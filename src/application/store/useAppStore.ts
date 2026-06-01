import { create } from 'zustand';
import { User } from '../../domain/entities/User';
import { SupabaseAuthRepository } from '../../infrastructure/repositories/SupabaseAuthRepository';
import { SignInWithGoogleUseCase } from '../use-cases/AuthUseCases';

const authRepository = new SupabaseAuthRepository();
const signInWithGoogleUseCase = new SignInWithGoogleUseCase(authRepository);

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, isAuthenticated: false, loading: false }),
  googleLogin: async () => {
    set({ loading: true });
    try {
      const { user, error } = await signInWithGoogleUseCase.execute();
      if (error) throw error;
      set({ loading: false });
      return { success: true };
    } catch (error: any) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },
}));
