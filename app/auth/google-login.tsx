import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/infrastructure/api/supabase';
import tw from 'twrnc';

export default function GoogleLoginScreen() {
  const router = useRouter();
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    const getOAuthUrl = async () => {
      try {
        const redirectUrl = 'petadopt://auth/callback';
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;
        if (data?.url) {
          setAuthUrl(data.url);
        } else {
          setErrorMsg('No se pudo obtener la URL de autenticación.');
        }
      } catch (err: any) {
        console.error('❌ Error obteniendo URL OAuth:', err);
        setErrorMsg(err.message || 'Error iniciando autenticación con Google.');
      }
    };

    getOAuthUrl();
  }, []);

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const url = navState.url;

    // Detectar cuando la URL contiene los tokens (puede venir en hash o query params)
    if (url.includes('access_token=') && url.includes('refresh_token=')) {
      if (processed.current) return;
      processed.current = true;

      try {
        console.log('🚀 Extrayendo tokens de la URL del WebView:', url);

        let accessToken = '';
        let refreshToken = '';

        const accessMatch = url.match(/access_token=([^&]+)/);
        if (accessMatch) accessToken = accessMatch[1];

        const refreshMatch = url.match(/refresh_token=([^&]+)/);
        if (refreshMatch) refreshToken = refreshMatch[1];

        if (accessToken && refreshToken) {
          console.log('🔑 Tokens detectados. Estableciendo sesión...');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;
          console.log('✅ Sesión inyectada en Supabase correctamente.');
        } else {
          console.warn('⚠️ No se encontraron tokens en la URL del WebView.');
        }
      } catch (err: any) {
        console.error('❌ Error procesando callback en WebView:', err);
        setErrorMsg(err.message || 'Error procesando autenticación.');
      }
    }
  };

  if (errorMsg) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED] px-6`}>
        <Text style={tw`text-red-500 text-center text-base font-medium`}>{errorMsg}</Text>
        <Text
          style={tw`mt-4 text-[#F4A261] font-semibold text-sm`}
          onPress={() => router.replace('/login')}
        >
          Volver al Login
        </Text>
      </View>
    );
  }

  if (!authUrl) {
    console.log('🌀 RENDER LOADER desde GoogleLoginScreen — authUrl es null');
    return (
      <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={tw`mt-4 text-[#6D597A] text-base font-medium`}>Preparando Google OAuth...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      <WebView
        source={{ uri: authUrl }}
        style={tw`flex-1`}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState
        renderLoading={() => (
          <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}>
            <ActivityIndicator size="large" color="#F4A261" />
          </View>
        )}
      />
    </View>
  );
}
