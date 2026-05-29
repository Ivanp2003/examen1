import { TouchableOpacity, Text, Image, View, StyleSheet } from 'react-native';
import { Pet } from '../../../domain/entities/Pet';

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 192,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6D597A',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  separator: {
    fontSize: 14,
    color: '#94A3B8',
    marginHorizontal: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(244, 162, 97, 0.1)',
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#F4A261',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeDisponible: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusBadgePendiente: {
    backgroundColor: 'rgba(244, 162, 97, 0.2)',
  },
  statusBadgeAdoptado: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextDisponible: {
    color: '#10B981',
  },
  statusTextPendiente: {
    color: '#F4A261',
  },
  statusTextAdoptado: {
    color: '#6B7280',
  },
});

export const PetCard = ({ pet, onPress }: PetCardProps) => {
  const getStatusStyle = () => {
    switch (pet.status) {
      case 'disponible':
        return { badge: styles.statusBadgeDisponible, text: styles.statusTextDisponible };
      case 'pendiente':
        return { badge: styles.statusBadgePendiente, text: styles.statusTextPendiente };
      case 'adoptado':
        return { badge: styles.statusBadgeAdoptado, text: styles.statusTextAdoptado };
      default:
        return { badge: styles.statusBadgeAdoptado, text: styles.statusTextAdoptado };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: pet.images[0] || 'https://via.placeholder.com/300' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{pet.name}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{pet.species}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.infoText}>{pet.age} {pet.age === 1 ? 'año' : 'años'}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.infoText}>{pet.size}</Text>
        </View>
        {pet.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {pet.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.description} numberOfLines={2}>{pet.description}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>
              {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
