import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../../src/infrastructure/api/supabase';

interface Shelter {
  id: string;
  nombre: string;
  latitude: number;
  longitude: number;
  description: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF7ED',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6D597A',
    fontWeight: '500',
  },
  distanceCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
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
  },
  distanceTitle: {
    fontSize: 14,
    color: '#6D597A',
    fontWeight: '500',
  },
  distanceValue: {
    fontSize: 24,
    color: '#F4A261',
    fontWeight: 'bold',
    marginTop: 4,
  },
  distanceShelter: {
    fontSize: 16,
    color: '#6D597A',
    marginTop: 4,
  },
  clearButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F4A261',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

// Refugios de fallback para demostración (coordenadas Quito/EPN)
const FALLBACK_SHELTERS: Shelter[] = [
  {
    id: 'shelter-1',
    nombre: 'Refugio Esperanza',
    latitude: -0.2105,
    longitude: -78.4916,
    description: 'Refugio de mascotas - Listo para adoptar',
  },
  {
    id: 'shelter-2',
    nombre: 'Hogar Animal',
    latitude: -0.2150,
    longitude: -78.4850,
    description: 'Refugio de mascotas - Listo para adoptar',
  },
  {
    id: 'shelter-3',
    nombre: 'Patitas Felices',
    latitude: -0.2050,
    longitude: -78.4980,
    description: 'Refugio de mascotas - Listo para adoptar',
  },
];

export default function ExploreScreen() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Calcular distancia usando fórmula Haversine (en km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleShelterPress = (shelter: Shelter) => {
    if (!userLocation) return;
    
    setSelectedShelter(shelter);
    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      shelter.latitude,
      shelter.longitude
    );
    setDistance(dist);
  };

  const clearSelection = () => {
    setSelectedShelter(null);
    setDistance(null);
  };

  useEffect(() => {
    (async () => {
      try {
        // Solicitar permisos de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permiso de ubicación denegado, usando ubicación por defecto');
          setUserLocation({ latitude: -0.2105, longitude: -78.4916 });
        } else {
          // Obtener ubicación actual
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }

        // Cargar refugios de Supabase
        const { data: sheltersData, error } = await supabase
          .from('usuarios')
          .select('id, nombre, metadata')
          .eq('role', 'refugio');

        if (error) {
          console.error('Error cargando refugios:', error);
          setShelters(FALLBACK_SHELTERS);
        } else if (sheltersData && sheltersData.length > 0) {
          // Convertir datos de Supabase a formato de marcadores
          const shelterMarkers: Shelter[] = sheltersData.map((s: any) => ({
            id: s.id,
            nombre: s.nombre || 'Refugio',
            latitude: s.metadata?.latitude || -0.2105,
            longitude: s.metadata?.longitude || -78.4916,
            description: 'Refugio de mascotas - Listo para adoptar',
          }));
          setShelters(shelterMarkers);
        } else {
          // Usar refugios de fallback si no hay datos
          console.log('No hay refugios en la base de datos, usando fallback');
          setShelters(FALLBACK_SHELTERS);
        }
      } catch (error) {
        console.error('Error en inicialización:', error);
        setUserLocation({ latitude: -0.2105, longitude: -78.4916 });
        setShelters(FALLBACK_SHELTERS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  const region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: -0.2105,
        longitude: -78.4916,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Marcador del usuario (azul) */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Tu ubicación"
            description="Estás aquí"
            pinColor="#4285F4"
          />
        )}

        {/* Línea entre usuario y refugio seleccionado */}
        {selectedShelter && userLocation && (
          <Polyline
            coordinates={[
              {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              {
                latitude: selectedShelter.latitude,
                longitude: selectedShelter.longitude,
              },
            ]}
            strokeColor="#F4A261"
            strokeWidth={3}
          />
        )}

        {/* Marcadores de refugios */}
        {shelters.map((shelter) => (
          <Marker
            key={shelter.id}
            coordinate={{
              latitude: shelter.latitude,
              longitude: shelter.longitude,
            }}
            title={shelter.nombre}
            description={shelter.description}
            pinColor={selectedShelter?.id === shelter.id ? "#E76F51" : "#F4A261"}
            onPress={() => handleShelterPress(shelter)}
          />
        ))}
      </MapView>

      {/* Card de distancia */}
      {selectedShelter && distance !== null && (
        <View style={styles.distanceCard}>
          <Text style={styles.distanceTitle}>Distancia al refugio</Text>
          <Text style={styles.distanceValue}>{distance.toFixed(2)} km</Text>
          <Text style={styles.distanceShelter}>{selectedShelter.nombre}</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
            <Text style={styles.clearButtonText}>Limpiar selección</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
