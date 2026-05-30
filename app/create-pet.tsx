import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  Alert, TextInput, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import { useForm } from '@tanstack/react-form';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PetSize, PetTag, PetStatus } from '../src/domain/entities/Pet';
import { supabase } from '../src/infrastructure/api/supabase';
import { SupabasePetRepository } from '../src/infrastructure/repositories/SupabasePetRepository';
import { CreatePetUseCase } from '../src/application/use-cases/PetUseCases';
import { useAppStore } from '../src/application/store/useAppStore';
import DogAnimation from '../src/infrastructure/ui/animations/DogAnimation';

const petRepo = new SupabasePetRepository();
const createPet = new CreatePetUseCase(petRepo);

const TAGS: PetTag[] = [
  'sociable', 'activo', 'tranquilo', 'cariñoso',
  'independiente', 'protector', 'jugueton', 'entrenado',
];

const SIZES: { key: PetSize; label: string; icon: any }[] = [
  { key: 'P' as PetSize, label: 'Pequeño', icon: 'paw-outline' },
  { key: 'M' as PetSize, label: 'Mediano', icon: 'paw-outline' },
  { key: 'G' as PetSize, label: 'Grande', icon: 'paw-outline' },
];

export default function CreatePetScreen() {
  const user = useAppStore((s) => s.user);
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditMode = !!editId;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEditMode);

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
        let imageUrl = imageUri;
        if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
          imageUrl = await petRepo.uploadPetImage(imageUri);
        }

        const petData = {
          name: value.name,
          species: value.species,
          breed: value.breed,
          age: parseInt(value.age, 10),
          size: value.size,
          description: value.description,
          tags: value.tags,
          images: [imageUrl],
        };

        if (isEditMode && editId) {
          await petRepo.updatePet(editId, petData);
          Alert.alert('Éxito', 'Mascota actualizada correctamente.');
        } else {
          const fullPetData = { ...petData, shelter_id: user.id, status: 'disponible' as PetStatus };
          await createPet.execute(fullPetData);
          setSuccess(true);
          setTimeout(() => router.back(), 2000);
          return;
        }

        router.back();
      } catch (err: any) {
        console.error('❌ Error completo:', err);
        Alert.alert('Error', err.message || 'No se pudo guardar la mascota.');
      } finally {
        setUploading(false);
      }
    },
  });

  // Precargar datos en modo edición
  useEffect(() => {
    if (!isEditMode || !editId) return;

    const loadPet = async () => {
      try {
        const { data, error } = await supabase
          .from('mascotas')
          .select('*')
          .eq('id', editId)
          .single();

        if (error || !data) {
          Alert.alert('Error', 'No se pudo cargar la mascota.');
          router.back();
          return;
        }

        form.setFieldValue('name', data.name || '');
        form.setFieldValue('species', data.species || '');
        form.setFieldValue('breed', data.breed || '');
        form.setFieldValue('age', String(data.age || ''));
        form.setFieldValue('size', (data.size as PetSize) || 'M');
        form.setFieldValue('description', data.description || '');
        form.setFieldValue('tags', (data.tags as PetTag[]) || []);
        if (data.images && data.images.length > 0) {
          setImageUri(data.images[0]);
        }
      } catch (err) {
        console.error('❌ Error cargando mascota para editar:', err);
      } finally {
        setLoadingEdit(false);
      }
    };

    loadPet();
  }, [editId, isEditMode]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const Field = form.Field;

  if (loadingEdit) {
    return (
      <View style={tw`flex-1 bg-[#FFF7ED] items-center justify-center`}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={tw`text-[#10B981] font-semibold text-lg mt-4`}>Cargando mascota...</Text>
      </View>
    );
  }

  if (success) {
    return (
      <View style={tw`flex-1 bg-[#FFF7ED] items-center justify-center`}>
        <DogAnimation size={120} loop={false} />
        <Text style={tw`text-[#10B981] font-semibold text-lg mt-4`}>¡Mascota registrada!</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 bg-[#FFF7ED]`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Hero Section */}
        <View style={tw`bg-[#F4A261] px-6 pt-20 pb-16 rounded-b-[40px]`}>
          <View style={tw`items-center`}>
            <View style={tw`w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-4`}>
              <MaterialCommunityIcons name="pencil-outline" size={36} color="#FFFFFF" />
            </View>
            <Text style={tw`text-[32px] font-bold text-white text-center`}>{isEditMode ? 'Editar Mascota' : 'Registrar Mascota'}</Text>
            <Text style={tw`text-white/80 text-base mt-2 text-center max-w-[280px]`}>
              {isEditMode ? 'Actualiza los datos de tu mascota' : 'Completa los datos para publicarla y encontrarle un hogar'}
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={tw`px-6 -mt-8`}>
          <View style={tw`bg-white rounded-3xl p-8 shadow-sm border border-[#F1F3F5]`}>
            <Text style={tw`text-2xl font-bold text-[#6D597A] mb-1`}>{isEditMode ? 'Editar Información' : 'Información'}</Text>
            <Text style={tw`text-[#94A3B8] text-sm mb-6`}>Todos los campos con * son obligatorios</Text>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <>
                  {/* Foto */}
                  <TouchableOpacity onPress={pickImage} style={tw`w-full h-48 bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-[#E8E8E8] items-center justify-center mb-6 overflow-hidden`}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={tw`w-full h-full`} resizeMode="cover" />
                    ) : (
                      <View style={tw`items-center`}>
                        <View style={tw`w-16 h-16 bg-[#F4A261]/10 rounded-full items-center justify-center mb-2`}>
                          <MaterialCommunityIcons name="camera-outline" size={28} color="#6D597A" />
                        </View>
                        <Text style={tw`text-[#6D597A] font-medium text-base`}>Agregar foto</Text>
                        <Text style={tw`text-[#94A3B8] text-xs mt-1`}>Toca para seleccionar</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Nombre */}
                  <Field name="name">
                    {(f) => (
                      <View>
                        <Text style={tw`text-sm font-semibold text-[#6D597A] mb-2 ml-1`}>Nombre *</Text>
                        <View style={tw`flex-row items-center bg-[#F8F9FA] border border-[#E8E8E8] rounded-2xl px-4 mb-5`}>
                          <MaterialCommunityIcons name="tag-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                          <TextInput
                            value={f.state.value}
                            onChangeText={(t) => f.handleChange(t)}
                            placeholder="Max"
                            placeholderTextColor="#94A3B8"
                            style={tw`flex-1 py-4 text-[#6D597A] text-base`}
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Especie & Raza row */}
                  <View style={tw`flex-row gap-4`}>
                    <View style={tw`flex-1`}>
                      <Field name="species">
                        {(f) => (
                          <View>
                            <Text style={tw`text-sm font-semibold text-[#6D597A] mb-2 ml-1`}>Especie *</Text>
                            <View style={tw`flex-row items-center bg-[#F8F9FA] border border-[#E8E8E8] rounded-2xl px-4 mb-5`}>
                              <MaterialCommunityIcons name="paw-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                              <TextInput
                                value={f.state.value}
                                onChangeText={(t) => f.handleChange(t)}
                                placeholder="Perro"
                                placeholderTextColor="#94A3B8"
                                style={tw`flex-1 py-4 text-[#6D597A] text-base`}
                              />
                            </View>
                          </View>
                        )}
                      </Field>
                    </View>
                    <View style={tw`flex-1`}>
                      <Field name="breed">
                        {(f) => (
                          <View>
                            <Text style={tw`text-sm font-semibold text-[#6D597A] mb-2 ml-1`}>Raza</Text>
                            <View style={tw`flex-row items-center bg-[#F8F9FA] border border-[#E8E8E8] rounded-2xl px-4 mb-5`}>
                              <MaterialCommunityIcons name="source-branch" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                              <TextInput
                                value={f.state.value}
                                onChangeText={(t) => f.handleChange(t)}
                                placeholder="Labrador"
                                placeholderTextColor="#94A3B8"
                                style={tw`flex-1 py-4 text-[#6D597A] text-base`}
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
                      <View>
                        <Text style={tw`text-sm font-semibold text-[#6D597A] mb-2 ml-1`}>Edad (años) *</Text>
                        <View style={tw`flex-row items-center bg-[#F8F9FA] border border-[#E8E8E8] rounded-2xl px-4 mb-5`}>
                          <MaterialCommunityIcons name="calendar-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                          <TextInput
                            value={f.state.value}
                            onChangeText={(t) => f.handleChange(t)}
                            placeholder="2"
                            keyboardType="numeric"
                            placeholderTextColor="#94A3B8"
                            style={tw`flex-1 py-4 text-[#6D597A] text-base`}
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Tamaño */}
                  <Text style={tw`text-sm font-semibold text-[#6D597A] mb-3 ml-1`}>Tamaño *</Text>
                  <Field name="size">
                    {(f) => (
                      <View style={tw`flex-row mb-5 gap-3`}>
                        {SIZES.map((s) => (
                          <TouchableOpacity
                            key={s.key}
                            onPress={() => f.handleChange(s.key)}
                            activeOpacity={0.85}
                            style={[tw`flex-1 py-4 rounded-2xl border items-center`, f.state.value === s.key ? tw`bg-[#F4A261] border-[#F4A261]` : tw`bg-[#F8F9FA] border-[#E8E8E8]`]}
                          >
                            <MaterialCommunityIcons name={s.icon} size={20} color={f.state.value === s.key ? '#FFFFFF' : '#6D597A'} />
                            <Text style={[tw`font-semibold text-sm`, f.state.value === s.key ? tw`text-white` : tw`text-[#6D597A]`]}>{s.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </Field>

                  {/* Tags */}
                  <Text style={tw`text-sm font-semibold text-[#6D597A] mb-3 ml-1`}>Etiquetas</Text>
                  <Field name="tags">
                    {(f) => (
                      <View style={tw`flex-row flex-wrap mb-5 gap-2`}>
                        {TAGS.map((tag) => {
                          const active = f.state.value.includes(tag);
                          return (
                            <TouchableOpacity
                              key={tag}
                              onPress={() => f.handleChange(active ? f.state.value.filter((t) => t !== tag) : [...f.state.value, tag])}
                              activeOpacity={0.7}
                              style={[tw`px-4 py-2.5 rounded-full border`, active ? tw`bg-[#F4A261] border-[#F4A261]` : tw`bg-[#F8F9FA] border-[#E8E8E8]`]}
                            >
                              <Text style={[tw`font-medium text-sm`, active ? tw`text-white` : tw`text-[#6D597A]`]}>{tag}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </Field>

                  {/* Descripción */}
                  <Field name="description">
                    {(f) => (
                      <View>
                        <Text style={tw`text-sm font-semibold text-[#6D597A] mb-2 ml-1`}>Descripción</Text>
                        <View style={tw`flex-row bg-[#F8F9FA] border border-[#E8E8E8] rounded-2xl px-4 mb-6`}>
                          <MaterialCommunityIcons name="book-outline" size={18} color="#6D597A" style={{ marginTop: 16, marginRight: 12 }} />
                          <TextInput
                            value={f.state.value}
                            onChangeText={(t) => f.handleChange(t)}
                            placeholder="Cuéntanos sobre su personalidad..."
                            multiline
                            placeholderTextColor="#94A3B8"
                            style={tw`flex-1 py-4 text-[#6D597A] text-base min-h-[100px]`}
                            textAlignVertical="top"
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  <TouchableOpacity
                    onPress={() => form.handleSubmit()}
                    disabled={isSubmitting || uploading}
                    activeOpacity={0.85}
                    style={tw`py-4 rounded-2xl bg-[#F4A261] items-center justify-center flex-row`}
                  >
                    {(isSubmitting || uploading) && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
                    <Text style={tw`font-bold text-base text-white`}>
                      {isSubmitting || uploading ? (isEditMode ? 'Guardando...' : 'Publicando...') : (isEditMode ? 'Guardar Cambios' : 'Publicar Mascota')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </form.Subscribe>
          </View>
        </View>

        <View style={tw`items-center mt-8 pb-10 px-6`}>
          <Text style={tw`text-[#94A3B8] text-xs text-center max-w-[280px]`}>
            Al publicar, aceptas nuestros Términos y Condiciones
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
