import { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  Alert, TextInput, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useForm } from '@tanstack/react-form';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';

import { PetSize, PetTag } from '../src/domain/entities/Pet';
import { SupabasePetRepository } from '../src/infrastructure/repositories/SupabasePetRepository';
import { CreatePetUseCase } from '../src/application/use-cases/PetUseCases';
import { useAppStore } from '../src/application/store/useAppStore';

const petRepo = new SupabasePetRepository();
const createPet = new CreatePetUseCase(petRepo);

const TAGS: PetTag[] = [
  'sociable', 'activo', 'tranquilo', 'cariñoso',
  'independiente', 'protector', 'jugueton', 'entrenado',
];

const SIZES: { key: PetSize; label: string }[] = [
  { key: 'P', label: 'Pequeño' },
  { key: 'M', label: 'Mediano' },
  { key: 'G', label: 'Grande' },
];

export default function CreatePetScreen() {
  const user = useAppStore((s) => s.user);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      species: '',
      breed: '',
      age: '',
      size: 'M' as PetSize,
      description: '',
      tags: [] as PetTag[],
    },
    onSubmit: async ({ value }) => {
      if (!user) { Alert.alert('Error', 'Debes iniciar sesión.'); return; }
      if (!imageUri) { Alert.alert('Error', 'Selecciona una foto de la mascota.'); return; }

      setUploading(true);
      try {
        const imageUrl = await petRepo.uploadPetImage(imageUri);
        await createPet.execute({
          name: value.name,
          species: value.species,
          breed: value.breed,
          age: parseInt(value.age, 10),
          size: value.size,
          description: value.description,
          tags: value.tags,
          images: [imageUrl],
          shelter_id: user.id,
          status: 'disponible',
        });
        setSuccess(true);
        setTimeout(() => router.back(), 2000);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudo registrar la mascota.');
      } finally {
        setUploading(false);
      }
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const Field = form.Field;

  if (success) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <LottieView
          source={require('../assets/animations/success.json')}
          autoPlay loop={false} style={{ width: 120, height: 120 }}
        />
        <Text className="text-success font-semibold text-lg mt-4">¡Mascota registrada!</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-6" keyboardShouldPersistTaps="handled">
        <Text className="text-3xl font-bold text-text mb-1">Registrar Mascota</Text>
        <Text className="text-text-secondary mb-6">Completa los datos para publicarla</Text>

        {/* Foto */}
        <TouchableOpacity onPress={pickImage} className="w-full h-48 bg-gray-100 rounded-2xl border border-dashed border-gray-300 items-center justify-center mb-6 overflow-hidden">
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center">
              <Text className="text-3xl text-text-secondary">+</Text>
              <Text className="text-text-secondary text-sm mt-1">Agregar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <>
              {/* Nombre */}
              <Field name="name">
                {(f) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Nombre *</Text>
                    <TextInput
                      value={f.state.value}
                      onChangeText={(t) => f.handleChange(t)}
                      placeholder="Max"
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text"
                    />
                  </View>
                )}
              </Field>

              {/* Especie */}
              <Field name="species">
                {(f) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Especie *</Text>
                    <TextInput
                      value={f.state.value}
                      onChangeText={(t) => f.handleChange(t)}
                      placeholder="Perro, Gato, etc."
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text"
                    />
                  </View>
                )}
              </Field>

              {/* Raza */}
              <Field name="breed">
                {(f) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Raza</Text>
                    <TextInput
                      value={f.state.value}
                      onChangeText={(t) => f.handleChange(t)}
                      placeholder="Labrador, Criollo, etc."
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text"
                    />
                  </View>
                )}
              </Field>

              {/* Edad */}
              <Field name="age">
                {(f) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">Edad (años) *</Text>
                    <TextInput
                      value={f.state.value}
                      onChangeText={(t) => f.handleChange(t)}
                      placeholder="2"
                      keyboardType="numeric"
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text"
                    />
                  </View>
                )}
              </Field>

              {/* Tamaño */}
              <Text className="text-sm font-medium text-text mb-2">Tamaño *</Text>
              <Field name="size">
                {(f) => (
                  <View className="flex-row mb-4 gap-3">
                    {SIZES.map((s) => (
                      <TouchableOpacity
                        key={s.key}
                        onPress={() => f.handleChange(s.key)}
                        className={`flex-1 py-3 rounded-xl border items-center ${f.state.value === s.key ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                      >
                        <Text className={`font-semibold ${f.state.value === s.key ? 'text-white' : 'text-text'}`}>{s.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Field>

              {/* Tags */}
              <Text className="text-sm font-medium text-text mb-2">Etiquetas</Text>
              <Field name="tags">
                {(f) => (
                  <View className="flex-row flex-wrap mb-4 gap-2">
                    {TAGS.map((tag) => {
                      const active = f.state.value.includes(tag);
                      return (
                        <TouchableOpacity
                          key={tag}
                          onPress={() => f.handleChange(active ? f.state.value.filter((t) => t !== tag) : [...f.state.value, tag])}
                          className={`px-3 py-2 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                        >
                          <Text className={active ? 'text-white text-sm' : 'text-text text-sm'}>{tag}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </Field>

              {/* Descripción */}
              <Field name="description">
                {(f) => (
                  <View className="mb-6">
                    <Text className="text-sm font-medium text-text mb-2">Descripción</Text>
                    <TextInput
                      value={f.state.value}
                      onChangeText={(t) => f.handleChange(t)}
                      placeholder="Cuéntanos sobre su personalidad..."
                      multiline
                      placeholderTextColor="#94A3B8"
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-text min-h-[100px]"
                    />
                  </View>
                )}
              </Field>

              <TouchableOpacity
                onPress={() => form.handleSubmit()}
                disabled={isSubmitting || uploading}
                className="py-4 px-6 rounded-2xl bg-primary border border-primary items-center justify-center flex-row"
              >
                {(isSubmitting || uploading) && <ActivityIndicator color="white" className="mr-2" />}
                <Text className="font-semibold text-base text-white">Publicar Mascota</Text>
              </TouchableOpacity>
            </>
          )}
        </form.Subscribe>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
