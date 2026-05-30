import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Alert, Platform, ToastAndroid } from 'react-native';
import tw from 'twrnc';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../../src/infrastructure/api/supabase';
import { useAppStore } from '../../src/application/store/useAppStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Shelter {
  id: string;
  nombre: string;
  latitude: number;
  longitude: number;
  description: string;
}


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
  const [pendingLocation, setPendingLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const user = useAppStore((s) => s.user);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const isOnline = async (): Promise<boolean> => {
    try {
      // Endpoint de conectividad ligera (204)
      await fetch('https://www.gstatic.com/generate_204', { method: 'GET' });
      return true;
    } catch {
      return false;
    }
  };

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

  const saveShelterLocation = async () => {
    if (!user || user.role !== 'refugio') return;
    const coords = pendingLocation || userLocation;
    if (!coords) return;
    const online = await isOnline();
    if (!online) {
      showToast('Sin conexión a Internet. Inténtalo nuevamente.');
      return;
    }
    setSaving(true);
    try {
      const { data: existing, error: selErr } = await supabase
        .from('usuarios')
        .select('metadata, nombre')
        .eq('id', user.id)
        .single();
      if (selErr && selErr.code !== 'PGRST116') throw selErr;
      const newMetadata = { ...(existing?.metadata || {}), latitude: coords.latitude, longitude: coords.longitude };
      const { error: updErr } = await supabase
        .from('usuarios')
        .update({ metadata: newMetadata })
        .eq('id', user.id);
      if (updErr) throw updErr;

      const me: Shelter = {
        id: user.id,
        nombre: existing?.nombre || user.nombre || 'Mi Refugio',
        latitude: coords.latitude,
        longitude: coords.longitude,
        description: 'Mi refugio',
      };
      setShelters((prev) => {
        const idx = prev.findIndex((s) => s.id === user.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = me;
          return copy;
        }
        return [...prev, me];
      });
      setSelectedShelter(me);
      if (userLocation) {
        setDistance(calculateDistance(userLocation.latitude, userLocation.longitude, coords.latitude, coords.longitude));
      }
      setPendingLocation(null);
      console.log('✅ Ubicación del refugio guardada');
      showToast('Ubicación del refugio guardada');
    } catch (e) {
      console.error('❌ Error guardando ubicación del refugio:', e);
      showToast('Error al guardar la ubicación');
    } finally {
      setSaving(false);
    }
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
      <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={tw`mt-4 text-base text-[#6D597A] font-medium`}>Cargando mapa...</Text>
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
    <View style={tw`flex-1 w-full h-full bg-[#FFF7ED]`}>
      <MapView
        style={tw`flex-1 w-full h-full`}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
        onLongPress={(e) => setPendingLocation(e.nativeEvent.coordinate)}
      >
        {/* Marcador pendiente del refugio (seleccionado por long-press) */}
        {pendingLocation && (
          <Marker
            coordinate={pendingLocation}
            title="Mi refugio (pendiente)"
            description="Mantén pulsado para mover y luego guarda"
            pinColor="#2E86DE"
          />
        )}
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

      {user?.role === 'refugio' && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[tw`absolute top-6 right-4 bg-[#6D597A] rounded-3xl py-2.5 px-3.5 shadow-sm`, { elevation: 4 }]}
          onPress={saveShelterLocation}
          disabled={saving || (!pendingLocation && !userLocation)}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={tw`text-white font-semibold text-[13px]`}>
                {pendingLocation ? 'Guardar ubicación seleccionada' : 'Guardar mi ubicación actual'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Card de distancia */}
      {selectedShelter && distance !== null && (
        <View style={tw`absolute bottom-6 left-4 right-4 bg-white rounded-2xl p-4 shadow-sm border border-[#F1F3F5]`}>
          <Text style={tw`text-sm text-[#6D597A] font-medium`}>Distancia al refugio</Text>
          <Text style={tw`text-2xl text-[#F4A261] font-bold mt-1`}>{distance.toFixed(2)} km</Text>
          <Text style={tw`text-base text-[#6D597A] mt-1`}>{selectedShelter.nombre}</Text>
          <TouchableOpacity style={tw`mt-3 py-2 px-4 bg-[#F4A261] rounded-lg items-center`} onPress={clearSelection}>
            <Text style={tw`text-white font-semibold text-sm`}>Limpiar selección</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
