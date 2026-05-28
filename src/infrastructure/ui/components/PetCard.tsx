import { TouchableOpacity, Text, Image, View } from 'react-native';
import { Pet } from '../../../domain/entities/Pet';

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
}

export const PetCard = ({ pet, onPress }: PetCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4"
  >
    <Image
      source={{ uri: pet.images[0] || 'https://via.placeholder.com/300' }}
      className="w-full h-48"
      resizeMode="cover"
    />
    <View className="p-4">
      <Text className="text-lg font-bold text-text">{pet.name}</Text>
      <View className="flex-row items-center mt-1">
        <Text className="text-text-secondary text-sm">{pet.species}</Text>
        <Text className="text-text-secondary text-sm mx-2">•</Text>
        <Text className="text-text-secondary text-sm">{pet.age} {pet.age === 1 ? 'año' : 'años'}</Text>
        <Text className="text-text-secondary text-sm mx-2">•</Text>
        <Text className="text-text-secondary text-sm">{pet.size}</Text>
      </View>
      {pet.tags.length > 0 && (
        <View className="flex-row flex-wrap mt-2 gap-1">
          {pet.tags.map((tag) => (
            <View key={tag} className="px-2 py-1 bg-primary/10 rounded-full">
              <Text className="text-xs text-primary">{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <Text className="text-text-secondary text-sm mt-2 line-clamp-2">{pet.description}</Text>
      <View className="flex-row mt-3">
        <View className={`px-3 py-1 rounded-full ${pet.status === 'disponible' ? 'bg-success/20' : pet.status === 'pendiente' ? 'bg-accent/20' : 'bg-gray-200'}`}>
          <Text className={`text-xs font-medium ${pet.status === 'disponible' ? 'text-success' : pet.status === 'pendiente' ? 'text-accent' : 'text-gray-500'}`}>
            {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
