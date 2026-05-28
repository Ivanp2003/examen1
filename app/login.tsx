import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import { SupabaseAuthRepository } from '../src/infrastructure/repositories/SupabaseAuthRepository';
import { LoginUseCase } from '../src/application/use-cases/AuthUseCases';

const authRepo = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepo);

export default function LoginScreen() {
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
      <ScrollView contentContainerClassName="flex-1 justify-center px-6" keyboardShouldPersistTaps="handled">
        <Text className="text-4xl font-bold text-primary text-center mb-1">PetAdopt</Text>
        <Text className="text-text-secondary text-center mb-10 text-base">Encuentra a tu nuevo mejor amigo</Text>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <>
              <Field name="email">
                {(field) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Correo electrónico</Text>
                    <TextInput
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      placeholder="tu@correo.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text"
                    />
                  </View>
                )}
              </Field>

              <Field name="password">
                {(field) => (
                  <View className="mb-6">
                    <Text className="text-sm font-medium text-text mb-2">Contraseña</Text>
                    <TextInput
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      placeholder="••••••••"
                      secureTextEntry
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text"
                    />
                  </View>
                )}
              </Field>

              <TouchableOpacity
                onPress={() => form.handleSubmit()}
                disabled={isSubmitting}
                className="py-4 px-6 rounded-2xl bg-primary border border-primary items-center justify-center flex-row"
              >
                {isSubmitting && <ActivityIndicator color="white" className="mr-2" />}
                <Text className="font-semibold text-base text-white">Iniciar Sesión</Text>
              </TouchableOpacity>
            </>
          )}
        </form.Subscribe>

        <Text className="text-center text-text-secondary mt-6 text-sm">
          ¿No tienes cuenta?{' '}
          <Text className="text-primary font-semibold" onPress={() => router.push('/register')}>Regístrate</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
