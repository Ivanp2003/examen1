import { IPetRepository } from '../../domain/repositories/IPetRepository';
import { Pet } from '../../domain/entities/Pet';

export class GetAvailablePetsUseCase {
  constructor(private petRepo: IPetRepository) {}

  async execute(): Promise<Pet[]> {
    return this.petRepo.getAllPets();
  }
}

export class CreatePetUseCase {
  constructor(private petRepo: IPetRepository) {}

  async execute(pet: Omit<Pet, 'id' | 'created_at'>): Promise<Pet> {
    return this.petRepo.createPet(pet);
  }
}
