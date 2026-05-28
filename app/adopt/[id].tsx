import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useForm } from '@tanstack/react-form';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SuccessAnimation } from '../../src/infrastructure/ui/animations/SuccessAnimation';
import { useAppStore } from '../../src/application/store/useAppStore';
import { SupabaseAdoptionRepository } from '../../src/infrastructure/repositories/SupabaseAdoptionRepository';
import { SupabasePetRepository } from '../../src/infrastructure/repositories/SupabasePetRepository';
import { Pet } from '../../src/domain/entities/Pet';

const adoptionRepo = new SupabaseAdoptionRepository();
const petRepo = new SupabasePetRepository();

export default function AdoptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAppStore((s) => s.user);
  const [pet, setPet] = useState<Pet | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const all = await petRepo.getAllPets();
      const found = all.find((p) => p.id === id);
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
      if (!user || !pet) return;
      try {
        await adoptionRepo.submitRequest({
          pet_id: id!,
          applicant_id: user.id,
          shelter_id: pet.shelter_id,
          applicant_metadata: {
            hogar: value.hogar,
            experiencia: value.experiencia,
            motivo: value.motivo,
            tiene_espacio: value.hogar === 'casa',
            otros_mascotas: value.otros_mascotas,
          },
          status: 'pendiente',
        });
        setSuccess(true);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudo enviar la solicitud.');
      }
    },
  });

  const Field = form.Field;

  if (success) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <SuccessAnimation />
        <Text className="text-success font-semibold text-lg mt-4">¡Solicitud enviada!</Text>
        <Text className="text-text-secondary mt-2">El refugio revisará tu solicitud</Text>
        <View className="mt-6">
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            className="py-4 px-6 rounded-2xl bg-primary items-center"
          >
            <Text className="font-semibold text-base text-white">Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-6" keyboardShouldPersistTaps="handled">
        <Text className="text-3xl font-bold text-text mb-2">Solicitar Adopción</Text>
        <Text className="text-text-secondary mb-6">
          {pet ? `Solicitando a: ${pet.name}` : 'Cargando...'}
        </Text>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <>
              <Field name="experiencia">
                {(field) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Experiencia con mascotas</Text>
                    <TextInput
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      placeholder="¿Has tenido mascotas antes? Cuéntanos..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text min-h-[80px]"
                    />
                  </View>
                )}
              </Field>

              <Field name="hogar">
                {(field) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Tipo de hogar</Text>
                    <View className="flex-row gap-3">
                      {['casa', 'departamento'].map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => field.handleChange(opt)}
                          className={`flex-1 py-3 px-4 rounded-xl border items-center ${
                            field.state.value === opt
                              ? 'bg-primary border-primary'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Text
                            className={`font-medium ${
                              field.state.value === opt ? 'text-white' : 'text-text'
                            }`}
                          >
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
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">¿Tienes otras mascotas?</Text>
                    <View className="flex-row gap-3">
                      {[
                        { label: 'Sí', value: true },
                        { label: 'No', value: false },
                      ].map((opt) => (
                        <TouchableOpacity
                          key={opt.label}
                          onPress={() => field.handleChange(opt.value)}
                          className={`flex-1 py-3 px-4 rounded-xl border items-center ${
                            field.state.value === opt.value
                              ? 'bg-primary border-primary'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Text
                            className={`font-medium ${
                              field.state.value === opt.value ? 'text-white' : 'text-text'
                            }`}
                          >
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
                  <View className="mb-6">
                    <Text className="text-sm font-medium text-text mb-2">Motivación</Text>
                    <TextInput
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      placeholder="¿Por qué deseas adoptar a esta mascota?"
                      placeholderTextColor="#94A3B8"
                      multiline
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text min-h-[100px]"
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
                <Text className="font-semibold text-base text-white">Enviar Solicitud</Text>
              </TouchableOpacity>
            </>
          )}
        </form.Subscribe>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
