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
  const [hasNewMessage, setHasNewMessage] = useState<boolean>(false);
  
  const typingTimeoutRef = useRef<number | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  const {
    messages,
    loading,
    isTyping,
    startChat,
    handleWebSocketMessage,
    resetChat,
    markAsRead,
    sendTypingIndicator,
    sendMessageSeen
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
      setHasNewMessage(false);
    }
  }, [isOpen, markAsRead]);

  // Auto-reopen when new message arrives while closed
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && !isOpen && chatStarted) {
      const newMessages = messages.slice(lastMessageCountRef.current);
      const hasAgentMessage = newMessages.some(msg => msg.sender_type === 'agent');
      
      if (hasAgentMessage) {
        setHasNewMessage(true);
        setIsOpen(true);
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, isOpen, chatStarted]);

  // Effect to send message seen notifications for agent messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && 
        lastMessage.sender_type === 'agent' && 
        chatStarted && 
        connectionStatus === 'connected' &&
        isOpen && // Only send seen when chat is open
        lastMessage.status !== 'read') { // Don't send seen for already seen messages
      // Send message seen notification for agent messages
      sendMessageSeen(lastMessage.id, sendMessage);
    }
  }, [messages, chatStarted, connectionStatus, isOpen, sendMessageSeen, sendMessage]);


  // Handle connection loss - minimize chat and reset session
  useEffect(() => {
    if (connectionStatus === 'disconnected' && chatStarted) {
      setIsOpen(false); // Minimize the chat
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
    }
  };

  const handleSendMessage = (messageText: string): void => {
    if (!messageText.trim() || connectionStatus !== 'connected') return;

    const messageId = `${Date.now()}-${Math.random()}`;
    const message: OutgoingMessage = {
      type: 'chat_message',
      message: messageText,
      message_id: messageId
    };

    // Don't add to UI immediately - let WebSocket echo handle it
    // This prevents duplicate messages on mobile
    sendMessage(message);
  };

  const handleTypingChange = (isTyping: boolean): void => {
    sendTypingIndicator(isTyping, sendMessage);
  };

  const handleCloseChat = (): void => {
    
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
      // If disconnected or no session, start new chat
      if (connectionStatus === 'disconnected' || !chatStarted) {
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
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      disconnect();
    };
  }, [disconnect]);

  return (
    <div className="w-full h-full relative">
      {!isOpen ? (
        <div className={`absolute bottom-4 right-4 transition-all duration-300 ${hasNewMessage ? 'animate-bounce' : ''}`}>
          <ChatButton
            onClick={handleToggleChat}
          />
        </div>
      ) : (
        <div className="w-full h-full bg-white rounded-b-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <ChatWindow
            chatStarted={chatStarted}
            loading={loading}
            messages={messages}
            isTyping={isTyping}
            connectionStatus={connectionStatus}
            onStartChat={handleStartChat}
            onSendMessage={handleSendMessage}
            onTypingChange={handleTypingChange}
            onClose={handleCloseChat}
          />
        </div>
      )}
    </div>
  );
};
