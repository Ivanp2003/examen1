import '../global.css';
import { Slot, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import Constants, { AppOwnership } from 'expo-constants';
import { supabase } from '../src/infrastructure/api/supabase';
import { useAppStore } from '../src/application/store/useAppStore';
import { oauthCallback } from '../src/infrastructure/api/oauthCallback';
import { NotificationsDataSource } from '../src/infrastructure/datasources/NotificationsDataSource';

const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

console.log('_layout cargando...');
console.log('GestureHandlerRootView:', typeof GestureHandlerRootView);
console.log('StatusBar:', typeof StatusBar);
console.log('Slot:', typeof Slot);
console.log('📱 Entorno:', isExpoGo ? 'Expo Go' : 'Standalone APK');

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const setUser = useAppStore((state) => state.setUser);
  const user = useAppStore((state) => state.user);
  const segments = useSegments();
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const segmentsRef = useRef<string[]>(segments);
  segmentsRef.current = segments;
  const routerRef = useRef(router);
  routerRef.current = router;

  // 1. Inicialización de notificaciones
  useEffect(() => {
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
      console.warn('⚠️ Ejecutando en Expo Go: Notificaciones locales desactivadas.');
    }
  }, []);

  // 2. Control de Autenticación Centralizado (Supabase)
  useEffect(() => {
    let mounted = true;
    let authResolved = false;

    const resolveAuth = () => {
      if (!mounted || authResolved) return;
      authResolved = true;
      setIsAuthChecking(false);
    };

    // Registrar listener PRIMERO para no perder eventos como INITIAL_SESSION
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log(`🔐 Evento de Autenticación detectado: ${event}`);
      console.log('🔐 Auth state change:', event, session?.user?.id);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔑 Recuperación de contraseña - redirigiendo a reset');
        routerRef.current.replace('/auth/reset');
        resolveAuth();
        return;
      }

      if (session?.user) {
        try {
          const userId = session.user.id;
          console.log('🔐 _layout session:', session?.user?.id);

          let { data: profile, error: profileError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();
          console.log('🔐 _layout profile:', profile?.id ?? 'null', 'error:', profileError?.code ?? 'none');

          if (profileError && profileError.code === 'PGRST116') {
            console.log('📝 Usuario no existe en tabla usuarios, creando perfil...');
            const { data: nuevoPerfil, error: insertError } = await supabase
              .from('usuarios')
              .insert({
                id: userId,
                email: session.user.email,
                nombre: session.user.user_metadata?.nombre || session.user.user_metadata?.full_name || 'Usuario',
                role: session.user.user_metadata?.role || 'adoptante',
                metadata: session.user.user_metadata || {},
              })
              .select()
              .single();

            if (insertError) throw insertError;
            profile = nuevoPerfil;
            console.log('✅ Perfil creado exitosamente');
          } else if (profileError) {
            console.error('❌ Error obteniendo perfil:', profileError);
          }

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: profile?.role || session.user.user_metadata?.role || 'adoptante',
            nombre: profile?.nombre || session.user.user_metadata?.nombre || session.user.user_metadata?.full_name || 'Usuario',
            metadata: profile?.metadata || session.user.user_metadata || {},
            created_at: profile?.created_at || session.user.created_at,
          });
          console.log('✅ Store actualizado con el perfil:', session.user.id);
          resolveAuth();
        } catch (err: any) {
          console.error('❌ Error en el flujo de auth:', err);
          resolveAuth();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        console.log('👋 Usuario deslogueado');
        resolveAuth();
      } else {
        // INITIAL_SESSION sin usuario u otros eventos
        resolveAuth();
      }
    });

    // Luego verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      console.log('📦 Sesión inicial recuperada:', session ? 'Usuario detectado' : 'Vacía');
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'adoptante',
          nombre: session.user.user_metadata?.nombre || session.user.user_metadata?.full_name || 'Usuario',
          metadata: session.user.user_metadata || {},
          created_at: session.user.created_at,
        });
      } else {
        setUser(null);
      }
      resolveAuth();
    }).catch((err) => {
      console.error('❌ Error al recuperar sesión:', err);
      if (mounted) {
        setUser(null);
        resolveAuth();
      }
    });

    // Safety timeout: fuerza liberación si nada resolvió en 5s
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.log('⏰ Safety timeout - forzando isAuthChecking=false');
        resolveAuth();
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);

  // 3. Registro de push token tras login exitoso
  useEffect(() => {
    if (user?.id) {
      const notificationsDS = new NotificationsDataSource();
      notificationsDS.registerPushToken(user.id);
    }
  }, [user?.id]);

  // 4. El Guardián de Rutas
  useEffect(() => {
    if (isAuthChecking) {
      console.log(`⏳ Guardián esperando... isAuthChecking: ${isAuthChecking}`);
      return;
    }

    const rootSegment = segments[0];
    const publicRoutes = ['login', 'register', 'auth']; // ✅ cubre auth/callback, auth/reset, etc.
    const isInsideAuthGroup = publicRoutes.includes(rootSegment);

    console.log('🔍 Routing guard evaluando: user=', !!user, 'segment=', rootSegment, 'isInsideAuthGroup=', isInsideAuthGroup);

    const timeout = setTimeout(() => {
      if (!user && !isInsideAuthGroup) {
        console.log('➡️ Guardián: Sin usuario detectado. Redirigiendo a /login');
        router.replace('/login');
      } else if (user && (isInsideAuthGroup || rootSegment === 'index' || rootSegment === undefined || rootSegment === 'auth')) {
        console.log('➡️ Guardián: Usuario activo detectado. Redirigiendo a /(tabs)');
        router.replace('/(tabs)');
      } else {
        console.log('✨ Guardián: Ruta correcta actual:', rootSegment);
      }
    }, 10);

    return () => clearTimeout(timeout);
  }, [user, segments, isAuthChecking]);

  useEffect(() => {
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
      clearTimeout(realtimeTimeout);
      if (adoptionsChannel) {
        adoptionsChannel.unsubscribe();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Slot />
    </GestureHandlerRootView>
  );
}
