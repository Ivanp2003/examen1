import { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  Alert, TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import { SupabaseAuthRepository } from '../src/infrastructure/repositories/SupabaseAuthRepository';
import { RegisterUseCase } from '../src/application/use-cases/AuthUseCases';

const authRepo = new SupabaseAuthRepository();
const registerUseCase = new RegisterUseCase(authRepo);

type Role = 'refugio' | 'adoptante';

export default function RegisterScreen() {
  const [role, setRole] = useState<Role>('adoptante');

  const form = useForm({
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      cedula: '',
      ocupacion: '',
      direccion: '',
      telefono: '',
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
        return;
      }

      const metadata = role === 'adoptante'
        ? { cedula: value.cedula, ocupacion: value.ocupacion }
        : { direccion: value.direccion, telefono: value.telefono };

      try {
        await registerUseCase.execute(value.email, value.password, value.nombre, role, metadata);
        router.replace('/(tabs)');
      } catch (err: any) {
        Alert.alert('Error de registro', err.message || 'No se pudo completar el registro.');
      }
    },
  });

  const Field = form.Field;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow px-6 py-12" keyboardShouldPersistTaps="handled">
        <Text className="text-3xl font-bold text-primary text-center mb-1">Crear Cuenta</Text>
        <Text className="text-text-secondary text-center mb-8">Únete a PetAdopt</Text>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <>
              {/* Tipo de usuario */}
              <Text className="text-sm font-medium text-text mb-2">Tipo de usuario</Text>
              <View className="flex-row mb-6 gap-3">
                {(['adoptante', 'refugio'] as Role[]).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => { setRole(opt); form.reset(); }}
                    className={`flex-1 py-3 rounded-xl border items-center ${role === opt ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                  >
                    <Text className={`font-semibold ${role === opt ? 'text-white' : 'text-text'}`}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Campos comunes */}
              <Field name="nombre">
                {(field) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Nombre completo</Text>
                    <TextInput
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      placeholder="Juan Pérez"
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text"
                    />
                  </View>
                )}
              </Field>

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
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Contraseña</Text>
                    <TextInput
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      placeholder="Mínimo 6 caracteres"
                      secureTextEntry
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text"
                    />
                  </View>
                )}
              </Field>

              <Field name="confirmPassword">
                {(field) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Confirmar contraseña</Text>
                    <TextInput
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      placeholder="Repite la contraseña"
                      secureTextEntry
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text"
                    />
                  </View>
                )}
              </Field>

              {/* Campos condicionales según rol */}
              <View className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Text className="text-sm font-semibold text-text mb-3">
                  {role === 'adoptante' ? 'Información del adoptante' : 'Información del refugio'}
                </Text>

                {role === 'adoptante' ? (
                  <>
                    <Field name="cedula">
                      {(field) => (
                        <View className="mb-3">
                          <Text className="text-sm font-medium text-text mb-2">Cédula / Identificación</Text>
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="123456789"
                            placeholderTextColor="#94A3B8"
                            className="p-4 bg-white border border-gray-200 rounded-xl text-text"
                          />
                        </View>
                      )}
                    </Field>
                    <Field name="ocupacion">
                      {(field) => (
                        <View>
                          <Text className="text-sm font-medium text-text mb-2">Ocupación</Text>
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="Ingeniero, Docente, etc."
                            placeholderTextColor="#94A3B8"
                            className="p-4 bg-white border border-gray-200 rounded-xl text-text"
                          />
                        </View>
                      )}
                    </Field>
                  </>
                ) : (
                  <>
                    <Field name="direccion">
                      {(field) => (
                        <View className="mb-3">
                          <Text className="text-sm font-medium text-text mb-2">Dirección del refugio</Text>
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="Calle 123, Ciudad"
                            placeholderTextColor="#94A3B8"
                            className="p-4 bg-white border border-gray-200 rounded-xl text-text"
                          />
                        </View>
                      )}
                    </Field>
                    <Field name="telefono">
                      {(field) => (
                        <View>
                          <Text className="text-sm font-medium text-text mb-2">Teléfono de contacto</Text>
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="+52 555 123 4567"
                            keyboardType="phone-pad"
                            placeholderTextColor="#94A3B8"
                            className="p-4 bg-white border border-gray-200 rounded-xl text-text"
                          />
                        </View>
                      )}
                    </Field>
                  </>
                )}
              </View>

              <TouchableOpacity
                onPress={() => form.handleSubmit()}
                disabled={isSubmitting}
                className="py-4 px-6 rounded-2xl bg-primary border border-primary items-center justify-center flex-row"
              >
                {isSubmitting && <ActivityIndicator color="white" className="mr-2" />}
                <Text className="font-semibold text-base text-white">Crear Cuenta</Text>
              </TouchableOpacity>
            </>
          )}
        </form.Subscribe>

        <Text className="text-center text-text-secondary mt-6 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Text className="text-primary font-semibold" onPress={() => router.push('/login')}>Inicia sesión</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
