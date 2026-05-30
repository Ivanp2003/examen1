import { Pet } from '../entities/Pet';

export interface IPetRepository {
  getAllPets(): Promise<Pet[]>;
  getPetsByShelter(shelterId: string): Promise<Pet[]>;
  createPet(pet: Omit<Pet, 'id' | 'created_at'>): Promise<Pet>;
  uploadPetImage(localUri: string): Promise<string>;
  updatePetStatus(petId: string, status: 'disponible' | 'adoptado' | 'pendiente'): Promise<void>;
  updatePet(petId: string, pet: Partial<Pet>): Promise<void>;
  deletePet(petId: string): Promise<void>;
}
