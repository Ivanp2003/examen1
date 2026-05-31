import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { supabase } from '../api/supabase';
import * as Linking from 'expo-linking';
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

  async loginWithGoogle(redirectUrl?: string): Promise<void> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl || Linking.createURL('auth/callback'),
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    if (data.url) {
      await WebBrowser.openBrowserAsync(data.url);
    } else {
      throw new Error('No se recibió URL de autorización');
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
