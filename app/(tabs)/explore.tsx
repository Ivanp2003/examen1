import React, { useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Alert, Platform, ToastAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import tw from 'twrnc';
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

const FALLBACK_SHELTERS: Shelter[] = [
  { id: 'shelter-1', nombre: 'Refugio Esperanza', latitude: -0.2105, longitude: -78.4916, description: 'Refugio de mascotas - Listo para adoptar' },
  { id: 'shelter-2', nombre: 'Hogar Animal', latitude: -0.2150, longitude: -78.4850, description: 'Refugio de mascotas - Listo para adoptar' },
  { id: 'shelter-3', nombre: 'Patitas Felices', latitude: -0.2050, longitude: -78.4980, description: 'Refugio de mascotas - Listo para adoptar' },
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
      await fetch('https://www.gstatic.com/generate_204', { method: 'GET' });
      return true;
    } catch {
      return false;
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleShelterPress = (shelter: Shelter) => {
    if (!userLocation) return;
    setSelectedShelter(shelter);
    setDistance(calculateDistance(userLocation.latitude, userLocation.longitude, shelter.latitude, shelter.longitude));
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
      const { error: updErr } = await supabase.from('usuarios').update({ metadata: newMetadata }).eq('id', user.id);
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
        if (idx >= 0) { const copy = [...prev]; copy[idx] = me; return copy; }
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
      console.error('❌ Error guardando ubicación:', e);
      showToast('Error al guardar la ubicación');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setUserLocation({ latitude: -0.2105, longitude: -78.4916 });
        } else {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
        const { data: sheltersData, error } = await supabase
          .from('usuarios')
          .select('id, nombre, metadata')
          .eq('role', 'refugio');
        if (error) {
          setShelters(FALLBACK_SHELTERS);
        } else if (sheltersData && sheltersData.length > 0) {
          setShelters(sheltersData.map((s: any) => ({
            id: s.id,
            nombre: s.nombre || 'Refugio',
            latitude: s.metadata?.latitude || -0.2105,
            longitude: s.metadata?.longitude || -78.4916,
            description: 'Refugio de mascotas - Listo para adoptar',
          })));
        } else {
          setShelters(FALLBACK_SHELTERS);
        }
      } catch {
        setUserLocation({ latitude: -0.2105, longitude: -78.4916 });
        setShelters(FALLBACK_SHELTERS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const centerLat = selectedShelter?.latitude ?? userLocation?.latitude ?? -0.2105;
  const centerLon = selectedShelter?.longitude ?? userLocation?.longitude ?? -78.4916;

  const mapHtml = useMemo(() => {
    const sheltersJson = JSON.stringify(shelters);
    const userLat = userLocation?.latitude ?? null;
    const userLon = userLocation?.longitude ?? null;
    const selectedId = selectedShelter?.id ?? null;
    const selectedLat = selectedShelter?.latitude ?? null;
    const selectedLon = selectedShelter?.longitude ?? null;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-popup-content-wrapper { border-radius: 12px; }
    .leaflet-popup-content { font-family: sans-serif; font-size: 14px; margin: 8px 12px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      var map = L.map('map').setView([${centerLat}, ${centerLon}], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      var shelters = ${sheltersJson};
      var userLat = ${userLat !== null ? userLat : 'null'};
      var userLon = ${userLon !== null ? userLon : 'null'};
      var selectedId = ${selectedId !== null ? '"' + selectedId + '"' : 'null'};
      var selectedLat = ${selectedLat !== null ? selectedLat : 'null'};
      var selectedLon = ${selectedLon !== null ? selectedLon : 'null'};

      // Marcadores de refugios
      shelters.forEach(function(s) {
        var color = (selectedId && s.id === selectedId) ? '#E76F51' : '#F4A261';
        var marker = L.circleMarker([s.latitude, s.longitude], {
          radius: 10, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9
        }).addTo(map);
        marker.bindPopup('<b>' + s.nombre + '</b><br/>' + s.description);
        marker.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'shelterSelected',
              id: s.id,
              nombre: s.nombre,
              lat: s.latitude,
              lon: s.longitude
            }));
          }
        });
      });

      // Marcador del usuario
      if (userLat !== null && userLon !== null) {
        L.circleMarker([userLat, userLon], {
          radius: 8, fillColor: '#4285F4', color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9
        }).addTo(map).bindPopup('Tu ubicación').openPopup();
      }

      // Línea entre usuario y refugio seleccionado
      if (userLat !== null && userLon !== null && selectedLat !== null && selectedLon !== null) {
        var latlngs = [
          [userLat, userLon],
          [selectedLat, selectedLon]
        ];
        L.polyline(latlngs, { color: '#F4A261', weight: 4, opacity: 0.8, dashArray: '8, 6' }).addTo(map);
      }

      // Marcador pendiente
      var pendingLat = null;
      var pendingLon = null;
      var pendingMarker = null;

      map.on('contextmenu', function(e) {
        pendingLat = e.latlng.lat;
        pendingLon = e.latlng.lng;
        if (pendingMarker) map.removeLayer(pendingMarker);
        pendingMarker = L.circleMarker([pendingLat, pendingLon], {
          radius: 8, fillColor: '#2E86DE', color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9
        }).addTo(map).bindPopup('Ubicación seleccionada (guardar)').openPopup();
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'longPress',
            lat: pendingLat,
            lon: pendingLon
          }));
        }
      });
    })();
  </script>
</body>
</html>
    `;
  }, [shelters, userLocation, selectedShelter, centerLat, centerLon]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'shelterSelected') {
        const shelter: Shelter = {
          id: data.id,
          nombre: data.nombre,
          latitude: data.lat,
          longitude: data.lon,
          description: 'Refugio de mascotas - Listo para adoptar',
        };
        handleShelterPress(shelter);
      } else if (data.type === 'longPress') {
        setPendingLocation({ latitude: data.lat, longitude: data.lon });
      }
    } catch (e) {
      console.warn('Error procesando mensaje del WebView:', e);
    }
  };

  if (loading) {
    console.log('🌀 RENDER LOADER desde ExploreScreen — loading:', loading, 'user:', user?.id ?? 'null');
    return (
      <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={tw`mt-4 text-base text-[#6D597A] font-medium`}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 w-full h-full bg-[#FFF7ED]`}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={tw`flex-1 w-full h-full`}
        onMessage={handleWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
      />

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
