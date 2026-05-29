import { View, Text, FlatList, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../src/application/store/useAppStore';
import { SupabaseAdoptionRepository } from '../../src/infrastructure/repositories/SupabaseAdoptionRepository';
import { SupabasePetRepository } from '../../src/infrastructure/repositories/SupabasePetRepository';
import { AdoptionRequest } from '../../src/domain/entities/AdoptionRequest';
import { Pet } from '../../src/domain/entities/Pet';
import { User } from '../../src/domain/entities/User';
import { supabase } from '../../src/infrastructure/api/supabase';
import { LoadingAnimation } from '../../src/infrastructure/ui/animations/LoadingAnimation';
import { EmptyAnimation } from '../../src/infrastructure/ui/animations/EmptyAnimation';

const adoptionRepo = new SupabaseAdoptionRepository();
const petRepo = new SupabasePetRepository();

interface RequestWithDetails extends AdoptionRequest {
  pet?: Pet;
  applicant?: User;
}

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 16,
  },
  header: {
    paddingHorizontal: 8,
    paddingTop: 64,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    color: '#64748B',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEEDD',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  petImage: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    overflow: 'hidden',
  },
  petImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImageText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  statusBadge: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusPendiente: {
    backgroundColor: '#FEF3C7',
  },
  statusPendienteText: {
    color: '#92400E',
  },
  statusAprobado: {
    backgroundColor: '#D1FAE5',
  },
  statusAprobadoText: {
    color: '#065F46',
  },
  statusRechazado: {
    backgroundColor: '#FEE2E2',
  },
  statusRechazadoText: {
    color: '#991B1B',
  },
  badgesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#FFEEDD',
    padding: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  actionButtonReject: {
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  actionButtonRejectText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonAccept: {
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  actionButtonAcceptText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  compactCard: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  compactImage: {
    width: 64,
    height: 64,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  compactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  compactDetails: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  compactDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  compactStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  compactStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default function RequestsScreen() {
  const user = useAppStore((s) => s.user);
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.log('Fetching requests for user:', user.id, 'role:', user.role);
      const allPets = await petRepo.getAllPets();
      setPets(allPets);

      let data: AdoptionRequest[];
      if (user.role === 'refugio') {
        data = await adoptionRepo.getRequestsByShelter(user.id);
      } else {
        data = await adoptionRepo.getRequestsByApplicant(user.id);
      }

      console.log('Raw requests data:', data);

      const enriched: RequestWithDetails[] = await Promise.all(
        data.map(async (req) => {
          const pet = allPets.find((p) => p.id === req.pet_id);
          let applicant: User | undefined;
          if (user.role === 'refugio') {
            const { data: profile } = await supabase
              .from('usuarios')
              .select('*')
              .eq('id', req.applicant_id)
              .single();
            if (profile) {
              applicant = {
                id: profile.id,
                email: profile.email,
                role: profile.role,
                nombre: profile.nombre,
                metadata: profile.metadata ?? {},
                created_at: profile.created_at,
              };
            }
          }
          return { ...req, pet, applicant };
        })
      );

      console.log('Enriched requests:', enriched);
      setRequests(enriched);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusUpdate = async (requestId: string, status: 'aprobado' | 'rechazado') => {
    try {
      await adoptionRepo.updateRequestStatus(requestId, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el estado.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LoadingAnimation />
        </View>
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitudes</Text>
        <Text style={styles.subtitle}>
          {user.role === 'refugio' ? 'Solicitudes de adopción recibidas' : 'Historial de tus solicitudes'}
        </Text>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyAnimation />
          <Text style={styles.emptyText}>
            {user.role === 'refugio' ? 'No hay solicitudes aún' : 'No has enviado solicitudes'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            user.role === 'refugio' ? (
              <RefugioCard
                request={item}
                onAccept={() => handleStatusUpdate(item.id, 'aprobado')}
                onReject={() => handleStatusUpdate(item.id, 'rechazado')}
              />
            ) : (
              <AdoptanteCard request={item} />
            )
          )}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 32 }}
        />
      )}
    </View>
  );
}

