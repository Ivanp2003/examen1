import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../../application/store/useAppStore';
import { SupabaseAuthRepository } from '../../repositories/SupabaseAuthRepository';

const authRepo = new SupabaseAuthRepository();

const menuItems = [
  { label: 'Mis Mascotas', icon: '🐾', desc: 'Mascotas que has registrado', onPress: () => {} },
  { label: 'Solicitudes', icon: '📋', desc: 'Historial de solicitudes', onPress: () => router.push('/(tabs)/chat') },
  { label: 'Asistente IA', icon: '🤖', desc: 'Consejos y recomendaciones', onPress: () => router.push('/ai-chat') },
  { label: 'Configuración', icon: '⚙️', desc: 'Ajustes de la cuenta', onPress: () => {} },
];

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await authRepo.logout();
              logout();
              router.replace('/login');
            } catch {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-8" bounces={false}>
        {/* Profile Header */}
        <View className="bg-primary px-6 pt-12 pb-20 rounded-b-[40px]" style={{ paddingTop: insets.top + 12 }}>
          <View className="items-center">
            <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4 border-2 border-white/30">
              <Text className="text-white text-4xl font-bold">{user?.nombre?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <Text className="text-2xl font-bold text-white">{user?.nombre || 'Usuario'}</Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white/90 text-xs font-medium">
                  {user?.role === 'refugio' ? '🏠 Refugio' : '❤️ Adoptante'}
                </Text>
              </View>
            </View>
            <Text className="text-white/70 text-sm mt-2">{user?.email}</Text>
          </View>
        </View>

        {/* Menu Cards */}
        <View className="px-6 -mt-14">
          <View className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={item.onPress}
                activeOpacity={0.7}
                className={`flex-row items-center p-5 ${i < menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center">
                  <Text className="text-2xl">{item.icon}</Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text className="font-semibold text-text">{item.label}</Text>
                  <Text className="text-text-secondary text-xs mt-0.5">{item.desc}</Text>
                </View>
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                  <Text className="text-text-secondary text-lg">›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            disabled={loading}
            className="mt-6 py-4 rounded-2xl bg-white border border-error/20 items-center justify-center flex-row"
          >
            {loading ? (
              <Text className="text-text-secondary">Cerrando sesión...</Text>
            ) : (
              <>
                <Text className="text-error font-bold text-base">Cerrar Sesión</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Version */}
          <Text className="text-text-secondary/40 text-xs text-center mt-6">PetAdopt v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};
