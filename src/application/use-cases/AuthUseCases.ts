import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { useAppStore } from '../store/useAppStore';

export class LoginUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<void> {
    const user = await this.authRepo.login(email, password);
    useAppStore.getState().setUser({
      id: user.id,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
      metadata: user.metadata,
      created_at: user.created_at,
    });
  }
}

export class LoginWithGoogleUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(redirectUrl?: string): Promise<void> {
    await this.authRepo.loginWithGoogle(redirectUrl);
  }
}

export class RegisterUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(
    email: string,
    password: string,
    nombre: string,
    role: 'refugio' | 'adoptante',
    metadata: Record<string, any>,
  ): Promise<void> {
    const user = await this.authRepo.register(email, password, nombre, role, metadata);
    useAppStore.getState().setUser({
      id: user.id,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
      metadata: user.metadata,
      created_at: user.created_at,
    });
  }
}
