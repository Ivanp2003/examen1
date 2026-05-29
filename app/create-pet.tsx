import { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  Alert, TextInput, TouchableOpacity, Image, ActivityIndicator, Dimensions, StyleSheet,
} from 'react-native';
import { useForm } from '@tanstack/react-form';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PetSize, PetTag, PetStatus } from '../src/domain/entities/Pet';
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
  successText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 18,
    marginTop: 16,
  },
  hero: {
    backgroundColor: '#F4A261',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 64,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: -32,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6D597A',
    marginBottom: 4,
  },
  formSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 24,
  },
  photoButton: {
    width: '100%',
    height: 192,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(244, 162, 97, 0.1)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoText: {
    color: '#6D597A',
    fontWeight: '500',
    fontSize: 16,
  },
  photoSubtext: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D597A',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: '#6D597A',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  rowItem: {
    flex: 1,
  },
  sizeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D597A',
    marginBottom: 12,
    marginLeft: 4,
  },
  sizeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: '#F4A261',
    borderColor: '#F4A261',
    shadowColor: '#F4A261',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sizeButtonInactive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E8E8E8',
  },
  sizeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sizeTextActive: {
    color: '#FFFFFF',
  },
  sizeTextInactive: {
    color: '#6D597A',
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D597A',
    marginBottom: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagButtonActive: {
    backgroundColor: '#F4A261',
    borderColor: '#F4A261',
    shadowColor: '#F4A261',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tagButtonInactive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E8E8E8',
  },
  tagText: {
    fontWeight: '500',
    fontSize: 14,
  },
  tagTextActive: {
    color: '#FFFFFF',
  },
  tagTextInactive: {
    color: '#6D597A',
  },
  textareaContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  textarea: {
    flex: 1,
    paddingVertical: 16,
    color: '#6D597A',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
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
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
  },
});

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

      console.log('👤 Usuario actual:', user);
      console.log('🆔 User ID:', user.id);

      setUploading(true);
      try {
        const imageUrl = await petRepo.uploadPetImage(imageUri);
        const petData = {
          name: value.name,
          species: value.species,
          breed: value.breed,
          age: parseInt(value.age, 10),
          size: value.size,
          description: value.description,
          tags: value.tags,
          images: [imageUrl],
          shelter_id: user.id,
          status: 'disponible' as PetStatus,
        };
        console.log('📦 Datos a insertar:', petData);
        await createPet.execute(petData);
        setSuccess(true);
        setTimeout(() => router.back(), 2000);
      } catch (err: any) {
        console.error('❌ Error completo:', err);
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
      <View style={styles.successContainer}>
        <DogAnimation size={120} loop={false} />
        <Text style={styles.successText}>¡Mascota registrada!</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="pencil-outline" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Registrar Mascota</Text>
            <Text style={styles.heroSubtitle}>
              Completa los datos para publicarla y encontrarle un hogar
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Información</Text>
            <Text style={styles.formSubtitle}>Todos los campos con * son obligatorios</Text>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <>
                  {/* Foto */}
                  <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.photoImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <View style={styles.photoIcon}>
                          <MaterialCommunityIcons name="camera-outline" size={28} color="#6D597A" />
                        </View>
                        <Text style={styles.photoText}>Agregar foto</Text>
                        <Text style={styles.photoSubtext}>Toca para seleccionar</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Nombre */}
                  <Field name="name">
                    {(f) => (
                      <View>
                        <Text style={styles.label}>Nombre *</Text>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="tag-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                          <TextInput
                            value={f.state.value}
                            onChangeText={(t) => f.handleChange(t)}
                            placeholder="Max"
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Especie & Raza row */}
                  <View style={styles.row}>
                    <View style={styles.rowItem}>
                      <Field name="species">
                        {(f) => (
                          <View>
                            <Text style={styles.label}>Especie *</Text>
                            <View style={styles.inputContainer}>
                              <MaterialCommunityIcons name="paw-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                              <TextInput
                                value={f.state.value}
                                onChangeText={(t) => f.handleChange(t)}
                                placeholder="Perro"
                                placeholderTextColor="#94A3B8"
                                style={styles.input}
                              />
                            </View>
                          </View>
                        )}
                      </Field>
                    </View>
                    <View style={styles.rowItem}>
                      <Field name="breed">
                        {(f) => (
                          <View>
                            <Text style={styles.label}>Raza</Text>
                            <View style={styles.inputContainer}>
                              <MaterialCommunityIcons name="source-branch" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                              <TextInput
                                value={f.state.value}
                                onChangeText={(t) => f.handleChange(t)}
                                placeholder="Labrador"
                                placeholderTextColor="#94A3B8"
                                style={styles.input}
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
                        <Text style={styles.label}>Edad (años) *</Text>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="calendar-outline" size={18} color="#6D597A" style={{ marginRight: 12 }} />
                          <TextInput
                            value={f.state.value}
                            onChangeText={(t) => f.handleChange(t)}
                            placeholder="2"
                            keyboardType="numeric"
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  {/* Tamaño */}
                  <Text style={styles.sizeLabel}>Tamaño *</Text>
                  <Field name="size">
                    {(f) => (
                      <View style={styles.sizeContainer}>
                        {SIZES.map((s) => (
                          <TouchableOpacity
                            key={s.key}
                            onPress={() => f.handleChange(s.key)}
                            activeOpacity={0.85}
                            style={[
                              styles.sizeButton,
                              f.state.value === s.key ? styles.sizeButtonActive : styles.sizeButtonInactive
                            ]}
                          >
                            <MaterialCommunityIcons name={s.icon} size={20} color={f.state.value === s.key ? '#FFFFFF' : '#6D597A'} />
                            <Text style={[
                              styles.sizeText,
                              f.state.value === s.key ? styles.sizeTextActive : styles.sizeTextInactive
                            ]}>{s.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </Field>

                  {/* Tags */}
                  <Text style={styles.tagsLabel}>Etiquetas</Text>
                  <Field name="tags">
                    {(f) => (
                      <View style={styles.tagsContainer}>
                        {TAGS.map((tag) => {
                          const active = f.state.value.includes(tag);
                          return (
                            <TouchableOpacity
                              key={tag}
                              onPress={() => f.handleChange(active ? f.state.value.filter((t) => t !== tag) : [...f.state.value, tag])}
                              activeOpacity={0.7}
                              style={[
                                styles.tagButton,
                                active ? styles.tagButtonActive : styles.tagButtonInactive
                              ]}
                            >
                              <Text style={[
                                styles.tagText,
                                active ? styles.tagTextActive : styles.tagTextInactive
                              ]}>{tag}</Text>
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
                        <Text style={styles.label}>Descripción</Text>
                        <View style={styles.textareaContainer}>
                          <MaterialCommunityIcons name="book-outline" size={18} color="#6D597A" style={{ marginTop: 16, marginRight: 12 }} />
                          <TextInput
                            value={f.state.value}
                            onChangeText={(t) => f.handleChange(t)}
                            placeholder="Cuéntanos sobre su personalidad..."
                            multiline
                            placeholderTextColor="#94A3B8"
                            style={styles.textarea}
                          />
                        </View>
                      </View>
                    )}
                  </Field>

                  <TouchableOpacity
                    onPress={() => form.handleSubmit()}
                    disabled={isSubmitting || uploading}
                    activeOpacity={0.85}
                    style={styles.submitButton}
                  >
                    {(isSubmitting || uploading) && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
                    <Text style={styles.submitButtonText}>
                      {isSubmitting || uploading ? 'Publicando...' : 'Publicar Mascota'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </form.Subscribe>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Al publicar, aceptas nuestros Términos y Condiciones
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
