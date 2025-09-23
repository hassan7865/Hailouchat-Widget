import { useState, useRef, useCallback } from 'react';
import type { Message, ChatInitiateRequest, ChatInitiateResponse } from '../types/chat';
import { getDeviceInfo } from '../utils/deviceDetection';
import { getLocationData, getIPAddress } from '../utils/locationDetection';
import { generateMessageId, isDuplicateMessage } from '../utils/messageUtils';

interface UseChatProps {
  clientId: string;
  apiBase: string;
  onConnectionChange: (status: 'connected' | 'disconnected' | 'error' | 'connecting') => void;
}

export const useChat = ({ clientId, apiBase }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const messageIdsRef = useRef<Set<string>>(new Set());
  const lastMessageTimeRef = useRef<number>(0);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  const addMessage = useCallback((message: Message): void => {
    setMessages(prev => {
      if (isDuplicateMessage(message, prev)) {
        return prev;
      }
      
      return [...prev, message];
    });
  }, []);

  const startChat = useCallback(async (): Promise<{ visitorId: string; sessionId: string }> => {
    setLoading(true);
    try {
      const locationPromise = getLocationData().catch(() => ({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }));
      
      const ipPromise = getIPAddress().catch(() => undefined);
      
      const [locationData, ipAddress] = await Promise.all([locationPromise, ipPromise]);


      const deviceInfo = getDeviceInfo();

      // Get parent page URL from URL parameters (passed by injector)
      const urlParams = new URLSearchParams(window.location.search);
      const parentUrl = urlParams.get('parent_url');
      const parentReferrer = urlParams.get('parent_referrer');
      
      const requestBody: ChatInitiateRequest = {
        client_key: clientId,
        visitor_metadata: {
          name: `Visitor ${Date.now()}`,
          ip_address: ipAddress,
          page_url: parentUrl || window.location.href, // Use parent URL if available
          referrer: parentReferrer || document.referrer || undefined, // Use parent referrer if available
          ...locationData,
          ...deviceInfo
        }
      };


      const response = await fetch(`${apiBase}/chat/initiate-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to start chat: ${response.status} ${response.statusText}`);
      }

      const data: ChatInitiateResponse = await response.json();
      const { visitor_id, session_id } = data;
      
      setVisitorId(visitor_id);
      setSessionId(session_id);
      
      setMessages([]);
      messageIdsRef.current.clear();
      
      const welcomeMessage: Message = {
        id: generateMessageId(),
        sender_type: 'agent',
        sender_id: 'system',
        message: '👋 Hello! Welcome to our support chat. How can I help you today?',
        timestamp: new Date().toISOString()
      };
      
      messageIdsRef.current.add(welcomeMessage.id);
      addMessage(welcomeMessage);

      return { visitorId: visitor_id, sessionId: session_id };

    } catch (error: any) {
      const errorMessage: Message = {
        id: generateMessageId(),
        sender_type: 'system',
        message: `❌ Failed to start chat: ${error.message}. Please try again.`,
        timestamp: new Date().toISOString()
      };
      addMessage(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clientId, apiBase, addMessage]);

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'chat_message' && data.message) {
      const currentTime = Date.now();
      
      if (currentTime - lastMessageTimeRef.current < 100) {
        return;
      }
      
      const messageId = data.message_id || generateMessageId();
      
      if (messageIdsRef.current.has(messageId)) {
        return;
      }
      
      lastMessageTimeRef.current = currentTime;
      messageIdsRef.current.add(messageId);
      
      const newMsg: Message = {
        id: messageId,
        sender_type: data.sender_type || 'agent',
        sender_id: data.sender_id,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        status: 'delivered' // Mark as delivered when received
      };
      
      addMessage(newMsg);
      
    } else if (data.type === 'typing_indicator') {
      setIsTyping(Boolean(data.is_typing && data.sender_type === 'agent'));
    } else if (data.type === 'message_seen') {
      // Handle message seen confirmation
      setMessages(prev => prev.map(msg => 
        msg.id === data.message_id 
          ? { ...msg, status: 'read' }
          : msg
      ));
    } else if (data.type === 'chat_connected') {
    }
  }, [addMessage]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setVisitorId(null);
    setSessionId(null);
    setIsTyping(false);
    messageIdsRef.current.clear();
    seenMessageIdsRef.current.clear();
    lastMessageTimeRef.current = 0;
  }, []);

  const markAsRead = useCallback(() => {
  }, []);

  const sendTypingIndicator = useCallback((isTyping: boolean, sendMessage: (message: any) => void) => {
    if (sessionId && visitorId) {
      sendMessage({
        type: 'typing_indicator',
        is_typing: isTyping
      });
    }
  }, [sessionId, visitorId]);

  const sendMessageSeen = useCallback((messageId: string, sendMessage: (message: any) => void) => {
    if (sessionId && visitorId && !seenMessageIdsRef.current.has(messageId)) {
      seenMessageIdsRef.current.add(messageId);
      sendMessage({
        type: 'message_seen',
        message_id: messageId,
        timestamp: new Date().toISOString()
      });
    }
  }, [sessionId, visitorId]);

  return {
    messages,
    visitorId,
    sessionId,
    loading,
    isTyping,
    startChat,
    handleWebSocketMessage,
    resetChat,
    markAsRead,
    addMessage,
    sendTypingIndicator,
    sendMessageSeen
  };
};
