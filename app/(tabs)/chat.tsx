import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
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

const statusColors: Record<string, string> = {
  pendiente: 'bg-accent/20 text-accent',
  aprobado: 'bg-success/20 text-success',
  rechazado: 'bg-error/20 text-error',
};

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

export default function RequestsScreen() {
  const user = useAppStore((s) => s.user);
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allPets = await petRepo.getAllPets();
      setPets(allPets);

      let data: AdoptionRequest[];
      if (user.role === 'refugio') {
        data = await adoptionRepo.getRequestsByShelter(user.id);
      } else {
        data = await adoptionRepo.getRequestsByApplicant(user.id);
      }

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

      setRequests(enriched);
    } catch {
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

  if (loading) return <View className="flex-1 bg-background items-center justify-center"><LoadingAnimation /></View>;

  if (!user) return null;

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold text-text">Solicitudes</Text>
        <Text className="text-text-secondary mt-1">
          {user.role === 'refugio' ? 'Solicitudes de adopción recibidas' : 'Historial de tus solicitudes'}
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-6 pb-8">
        {requests.length === 0 ? (
          <View className="items-center mt-16">
            <EmptyAnimation />
            <Text className="text-text-secondary mt-4">
              {user.role === 'refugio'
                ? 'No hay solicitudes aún'
                : 'No has enviado solicitudes'}
            </Text>
          </View>
        ) : (
          requests.map((req) => (
            <View key={req.id} className="bg-white rounded-2xl mb-4 border border-gray-100 overflow-hidden">
              {user.role === 'refugio' ? (
                <RefugioCard
                  request={req}
                  onAccept={() => handleStatusUpdate(req.id, 'aprobado')}
                  onReject={() => handleStatusUpdate(req.id, 'rechazado')}
                />
              ) : (
                <AdoptanteCard request={req} />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function RefugioCard({ request, onAccept, onReject }: { request: RequestWithDetails; onAccept: () => void; onReject: () => void }) {
  const pet = request.pet;
  const applicant = request.applicant;
  const meta = request.applicant_metadata;

  return (
    <View>
      <View className="flex-row p-4">
        <View className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden">
          {pet?.images?.[0] ? (
            <Image source={{ uri: pet.images[0] }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-2xl">🐾</Text>
            </View>
          )}
        </View>
        <View className="flex-1 ml-4">
          <Text className="font-bold text-text text-lg">{applicant?.nombre || 'Desconocido'}</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-primary font-semibold">{pet?.name || 'Mascota'}</Text>
            <View className={`ml-2 px-2 py-0.5 rounded-full ${statusColors[request.status] || 'bg-gray-200'}`}>
              <Text className="text-xs font-medium">{statusLabels[request.status]}</Text>
            </View>
          </View>
        </View>
      </View>

      {meta && (
        <View className="px-4 pb-3 flex-row flex-wrap gap-2">
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
        <View className="flex-row border-t border-gray-100">
          <TouchableOpacity
            onPress={onReject}
            className="flex-1 py-3 items-center bg-error/10"
          >
            <Text className="text-error font-semibold">Rechazar</Text>
          </TouchableOpacity>
          <View className="w-[1px] bg-gray-100" />
          <TouchableOpacity
            onPress={onAccept}
            className="flex-1 py-3 items-center bg-success/10"
          >
            <Text className="text-success font-semibold">Aceptar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function AdoptanteCard({ request }: { request: RequestWithDetails }) {
  const pet = request.pet;

  return (
    <View className="flex-row p-4 items-center">
      <View className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden">
        {pet?.images?.[0] ? (
          <Image source={{ uri: pet.images[0] }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-2xl">🐾</Text>
          </View>
        )}
      </View>
      <View className="flex-1 ml-4">
        <Text className="font-bold text-text">{pet?.name || 'Mascota'}</Text>
        <Text className="text-text-secondary text-sm mt-0.5">
          {pet?.species} - {pet?.breed}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5">
          Solicitado el {new Date(request.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View className={`px-3 py-1 rounded-full ${statusColors[request.status] || 'bg-gray-200'}`}>
        <Text className="text-xs font-bold">{statusLabels[request.status]}</Text>
      </View>
    </View>
  );
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center bg-gray-100 px-2.5 py-1 rounded-full">
      <Text className="text-xs mr-1">{icon}</Text>
      <Text className="text-xs text-text-secondary font-medium">{text}</Text>
    </View>
  );
}
