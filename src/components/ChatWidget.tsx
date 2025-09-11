import React, { useState, useEffect, useRef } from 'react';
import { ChatButton } from './chat/ChatButton';
import { ChatWindow } from './chat/ChatWindow';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChat } from '../hooks/useChat';
import type { ChatWidgetProps, ConnectionStatus, OutgoingMessage } from '../types/chat';
import { DEFAULT_CONFIG } from '../config/chatConfig';

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  clientId,
  apiBase = DEFAULT_CONFIG.API_BASE,
  wsBase = DEFAULT_CONFIG.WS_BASE,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatStarted, setChatStarted] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  
    const typingTimeoutRef = useRef<number | null>(null);

  const {
    messages,
    sessionId,
    loading,
    isTyping,
    unreadCount,
    startChat,
    handleWebSocketMessage,
    resetChat,
    markAsRead
  } = useChat({
    clientId,
    apiBase,
    onConnectionChange: setConnectionStatus
  });

  const { connect, sendMessage, disconnect } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnectionChange: setConnectionStatus
  });

  useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, markAsRead]);


  // Reset chat when connection is lost
  useEffect(() => {
    if (connectionStatus === 'disconnected' && chatStarted) {
      console.log('Connection lost, resetting chat completely');
      setChatStarted(false);
      resetChat(); // Reset all chat state like a fresh start
    }
  }, [connectionStatus, chatStarted, resetChat]);



  const handleStartChat = async (): Promise<void> => {
    try {
      const { visitorId: newVisitorId, sessionId: newSessionId } = await startChat();
      setChatStarted(true);
      
      const wsUrl = `${wsBase}/ws/chat/${newSessionId}/visitor/${newVisitorId}`;
      connect(wsUrl);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleSendMessage = (messageText: string): void => {
    if (!messageText.trim() || connectionStatus !== 'connected') return;

    const message: OutgoingMessage = {
      type: 'chat_message',
      message: messageText
    };

    // Don't add to UI immediately - let WebSocket echo handle it
    // This prevents duplicate messages on mobile

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    const typingMessage: OutgoingMessage = {
      type: 'typing_indicator',
      is_typing: true
    };
    
    sendMessage(typingMessage);

    typingTimeoutRef.current = setTimeout(() => {
      const stopTypingMessage: OutgoingMessage = {
        type: 'typing_indicator',
        is_typing: false
      };
      sendMessage(stopTypingMessage);
    }, 1000);

    sendMessage(message);
  };

  const handleCloseChat = (): void => {
    console.log('Closing chat dialog...');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // Only close the chat dialog, keep WebSocket connection active
    setIsOpen(false);
    // Don't disconnect WebSocket - keep the session active
    // Don't reset chat started or reset chat - keep the session
    
    // Notify parent window that chat closed
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'CHAT_CLOSED' }, '*');
    }
  };

  const handleToggleChat = (): void => {
    if (!isOpen) {
      setIsOpen(true);
      if (!chatStarted) {
        handleStartChat();
      }
      // Notify parent window that chat opened
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'CHAT_OPENED' }, '*');
      }
    } else {
      setIsOpen(false);
      // Notify parent window that chat closed
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'CHAT_CLOSED' }, '*');
      }
    }
  };

  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up...');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      disconnect();
    };
  }, [disconnect]);

  return (
    <div className="w-full h-full relative">
      {!isOpen ? (
        <div className="absolute bottom-4 right-4">
          <ChatButton
            onClick={handleToggleChat}
            unreadCount={unreadCount}
          />
        </div>
      ) : (
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <ChatWindow
            chatStarted={chatStarted}
            loading={loading}
            messages={messages}
            isTyping={isTyping}
            connectionStatus={connectionStatus}
            sessionId={sessionId}
            onStartChat={handleStartChat}
            onSendMessage={handleSendMessage}
            onClose={handleCloseChat}
          />
        </div>
      )}
    </div>
  );
};
