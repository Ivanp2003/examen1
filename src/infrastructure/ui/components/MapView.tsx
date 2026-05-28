import { View, Text } from 'react-native';

interface MapViewProps {
  latitude: number;
  longitude: number;
}

export const MapPreview = ({ latitude, longitude }: MapViewProps) => (
  <View className="w-full h-48 bg-gray-200 rounded-2xl items-center justify-center overflow-hidden">
    <Text className="text-text-secondary text-sm">📍 Map: {latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
  </View>
);
