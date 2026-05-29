export type UserRole = 'refugio' | 'adoptante';

export interface UserMetadata {
  cedula?: string;
  direccion?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  ocupacion?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nombre: string;
  metadata: UserMetadata;
  created_at: string;
}
