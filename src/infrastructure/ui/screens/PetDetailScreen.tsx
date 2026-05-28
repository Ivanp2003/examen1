import { View, Text, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Pet } from '../../../domain/entities/Pet';
import { SupabasePetRepository } from '../../repositories/SupabasePetRepository';
import { GetAvailablePetsUseCase } from '../../../application/use-cases/PetUseCases';
import { Button } from '../components/Button';

const petRepo = new SupabasePetRepository();
const getPets = new GetAvailablePetsUseCase(petRepo);

export const PetDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await getPets.execute();
        const found = all.find((p) => p.id === id) ?? null;
        setPet(found);
      } catch {
        setPet(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <LottieView source={require('../../../../assets/animations/loading.json')} autoPlay loop style={{ width: 120, height: 120 }} />
      </View>
    );
  }
  if (!pet) return <View className="flex-1 bg-background items-center justify-center"><Text>Mascota no encontrada</Text></View>;

  return (
    <ScrollView className="flex-1 bg-background">
      <Image source={{ uri: pet.images[0] || 'https://via.placeholder.com/400' }} className="w-full h-72" resizeMode="cover" />
      <View className="px-6 -mt-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-text">{pet.name}</Text>
            <View className={`px-3 py-1 rounded-full ${pet.status === 'disponible' ? 'bg-success/20' : pet.status === 'pendiente' ? 'bg-accent/20' : 'bg-gray-200'}`}>
              <Text className={`text-xs font-medium ${pet.status === 'disponible' ? 'text-success' : pet.status === 'pendiente' ? 'text-accent' : 'text-gray-500'}`}>
                {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
              </Text>
            </View>
          </View>
          <View className="flex-row mt-2">
            <Text className="text-text-secondary">{pet.species}</Text>
            {pet.breed && <Text className="text-text-secondary ml-2">• {pet.breed}</Text>}
            <Text className="text-text-secondary ml-2">• {pet.age} {pet.age === 1 ? 'año' : 'años'}</Text>
            <Text className="text-text-secondary ml-2">• Tamaño {pet.size}</Text>
          </View>
          {pet.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-3 gap-1">
              {pet.tags.map((tag) => (
                <View key={tag} className="px-3 py-1 bg-primary/10 rounded-full">
                  <Text className="text-xs text-primary">{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <Text className="text-text mt-4 leading-6">{pet.description}</Text>
          <View className="flex-row mt-6 gap-4">
            <Button title="Solicitar Adopción" onPress={() => router.push(`/adopt/${pet.id}`)} variant="primary" />
            <Button title="Contactar" onPress={() => router.push(`/(tabs)/chat`)} variant="outline" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
