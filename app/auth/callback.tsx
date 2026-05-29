import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../src/infrastructure/api/supabase';
import { oauthCallback } from '../../src/infrastructure/api/oauthCallback';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function AuthCallback() {
  useEffect(() => {
    // Manejo de eventos de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Callback - auth event:', event);
      if (event === 'PASSWORD_RECOVERY') {
        // Navegar a restablecer contraseña
        router.replace('/auth/reset');
        return;
      }
      if (event === 'SIGNED_IN' && session?.user) {
        subscription.unsubscribe();
        await createProfileIfNeeded(session.user);
        router.replace('/(tabs)');
      }
    });

    // Intentar parsear tokens desde el enlace profundo (recuperación)
    const handleUrl = async (url: string) => {
      try {
        const parsed = Linking.parse(url);
        const params = parsed.queryParams || {} as Record<string, string>;
        // Algunos proveedores colocan en el hash
        const hash = (url.split('#')[1] || '').split('&').reduce((acc, kv) => {
          const [k, v] = kv.split('=');
          if (k && v) acc[decodeURIComponent(k)] = decodeURIComponent(v);
          return acc;
        }, {} as Record<string, string>);
        const type = (params.type || hash.type) as string | undefined;
        const access_token = (params.access_token || hash.access_token) as string | undefined;
        const refresh_token = (params.refresh_token || hash.refresh_token) as string | undefined;

        if (access_token && refresh_token) {
          console.log('🔑 Estableciendo sesión desde deep link');
          await supabase.auth.setSession({ access_token, refresh_token });
          if (type === 'recovery') {
            router.replace('/auth/reset');
            return;
          }
        }
      } catch (e) {
        console.warn('No se pudo procesar el deep link de callback:', e);
      }
    };

    // Usar URL guardada por RootLayout si existe (evita perder el enlace original)
    const savedUrl = oauthCallback.getUrl();
    if (savedUrl) {
      handleUrl(savedUrl);
      oauthCallback.clear();
    }

    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => {
      subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  async function createProfileIfNeeded(user: any) {
    if (!user) return;
    const { data: profile, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      await supabase.from('usuarios').insert({
        id: user.id,
        email: user.email,
        nombre: user.user_metadata?.full_name || 'Usuario',
        role: 'adoptante',
        metadata: user.user_metadata || {},
      });
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F4A261" />
    </View>
  );
}
