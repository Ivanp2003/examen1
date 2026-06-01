import { View, ActivityIndicator, Text } from 'react-native';
import tw from 'twrnc';

export default function Index() {
  // Pantalla de carga pura; el routing guard en _layout.tsx decide a dónde redirigir
  return (
    <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}>
      <ActivityIndicator size="large" color="#F4A261" />
      <Text style={tw`mt-4 text-[#6D597A] text-base font-medium`}>Iniciando PetAdopt...</Text>
    </View>
  );
}
