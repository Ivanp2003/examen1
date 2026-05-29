import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import { Pet } from '../../src/domain/entities/Pet';
import { SupabasePetRepository } from '../../src/infrastructure/repositories/SupabasePetRepository';
import { GetAvailablePetsUseCase } from '../../src/application/use-cases/PetUseCases';
import { useAppStore } from '../../src/application/store/useAppStore';
import { PetCard } from '../../src/infrastructure/ui/components/PetCard';

const { width } = Dimensions.get('window');

const petRepo = new SupabasePetRepository();
const getPets = new GetAvailablePetsUseCase(petRepo);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const role = user?.role ?? 'adoptante';

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = useCallback(async () => {
    try {
      const data = role === 'refugio'
        ? await petRepo.getPetsByShelter(user!.id)
        : await getPets.execute();
      setPets(data);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => { fetchPets(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchPets(); };

  const renderPet = ({ item }: { item: Pet }) => (
    <PetCard pet={item} onPress={() => router.push(`/pet/${item.id}`)} />
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <LottieView
          source={require('../../assets/animations/loading.json')}
          autoPlay loop style={{ width: 120, height: 120 }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-6 pt-12 pb-8 rounded-b-[32px]" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white/70 text-sm font-medium">
              {role === 'refugio' ? 'Panel de gestión' : 'Descubre mascotas'}
            </Text>
            <Text className="text-3xl font-bold text-white mt-1">
              {role === 'refugio' ? 'Mis Mascotas' : 'Mascotas en Adopción'}
            </Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
            <Text className="text-2xl">🐾</Text>
          </View>
        </View>
      </View>

      {/* Stats for shelters */}
      {role === 'refugio' && pets.length > 0 && (
        <View className="px-6 -mt-5">
          <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{pets.length}</Text>
              <Text className="text-text-secondary text-xs mt-1">Total</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-success">{pets.filter(p => p.status === 'disponible').length}</Text>
              <Text className="text-text-secondary text-xs mt-1">Disponibles</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-accent">{pets.filter(p => p.status === 'pendiente').length}</Text>
              <Text className="text-text-secondary text-xs mt-1">Pendientes</Text>
            </View>
          </View>
        </View>
      )}

      {/* Subtitle */}
      <View className="px-6 mt-6 mb-4">
        <Text className="text-text-secondary text-sm">
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
        contentContainerClassName="px-6 pb-28"
        refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4F46E5"
          colors={['#4F46E5']}
        />}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <LottieView
              source={require('../../assets/animations/empty.json')}
              autoPlay loop style={{ width: 150, height: 150 }}
            />
            <Text className="text-text-secondary mt-4 text-base">
              {role === 'refugio' ? 'No has registrado mascotas aún' : 'No hay mascotas disponibles'}
            </Text>
            {role === 'refugio' && (
              <TouchableOpacity
                onPress={() => router.push('/create-pet')}
                className="mt-6 py-3 px-8 bg-primary rounded-2xl"
              >
                <Text className="text-white font-bold">Registrar primera mascota</Text>
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
          className="absolute bottom-8 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-xl"
          style={{ elevation: 8 }}
        >
          <Text className="text-white text-3xl leading-none">+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