function RefugioCard({ request, onAccept, onReject }: { request: RequestWithDetails; onAccept: () => void; onReject: () => void }) {
  const pet = request.pet;
  const applicant = request.applicant;
  const meta = request.applicant_metadata;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pendiente':
        return { bg: styles.statusPendiente, text: styles.statusPendienteText };
      case 'aprobado':
        return { bg: styles.statusAprobado, text: styles.statusAprobadoText };
      case 'rechazado':
        return { bg: styles.statusRechazado, text: styles.statusRechazadoText };
      default:
        return { bg: { backgroundColor: '#F3F4F6' }, text: { color: '#6B7280' } };
    }
  };

  const statusStyle = getStatusStyle(request.status);

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.petImage}>
          {pet?.images?.[0] ? (
            <Image source={{ uri: pet.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={styles.petImagePlaceholder}>
              <Text style={styles.petImageText}>🐾</Text>
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.applicantName}>{applicant?.nombre || 'Desconocido'}</Text>
          <View style={styles.petNameRow}>
            <Text style={styles.petName}>{pet?.name || 'Mascota'}</Text>
            <View style={[styles.statusBadge, statusStyle.bg]}>
              <Text style={[styles.statusBadgeText, statusStyle.text]}>{statusLabels[request.status]}</Text>
            </View>
          </View>
        </View>
      </View>

      {meta && (
        <View style={styles.badgesContainer}>
          <Badge
            icon={meta.hogar === 'casa' ? '🏠' : '🏢'}
            text={meta.hogar === 'casa' ? 'Casa' : 'Departamento'}
          />
          <Badge
            icon={meta.otros_mascotas ? '🐕' : '🚫'}
            text={meta.otros_mascotas ? 'Con otras mascotas' : 'Sin otras mascotas'}
          />
          {meta.experiencia && (
            <Badge icon="💚" text={meta.experiencia.length > 20 ? meta.experiencia.slice(0, 20) + '...' : meta.experiencia} />
          )}
        </View>
      )}

      {request.status === 'pendiente' && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onReject}
            style={[styles.actionButton, styles.actionButtonReject]}
          >
            <Text style={styles.actionButtonRejectText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            style={[styles.actionButton, styles.actionButtonAccept]}
          >
            <Text style={styles.actionButtonAcceptText}>Aceptar Adopción</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function AdoptanteCard({ request }: { request: RequestWithDetails }) {
  const pet = request.pet;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pendiente':
        return { bg: styles.statusPendiente, text: styles.statusPendienteText };
      case 'aprobado':
        return { bg: styles.statusAprobado, text: styles.statusAprobadoText };
      case 'rechazado':
        return { bg: styles.statusRechazado, text: styles.statusRechazadoText };
      default:
        return { bg: { backgroundColor: '#F3F4F6' }, text: { color: '#6B7280' } };
    }
  };

  const statusStyle = getStatusStyle(request.status);

  return (
    <View style={[styles.card, styles.compactCard]}>
      <View style={styles.compactImage}>
        {pet?.images?.[0] ? (
          <Image source={{ uri: pet.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={styles.petImagePlaceholder}>
            <Text style={styles.petImageText}>🐾</Text>
          </View>
        )}
      </View>
      <View style={styles.compactInfo}>
        <Text style={styles.compactName}>{pet?.name || 'Mascota'}</Text>
        <Text style={styles.compactDetails}>
          {pet?.species} - {pet?.breed}
        </Text>
        <Text style={styles.compactDate}>
          Solicitado el {new Date(request.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={[styles.compactStatus, statusStyle.bg]}>
        <Text style={[styles.compactStatusText, statusStyle.text]}>{statusLabels[request.status]}</Text>
      </View>
    </View>
  );
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeIcon}>{icon}</Text>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}
