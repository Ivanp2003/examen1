import { User, UserMetadata } from '../entities/User';

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  signInWithGoogle(): Promise<{ user: any; error: any }>;
  register(
    email: string,
    password: string,
    nombre: string,
    role: 'refugio' | 'adoptante',
    metadata: UserMetadata,
  ): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
  resetPassword(email: string, redirectTo: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
}
