import { Pet } from '../../domain/entities/Pet';
import { IPetRepository } from '../../domain/repositories/IPetRepository';
import { supabase } from '../api/supabase';

export class SupabasePetRepository implements IPetRepository {
  async getAllPets(): Promise<Pet[]> {
    const { data, error } = await supabase.from('mascotas').select('*');
    if (error) throw error;
    return data as Pet[];
  }

  async getPetsByShelter(shelterId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('mascotas')
      .select('*')
      .eq('shelter_id', shelterId);
    if (error) throw error;
    return data as Pet[];
  }

  async createPet(pet: Omit<Pet, 'id' | 'created_at'>): Promise<Pet> {
    console.log('🐾 Creando mascota con shelter_id:', pet.shelter_id);
    const { data, error } = await supabase
      .from('mascotas')
      .insert(pet)
      .select()
      .single();
    if (error) {
      console.error('❌ Error al crear mascota:', error);
      throw error;
    }
    console.log('✅ Mascota creada:', data);
    return data as Pet;
  }

  async uploadPetImage(localUri: string): Promise<string> {
    const filename = localUri.split('/').pop() || 'pet.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', { uri: localUri, name: filename, type } as any);

    const { data, error } = await supabase.storage
      .from('pet-images')
      .upload(`public/${filename}`, formData, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) throw error;

    return supabase.storage.from('pet-images').getPublicUrl(data.path).data.publicUrl;
  }

  async updatePetStatus(petId: string, status: 'disponible' | 'adoptado' | 'pendiente'): Promise<void> {
    const { error } = await supabase
      .from('mascotas')
      .update({ status })
      .eq('id', petId);
    if (error) throw error;
  }

  async updatePet(petId: string, pet: Partial<Pet>): Promise<void> {
    const { error } = await supabase
      .from('mascotas')
      .update(pet)
      .eq('id', petId);
    if (error) throw error;
  }

  async deletePet(petId: string): Promise<void> {
    const { error } = await supabase
      .from('mascotas')
      .delete()
      .eq('id', petId);
    if (error) throw error;
  }
}
