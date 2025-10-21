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
  visitorId?: string;
  onStartChat: () => void;
  onSendMessage: (message: string) => void | Promise<void>;
  onTypingChange: (isTyping: boolean) => void;
  onFileUpload?: (file: File) => Promise<void>;
  onClose: () => void;
  onEndChat?: () => void;
  onOpenContactModal?: () => void;
  isMobile?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatStarted,
  loading,
  messages,
  isTyping,
  connectionStatus,
  visitorId, // Keep for potential future use
  onStartChat,
  onSendMessage,
  onTypingChange,
  onFileUpload,
  onClose,
  onEndChat,
  onOpenContactModal,
  isMobile = false,
}) => {
  // Auto-start chat when window opens if not already started
  useEffect(() => {
    if (!chatStarted && !loading) {
      onStartChat();
    }
  }, [chatStarted, loading]); // Remove onStartChat from dependencies to prevent multiple calls

  // Auto-minimize when session ends (disconnected)
  useEffect(() => {
    if (connectionStatus === 'disconnected' && chatStarted) {
      onClose();
    }
  }, [connectionStatus, chatStarted, onClose]);

  return (
    <div className={`w-full h-full bg-white ${isMobile ? 'rounded-none' : 'rounded-b-2xl'} flex flex-col transition-all duration-300 pointer-events-auto`}>
      
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0">
        <ChatHeader
          connectionStatus={connectionStatus}
          onClose={onClose}
          isMobile={isMobile}
        />

        {/* Support Channel Section */}
        <div className={`bg-white ${isMobile ? 'p-4' : 'p-3'} border-b border-gray-100`}>
          <div className="flex items-center gap-2">
            <div className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} bg-gray-400 rounded-full flex items-center justify-center`}>
              <Bell className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-white`} />
            </div>
            <div>
              <h4 className={`font-semibold ${isMobile ? 'text-sm' : 'text-xs'} text-gray-900 font-bold`}>Live Support</h4>
              <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-500 font-semibold`}>Customer Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Section - Flexible */}
      <div className="flex-1 min-h-0">
        <MessageList
          messages={messages}
          isTyping={isTyping}
          isMobile={isMobile}
        />
      </div>

      {/* Input Section - Fixed at Bottom */}
      <div className="flex-shrink-0" style={{ position: 'relative', zIndex: 10 }}>
        <MessageInput
          onSendMessage={onSendMessage}
          onTypingChange={onTypingChange}
          onFileUpload={onFileUpload}
          connectionStatus={connectionStatus}
          isMobile={isMobile}
          onEndChat={onEndChat}
          onEditContactDetails={onOpenContactModal}
        />
      </div>
    </div>
  );
};
