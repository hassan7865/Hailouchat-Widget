import { useRef, useCallback, useEffect } from 'react';
import type { WebSocketMessage, OutgoingMessage, ConnectionStatus } from '../types/chat';

interface UseWebSocketProps {
  onMessage: (message: WebSocketMessage) => void;
  onConnectionChange: (status: ConnectionStatus) => void;
}

export const useWebSocket = ({ onMessage, onConnectionChange }: UseWebSocketProps) => {
  const websocketRef = useRef<WebSocket | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 10; // Increased from 5 to 10
  const baseReconnectDelay = 2000; // Increased from 1 second to 2 seconds

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close(1000, 'Component unmounting');
      }
    };
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 15000); // Send heartbeat every 15 seconds for better connection monitoring
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback((wsUrl: string) => {
    if (isConnectingRef.current || (websocketRef.current?.readyState === WebSocket.OPEN)) {
      return;
    }

    isConnectingRef.current = true;
    onConnectionChange('connecting');
    
    // Clean up existing connection
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    
    stopHeartbeat();

    try {
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = (): void => {
        onConnectionChange('connected');
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        
        // Start heartbeat
        startHeartbeat();
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      websocketRef.current.onmessage = (event: MessageEvent): void => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          // Handle heartbeat response
          if ((data as any).type === 'heartbeat_response') {
            return; // Don't process heartbeat responses as regular messages
          }
          
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocketRef.current.onclose = (event: CloseEvent): void => {
        onConnectionChange('disconnected');
        isConnectingRef.current = false;
        stopHeartbeat();
        
        // Only attempt reconnection if it wasn't a clean close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current); // Exponential backoff
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isConnectingRef.current) {
              connect(wsUrl);
            }
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          onConnectionChange('error');
        }
      };

      websocketRef.current.onerror = (error: Event): void => {
        console.error('WebSocket error:', error);
        onConnectionChange('error');
        isConnectingRef.current = false;
        stopHeartbeat();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      onConnectionChange('error');
      isConnectingRef.current = false;
    }
  }, [onMessage, onConnectionChange, startHeartbeat, stopHeartbeat]);

  const sendMessage = useCallback((message: OutgoingMessage) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      try {
        websocketRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        onConnectionChange('error');
      }
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }, [onConnectionChange]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (websocketRef.current) {
      websocketRef.current.close(1000, 'User disconnected');
      websocketRef.current = null;
    }
    
    isConnectingRef.current = false;
    reconnectAttemptsRef.current = 0;
  }, [stopHeartbeat]);

  const getConnectionState = useCallback(() => {
    if (!websocketRef.current) return 'disconnected';
    
    switch (websocketRef.current.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'disconnecting';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'disconnected';
    }
  }, []);

  return {
    connect,
    sendMessage,
    disconnect,
    isConnected: websocketRef.current?.readyState === WebSocket.OPEN,
    connectionState: getConnectionState(),
    reconnectAttempts: reconnectAttemptsRef.current
  };
};
