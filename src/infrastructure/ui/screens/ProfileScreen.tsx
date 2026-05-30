import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import tw from 'twrnc';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../../application/store/useAppStore';
import { SupabaseAuthRepository } from '../../repositories/SupabaseAuthRepository';
import DogAnimation from '../animations/DogAnimation';

const authRepo = new SupabaseAuthRepository();

const menuItems = [
  { label: 'Mis Mascotas', icon: 'paw-outline' as const, desc: 'Mascotas que has registrado', onPress: () => router.push('/(tabs)') },
  { label: 'Solicitudes', icon: 'chat-outline' as const, desc: 'Historial de solicitudes', onPress: () => router.push('/(tabs)/chat') },
  { label: 'Asistente IA', icon: 'lightbulb-outline' as const, desc: 'Consejos y recomendaciones', onPress: () => router.push('/ai-chat') },
  { label: 'Configuración', icon: 'cog-outline' as const, desc: 'Ajustes de la cuenta', onPress: () => router.push('/settings') },
];

const ProfileScreen = () => {
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
    <View style={tw`flex-1 bg-[#FFF7ED]`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} bounces={false}>
        {/* Profile Header */}
        <View style={[tw`px-6 pb-20 rounded-b-[40px] bg-[#F4A261]`, { paddingTop: insets.top + 12 }]}>
          <View style={tw`items-center`}>
            <View style={tw`w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4 border-2 border-white/30`}>
              <DogAnimation size={80} />
            </View>
            <Text style={tw`text-white text-2xl font-bold`}>{user?.nombre || 'Usuario'}</Text>
            <View style={tw`bg-white/20 px-3 py-1 rounded-2xl mt-1`}>
              <View style={tw`flex-row items-center`}>
                <MaterialCommunityIcons name={user?.role === 'refugio' ? 'home' : 'heart'} size={14} color="rgba(255,255,255,0.9)" style={{ marginRight: 4 }} />
                <Text style={tw`text-white/90 text-xs font-medium`}>
                  {user?.role === 'refugio' ? ' Refugio' : ' Adoptante'}
                </Text>
              </View>
            </View>
            <Text style={tw`text-white/70 text-sm mt-2`}>{user?.email}</Text>
          </View>
        </View>

        {/* Menu Cards */}
        <View style={tw`px-6 -mt-14`}>
          <View style={tw`bg-white rounded-3xl shadow-sm border border-[#F1F3F5] overflow-hidden`}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={item.onPress}
                activeOpacity={0.7}
                style={[tw`flex-row items-center p-5`, i < menuItems.length - 1 ? tw`border-b border-[#F1F3F5]` : {}]}
              >
                <View style={tw`w-12 h-12 bg-[#F4A261]/10 rounded-2xl items-center justify-center`}>
                  <MaterialCommunityIcons name={item.icon} size={24} color="#6D597A" />
                </View>
                <View style={tw`flex-1 ml-4`}>
                  <Text style={tw`text-base font-semibold text-[#6D597A]`}>{item.label}</Text>
                  <Text style={tw`text-xs text-[#6D597A] mt-0.5`}>{item.desc}</Text>
                </View>
                <View style={tw`w-8 h-8 bg-[#F1F3F5] rounded-full items-center justify-center`}>
                  <Text style={tw`text-[#6D597A] text-lg`}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            disabled={loading}
            style={tw`mt-6 py-4 rounded-2xl bg-white border border-[#6D597A]/20 items-center justify-center`}
          >
            {loading ? (
              <Text style={tw`text-[#6D597A] font-bold text-base`}>Cerrando sesión...</Text>
            ) : (
              <Text style={tw`text-[#6D597A] font-bold text-base`}>Cerrar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Version */}
          <Text style={tw`text-[#6D597A]/40 text-xs text-center mt-6`}>PetAdopt v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
