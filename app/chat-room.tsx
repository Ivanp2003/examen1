import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../src/infrastructure/api/supabase';
import { useAppStore } from '../src/application/store/useAppStore';

interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
  adoption_request_id: string;
}

export default function ChatRoomScreen() {
  const { adoptionRequestId, receiverId, petName } = useLocalSearchParams<{
    adoptionRequestId: string;
    receiverId: string;
    petName: string;
  }>();

  const user = useAppStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const currentUserId = user?.id;

  // Cargar mensajes existentes
  const loadMessages = async () => {
    if (!adoptionRequestId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('adoption_request_id', adoptionRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error cargando mensajes:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  // Enviar mensaje
  const sendMessage = async () => {
    if (!inputText.trim() || !currentUserId || !adoptionRequestId) return;

    const text = inputText.trim();
    setInputText('');

    const { error } = await supabase.from('messages').insert({
      adoption_request_id: adoptionRequestId,
      sender_id: currentUserId,
      receiver_id: receiverId,
      text,
    });

    if (error) {
      console.error('❌ Error enviando mensaje:', error);
    }
  };

  useEffect(() => {
    loadMessages();

    if (!adoptionRequestId) return;

    const channel = supabase
      .channel(`messages-${adoptionRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `adoption_request_id=eq.${adoptionRequestId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [adoptionRequestId]);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === currentUserId;

    return (
      <View
        style={tw`mb-3 flex-row ${isMine ? 'justify-end' : 'justify-start'}`}
      >
        <View
          style={[tw`max-w-[80%] rounded-2xl px-4 py-3`,
            isMine
              ? tw`bg-[#F4A261] rounded-br-none`
              : tw`bg-white rounded-bl-none border border-[#F1F3F5]`
          ]}
        >
          <Text
            style={[tw`text-sm leading-5`,
              isMine ? tw`text-white` : tw`text-[#6D597A]`
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[tw`text-xs mt-1`,
              isMine ? tw`text-white/70` : tw`text-[#94A3B8]`
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FFF7ED]`}>
      {/* Header */}
      <View style={tw`flex-row items-center px-4 py-3 bg-white border-b border-[#FFEDD5] shadow-sm`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`mr-3 w-10 h-10 bg-[#FFF7ED] rounded-full items-center justify-center`}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#6D597A" />
        </TouchableOpacity>
        <View style={tw`flex-1`}>
          <Text style={tw`text-lg font-bold text-[#6D597A]`}>
            {petName || 'Chat'}
          </Text>
          <Text style={tw`text-xs text-[#84A98C]`}>
            Coordinación de visita
          </Text>
        </View>
        <View style={tw`w-10 h-10 bg-[#F4A261]/10 rounded-full items-center justify-center`}>
          <MaterialCommunityIcons name="paw" size={20} color="#F4A261" />
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={tw`px-4 py-4`}
          ListEmptyComponent={() => (
            <View style={tw`flex-1 items-center justify-center py-20`}>
              <View style={tw`w-20 h-20 bg-[#F4A261]/10 rounded-full items-center justify-center mb-4`}>
                <MaterialCommunityIcons
                  name="chat-outline"
                  size={40}
                  color="#F4A261"
                />
              </View>
              <Text style={tw`text-[#6D597A] mt-4 text-base font-semibold`}>
                Aún no hay mensajes
              </Text>
              <Text style={tw`text-[#84A98C] mt-1 text-sm text-center px-8`}>
                Coordina la visita para conocer a la mascota
              </Text>
            </View>
          )}
        />

        {/* Input */}
        <View style={tw`flex-row items-center px-4 py-3 bg-white border-t border-[#FFEDD5]`}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={500}
            style={tw`flex-1 bg-[#F8F9FA] rounded-2xl px-4 py-3 text-[#6D597A] max-h-24`}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim()}
            style={[tw`ml-3 w-11 h-11 rounded-full items-center justify-center`,
              inputText.trim() ? tw`bg-[#F4A261]` : tw`bg-gray-300`
            ]}
          >
            <MaterialCommunityIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
