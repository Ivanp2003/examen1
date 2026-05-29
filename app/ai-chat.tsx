import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { askGemini } from '../src/infrastructure/api/deepseek';
import { LoadingAnimation } from '../src/infrastructure/ui/animations/LoadingAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  aiMessageText: {
    color: '#1E293B',
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputFocused: {
    borderColor: '#4F46E5',
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowColor: 'transparent',
    elevation: 0,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(253, 251, 247, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#1E293B',
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 6,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 4,
    marginBottom: 4,
  },
  strong: {
    fontWeight: 'bold',
    color: '#1E293B',
  },
  em: {
    fontStyle: 'italic',
    color: '#475569',
  },
  link: {
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  code_inline: {
    backgroundColor: '#F1F5F9',
    color: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  code_block: {
    backgroundColor: '#1E293B',
    color: '#E2E8F0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  fence: {
    backgroundColor: '#1E293B',
    color: '#E2E8F0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  blockquote: {
    backgroundColor: '#F1F5F9',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
    fontStyle: 'italic',
  },
  bullet_list: {
    marginLeft: 16,
    marginVertical: 4,
  },
  ordered_list: {
    marginLeft: 16,
    marginVertical: 4,
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  hr: {
    backgroundColor: '#E2E8F0',
    height: 1,
    marginVertical: 12,
  },
});

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const history = messages.map(msg => ({
    role: msg.isUser ? 'user' as const : 'model' as const,
    parts: [{ text: msg.text }],
  }));

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    // Debounce para evitar bloqueos por rate limit
    await new Promise(r => setTimeout(r, 800));

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Sanitizar historial para asegurar estructura correcta
      const sanitizedHistory = messages.map(msg => ({
        role: msg.isUser ? ('user' as const) : ('model' as const),
        parts: [{ text: msg.text }],
      }));

      console.log('📤 Enviando a Gemini:', {
        prompt: userMessage.text,
        historyLength: sanitizedHistory.length,
        historySample: sanitizedHistory.slice(-2),
      });

      const response = await askGemini(userMessage.text, sanitizedHistory);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('🔥 ERROR GEMINI DETALLADO:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      let errorText = 'Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.';
      
      if (error?.message?.includes('API Key') || error?.message?.includes('undefined')) {
        errorText = 'Error: La API Key de Gemini no está configurada correctamente. Verifica tu archivo .env';
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
      <View style={item.isUser ? styles.userMessage : styles.aiMessage}>
        {item.isUser ? (
          <Text style={styles.userMessageText}>
            {item.text}
          </Text>
        ) : (
          <Markdown style={markdownStyles}>
            {item.text}
          </Markdown>
        )}
      </View>
      <Text style={[styles.timestamp, item.isUser ? { textAlign: 'right' } : { textAlign: 'left' }]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={{ fontSize: 48 }}>🤖</Text>
      <Text style={styles.emptyTitle}>Asistente de IA PetAdopt</Text>
      <Text style={styles.emptySubtitle}>
        Tu experto 24/7 en salud, nutrición y comportamiento animal.{'\n'}
        ¡Haz tu primera pregunta!
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Asistente de IA PetAdopt</Text>
        <Text style={styles.subtitle}>
          Tu experto 24/7 en salud, nutrición y comportamiento animal
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <LoadingAnimation />
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, isInputFocused && styles.inputFocused]}
            placeholder="Escribe tu pregunta sobre mascotas..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
