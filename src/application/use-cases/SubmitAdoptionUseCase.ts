import { AdoptionRequest } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRepository } from '../../domain/repositories/IAdoptionRepository';

export class SubmitAdoptionUseCase {
  constructor(private adoptionRepo: IAdoptionRepository) {}

  async execute(request: Omit<AdoptionRequest, 'created_at' | 'id'>): Promise<AdoptionRequest> {
    return this.adoptionRepo.submitRequest(request);
  }
}
