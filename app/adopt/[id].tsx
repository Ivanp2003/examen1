import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { useForm } from '@tanstack/react-form';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SuccessAnimation from '../../src/infrastructure/ui/animations/SuccessAnimation';
import { useAppStore } from '../../src/application/store/useAppStore';
import { SupabaseAdoptionRepository } from '../../src/infrastructure/repositories/SupabaseAdoptionRepository';
import { SupabasePetRepository } from '../../src/infrastructure/repositories/SupabasePetRepository';
import { Pet } from '../../src/domain/entities/Pet';
import { AdoptionStatus } from '../../src/domain/entities/AdoptionRequest';
import { supabase } from '../../src/infrastructure/api/supabase';

const adoptionRepo = new SupabaseAdoptionRepository();
const petRepo = new SupabasePetRepository();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 18,
    marginTop: 16,
  },
  successSubtitle: {
    color: '#94A3B8',
    marginTop: 8,
  },
  successButton: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#F4A261',
    borderRadius: 16,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D597A',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6D597A',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    color: '#6D597A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLarge: {
    minHeight: 100,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#F4A261',
    borderColor: '#F4A261',
  },
  optionButtonInactive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E8E8E8',
  },
  optionText: {
    fontWeight: '500',
    fontSize: 14,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  optionTextInactive: {
    color: '#6D597A',
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#F4A261',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F4A261',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default function AdoptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAppStore((s) => s.user);
  const [pet, setPet] = useState<Pet | null>(null);
  const [success, setSuccess] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('🔍 useEffect ejecutado con id:', id);
    if (!id) return;
    (async () => {
      console.log('📦 Obteniendo todas las mascotas...');
      const all = await petRepo.getAllPets();
      console.log('🐾 Mascotas obtenidas:', all);
      const found = all.find((p) => p.id === id);
      console.log('🎯 Mascota encontrada:', found);
      if (found) setPet(found);
    })();
  }, [id]);

  const form = useForm({
    defaultValues: {
      experiencia: '',
      hogar: 'casa',
      otros_mascotas: false,
      motivo: '',
    },
    onSubmit: async ({ value }) => {
      console.log('🔘 Botón enviar presionado');
      console.log('👤 Usuario (store):', user);
      console.log('🐾 Mascota:', pet);
      console.log('🆔 Pet ID:', id);

      if (!pet) {
        console.error('❌ Mascota no encontrada');
        Alert.alert('Error', 'No se encontró la mascota. Intenta nuevamente.');
        return;
      }

      // Fallback de emergencia por si el Store de Zustand no se ha sincronizado
      let currentUserId = user?.id;
      if (!currentUserId) {
        console.log('⚠️ Usuario nulo en store, intentando obtener sesión de Supabase...');
        const { data: sessionData } = await supabase.auth.getSession();
        currentUserId = sessionData?.session?.user?.id;
        console.log('🆔 User ID de Supabase:', currentUserId);
      }

      if (!currentUserId) {
        console.error('❌ Usuario no autenticado de forma local ni en Supabase');
        Alert.alert('Error', 'Usuario no autenticado. Debes iniciar sesión para enviar una solicitud de adopción.');
        router.replace('/login');
        return;
      }

      try {
        console.log('📦 Datos del formulario:', value);
        const requestData = {
          pet_id: id!,
          applicant_id: currentUserId,
          shelter_id: pet.shelter_id,
          applicant_metadata: {
            hogar: value.hogar,
            experiencia: value.experiencia,
            motivo: value.motivo,
            tiene_espacio: value.hogar === 'casa',
            otros_mascotas: value.otros_mascotas,
          },
          status: 'pendiente' as AdoptionStatus,
        };
        console.log('📝 Enviando solicitud:', requestData);

        await adoptionRepo.submitRequest(requestData);
        console.log('✅ Solicitud enviada, cambiando a success');
        setSuccess(true);
      } catch (err: any) {
        console.error('❌ Error en onSubmit:', err);
        Alert.alert('Error', err.message || 'No se pudo enviar la solicitud.');
      }
    },
  });

  const Field = form.Field;

  if (success) {
    return (
      <View style={styles.successContainer}>
        <SuccessAnimation />
        <Text style={styles.successTitle}>¡Solicitud enviada!</Text>
        <Text style={styles.successSubtitle}>El refugio revisará tu solicitud</Text>
        <View>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={styles.successButton}
          >
            <Text style={styles.successButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollView, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Solicitar Adopción</Text>
        <Text style={styles.subtitle}>
          {pet ? `Solicitando a: ${pet.name}` : 'Cargando...'}
        </Text>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <>
              <Field name="experiencia">
                {(field) => (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Experiencia con mascotas</Text>
                    <TextInput
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      placeholder="¿Has tenido mascotas antes? Cuéntanos..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      style={styles.input}
                    />
                  </View>
                )}
              </Field>

              <Field name="hogar">
                {(field) => (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Tipo de hogar</Text>
                    <View style={styles.optionsRow}>
                      {['casa', 'departamento'].map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => field.handleChange(opt)}
                          style={[
                            styles.optionButton,
                            field.state.value === opt ? styles.optionButtonActive : styles.optionButtonInactive
                          ]}
                        >
                          <Text style={[
                            styles.optionText,
                            field.state.value === opt ? styles.optionTextActive : styles.optionTextInactive
                          ]}>
                            {opt === 'casa' ? 'Casa' : 'Departamento'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </Field>

              <Field name="otros_mascotas">
                {(field) => (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>¿Tienes otras mascotas?</Text>
                    <View style={styles.optionsRow}>
                      {[
                        { label: 'Sí', value: true },
                        { label: 'No', value: false },
                      ].map((opt) => (
                        <TouchableOpacity
                          key={opt.label}
                          onPress={() => field.handleChange(opt.value)}
                          style={[
                            styles.optionButton,
                            field.state.value === opt.value ? styles.optionButtonActive : styles.optionButtonInactive
                          ]}
                        >
                          <Text style={[
                            styles.optionText,
                            field.state.value === opt.value ? styles.optionTextActive : styles.optionTextInactive
                          ]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </Field>

              <Field name="motivo">
                {(field) => (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Motivación</Text>
                    <TextInput
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      placeholder="¿Por qué deseas adoptar a esta mascota?"
                      placeholderTextColor="#94A3B8"
                      multiline
                      style={[styles.input, styles.inputLarge]}
                    />
                  </View>
                )}
              </Field>

              <TouchableOpacity
                onPress={() => form.handleSubmit()}
                disabled={isSubmitting}
                style={styles.submitButton}
              >
                {isSubmitting && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
                <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
              </TouchableOpacity>
            </>
          )}
        </form.Subscribe>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
