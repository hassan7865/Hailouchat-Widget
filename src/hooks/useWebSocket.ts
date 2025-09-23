import { useRef, useCallback } from 'react';
import type { WebSocketMessage, OutgoingMessage, ConnectionStatus } from '../types/chat';

interface UseWebSocketProps {
  onMessage: (message: WebSocketMessage) => void;
  onConnectionChange: (status: ConnectionStatus) => void;
}

export const useWebSocket = ({ onMessage, onConnectionChange }: UseWebSocketProps) => {
  const websocketRef = useRef<WebSocket | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback((wsUrl: string) => {
    if (isConnectingRef.current || (websocketRef.current?.readyState === WebSocket.OPEN)) {
      return;
    }

    isConnectingRef.current = true;
    onConnectionChange('connecting');
    
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    
    websocketRef.current = new WebSocket(wsUrl);

    websocketRef.current.onopen = (): void => {
      onConnectionChange('connected');
      isConnectingRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    websocketRef.current.onmessage = (event: MessageEvent): void => {
      const data: WebSocketMessage = JSON.parse(event.data);
      onMessage(data);
    };

    websocketRef.current.onclose = (event: CloseEvent): void => {
      onConnectionChange('disconnected');
      isConnectingRef.current = false;
      
      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isConnectingRef.current) {
            connect(wsUrl);
          }
        }, 3000);
      }
    };

    websocketRef.current.onerror = (error: Event): void => {
      onConnectionChange('error');
      isConnectingRef.current = false;
    };
  }, [onMessage, onConnectionChange]);

  const sendMessage = useCallback((message: OutgoingMessage) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (websocketRef.current) {
      websocketRef.current.close(1000, 'User disconnected');
      websocketRef.current = null;
    }
    
    isConnectingRef.current = false;
  }, []);

  return {
    connect,
    sendMessage,
    disconnect,
    isConnected: websocketRef.current?.readyState === WebSocket.OPEN
  };
};
