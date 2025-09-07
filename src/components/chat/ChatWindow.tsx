import React from 'react';
import { ChatHeader } from './ChatHeader';
import { WelcomeScreen } from './WelcomeScreen';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { ConnectionStatus, Message } from '../../types/chat';


interface ChatWindowProps {
  chatStarted: boolean;
  loading: boolean;
  messages: Message[];
  isTyping: boolean;
  connectionStatus: ConnectionStatus;
  sessionId: string | null;
  onStartChat: () => void;
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatStarted,
  loading,
  messages,
  isTyping,
  connectionStatus,
  sessionId,
  onStartChat,
  onSendMessage,
  onClose
}) => {
  return (
    <div className="w-full h-full bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-300 pointer-events-auto">
      
      <ChatHeader
        connectionStatus={connectionStatus}
        onClose={onClose}
      />

      {!chatStarted ? (
        <WelcomeScreen
          onStartChat={onStartChat}
          loading={loading}
        />
      ) : (
        <>
          <MessageList
            messages={messages}
            isTyping={isTyping}
          />

          <MessageInput
            onSendMessage={onSendMessage}
            connectionStatus={connectionStatus}
            sessionId={sessionId}
          />
        </>
      )}
    </div>
  );
};
