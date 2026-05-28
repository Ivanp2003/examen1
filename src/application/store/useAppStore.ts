import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'refugio' | 'adoptante';
  nombre: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, isAuthenticated: false, loading: false }),
}));
