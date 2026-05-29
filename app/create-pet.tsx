import { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  Alert, TextInput, TouchableOpacity, Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { useForm } from '@tanstack/react-form';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';

import { PetSize, PetTag } from '../src/domain/entities/Pet';
import { SupabasePetRepository } from '../src/infrastructure/repositories/SupabasePetRepository';
import { CreatePetUseCase } from '../src/application/use-cases/PetUseCases';
import { useAppStore } from '../src/application/store/useAppStore';

const { width } = Dimensions.get('window');

const petRepo = new SupabasePetRepository();
const createPet = new CreatePetUseCase(petRepo);

const TAGS: PetTag[] = [
  'sociable', 'activo', 'tranquilo', 'cariñoso',
  'independiente', 'protector', 'jugueton', 'entrenado',
];

const SIZES: { key: PetSize; label: string; icon: string }[] = [
  { key: 'P', label: 'Pequeño', icon: '🐕' },
  { key: 'M', label: 'Mediano', icon: '🐕' },
  { key: 'G', label: 'Grande', icon: '🐕' },
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
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Hero Section */}
        <View className="bg-primary px-6 pt-20 pb-16 rounded-b-[40px]">
          <View className="items-center">
            <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-4">
              <Text className="text-4xl">📝</Text>
            </View>
            <Text className="text-4xl font-bold text-white tracking-tight">Registrar Mascota</Text>
            <Text className="text-white/80 text-base mt-2 text-center max-w-xs">
              Completa los datos para publicarla y encontrarle un hogar
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View className="px-6 -mt-8">
          <View className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <Text className="text-2xl font-bold text-text mb-1">Información</Text>
            <Text className="text-text-secondary text-sm mb-6">Todos los campos con * son obligatorios</Text>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <>
                  {/* Foto */}
                  <TouchableOpacity onPress={pickImage} className="w-full h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 items-center justify-center mb-6 overflow-hidden">
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="items-center">
                        <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
                          <Text className="text-3xl">📷</Text>
                        </View>
                        <Text className="text-text-secondary font-medium">Agregar foto</Text>
                        <Text className="text-text-secondary/60 text-xs mt-1">Toca para seleccionar</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Nombre */}
                  <Field name="name">
                    {(f) => (
                      <View className="mb-5">
                        <Text className="text-sm font-semibold text-text mb-2 ml-1">Nombre *</Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                          <Text className="text-lg mr-3">📛</Text>
                          <TextInput
                            value={f.state.value}
                            onChangeText={(t) => f.handleChange(t)}
                            placeholder="Max"
                            placeholderTextColor="#94A3B8"
                            className="flex-1 py-4 text-text"
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Especie & Raza row */}
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Field name="species">
                        {(f) => (
                          <View className="mb-5">
                            <Text className="text-sm font-semibold text-text mb-2 ml-1">Especie *</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                              <Text className="text-lg mr-3">🐾</Text>
                              <TextInput
                                value={f.state.value}
                                onChangeText={(t) => f.handleChange(t)}
                                placeholder="Perro"
                                placeholderTextColor="#94A3B8"
                                className="flex-1 py-4 text-text"
                              />
                            </View>
                          </View>
                        )}
                      </Field>
                    </View>
                    <View className="flex-1">
                      <Field name="breed">
                        {(f) => (
                          <View className="mb-5">
                            <Text className="text-sm font-semibold text-text mb-2 ml-1">Raza</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                              <Text className="text-lg mr-3">🧬</Text>
                              <TextInput
                                value={f.state.value}
                                onChangeText={(t) => f.handleChange(t)}
                                placeholder="Labrador"
                                placeholderTextColor="#94A3B8"
                                className="flex-1 py-4 text-text"
                              />
                            </View>
                          </View>
                        )}
                      </Field>
                    </View>
                  </View>

                  {/* Edad */}
                  <Field name="age">
                    {(f) => (
                      <View className="mb-5">
                        <Text className="text-sm font-semibold text-text mb-2 ml-1">Edad (años) *</Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                          <Text className="text-lg mr-3">🎂</Text>
                          <TextInput
                            value={f.state.value}
                            onChangeText={(t) => f.handleChange(t)}
                            placeholder="2"
                            keyboardType="numeric"
                            placeholderTextColor="#94A3B8"
                            className="flex-1 py-4 text-text"
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Tamaño */}
                  <Text className="text-sm font-semibold text-text mb-3 ml-1">Tamaño *</Text>
                  <Field name="size">
                    {(f) => (
                      <View className="flex-row mb-5 gap-3">
                        {SIZES.map((s) => (
                          <TouchableOpacity
                            key={s.key}
                            onPress={() => f.handleChange(s.key)}
                            activeOpacity={0.85}
                            className={`flex-1 py-4 rounded-2xl border items-center ${f.state.value === s.key ? 'bg-primary border-primary shadow-sm shadow-primary/30' : 'bg-gray-50 border-gray-200'}`}
                            style={f.state.value === s.key ? { elevation: 3 } : {}}
                          >
                            <Text className="text-xl mb-1">{s.icon}</Text>
                            <Text className={`font-semibold text-sm ${f.state.value === s.key ? 'text-white' : 'text-text'}`}>{s.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </Field>

                  {/* Tags */}
                  <Text className="text-sm font-semibold text-text mb-3 ml-1">Etiquetas</Text>
                  <Field name="tags">
                    {(f) => (
                      <View className="flex-row flex-wrap mb-5 gap-2">
                        {TAGS.map((tag) => {
                          const active = f.state.value.includes(tag);
                          return (
                            <TouchableOpacity
                              key={tag}
                              onPress={() => f.handleChange(active ? f.state.value.filter((t) => t !== tag) : [...f.state.value, tag])}
                              activeOpacity={0.7}
                              className={`px-4 py-2.5 rounded-full border ${active ? 'bg-primary border-primary shadow-sm shadow-primary/20' : 'bg-gray-50 border-gray-200'}`}
                              style={active ? { elevation: 2 } : {}}
                            >
                              <Text className={`font-medium text-sm ${active ? 'text-white' : 'text-text'}`}>{tag}</Text>
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
                        <Text className="text-sm font-semibold text-text mb-2 ml-1">Descripción</Text>
                        <View className="flex-row bg-gray-50 border border-gray-200 rounded-2xl px-4">
                          <Text className="text-lg mt-4 mr-3">📖</Text>
                          <TextInput
                            value={f.state.value}
                            onChangeText={(t) => f.handleChange(t)}
                            placeholder="Cuéntanos sobre su personalidad..."
                            multiline
                            placeholderTextColor="#94A3B8"
                            className="flex-1 py-4 text-text min-h-[100px]"
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  <TouchableOpacity
                    onPress={() => form.handleSubmit()}
                    disabled={isSubmitting || uploading}
                    activeOpacity={0.85}
                    className="py-4 rounded-2xl bg-primary items-center justify-center flex-row shadow-lg shadow-primary/40"
                    style={{ elevation: 4 }}
                  >
                    {(isSubmitting || uploading) && <ActivityIndicator color="white" className="mr-2" />}
                    <Text className="font-bold text-base text-white">
                      {isSubmitting || uploading ? 'Publicando...' : 'Publicar Mascota'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </form.Subscribe>
          </View>
        </View>

        <View className="items-center mt-8 pb-10 px-6">
          <Text className="text-text-secondary/60 text-xs text-center max-w-xs">
            Al publicar, aceptas nuestros Términos y Condiciones
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
