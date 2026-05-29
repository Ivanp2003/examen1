import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AskGeminiUseCase } from '../../../application/use-cases/AskGeminiUseCase';
import LoadingAnimation from '../animations/LoadingAnimation';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const askGemini = new AskGeminiUseCase(API_KEY);

interface Message {
  text: string;
  isUser: boolean;
}

const AIChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! I am your PetAdopt AI assistant. How can I help you today?', isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { text: userMsg, isUser: true }]);
    setLoading(true);
    try {
      const response = await askGemini.execute(userMsg);
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    } catch {
      setMessages((prev) => [...prev, { text: 'Sorry, I could not process your request.', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-text">AI Assistant</Text>
        <Text className="text-text-secondary mt-1">Powered by Gemini</Text>
      </View>
      <ScrollView contentContainerClassName="px-6 py-4 flex-grow">
        {messages.map((msg, i) => (
          <View key={i} className={`mb-4 ${msg.isUser ? 'items-end' : 'items-start'}`}>
            <View className={`max-w-[80%] p-4 rounded-2xl ${msg.isUser ? 'bg-primary rounded-tr-sm' : 'bg-white border border-gray-200 rounded-tl-sm'}`}>
              <Text className={`${msg.isUser ? 'text-white' : 'text-text'}`}>{msg.text}</Text>
            </View>
          </View>
        ))}
        {loading && <LoadingAnimation />}
      </ScrollView>
      <View className="px-6 py-4 border-t border-gray-200 flex-row items-center">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask anything about pet adoption..."
          className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl text-text mr-3"
          multiline
        />
        <TouchableOpacity onPress={handleSend} className="bg-primary w-14 h-14 rounded-full items-center justify-center">
          <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AIChatScreen;
