import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../src/infrastructure/api/supabase';

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
    // Supabase ya maneja los tokens automáticamente.
    // Solo escuchar el evento SIGNED_IN y redirigir.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Callback - auth event:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        subscription.unsubscribe();
        await createProfileIfNeeded(session.user);
        router.replace('/(tabs)');
      }
    });

    // Verificar si ya hay sesión activa (llegamos tarde al evento)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('✅ Sesión ya activa, redirigiendo...');
        subscription.unsubscribe();
        createProfileIfNeeded(session.user).then(() => {
          router.replace('/(tabs)');
        });
      }
    });

    return () => subscription.unsubscribe();
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
