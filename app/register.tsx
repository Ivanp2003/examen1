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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Hero Section */}
        <View className="bg-primary px-6 pt-16 pb-12 rounded-b-[40px]">
          <View className="items-center">
            <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-3">
              <Text className="text-3xl">🐾</Text>
            </View>
            <Text className="text-3xl font-bold text-white tracking-tight">Crear Cuenta</Text>
            <Text className="text-white/80 text-sm mt-2">Únete a la comunidad PetAdopt</Text>
          </View>
        </View>

        {/* Form */}
        <View className="px-6 -mt-7">
          <View className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            {/* Tipo de usuario */}
            <Text className="text-sm font-semibold text-text mb-3 ml-1">Elige tu perfil</Text>
            <View className="flex-row mb-6 gap-3">
              {(['adoptante', 'refugio'] as Role[]).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => { setRole(opt); form.reset(); }}
                  activeOpacity={0.8}
                  className={`flex-1 py-3.5 rounded-2xl border-2 items-center ${
                    role === opt ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={`text-xl mb-1`}>{opt === 'adoptante' ? '❤️' : '🏠'}</Text>
                  <Text className={`font-semibold text-sm ${role === opt ? 'text-white' : 'text-text'}`}>
                    {opt === 'adoptante' ? 'Adoptante' : 'Refugio'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <>
                  {/* Nombre */}
                  <Field name="nombre">
                    {(field) => (
                      <View className="mb-4">
                        <Text className="text-sm font-semibold text-text mb-2 ml-1">Nombre completo</Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                          <Text className="text-lg mr-3">👤</Text>
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="Juan Pérez"
                            placeholderTextColor="#94A3B8"
                            className="flex-1 py-4 text-text"
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Email */}
                  <Field name="email">
                    {(field) => (
                      <View className="mb-4">
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

                  {/* Password */}
                  <Field name="password">
                    {(field) => (
                      <View className="mb-4">
                        <Text className="text-sm font-semibold text-text mb-2 ml-1">Contraseña</Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                          <Text className="text-lg mr-3">🔒</Text>
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="Mínimo 6 caracteres"
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

                  {/* Confirm Password */}
                  <Field name="confirmPassword">
                    {(field) => (
                      <View className="mb-4">
                        <Text className="text-sm font-semibold text-text mb-2 ml-1">Confirmar contraseña</Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                          <Text className="text-lg mr-3">🔐</Text>
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="Repite la contraseña"
                            secureTextEntry={!showConfirm}
                            placeholderTextColor="#94A3B8"
                            className="flex-1 py-4 text-text"
                          />
                          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="ml-2">
                            <Text className="text-lg">{showConfirm ? '🙈' : '👁️'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Campos condicionales según rol */}
                  <View className="mb-4 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                    <Text className="text-sm font-bold text-text mb-4">
                      {role === 'adoptante' ? '📋 Información del adoptante' : '🏠 Información del refugio'}
                    </Text>

                    {role === 'adoptante' ? (
                      <>
                        <Field name="cedula">
                          {(field) => (
                            <View className="mb-3">
                              <Text className="text-sm font-medium text-text mb-2 ml-1">Cédula / Identificación</Text>
                              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4">
                                <Text className="text-base mr-3">🪪</Text>
                                <TextInput
                                  value={field.state.value}
                                  onChangeText={(text) => field.handleChange(text)}
                                  placeholder="123456789"
                                  placeholderTextColor="#94A3B8"
                                  className="flex-1 py-3.5 text-text"
                                />
                              </View>
                            </View>
                          )}
                        </Field>
                        <Field name="ocupacion">
                          {(field) => (
                            <View>
                              <Text className="text-sm font-medium text-text mb-2 ml-1">Ocupación</Text>
                              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4">
                                <Text className="text-base mr-3">💼</Text>
                                <TextInput
                                  value={field.state.value}
                                  onChangeText={(text) => field.handleChange(text)}
                                  placeholder="Ingeniero, Docente, etc."
                                  placeholderTextColor="#94A3B8"
                                  className="flex-1 py-3.5 text-text"
                                />
                              </View>
                            </View>
                          )}
                        </Field>
                      </>
                    ) : (
                      <>
                        <Field name="direccion">
                          {(field) => (
                            <View className="mb-3">
                              <Text className="text-sm font-medium text-text mb-2 ml-1">Dirección del refugio</Text>
                              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4">
                                <Text className="text-base mr-3">📍</Text>
                                <TextInput
                                  value={field.state.value}
                                  onChangeText={(text) => field.handleChange(text)}
                                  placeholder="Calle 123, Ciudad"
                                  placeholderTextColor="#94A3B8"
                                  className="flex-1 py-3.5 text-text"
                                />
                              </View>
                            </View>
                          )}
                        </Field>
                        <Field name="telefono">
                          {(field) => (
                            <View>
                              <Text className="text-sm font-medium text-text mb-2 ml-1">Teléfono de contacto</Text>
                              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4">
                                <Text className="text-base mr-3">📞</Text>
                                <TextInput
                                  value={field.state.value}
                                  onChangeText={(text) => field.handleChange(text)}
                                  placeholder="+52 555 123 4567"
                                  keyboardType="phone-pad"
                                  placeholderTextColor="#94A3B8"
                                  className="flex-1 py-3.5 text-text"
                                />
                              </View>
                            </View>
                          )}
                        </Field>
                      </>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => form.handleSubmit()}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                    className="py-4 rounded-2xl bg-primary items-center justify-center flex-row shadow-lg shadow-primary/40"
                    style={{ elevation: 4 }}
                  >
                    {isSubmitting && <ActivityIndicator color="white" className="mr-2" />}
                    <Text className="font-bold text-base text-white">{isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </form.Subscribe>
          </View>
        </View>

        {/* Login CTA */}
        <View className="items-center mt-6 pb-10 px-6">
          <Text className="text-text-secondary text-sm">
            ¿Ya tienes cuenta?{' '}
            <Text className="text-primary font-bold" onPress={() => router.push('/login')}>Inicia sesión</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
