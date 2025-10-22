import { useState, useRef, useCallback } from 'react';
import type { Message, ChatInitiateRequest, ChatInitiateResponse } from '../types/chat';
import { getDeviceInfo } from '../utils/deviceDetection';
import { getLocationData, getIPAddress } from '../utils/locationDetection';
import { generateMessageId, isDuplicateMessage } from '../utils/messageUtils';
import { playAgentMessageSound } from '../utils/soundUtils';

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
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  
  const messageIdsRef = useRef<Set<string>>(new Set());
  const lastMessageTimeRef = useRef<number>(0);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  const addMessage = useCallback((message: Message): void => {
    setMessages(prev => {
      if (isDuplicateMessage(message, prev)) {
        return prev;
      }
      
      // Check if this is the first agent or visitor message (not system message)
      const isAgentOrVisitorMessage = message.sender_type === 'client_agent' || message.sender_type === 'visitor';
      const hasExistingAgentOrVisitorMessage = prev.some(msg => 
        msg.sender_type === 'client_agent' || msg.sender_type === 'visitor'
      );
      
      // If this is the first agent or visitor message, add "Chat started" system message
      if (isAgentOrVisitorMessage && !hasExistingAgentOrVisitorMessage) {
        const chatStartedMessage: Message = {
          id: `chat-started-${Date.now()}`,
          sender_type: 'system',
          sender_id: 'system',
          sender_name: 'System',
          message: 'Chat started',
          timestamp: new Date().toISOString(),
          status: 'delivered',
          type: 'system',
          system_message_type: 'chat_started'
        };
        
        return [...prev, chatStartedMessage, message];
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

      // Get parent page URL, referrer, and title from URL parameters (passed by injector)
      const urlParams = new URLSearchParams(window.location.search);
      const parentUrl = urlParams.get('parent_url');
      const parentReferrer = urlParams.get('parent_referrer');
      const pageTitle = urlParams.get('page_title');
      
      const visitorMetadata = {
        ip_address: ipAddress,
        page_url: parentUrl || window.location.href, // Use parent URL if available
        referrer: parentReferrer || document.referrer || undefined, // Use parent referrer if available
        page_title: pageTitle || document.title, // Use parent page title if available
        ...locationData,
        ...deviceInfo
      };

      const requestBody: ChatInitiateRequest = {
        client_key: clientId,
        visitor_metadata: visitorMetadata
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
      setIpAddress(ipAddress || null);
      
      setMessages([]);
      messageIdsRef.current.clear();

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
    if (data.type === 'chat_message' || data.type === 'message') {
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
      
      const isAttachment = data.type === 'message' && data.attachment;
      const newMsg: Message = {
        id: messageId,
        sender_type: data.sender_type || 'client_agent',
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        message: data.message || data.attachment?.file_name || '',
        timestamp: data.timestamp || new Date().toISOString(),
        status: 'delivered', // Mark as delivered when received
        type: isAttachment ? 'attachment' : 'text',
        attachment: data.attachment,
        system_message_type: data.system_message_type,
        hide_from_visitor: data.hide_from_visitor
      };
      
      addMessage(newMsg);
      
      // Play sound notification for agent messages
      if (newMsg.sender_type === 'client_agent') {
        playAgentMessageSound();
      }
      
    } else if (data.type === 'typing_indicator') {
      setIsTyping(Boolean(data.is_typing && data.sender_type === 'client_agent'));
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

  const fetchVisitorDetails = useCallback(async () => {
    if (!ipAddress) return null;
    
    try {
      const response = await fetch(
        `${apiBase}/chat/visitor-details?ip_address=${ipAddress}&client_key=${clientId}`
      );
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return {
        firstName: data.first_name || '',
        email: data.email || ''
      };
    } catch (error) {
      console.error('Error fetching visitor details:', error);
      return null;
    }
  }, [apiBase, clientId, ipAddress]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setVisitorId(null);
    setSessionId(null);
    setIpAddress(null);
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

  const uploadAttachment = useCallback(async (file: File, apiBase: string): Promise<void> => {
    if (!visitorId || !sessionId) {
      throw new Error('No active session');
    }

    try {
      // 1. Get presigned URL
      const presignResponse = await fetch(
        `${apiBase}/attachments/visitor/${sessionId}/${visitorId}/presign`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_name: file.name,
            mime_type: file.type || 'application/octet-stream',
            size: file.size
          })
        }
      );

      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const presignData = await presignResponse.json();
      if (!presignData.success) {
        throw new Error('Failed to get upload URL');
      }

      const { upload_url, headers, s3_key, public_url } = presignData;

      // 2. Upload to S3 using presigned URL
      if (upload_url) {
        // Start with Content-Type from file, then merge backend headers (as in fe_flow_test.py)
        const uploadHeaders: Record<string, string> = {};
        
        // Only add Content-Type if it's specified in the file
        if (file.type) {
          uploadHeaders['Content-Type'] = file.type;
        }
        
        // Merge additional headers from backend response (but be careful with CORS)
        if (headers) {
          // Only add headers that are safe for CORS
          Object.keys(headers).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (lowerKey.startsWith('x-amz-') || lowerKey === 'content-type') {
              uploadHeaders[key] = headers[key];
            }
          });
        }

        const uploadResponse = await fetch(upload_url, {
          method: 'PUT',
          body: file,
          headers: uploadHeaders
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload file: ${uploadResponse.status}`);
        }
      } else if (public_url) {
        // For public bucket mode, upload directly to public URL
        const uploadResponse = await fetch(public_url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream'
          }
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to public bucket');
        }
      } else {
        throw new Error('No upload URL provided');
      }

      // 3. Commit attachment
      await fetch(
        `${apiBase}/attachments/visitor/${sessionId}/${visitorId}/commit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_name: file.name,
            mime_type: file.type || 'application/octet-stream',
            size: file.size,
            s3_key: s3_key,
            caption: ''
          })
        }
      );
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }, [visitorId, sessionId]);

  return {
    messages,
    visitorId,
    sessionId,
    ipAddress,
    loading,
    isTyping,
    startChat,
    handleWebSocketMessage,
    resetChat,
    markAsRead,
    addMessage,
    sendTypingIndicator,
    sendMessageSeen,
    uploadAttachment,
    fetchVisitorDetails
  };
};
