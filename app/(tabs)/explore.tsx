import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { PetCard } from '../../src/infrastructure/ui/components/PetCard';
import { Pet } from '../../src/domain/entities/Pet';
import { SupabasePetRepository } from '../../src/infrastructure/repositories/SupabasePetRepository';
import { supabase } from '../../src/infrastructure/api/supabase';

const petRepo = new SupabasePetRepository();

interface ShelterMarker {
  id: string;
  nombre: string;
  latitude: number;
  longitude: number;
}

export default function ExploreScreen() {
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [query, setQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [shelters, setShelters] = useState<ShelterMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación.');
        } else {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch {
        setUserLocation({ latitude: 19.4326, longitude: -99.1332 });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [petsData, { data: sheltersData }] = await Promise.all([
          petRepo.getAllPets(),
          supabase.from('usuarios').select('id, nombre, metadata').eq('role', 'refugio'),
        ]);

        setAllPets(petsData);

        if (sheltersData) {
          const center = userLocation || { latitude: 19.4326, longitude: -99.1332 };
          const markers: ShelterMarker[] = sheltersData.map((s: any, i: number) => ({
            id: s.id,
            nombre: s.nombre || 'Refugio',
            latitude: center.latitude + (Math.random() - 0.5) * 0.05,
            longitude: center.longitude + (Math.random() - 0.5) * 0.05,
          }));
          setShelters(markers);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [userLocation]);

  const results = query.length < 2
    ? allPets
    : allPets.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : undefined;

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
        <Text className="text-lg font-semibold text-text mb-4">Refugios cercanos</Text>

        <View className="h-64 rounded-2xl overflow-hidden mb-2">
          {userLocation ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={region}
              showsUserLocation
              showsMyLocationButton
            >
              {shelters.map((s) => (
                <Marker
                  key={s.id}
                  coordinate={{ latitude: s.latitude, longitude: s.longitude }}
                  title={s.nombre}
                  pinColor="#7C3AED"
                />
              ))}
            </MapView>
          ) : (
            <View className="flex-1 bg-gray-200 items-center justify-center">
              <Text className="text-text-secondary">Cargando mapa...</Text>
            </View>
          )}
        </View>

        <Text className="text-lg font-semibold text-text mt-6 mb-4">
          {query.length >= 2 ? 'Resultados' : 'Todas las mascotas'}
        </Text>

        {loading ? (
          <View className="items-center mt-4">
            <LottieView
              source={require('../../assets/animations/loading.json')}
              autoPlay
              loop
              style={{ width: 80, height: 80 }}
            />
          </View>
        ) : results.length === 0 ? (
          <View className="items-center mt-8">
            <LottieView
              source={require('../../assets/animations/empty.json')}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
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
}
