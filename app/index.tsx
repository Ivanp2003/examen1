import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/infrastructure/api/supabase';
import tw from 'twrnc';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🏠 Index check session — session:', session?.user?.id ?? 'sin sesión');
      console.log('🏠 Index check session — loading: n/a (no loading state)');
      if (session?.user) {
        console.log('🏠 Index → /(tabs)');
        router.replace('/(tabs)');
      } else {
        console.log('🏠 Index → /login');
        router.replace('/login');
      }
    };

    checkSession();
  }, []);

  console.log('🌀 RENDER LOADER desde Index — este componente solo debe verse un instante');
  return (
    <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}>
      <ActivityIndicator size="large" color="#F4A261" />
    </View>
  );
}
