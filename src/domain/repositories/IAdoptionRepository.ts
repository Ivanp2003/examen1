import { AdoptionRequest } from '../entities/AdoptionRequest';

export interface IAdoptionRepository {
  submitRequest(request: Omit<AdoptionRequest, 'created_at' | 'id'>): Promise<AdoptionRequest>;
  getRequestsByShelter(shelterId: string): Promise<AdoptionRequest[]>;
  getRequestsByApplicant(applicantId: string): Promise<AdoptionRequest[]>;
  updateRequestStatus(requestId: string, status: 'aprobado' | 'rechazado'): Promise<void>;
}
