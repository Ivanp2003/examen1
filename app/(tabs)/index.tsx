import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pet } from '../../src/domain/entities/Pet';
import { SupabasePetRepository } from '../../src/infrastructure/repositories/SupabasePetRepository';
import { GetAvailablePetsUseCase } from '../../src/application/use-cases/PetUseCases';
import { useAppStore } from '../../src/application/store/useAppStore';
import { PetCard } from '../../src/infrastructure/ui/components/PetCard';
import { PawAnimation } from '../../src/infrastructure/ui/animations/PawAnimation';

const { width } = Dimensions.get('window');

const petRepo = new SupabasePetRepository();
const getPets = new GetAvailablePetsUseCase(petRepo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: '#F4A261',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F4A261',
  },
  statLabel: {
    fontSize: 12,
    color: '#6D597A',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E8E8E8',
  },
  subtitleContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 14,
    color: '#6D597A',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    backgroundColor: '#F4A261',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F4A261',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 32,
  },
  emptyButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#F4A261',
    borderRadius: 16,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const role = user?.role ?? 'adoptante';

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = useCallback(async () => {
    try {
      console.log('🔄 fetchPets - Role:', role);
      const data = role === 'refugio'
        ? await petRepo.getPetsByShelter(user!.id)
        : await getPets.execute();
      
      console.log('📦 Mascotas obtenidas:', data.length);
      data.forEach(pet => {
        console.log(`  - ${pet.name}: status=${pet.status}`);
      });
      
      // Filtrar solo mascotas disponibles para adoptantes
      const filteredPets = role === 'refugio'
        ? data
        : data.filter(pet => pet.status === 'disponible');
      
      console.log('✅ Mascotas filtradas:', filteredPets.length);
      setPets(filteredPets);
    } catch (error) {
      console.error('❌ Error fetching pets:', error);
      setPets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const onRefresh = () => { setRefreshing(true); fetchPets(); };

  const renderPet = ({ item }: { item: Pet }) => (
    <PetCard pet={item} onPress={() => router.push(`/pet/${item.id}`)} />
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <PawAnimation size={120} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitle}>
            <Text style={styles.headerSubtitle}>
              {role === 'refugio' ? 'Panel de gestión' : 'Descubre mascotas'}
            </Text>
            <Text style={styles.headerTitleText}>
              {role === 'refugio' ? 'Mis Mascotas' : 'Mascotas en Adopción'}
            </Text>
          </View>
          <View style={styles.logoContainer}>
            <PawAnimation size={28} />
          </View>
        </View>
      </View>

      {/* Stats for shelters */}
      {role === 'refugio' && pets.length > 0 && (
        <View style={{ paddingHorizontal: 24, marginTop: -20 }}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pets.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#84A98C' }]}>{pets.filter(p => p.status === 'disponible').length}</Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#6D597A' }]}>{pets.filter(p => p.status === 'pendiente').length}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>
        </View>
      )}

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>
          {role === 'refugio'
            ? 'Administra tus mascotas registradas'
            : `${pets.length} mascotas esperando un hogar`}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={renderPet}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 112 }}
        refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#F4A261"
          colors={['#F4A261']}
        />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 64 }}>
            <PawAnimation size={150} />
            <Text style={[styles.subtitleText, { marginTop: 16, fontSize: 16 }]}>
              {role === 'refugio' ? 'No has registrado mascotas aún' : 'No hay mascotas disponibles'}
            </Text>
            {role === 'refugio' && (
              <TouchableOpacity
                onPress={() => router.push('/create-pet')}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Registrar primera mascota</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* FAB solo para refugios */}
      {role === 'refugio' && pets.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/create-pet')}
          activeOpacity={0.85}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
