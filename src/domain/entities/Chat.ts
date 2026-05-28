export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  petId: string;
  text: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: string[];
  petId: string;
  lastMessage?: ChatMessage;
  createdAt: string;
}
