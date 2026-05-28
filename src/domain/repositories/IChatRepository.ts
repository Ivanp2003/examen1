import { Chat, ChatMessage } from '../entities/Chat';

export interface IChatRepository {
  getChatsByUser(userId: string): Promise<Chat[]>;
  getMessages(chatId: string): Promise<ChatMessage[]>;
  sendMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage>;
  createChat(chat: Omit<Chat, 'id' | 'createdAt'>): Promise<Chat>;
}
