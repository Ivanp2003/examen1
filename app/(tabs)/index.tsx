import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';

import { Pet } from '../../src/domain/entities/Pet';
import { SupabasePetRepository } from '../../src/infrastructure/repositories/SupabasePetRepository';
import { GetAvailablePetsUseCase } from '../../src/application/use-cases/PetUseCases';
import { useAppStore } from '../../src/application/store/useAppStore';
import { PetCard } from '../../src/infrastructure/ui/components/PetCard';
import PawAnimation from '../../src/infrastructure/ui/animations/PawAnimation';

const petRepo = new SupabasePetRepository();
const getPets = new GetAvailablePetsUseCase(petRepo);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const role = user?.role ?? 'adoptante';

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🏠 (tabs)/index loading:', loading, 'profile:', user?.id ?? 'null', 'role:', role);
  }, [loading, user, role]);

  const fetchPets = useCallback(async () => {
    try {
      console.log('🔄 fetchPets - Role:', role);
      const data = role === 'refugio'
        ? await petRepo.getPetsByShelter(user!.id)
        : await getPets.execute();
      
      console.log('📦 Mascotas obtenidas:', data.length);
      data.forEach(pet => {
        console.log(`  - ${pet.name}: status=${pet.status}`);
      });
      
      // Filtrar solo mascotas disponibles para adoptantes
      const filteredPets = role === 'refugio'
        ? data
        : data.filter(pet => pet.status === 'disponible');
      
      console.log('✅ Mascotas filtradas:', filteredPets.length);
      setPets(filteredPets);
    } catch (error) {
      console.error('❌ Error fetching pets:', error);
      setPets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const onRefresh = () => { setRefreshing(true); fetchPets(); };

  const isOwner = (pet: Pet) => role === 'refugio' && pet.shelter_id === user?.id;

  const handleDeletePet = (pet: Pet) => {
    Alert.alert(
      'Eliminar mascota',
      `¿Estás seguro de que deseas eliminar a ${pet.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await petRepo.deletePet(pet.id);
              setPets((prev) => prev.filter((p) => p.id !== pet.id));
              Alert.alert('Éxito', 'Mascota eliminada correctamente.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar la mascota.');
            }
          },
        },
      ]
    );
  };

  const handleEditPet = (petId: string) => {
    router.push({ pathname: '/create-pet', params: { editId: petId } });
  };

  const renderPet = ({ item }: { item: Pet }) => (
    <PetCard
      pet={item}
      onPress={() => router.push(`/pet/${item.id}`)}
      onEdit={isOwner(item) ? () => handleEditPet(item.id) : undefined}
      onDelete={isOwner(item) ? () => handleDeletePet(item) : undefined}
    />
  );

  if (loading) {
    console.log('🌀 RENDER LOADER desde HomeScreen — loading:', loading, 'user:', user?.id ?? 'null', 'role:', role);
    return (
      <View style={tw`flex-1 bg-[#FFF7ED] items-center justify-center`}>
        <PawAnimation size={120} />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-[#FFF7ED]`}>
      {/* Header */}
      <View
        style={[tw`px-6 pb-8 rounded-b-[32px] bg-[#F4A261]`, { paddingTop: insets.top + 12 }]}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-sm text-white/80 font-medium`}>
              {role === 'refugio' ? 'Panel de gestión' : 'Descubre mascotas'}
            </Text>
            <Text style={tw`text-[28px] text-white font-bold mt-1`}>
              {role === 'refugio' ? 'Mis Mascotas' : 'Mascotas en Adopción'}
            </Text>
          </View>
          <View style={tw`w-12 h-12 bg-white/20 rounded-2xl items-center justify-center`}>
            <PawAnimation size={28} />
          </View>
        </View>
      </View>

      {/* Stats for shelters */}
      {role === 'refugio' && pets.length > 0 && (
        <View style={tw`px-6 -mt-5`}>
          <View style={tw`bg-white rounded-2xl p-4 shadow-sm border border-[#F1F3F5] flex-row justify-around`}>
            <View style={tw`items-center`}>
              <Text style={tw`text-2xl font-bold text-[#F4A261]`}>{pets.length}</Text>
              <Text style={tw`text-xs text-[#6D597A] mt-1`}>Total</Text>
            </View>
            <View style={tw`w-px bg-[#E8E8E8]`} />
            <View style={tw`items-center`}>
              <Text style={tw`text-2xl font-bold text-[#84A98C]`}>{pets.filter(p => p.status === 'disponible').length}</Text>
              <Text style={tw`text-xs text-[#6D597A] mt-1`}>Disponibles</Text>
            </View>
            <View style={tw`w-px bg-[#E8E8E8]`} />
            <View style={tw`items-center`}>
              <Text style={tw`text-2xl font-bold text-[#6D597A]`}>{pets.filter(p => p.status === 'pendiente').length}</Text>
              <Text style={tw`text-xs text-[#6D597A] mt-1`}>Pendientes</Text>
            </View>
          </View>
        </View>
      )}

      {/* Subtitle */}
      <View style={tw`px-6 mt-6 mb-4`}>
        <Text style={tw`text-sm text-[#6D597A]`}>
          {role === 'refugio'
            ? 'Administra tus mascotas registradas'
            : `${pets.length} mascotas esperando un hogar`}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={renderPet}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 112 }}
        refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#F4A261"
          colors={['#F4A261']}
        />}
        ListEmptyComponent={
          <View style={tw`items-center mt-16`}>
            <PawAnimation size={150} />
            <Text style={tw`text-base text-[#6D597A] mt-4`}>
              {role === 'refugio' ? 'No has registrado mascotas aún' : 'No hay mascotas disponibles'}
            </Text>
            {role === 'refugio' && (
              <TouchableOpacity
                onPress={() => router.push('/create-pet')}
                style={tw`mt-6 py-3 px-8 bg-[#F4A261] rounded-2xl`}
              >
                <Text style={tw`text-white font-bold`}>Registrar primera mascota</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* FAB solo para refugios */}
      {role === 'refugio' && pets.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/create-pet')}
          activeOpacity={0.85}
          style={[tw`absolute bottom-8 right-6 w-16 h-16 bg-[#F4A261] rounded-full items-center justify-center shadow-lg`, { elevation: 8 }]}
        >
          <Text style={tw`text-white text-[32px] leading-8`}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
