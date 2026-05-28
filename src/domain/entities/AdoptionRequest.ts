export type AdoptionStatus = 'pendiente' | 'aprobado' | 'rechazado';

export interface ApplicantMetadata {
  hogar: string;
  experiencia: string;
  motivo: string;
  tiene_espacio: boolean;
  otros_mascotas: boolean;
}

export interface AdoptionRequest {
  id: string;
  pet_id: string;
  applicant_id: string;
  shelter_id: string;
  status: AdoptionStatus;
  applicant_metadata: ApplicantMetadata;
  created_at: string;
}
