import React, { useState, useEffect, useRef } from 'react';
import { ChatButton } from './chat/ChatButton';
import { ChatWindow } from './chat/ChatWindow';
import { ContactDetailsModal } from './ContactDetailsModal';
import { EndChatModal } from './EndChatModal';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChat } from '../hooks/useChat';
import type { ChatWidgetProps, ConnectionStatus, OutgoingMessage } from '../types/chat';
import { DEFAULT_CONFIG } from '../config/chatConfig';

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  clientId,
  apiBase = DEFAULT_CONFIG.API_BASE,
  wsBase = DEFAULT_CONFIG.WS_BASE,
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [chatStarted, setChatStarted] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [hasNewMessage, setHasNewMessage] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showEndChatModal, setShowEndChatModal] = useState<boolean>(false);
  
  const typingTimeoutRef = useRef<number | null>(null);
  const lastMessageCountRef = useRef<number>(0);
  const chatStartAttemptedRef = useRef<boolean>(false);

  const {
    messages,
    visitorId,
    sessionId,
    ipAddress,
    loading,
    isTyping,
    uploadingFiles,
    startChat,
    handleWebSocketMessage,
    resetChat,
    markAsRead,
    sendTypingIndicator,
    sendMessageSeen,
    uploadAttachment,
    fetchVisitorDetails
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
      const hasAgentMessage = newMessages.some(msg => msg.sender_type === 'client_agent');
      
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
        lastMessage.sender_type === 'client_agent' && 
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
      chatStartAttemptedRef.current = false; // Reset chat start flag
      resetChat(); // Reset all chat state like a fresh start
    }
  }, [connectionStatus, chatStarted, resetChat]);



  const handleStartChat = async (): Promise<void> => {
    // Prevent multiple chat start attempts
    if (chatStartAttemptedRef.current || chatStarted) {
      return;
    }
    
    chatStartAttemptedRef.current = true;
    
    try {
      const { visitorId: newVisitorId, sessionId: newSessionId } = await startChat();
      
      const wsUrl = `${wsBase}/ws/chat/${newSessionId}/visitor/${newVisitorId}`;
      
      // Wait longer for the backend to be ready, then connect
      setTimeout(() => {
        connect(wsUrl);
        // Only mark as started after WebSocket connection attempt
        setChatStarted(true);
      }, 500);
      
    } catch (error) {
      console.error('Error starting chat:', error);
      // Reset the flag on error so it can be retried
      chatStartAttemptedRef.current = false;
    }
  };

  const handleSendMessage = async (messageText: string): Promise<void> => {
    if (!messageText.trim() || connectionStatus !== 'connected') return;

    const messageId = `${Date.now()}-${Math.random()}`;
    const message: OutgoingMessage = {
      type: 'chat_message',
      message: messageText,
      message_id: messageId
    };

    // Don't add to UI immediately - let WebSocket echo handle it
    // This prevents duplicate messages and maintains proper seen status
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
    
  
    setIsOpen(false);

    if (window.parent !== window) {
      window.parent.postMessage({ type: 'CHAT_CLOSED' }, '*');
    }
  };


  const handleEndChat = (): void => {
    setShowEndChatModal(true);
  };

  const handleConfirmEndChat = (): void => {
    // Send close_session message to backend (visitor wants to leave)
    if (connectionStatus === 'connected') {
      sendMessage({
        type: 'close_session',
        timestamp: new Date().toISOString()
      });
    }
    
    // Keep connection alive, keep the window open
    // Don't minimize or close the widget - visitor can continue chatting
  };

  const handleHeaderRatingChange = async (rating: 'thumbs_up' | 'thumbs_down'): Promise<void> => {
    if (!sessionId || !clientId || !apiBase) return;
    
    try {
      const response = await fetch(`${apiBase}/chat/session-rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_key: clientId,
          session_id: sessionId,
          rating: rating,
          note: null
        })
      });
      
      if (response.ok) {
        // Rating submitted successfully
        // The backend should send a system message with emoji confirmation
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
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
    <div className={`${isMobile ? 'w-full h-full' : 'w-full h-full'} relative ${isMobile ? 'mobile-chat-widget' : ''}`}>
      {!isOpen ? (
        <div className={`absolute bottom-4 right-4 transition-all duration-300 ${hasNewMessage ? 'animate-bounce' : ''}`}>
          <ChatButton
            onClick={handleToggleChat}
            isMobile={isMobile}
          />
        </div>
      ) : (
        <div className={`${isMobile ? 'w-full h-full' : 'w-full h-full'} bg-white ${isMobile ? 'rounded-none' : 'rounded-b-2xl'} shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 border border-gray-200`}>
          <ChatWindow
            chatStarted={chatStarted}
            loading={loading}
            messages={messages}
            isTyping={isTyping}
            uploadingFiles={uploadingFiles}
            connectionStatus={connectionStatus}
            visitorId={visitorId || undefined}
            sessionId={sessionId || undefined}
            clientId={clientId}
            apiBase={apiBase}
            onStartChat={handleStartChat}
            onSendMessage={handleSendMessage}
            onTypingChange={handleTypingChange}
            onFileUpload={(file) => uploadAttachment(file, apiBase)}
            onClose={handleCloseChat}
            onEndChat={handleEndChat}
            onOpenContactModal={() => setShowContactModal(true)}
            isMobile={isMobile}
            onHeaderRatingChange={handleHeaderRatingChange}
          />
        </div>
      )}

      {/* Contact Details Modal */}
      <ContactDetailsModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSave={async (name, email) => {
          try {
            const response = await fetch(`${apiBase}/chat/visitor-details/widget`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                client_key: clientId,
                ip_address: ipAddress,
                first_name: name,
                email: email
              })
            });
            
            if (response.ok) {
              
            }
          } catch (error) {
            console.error('Error saving contact details:', error);
          }
          setShowContactModal(false);
        }}
        fetchVisitorDetails={fetchVisitorDetails}
      />

      {/* End Chat Modal */}
      <EndChatModal
        isOpen={showEndChatModal}
        onClose={() => setShowEndChatModal(false)}
        onConfirm={handleConfirmEndChat}
      />
    </div>
  );
};
