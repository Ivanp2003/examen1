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
    const { data, error } = await supabase
      .from('mascotas')
      .insert(pet)
      .select()
      .single();
    if (error) throw error;
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
}
