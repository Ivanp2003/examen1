import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../src/infrastructure/api/supabase';
import { router } from 'expo-router';
import { useAppStore } from '../src/application/store/useAppStore';
import '../global.css';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    // Listener para cambios de sesión de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.id);

      if (session?.user) {
        // Obtener los datos del perfil de la tabla usuarios
        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('❌ Error obteniendo perfil:', profileError);
        }

        // Forzar la actualización del usuario en el store global
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: profile?.role || 'adoptante',
          nombre: profile?.nombre || session.user.user_metadata?.nombre || session.user.user_metadata?.full_name || 'Usuario',
          metadata: profile?.metadata || session.user.user_metadata || {},
          created_at: profile?.created_at || session.user.created_at,
        });
        console.log('✅ Usuario actualizado en store:', session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        console.log('👋 Usuario deslogueado');
      }
    });

    const handleOAuthCallback = async (url: string) => {
      if (url.includes('access_token') || url.includes('error_code') || url.includes('code')) {
        console.log('🔗 OAuth callback URL:', url);
        // Supabase automatically handles the session from the URL
        // The auth state listener will handle the user update
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleOAuthCallback(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleOAuthCallback(url);
    });

    return () => {
      authListener.subscription.unsubscribe();
      subscription.remove();
    };
  }, [setUser]);

  return (
    <GestureHandlerRootView className="flex-1">
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
        <Stack.Screen name="auth/callback" />
      </Stack>
    </GestureHandlerRootView>
  );
}
