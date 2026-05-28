export type PetSize = 'P' | 'M' | 'G';
export type PetStatus = 'disponible' | 'adoptado' | 'pendiente';

export type PetTag =
  | 'sociable'
  | 'activo'
  | 'tranquilo'
  | 'cariñoso'
  | 'independiente'
  | 'protector'
  | 'jugueton'
  | 'entrenado';

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  size: PetSize;
  description: string;
  tags: PetTag[];
  images: string[];
  shelter_id: string;
  status: PetStatus;
  created_at: string;
}
