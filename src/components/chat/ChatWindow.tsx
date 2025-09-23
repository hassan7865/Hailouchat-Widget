import React, { useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Bell } from 'lucide-react';
import type { ConnectionStatus, Message } from '../../types/chat';


interface ChatWindowProps {
  chatStarted: boolean;
  loading: boolean;
  messages: Message[];
  isTyping: boolean;
  connectionStatus: ConnectionStatus;
  onStartChat: () => void;
  onSendMessage: (message: string) => void;
  onTypingChange: (isTyping: boolean) => void;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatStarted,
  loading,
  messages,
  isTyping,
  connectionStatus,
  onStartChat,
  onSendMessage,
  onTypingChange,
  onClose
}) => {
  // Auto-start chat when window opens if not already started
  useEffect(() => {
    if (!chatStarted && !loading) {
      onStartChat();
    }
  }, [chatStarted, loading, onStartChat]);

  // Auto-minimize when session ends (disconnected)
  useEffect(() => {
    if (connectionStatus === 'disconnected' && chatStarted) {
      onClose();
    }
  }, [connectionStatus, chatStarted, onClose]);

  return (
    <div className="w-full h-full bg-white rounded-b-2xl flex flex-col overflow-hidden transition-all duration-300 pointer-events-auto">
      
      <ChatHeader
        connectionStatus={connectionStatus}
        onClose={onClose}
      />

      {/* Support Channel Section */}
      <div className="bg-white p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <Bell className="w-3 h-3 text-gray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-gray-900">Live Support</h4>
            <p className="text-xs text-gray-500">Customer Support</p>
          </div>
        </div>
      </div>

      <MessageList
        messages={messages}
        isTyping={isTyping}
      />

      <MessageInput
        onSendMessage={onSendMessage}
        onTypingChange={onTypingChange}
        connectionStatus={connectionStatus}
      />
    </div>
  );
};
