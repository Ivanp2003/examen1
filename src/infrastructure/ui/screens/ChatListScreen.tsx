import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import LoadingAnimation from '../animations/LoadingAnimation';
import EmptyAnimation from '../animations/EmptyAnimation';
import { useAppStore } from '../../../application/store/useAppStore';

interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
}

const ChatListScreen = () => {
  const user = useAppStore((s) => s.user);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setChats([]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <View className="flex-1 bg-background items-center justify-center"><LoadingAnimation /></View>;

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold text-text">Messages</Text>
      </View>
      <ScrollView contentContainerClassName="px-6 pb-8">
        {chats.length === 0 ? (
          <View className="items-center mt-16">
            <EmptyAnimation />
            <Text className="text-text-secondary mt-4">No conversations yet</Text>
          </View>
        ) : (
          chats.map((chat) => (
            <TouchableOpacity key={chat.id} className="flex-row items-center p-4 bg-white rounded-2xl mb-3 border border-gray-100">
              <View className="w-14 h-14 bg-primary/20 rounded-full items-center justify-center">
                <Text className="text-primary text-xl font-bold">{chat.name[0]}</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-semibold text-text">{chat.name}</Text>
                <Text className="text-text-secondary text-sm mt-1">{chat.lastMessage}</Text>
              </View>
              <Text className="text-text-secondary text-xs">{chat.time}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ChatListScreen;
