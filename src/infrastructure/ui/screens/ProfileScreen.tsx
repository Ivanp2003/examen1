import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAppStore } from '../../../application/store/useAppStore';
import { SupabaseAuthRepository } from '../../repositories/SupabaseAuthRepository';
import { LoadingAnimation } from '../animations/LoadingAnimation';

const authRepo = new SupabaseAuthRepository();

export const ProfileScreen = () => {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authRepo.logout();
      logout();
      router.replace('/login');
    } catch {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold text-text">Profile</Text>
      </View>
      <ScrollView contentContainerClassName="px-6 pb-8 items-center">
        <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-4">
          <Text className="text-primary text-4xl font-bold">{user?.nombre?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text className="text-2xl font-bold text-text">{user?.nombre || 'Usuario'}</Text>
        <Text className="text-text-secondary mb-8">{user?.email}</Text>

        <View className="w-full bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          {[
            { label: 'My Pets', icon: '🐾', onPress: () => {} },
            { label: 'Adoption Requests', icon: '📋', onPress: () => {} },
            { label: 'AI Assistant', icon: '🤖', onPress: () => router.push('/ai-chat') },
            { label: 'Settings', icon: '⚙️', onPress: () => {} },
          ].map((item, i) => (
            <TouchableOpacity key={i} onPress={item.onPress} className="flex-row items-center py-4 border-b border-gray-100 last:border-b-0">
              <Text className="text-xl mr-4">{item.icon}</Text>
              <Text className="text-text flex-1">{item.label}</Text>
              <Text className="text-text-secondary">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} className="w-full py-4 bg-white rounded-2xl border border-error/20 items-center">
          {loading ? <LoadingAnimation /> : <Text className="text-error font-semibold">Sign Out</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
