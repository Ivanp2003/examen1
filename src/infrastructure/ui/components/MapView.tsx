import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MapViewProps {
  latitude: number;
  longitude: number;
}

export const MapPreview = ({ latitude, longitude }: MapViewProps) => (
  <View className="w-full h-48 bg-gray-200 rounded-2xl items-center justify-center overflow-hidden">
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <MaterialCommunityIcons name="map-marker-outline" size={14} color="#6D597A" style={{ marginRight: 4 }} />
      <Text className="text-text-secondary text-sm"> Map: {latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
    </View>
  </View>
);
