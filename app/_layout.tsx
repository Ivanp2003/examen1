import '../global.css';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import Constants, { AppOwnership } from 'expo-constants';
import { supabase } from '../src/infrastructure/api/supabase';
import { useAppStore } from '../src/application/store/useAppStore';
import { oauthCallback } from '../src/infrastructure/api/oauthCallback';

const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

console.log('_layout cargando...');
console.log('GestureHandlerRootView:', typeof GestureHandlerRootView);
console.log('StatusBar:', typeof StatusBar);
console.log('Stack:', typeof Stack);
console.log('📱 Entorno:', isExpoGo ? 'Expo Go' : 'Standalone APK');

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const setUser = useAppStore((state) => state.setUser);
  const segments = useSegments();
  const router = useRouter();
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    // Inicialización segura de notificaciones (solo fuera de Expo Go)
    if (!isExpoGo) {
      try {
        const Notifications = require('expo-notifications');
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        Notifications.requestPermissionsAsync().then((permissions: any) => {
          console.log('🔔 Permisos de Notificación en APK:', permissions.status);
        });
      } catch (e) {
        console.error('❌ Error cargando notificaciones nativas:', e);
      }
    } else {
      console.warn('⚠️ Ejecutando en Expo Go: Notificaciones locales desactivadas para evitar crash.');
    }

    // Listener para cambios de sesión de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.id);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔑 Recuperación de contraseña - redirigiendo a reset');
        routerRef.current.replace('/auth/reset');
        return;
      }

      if (session?.user) {
        // Obtener los datos del perfil de la tabla usuarios
        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('❌ Error obteniendo perfil:', profileError);

          // Si el perfil no existe, crearlo
          if (profileError.code === 'PGRST116') {
            console.log('📝 Usuario no existe en tabla usuarios, creando perfil...');
            const { error: insertError } = await supabase.from('usuarios').insert({
              id: session.user.id,
              email: session.user.email,
              nombre: session.user.user_metadata?.nombre || session.user.user_metadata?.full_name || 'Usuario',
              role: session.user.user_metadata?.role || 'adoptante',
              metadata: session.user.user_metadata || {},
            });

            if (insertError) {
              console.error('❌ Error creando perfil:', insertError);
            } else {
              console.log('✅ Perfil creado exitosamente');
            }
          }
        }

        // Forzar la actualización del usuario en el store global
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: profile?.role || session.user.user_metadata?.role || 'adoptante',
          nombre: profile?.nombre || session.user.user_metadata?.nombre || session.user.user_metadata?.full_name || 'Usuario',
          metadata: profile?.metadata || session.user.user_metadata || {},
          created_at: profile?.created_at || session.user.created_at,
        });
        console.log('✅ Usuario actualizado en store:', session.user.id);

        // Redirigir si está en pantallas de auth
        const inAuthGroup = segmentsRef.current[0] === 'login' || segmentsRef.current[0] === 'register' || segmentsRef.current[0] === 'auth';
        if (inAuthGroup) {
          console.log('🚀 Redirigiendo desde auth screen al catálogo');
          WebBrowser.dismissBrowser();
          routerRef.current.replace('/(tabs)');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        console.log('👋 Usuario deslogueado');
        routerRef.current.replace('/login');
      }
    });

    const handleOAuthCallback = async (url: string) => {
      if (url.includes('access_token') || url.includes('error_code') || url.includes('code')) {
        console.log('🔗 OAuth callback URL:', url.substring(0, 80));
        oauthCallback.setUrl(url);
        console.log('💾 URL guardada en singleton, verificando:', oauthCallback.getUrl() ? 'OK' : 'FALLÓ');
        routerRef.current.replace('/auth/callback');
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleOAuthCallback(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleOAuthCallback(url);
    });

    // Listener en tiempo real para solicitudes de adopción
    let adoptionsChannel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = () => {
      const currentUser = useAppStore.getState().user;
      if (!currentUser) return;

      adoptionsChannel = supabase
        .channel('solicitudes-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'solicitudes' },
          async (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload as any;
            const userId = useAppStore.getState().user?.id;
            const userRole = useAppStore.getState().user?.role;

            // SI ES ADOPTANTE: Le llega notificación si le aprueban/rechazan su solicitud
            if (eventType === 'UPDATE' && newRecord.applicant_id === userId) {
              const statusText = newRecord.status === 'aprobado' ? 'APROBADA' : newRecord.status === 'rechazado' ? 'RECHAZADA' : newRecord.status;
              if (!isExpoGo) {
                try {
                  const Notifications = require('expo-notifications');
                  await Notifications.scheduleNotificationAsync({
                    content: {
                      title: '📋 Actualización de tu Adopción',
                      body: `Tu solicitud de adopción ha sido ${statusText}.`,
                    },
                    trigger: null,
                  });
                  console.log('🔔 Notificación enviada al adoptante:', statusText);
                } catch (e) {
                  console.error('❌ Error enviando notificación:', e);
                }
              } else {
                console.log('📢 [Simulación Notificación] Tu solicitud fue', statusText);
              }
            }

            // SI ES REFUGIO: Le llega notificación si alguien crea una nueva solicitud para sus mascotas
            if (eventType === 'INSERT' && newRecord.shelter_id === userId && userRole === 'refugio') {
              if (!isExpoGo) {
                try {
                  const Notifications = require('expo-notifications');
                  await Notifications.scheduleNotificationAsync({
                    content: {
                      title: '🐾 ¡Nueva Solicitud Recibida!',
                      body: 'Un adoptante ha enviado una nueva solicitud de adopción. ¡Revísala ahora!',
                    },
                    trigger: null,
                  });
                  console.log('🔔 Notificación enviada al refugio: nueva solicitud');
                } catch (e) {
                  console.error('❌ Error enviando notificación:', e);
                }
              } else {
                console.log('📢 [Simulación Notificación] Nueva solicitud recibida para tu refugio');
              }
            }
          }
        )
        .subscribe();
    };

    // Configurar realtime después de un pequeño delay para asegurar que el store esté cargado
    const realtimeTimeout = setTimeout(setupRealtime, 1000);

    return () => {
      authListener.subscription.unsubscribe();
      subscription.remove();
      clearTimeout(realtimeTimeout);
      if (adoptionsChannel) {
        adoptionsChannel.unsubscribe();
      }
    };
  }, [setUser]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pet/[id]" />
        <Stack.Screen name="create-pet" />
        <Stack.Screen name="ai-chat" />
        <Stack.Screen name="adopt/[id]" />
        <Stack.Screen name="auth/forgot" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="auth/google-login" />
        <Stack.Screen name="auth/reset" />
        <Stack.Screen name="chat-room" />
      </Stack>
    </GestureHandlerRootView>
  );
}
