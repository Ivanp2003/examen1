import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TextInput, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import { SupabaseAuthRepository } from '../src/infrastructure/repositories/SupabaseAuthRepository';
import { LoginUseCase } from '../src/application/use-cases/AuthUseCases';

const { width } = Dimensions.get('window');

const authRepo = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepo);

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      try {
        await loginUseCase.execute(value.email, value.password);
        router.replace('/(tabs)');
      } catch (err: any) {
        Alert.alert('Error de inicio de sesión', err.message || 'Credenciales inválidas.');
      }
    },
  });

  const Field = form.Field;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Hero Section */}
        <View className="bg-primary px-6 pt-20 pb-16 rounded-b-[40px]">
          <View className="items-center">
            <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-4 backdrop-blur">
              <Text className="text-4xl">🐾</Text>
            </View>
            <Text className="text-4xl font-bold text-white tracking-tight">PetAdopt</Text>
            <Text className="text-white/80 text-base mt-2 text-center max-w-xs">
              Encuentra a tu compañero perfecto y cambia una vida
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View className="px-6 -mt-8">
          <View className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <Text className="text-2xl font-bold text-text mb-1">Bienvenido de nuevo</Text>
            <Text className="text-text-secondary text-sm mb-8">Inicia sesión para continuar</Text>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <>
                  <Field name="email">
                    {(field) => (
                      <View className="mb-5">
                        <Text className="text-sm font-semibold text-text mb-2 ml-1">Correo electrónico</Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                          <Text className="text-lg mr-3">📧</Text>
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="tu@correo.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#94A3B8"
                            className="flex-1 py-4 text-text"
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  <Field name="password">
                    {(field) => (
                      <View className="mb-2">
                        <Text className="text-sm font-semibold text-text mb-2 ml-1">Contraseña</Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                          <Text className="text-lg mr-3">🔒</Text>
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="••••••••"
                            secureTextEntry={!showPassword}
                            placeholderTextColor="#94A3B8"
                            className="flex-1 py-4 text-text"
                          />
                          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                            <Text className="text-lg">{showPassword ? '🙈' : '👁️'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Field>

                  <TouchableOpacity className="mb-8">
                    <Text className="text-primary text-sm font-medium text-right">¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => form.handleSubmit()}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                    className="py-4 rounded-2xl bg-primary items-center justify-center flex-row shadow-lg shadow-primary/40"
                    style={{ elevation: 4 }}
                  >
                    {isSubmitting && <ActivityIndicator color="white" className="mr-2" />}
                    <Text className="font-bold text-base text-white">{isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </form.Subscribe>
          </View>
        </View>

        {/* Register CTA */}
        <View className="items-center mt-8 pb-10 px-6">
          <Text className="text-text-secondary text-sm">
            ¿No tienes cuenta?{' '}
            <Text className="text-primary font-bold" onPress={() => router.push('/register')}>Crear cuenta</Text>
          </Text>
          <Text className="text-text-secondary/60 text-xs mt-6 text-center max-w-xs">
            Al continuar, aceptas nuestros Términos y Condiciones
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
