import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { supabase } from '../api/supabase';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;

    const { data: profile, error: profileError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Perfil de usuario no encontrado en la base de datos.');
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      nombre: profile.nombre,
      metadata: profile.metadata ?? {},
      created_at: profile.created_at,
    };
  }

  async signInWithGoogle(): Promise<{ user: any; error: any }> {
    try {
      const redirectTo = 'petadopt://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No se pudo generar la URL de autenticación.');

      console.log('🌐 Abriendo sesión de navegador, esperando redirect a petadopt://...');
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        console.log('✅ Regreso del navegador. Procesando URL...');
        const hashFragment = result.url.split('#')[1] || '';
        const hashParams = new URLSearchParams(hashFragment);

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          return { user: sessionData.user, error: null };
        }

        console.warn('⚠️ URL de retorno sin tokens:', result.url.substring(0, 80));
      }

      return { user: null, error: new Error('Autenticación cancelada o fallida') };
    } catch (error: any) {
      return { user: null, error };
    }
  }

  async register(
    email: string,
    password: string,
    nombre: string,
    role: 'refugio' | 'adoptante',
    metadata: Record<string, any>,
  ): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, role } },
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Error al crear el usuario en Auth.');

    const { error: insertError } = await supabase.from('usuarios').insert({
      id: authData.user.id,
      email,
      nombre,
      role,
      metadata,
    });
    if (insertError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw insertError;
    }

    return {
      id: authData.user.id,
      email,
      role,
      nombre,
      metadata,
      created_at: authData.user.created_at,
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return null;

    const { data: profile } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      nombre: profile.nombre,
      metadata: profile.metadata ?? {},
      created_at: profile.created_at,
    };
  }

  async resetPassword(email: string, redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }
}
