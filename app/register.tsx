import { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  Alert, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SupabaseAuthRepository } from '../src/infrastructure/repositories/SupabaseAuthRepository';
import { RegisterUseCase } from '../src/application/use-cases/AuthUseCases';

const authRepo = new SupabaseAuthRepository();
const registerUseCase = new RegisterUseCase(authRepo);

type Role = 'refugio' | 'adoptante';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: '#F4A261',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: -28,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D597A',
    marginBottom: 12,
    marginLeft: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#F4A261',
    borderColor: '#F4A261',
  },
  roleButtonInactive: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FED7AA',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  roleButtonTextInactive: {
    color: '#6D597A',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D597A',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: '#6D597A',
  },
  togglePassword: {
    marginLeft: 8,
  },
  conditionalFields: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#FFEDD5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  conditionalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6D597A',
  },
  conditionalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F4A261',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#F4A261',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  loginCTA: {
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  loginCTAText: {
    fontSize: 14,
    color: '#6D597A',
  },
  loginCTALink: {
    color: '#F4A261',
    fontWeight: 'bold',
  },
});

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <LottieView
                source={require('../assets/animations/cat.json')}
                autoPlay
                loop
                style={{ width: 56, height: 56 }}
              />
            </View>
            <Text style={styles.heroTitle}>Crear Cuenta</Text>
            <Text style={styles.heroSubtitle}>Únete a la comunidad PetAdopt</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            {/* Tipo de usuario */}
            <Text style={styles.sectionLabel}>Elige tu perfil</Text>
            <View style={styles.roleSelector}>
              {(['adoptante', 'refugio'] as Role[]).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => { setRole(opt); form.reset(); }}
                  activeOpacity={0.8}
                  style={[
                    styles.roleButton,
                    role === opt ? styles.roleButtonActive : styles.roleButtonInactive,
                  ]}
                >
                    <MaterialCommunityIcons name={opt === 'adoptante' ? 'heart' : 'home'} size={20} color="#FFFFFF" />
                  <Text style={[
                    styles.roleButtonText,
                    role === opt ? styles.roleButtonTextActive : styles.roleButtonTextInactive,
                  ]}>
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
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Nombre completo</Text>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="account-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="Juan Pérez"
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Email */}
                  <Field name="email">
                    {(field) => (
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Correo electrónico</Text>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="email-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
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

                  {/* Password */}
                  <Field name="password">
                    {(field) => (
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Contraseña</Text>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="lock-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="Mínimo 6 caracteres"
                            secureTextEntry={!showPassword}
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                          />
                          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.togglePassword}>
                            <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6D597A" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Confirm Password */}
                  <Field name="confirmPassword">
                    {(field) => (
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Confirmar contraseña</Text>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="lock-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                          <TextInput
                            value={field.state.value}
                            onChangeText={(text) => field.handleChange(text)}
                            placeholder="Repite la contraseña"
                            secureTextEntry={!showConfirm}
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                          />
                          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.togglePassword}>
                            <MaterialCommunityIcons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6D597A" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Campos condicionales según rol */}
                  <View style={styles.conditionalFields}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                      <MaterialCommunityIcons name={role === 'adoptante' ? 'clipboard-outline' : 'home-outline'} size={18} color="#6D597A" style={{ marginRight: 8 }} />
                      <Text style={styles.conditionalTitle}>
                        {role === 'adoptante' ? 'Información del adoptante' : 'Información del refugio'}
                      </Text>
                    </View>

                    {role === 'adoptante' ? (
                      <>
                        <Field name="cedula">
                          {(field) => (
                            <View style={styles.fieldContainer}>
                              <Text style={styles.fieldLabel}>Cédula / Identificación</Text>
                              <View style={styles.conditionalInputContainer}>
                                <MaterialCommunityIcons name="credit-card-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                                <TextInput
                                  value={field.state.value}
                                  onChangeText={(text) => field.handleChange(text)}
                                  placeholder="123456789"
                                  placeholderTextColor="#94A3B8"
                                  style={styles.input}
                                />
                              </View>
                            </View>
                          )}
                        </Field>
                        <Field name="ocupacion">
                          {(field) => (
                            <View style={styles.fieldContainer}>
                              <Text style={styles.fieldLabel}>Ocupación</Text>
                              <View style={styles.conditionalInputContainer}>
                                <MaterialCommunityIcons name="briefcase-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                                <TextInput
                                  value={field.state.value}
                                  onChangeText={(text) => field.handleChange(text)}
                                  placeholder="Ingeniero, Docente, etc."
                                  placeholderTextColor="#94A3B8"
                                  style={styles.input}
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
                            <View style={styles.fieldContainer}>
                              <Text style={styles.fieldLabel}>Dirección del refugio</Text>
                              <View style={styles.conditionalInputContainer}>
                                <MaterialCommunityIcons name="map-marker-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                                <TextInput
                                  value={field.state.value}
                                  onChangeText={(text) => field.handleChange(text)}
                                  placeholder="Calle 123, Ciudad"
                                  placeholderTextColor="#94A3B8"
                                  style={styles.input}
                                />
                              </View>
                            </View>
                          )}
                        </Field>
                        <Field name="telefono">
                          {(field) => (
                            <View style={styles.fieldContainer}>
                              <Text style={styles.fieldLabel}>Teléfono de contacto</Text>
                              <View style={styles.conditionalInputContainer}>
                                <MaterialCommunityIcons name="phone-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                                <TextInput
                                  value={field.state.value}
                                  onChangeText={(text) => field.handleChange(text)}
                                  placeholder="+52 555 123 4567"
                                  keyboardType="phone-pad"
                                  placeholderTextColor="#94A3B8"
                                  style={styles.input}
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
                    style={styles.submitButton}
                  >
                    {isSubmitting && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
                    <Text style={styles.submitButtonText}>{isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </form.Subscribe>
          </View>
        </View>

        {/* Login CTA */}
        <View style={styles.loginCTA}>
          <Text style={styles.loginCTAText}>
            ¿Ya tienes cuenta?{' '}
            <Text style={styles.loginCTALink} onPress={() => router.push('/login')}>Inicia sesión</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
