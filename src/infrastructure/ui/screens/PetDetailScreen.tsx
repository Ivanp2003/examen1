import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Pet } from '../../../domain/entities/Pet';
import { SupabasePetRepository } from '../../repositories/SupabasePetRepository';
import { GetAvailablePetsUseCase } from '../../../application/use-cases/PetUseCases';
import { Button } from '../components/Button';
import { PawAnimation } from '../animations/PawAnimation';

const petRepo = new SupabasePetRepository();
const getPets = new GetAvailablePetsUseCase(petRepo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#6D597A',
  },
  image: {
    width: '100%',
    height: 288,
  },
  contentContainer: {
    paddingHorizontal: 24,
    marginTop: -24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D597A',
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
    fontWeight: '500',
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
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  infoSeparator: {
    fontSize: 14,
    color: '#94A3B8',
    marginHorizontal: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 4,
  },
  tag: {
    paddingHorizontal: 12,
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
    fontSize: 16,
    color: '#6D597A',
    marginTop: 16,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: 'column',
    marginTop: 24,
    gap: 12,
  },
});

export const PetDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await getPets.execute();
        const found = all.find((p) => p.id === id) ?? null;
        setPet(found);
      } catch {
        setPet(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getStatusStyle = () => {
    switch (pet?.status) {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <PawAnimation size={120} />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Mascota no encontrada</Text>
      </View>
    );
  }

  const statusStyle = getStatusStyle();

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: pet.images[0] || 'https://via.placeholder.com/400' }} style={styles.image} resizeMode="cover" />
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.name}>{pet.name}</Text>
            <View style={[styles.statusBadge, statusStyle.badge]}>
              <Text style={[styles.statusText, statusStyle.text]}>
                {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{pet.species}</Text>
            {pet.breed && <Text style={[styles.infoText, styles.infoSeparator]}>• {pet.breed}</Text>}
            <Text style={[styles.infoText, styles.infoSeparator]}>• {pet.age} {pet.age === 1 ? 'año' : 'años'}</Text>
            <Text style={[styles.infoText, styles.infoSeparator]}>• Tamaño {pet.size}</Text>
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
          <Text style={styles.description}>{pet.description}</Text>
          <View style={styles.buttonsContainer}>
            <Button title="Solicitar Adopción" onPress={() => router.push(`/adopt/${pet.id}`)} variant="primary" />
            <Button title="Contactar" onPress={() => router.push(`/(tabs)/chat`)} variant="outline" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
