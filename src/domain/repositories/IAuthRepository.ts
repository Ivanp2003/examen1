import { User, UserMetadata } from '../entities/User';

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  register(
    email: string,
    password: string,
    nombre: string,
    role: 'refugio' | 'adoptante',
    metadata: UserMetadata,
  ): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
}
