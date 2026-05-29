import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
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
  const { access_token, refresh_token, error, error_description } = useLocalSearchParams();

  useEffect(() => {
    async function handleCallback() {
      console.log('🔗 Auth callback recibido');
      console.log('🆔 access_token:', access_token ? 'presente' : 'ausente');
      console.log('🆔 refresh_token:', refresh_token ? 'presente' : 'ausente');
      console.log('❌ error:', error);
      console.log('📝 error_description:', error_description);

      if (error) {
        console.error('❌ Error en OAuth:', error, error_description);
        router.replace('/login');
        return;
      }

      if (access_token && refresh_token) {
        try {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });

          if (sessionError) {
            console.error('❌ Error estableciendo sesión:', sessionError);
            router.replace('/login');
            return;
          }

          console.log('✅ Sesión establecida exitosamente');
          console.log('👤 Usuario:', data.user);

          // Check if user exists in usuarios table
          const { data: profile, error: profileError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', data.user?.id)
            .single();

          if (profileError || !profile) {
            console.log('📝 Usuario no existe en tabla usuarios, creando perfil...');
            // Create user profile if it doesn't exist
            const { error: insertError } = await supabase.from('usuarios').insert({
              id: data.user?.id,
              email: data.user?.email,
              nombre: data.user?.user_metadata?.nombre || data.user?.user_metadata?.full_name || 'Usuario',
              role: data.user?.user_metadata?.role || 'adoptante',
              metadata: data.user?.user_metadata || {},
            });

            if (insertError) {
              console.error('❌ Error creando perfil:', insertError);
            } else {
              console.log('✅ Perfil creado exitosamente');
            }
          } else {
            console.log('✅ Perfil encontrado:', profile);
          }

          router.replace('/(tabs)');
        } catch (err) {
          console.error('❌ Error en callback:', err);
          router.replace('/login');
        }
      } else {
        console.error('❌ No se recibieron tokens');
        router.replace('/login');
      }
    }

    handleCallback();
  }, [access_token, refresh_token, error, error_description]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F4A261" />
    </View>
  );
}
