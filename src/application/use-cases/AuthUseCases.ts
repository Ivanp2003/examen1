import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class LoginUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    return await this.authRepo.login(email, password);
  }
}

export class SignInWithGoogleUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(): Promise<{ user: any; error: any }> {
    return await this.authRepo.signInWithGoogle();
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
  ): Promise<User> {
    return await this.authRepo.register(email, password, nombre, role, metadata);
  }
}
