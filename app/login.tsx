import { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../src/infrastructure/api/supabase';
import { SupabaseAuthRepository } from '../src/infrastructure/repositories/SupabaseAuthRepository';
import { LoginUseCase } from '../src/application/use-cases/AuthUseCases';
import { useAppStore } from '../src/application/store/useAppStore';

const { width } = Dimensions.get('window');

const authRepo = new SupabaseAuthRepository();

WebBrowser.maybeCompleteAuthSession();
const loginUseCase = new LoginUseCase(authRepo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  heroGradient: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 64,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: '#F4A261',
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: -32,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#6D597A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6D597A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#84A98C',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D597A',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#6D597A',
  },
  forgotPassword: {
    marginBottom: 32,
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#84A98C',
    fontWeight: '600',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#F4A261',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: '#F4A261',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  registerText: {
    fontSize: 14,
    color: '#6D597A',
  },
  registerLink: {
    fontSize: 14,
    color: '#F4A261',
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(109, 89, 122, 0.5)',
    marginTop: 24,
    textAlign: 'center',
    maxWidth: 280,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#84A98C',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6D597A',
    marginLeft: 12,
  },
});

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user } = useAppStore();

  // Fallback: si el usuario ya está autenticado, redirigir
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const setUser = useAppStore((state) => state.setUser);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://pet-adopt-web-five.vercel.app/',
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No se obtuvo URL de OAuth');

      // ✅ Escuchar el deep link ANTES de abrir el browser
      const subscription = Linking.addEventListener('url', ({ url }) => {
        console.log('🔗 Deep link recibido:', url.substring(0, 80));
        if (url.includes('auth/callback') && url.includes('access_token')) {
          subscription.remove();
          // Navegar al callback con los params
          const accessMatch = url.match(/access_token=([^&]+)/);
          const refreshMatch = url.match(/refresh_token=([^&]+)/);
          if (accessMatch && refreshMatch) {
            router.replace({
              pathname: '/auth/callback',
              params: {
                access_token: decodeURIComponent(accessMatch[1]),
                refresh_token: decodeURIComponent(refreshMatch[1]),
              },
            });
          }
        }
      });

      // Abrir el browser del sistema
      await Linking.openURL(data.url);
    } catch (err: any) {
      console.error('❌ Error Google:', err);
      Alert.alert('Error', err.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      try {
        const user = await loginUseCase.execute(value.email, value.password);
        setUser(user);
        router.replace('/(tabs)');
      } catch (err: any) {
        Alert.alert('Error de inicio de sesión', err.message || 'Credenciales inválidas.');
      }
    },
  });

  const Field = form.Field;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Hero Section */}
        <View style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <LottieView
                source={require('../assets/animations/dog.json')}
                autoPlay
                loop
                style={{ width: 64, height: 64 }}
              />
            </View>
            <Text style={styles.title}>PetAdopt</Text>
            <Text style={styles.subtitle}>
              Encuentra a tu compañero perfecto y cambia una vida
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Bienvenido de nuevo</Text>
            <Text style={styles.welcomeSubtitle}>Inicia sesión para continuar</Text>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <>
                  <Field name="email">
                    {(field) => (
                      <View>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="email-outline" size={20} color="#6D597A" style={{ marginRight: 12 }} />
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="tu@correo.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  <Field name="password">
                    {(field) => (
                      <View>
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="lock-outline" size={20} color="#6D597A" style={{ marginRight: 12 }} />
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="••••••••"
                            secureTextEntry={!showPassword}
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                          />
                          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6D597A" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Field>

                  <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/auth/forgot')}>
                    <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => form.handleSubmit()}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                    style={styles.loginButton}
                  >
                    {isSubmitting && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
                    <Text style={styles.loginButtonText}>{isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}</Text>
                  </TouchableOpacity>

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>o continúa con</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    onPress={handleGoogleLogin}
                    activeOpacity={0.85}
                    disabled={googleLoading}
                    style={[styles.googleButton, googleLoading && { opacity: 0.7 }]}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color="#6D597A" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="google" size={24} color="#6D597A" />
                        <Text style={styles.googleButtonText}>Continuar con Google</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </form.Subscribe>
          </View>
        </View>

        {/* Register CTA */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta?{' '}
            <Text style={styles.registerLink} onPress={() => router.push('/register')}>Crear cuenta</Text>
          </Text>
          <Text style={styles.termsText}>
            Al continuar, aceptas nuestros Términos y Condiciones
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
