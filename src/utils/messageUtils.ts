import type { Message } from "../types/chat";


export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTime = (timestamp: string): string => {
  // Ensure we're working with UTC timestamps and convert to local time for display
  const utcDate = new Date(timestamp);
  return utcDate.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
