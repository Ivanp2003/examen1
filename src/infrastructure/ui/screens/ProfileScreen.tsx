import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 80,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: '#F4A261',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 4,
  },
  roleBadgeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  email: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 8,
  },
  menuContainer: {
    paddingHorizontal: 24,
    marginTop: -56,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  menuIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(244, 162, 97, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
    marginLeft: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6D597A',
  },
  menuDesc: {
    fontSize: 12,
    color: '#6D597A',
    marginTop: 2,
  },
  menuArrow: {
    width: 32,
    height: 32,
    backgroundColor: '#F1F3F5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuArrowText: {
    color: '#6D597A',
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(109, 89, 122, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#6D597A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  version: {
    color: 'rgba(109, 89, 122, 0.4)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});

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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} bounces={false}>
        {/* Profile Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <DogAnimation size={80} />
            </View>
            <Text style={styles.name}>{user?.nombre || 'Usuario'}</Text>
            <View style={styles.roleBadge}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name={user?.role === 'refugio' ? 'home' : 'heart'} size={14} color="rgba(255,255,255,0.9)" style={{ marginRight: 4 }} />
                <Text style={styles.roleBadgeText}>
                  {user?.role === 'refugio' ? ' Refugio' : ' Adoptante'}
                </Text>
              </View>
            </View>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        {/* Menu Cards */}
        <View style={styles.menuContainer}>
          <View style={styles.menuCard}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={item.onPress}
                activeOpacity={0.7}
                style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
              >
                <View style={styles.menuIcon}>
                  <MaterialCommunityIcons name={item.icon} size={24} color="#6D597A" />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <View style={styles.menuArrow}>
                  <Text style={styles.menuArrowText}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            disabled={loading}
            style={styles.logoutButton}
          >
            {loading ? (
              <Text style={styles.logoutButtonText}>Cerrando sesión...</Text>
            ) : (
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.version}>PetAdopt v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
