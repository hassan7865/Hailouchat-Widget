import type { Message } from "../types/chat";


export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const isDuplicateMessage = (newMessage: Message, existingMessages: Message[]): boolean => {
  return existingMessages.some(msg => 
    msg.id === newMessage.id || 
    (msg.message === newMessage.message && 
     msg.sender_type === newMessage.sender_type && 
     Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000)
  );
};
