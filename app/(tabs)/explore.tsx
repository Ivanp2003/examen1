import { View, Text, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D597A',
  },
  searchInput: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    fontSize: 16,
    color: '#6D597A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6D597A',
    marginBottom: 16,
  },
  mapContainer: {
    height: 256,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  mapLoading: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLoadingText: {
    color: '#6D597A',
  },
});

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <Text style={styles.sectionTitle}>Refugios cercanos</Text>

        <View style={styles.mapContainer}>
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
                  pinColor="#F4A261"
                />
              ))}
            </MapView>
          ) : (
            <View style={styles.mapLoading}>
              <Text style={styles.mapLoadingText}>Cargando mapa...</Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          {query.length >= 2 ? 'Resultados' : 'Todas las mascotas'}
        </Text>

        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <LottieView
              source={require('../../assets/animations/loading.json')}
              autoPlay
              loop
              style={{ width: 80, height: 80 }}
            />
          </View>
        ) : results.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <LottieView
              source={require('../../assets/animations/empty.json')}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
            <Text style={[styles.mapLoadingText, { marginTop: 16 }]}>Sin resultados</Text>
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
