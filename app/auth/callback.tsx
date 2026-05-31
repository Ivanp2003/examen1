import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/infrastructure/api/supabase';
import { oauthCallback } from '../../src/infrastructure/api/oauthCallback';
import tw from 'twrnc';

export default function AuthCallback() {
  const linkingUrl = Linking.useURL();
  const router = useRouter();
  const processed = useRef(false);

  // Listener de sesión: redirige inmediatamente si ya hay sesión activa
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 AuthCallback onAuthStateChange:', event, session?.user?.id);
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🚀 AuthCallback → /(tabs)');
        router.replace('/(tabs)');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    WebBrowser.dismissBrowser();

    const createSessionFromUrl = async (urlStr: string) => {
      if (processed.current) return;
      if (!urlStr.includes('access_token')) {
        console.log('⏳ URL sin tokens, ignorando:', urlStr.substring(0, 50));
        return;
      }
      processed.current = true;

      try {
        console.log('🔗 Procesando callback con tokens...');
        const accessMatch = urlStr.match(/access_token=([^&]+)/);
        const refreshMatch = urlStr.match(/refresh_token=([^&]+)/);
        const accessToken = accessMatch?.[1] ?? '';
        const refreshToken = refreshMatch?.[1] ?? '';

        if (!accessToken || !refreshToken) {
          console.warn('⚠️ Tokens no encontrados en la URL');
          return;
        }

        console.log('🔑 Estableciendo sesión...');
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        const { data: { session } } = await supabase.auth.getSession();
        console.log('✅ Sesión establecida. session:', session?.user?.id ?? 'null');
        console.log('✅ callback → index manejará navegación');
        // NO redirigimos aquí — index.tsx manejará la navegación tras el reload
      } catch (err) {
        console.error('❌ Error en callback:', err);
      }
    };

    const urlDesdeSingleton = oauthCallback.getUrl();
    const urlToProcess = urlDesdeSingleton || linkingUrl;
    if (urlToProcess) {
      if (urlDesdeSingleton) oauthCallback.clear();
      createSessionFromUrl(urlToProcess);
    }
  }, [linkingUrl]);

  // Listener separado para cuando llega via Linking
  useEffect(() => {
    if (!linkingUrl) return;
    if (processed.current) return;
    if (!linkingUrl.includes('access_token')) return;

    oauthCallback.setUrl(linkingUrl);
    oauthCallback.clear();

    const createSessionFromUrl = async (urlStr: string) => {
      if (processed.current) return;
      processed.current = true;
      try {
        const accessMatch = urlStr.match(/access_token=([^&]+)/);
        const refreshMatch = urlStr.match(/refresh_token=([^&]+)/);
        const accessToken = accessMatch?.[1] ?? '';
        const refreshToken = refreshMatch?.[1] ?? '';
        if (!accessToken || !refreshToken) return;
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) throw error;
        console.log('✅ Sesión establecida via Linking. Esperando navegación desde index...');
      } catch {
        console.error('❌ Error en callback via Linking');
      }
    };

    createSessionFromUrl(linkingUrl);
  }, [linkingUrl]);

  console.log('🌀 RENDER LOADER desde AuthCallback — processed:', processed.current, 'linkingUrl:', linkingUrl?.substring(0, 30) ?? 'null');
  return (
    <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}>
      <ActivityIndicator size="large" color="#F4A261" />
    </View>
  );
}
