import { Chat, ChatMessage } from '../../domain/entities/Chat';
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { supabase } from '../api/supabase';

export class SupabaseChatRepository implements IChatRepository {
  async getChatsByUser(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userId]);
    if (error) throw error;
    return data as Chat[];
  }

  async getMessages(chatId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chatId', chatId)
      .order('createdAt', { ascending: true });
    if (error) throw error;
    return data as ChatMessage[];
  }

  async sendMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ ...message, chatId })
      .select()
      .single();
    if (error) throw error;
    return data as ChatMessage;
  }

  async createChat(chat: Omit<Chat, 'id' | 'createdAt'>): Promise<Chat> {
    const { data, error } = await supabase
      .from('chats')
      .insert(chat)
      .select()
      .single();
    if (error) throw error;
    return data as Chat;
  }
}
