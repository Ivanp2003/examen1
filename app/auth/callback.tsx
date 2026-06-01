import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { supabase } from '../../src/infrastructure/api/supabase';
import tw from 'twrnc';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;

    if (!accessToken || !refreshToken) {
      console.log('⏳ Esperando tokens en params...');
      return;
    }

    processed.current = true;

    (async () => {
      try {
        console.log('🔑 Estableciendo sesión con tokens de params...');
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        console.log('✅ Sesión establecida. Redirigiendo...');
        router.replace('/(tabs)');
      } catch (err: any) {
        console.error('❌ Error en callback:', err);
        router.replace('/login');
      }
    })();
  }, [params.access_token, params.refresh_token]);

  return (
    <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}>
      <ActivityIndicator size="large" color="#F4A261" />
      <Text style={tw`mt-4 text-[#6D597A]`}>Completando inicio de sesión...</Text>
    </View>
  );
}
