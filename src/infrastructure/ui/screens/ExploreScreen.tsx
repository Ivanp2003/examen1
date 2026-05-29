import { View, Text, ScrollView, TextInput } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { PetCard } from '../components/PetCard';
import { MapPreview } from '../components/MapView';
import { Pet } from '../../../domain/entities/Pet';
import { SupabasePetRepository } from '../../repositories/SupabasePetRepository';
import { GetAvailablePetsUseCase } from '../../../application/use-cases/PetUseCases';
import { CatAnimation } from '../animations/CatAnimation';

const petRepo = new SupabasePetRepository();
const getPets = new GetAvailablePetsUseCase(petRepo);

export const ExploreScreen = () => {
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getPets.execute();
        setAllPets(data);
      } catch {}
    })();
  }, []);

  const results = query.length < 2
    ? allPets
    : allPets.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold text-text">Explorar</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre..."
          placeholderTextColor="#94A3B8"
          className="mt-4 p-4 bg-white border border-gray-200 rounded-xl text-text"
        />
      </View>
      <ScrollView contentContainerClassName="px-6 pb-8">
        <Text className="text-lg font-semibold text-text mb-4">Cerca de ti</Text>
        <MapPreview latitude={19.4326} longitude={-99.1332} />
        <Text className="text-lg font-semibold text-text mt-6 mb-4">
          {query.length >= 2 ? 'Resultados' : 'Todas las mascotas'}
        </Text>
        {results.length === 0 ? (
          <View className="items-center mt-8">
            <CatAnimation size={120} />
            <Text className="text-text-secondary mt-4">Sin resultados</Text>
          </View>
        ) : (
          results.map((pet) => (
            <PetCard key={pet.id} pet={pet} onPress={() => router.push(`/pet/${pet.id}`)} />
          ))
        )}
      </ScrollView>
    </View>
  );
};
