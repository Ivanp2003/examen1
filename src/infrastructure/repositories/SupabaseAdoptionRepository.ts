import { AdoptionRequest } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRepository } from '../../domain/repositories/IAdoptionRepository';
import { supabase } from '../api/supabase';

export class SupabaseAdoptionRepository implements IAdoptionRepository {
  async submitRequest(request: Omit<AdoptionRequest, 'created_at' | 'id'>): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('solicitudes')
      .insert({ ...request, status: 'pendiente' })
      .select()
      .single();
    if (error) throw error;
    return data as AdoptionRequest;
  }

  async getRequestsByShelter(shelterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as AdoptionRequest[];
  }

  async getRequestsByApplicant(applicantId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('applicant_id', applicantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as AdoptionRequest[];
  }

  async updateRequestStatus(requestId: string, status: 'aprobado' | 'rechazado'): Promise<void> {
    const { error } = await supabase
      .from('solicitudes')
      .update({ status })
      .eq('id', requestId);
    if (error) throw error;
  }
}
