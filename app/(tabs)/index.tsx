import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import { Pet } from '../../src/domain/entities/Pet';
import { SupabasePetRepository } from '../../src/infrastructure/repositories/SupabasePetRepository';
import { GetAvailablePetsUseCase } from '../../src/application/use-cases/PetUseCases';
import { useAppStore } from '../../src/application/store/useAppStore';
import { PetCard } from '../../src/infrastructure/ui/components/PetCard';

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
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pb-4">
        <Text className="text-3xl font-bold text-text">
          {role === 'refugio' ? 'Mis Mascotas' : 'Mascotas en Adopción'}
        </Text>
        <Text className="text-text-secondary mt-1">
          {role === 'refugio' ? 'Administra tus mascotas registradas' : 'Encuentra a tu nuevo compañero'}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={renderPet}
        contentContainerClassName="px-6 pb-24"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <LottieView
              source={require('../../assets/animations/empty.json')}
              autoPlay loop style={{ width: 150, height: 150 }}
            />
            <Text className="text-text-secondary mt-4 text-base">
              {role === 'refugio' ? 'No has registrado mascotas aún' : 'No hay mascotas disponibles'}
            </Text>
          </View>
        }
      />

      {/* FAB solo para refugios */}
      {role === 'refugio' && (
        <TouchableOpacity
          onPress={() => router.push('/create-pet')}
          activeOpacity={0.85}
          className="absolute bottom-8 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white text-3xl leading-none">+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
