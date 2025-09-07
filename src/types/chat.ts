export interface Message {
  id: string;
  sender_type: 'visitor' | 'agent' | 'system';
  sender_id?: string;
  message: string;
  timestamp: string;
}

export interface VisitorMetadata {
  name?: string;
  email?: string;
  ip_address?: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  user_agent?: string;
  referrer?: string;
  page_url?: string;
  device_type?: string;
  browser?: string;
  os?: string;
}

export interface ChatInitiateRequest {
  client_key: string;
  visitor_metadata: VisitorMetadata;
}

export interface ChatInitiateResponse {
  visitor_id: string;
  session_id: string;
}

export interface WebSocketMessage {
  type: 'chat_message' | 'typing_indicator' | 'chat_connected';
  sender_type?: 'visitor' | 'agent' | 'system';
  sender_id?: string;
  message?: string;
  timestamp?: string;
  is_typing?: boolean;
  message_id?: string;
}

export interface OutgoingMessage {
  type: 'chat_message' | 'typing_indicator';
  message?: string;
  is_typing?: boolean;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

export interface ChatWidgetProps {
  clientId: string;
  apiBase?: string;
  wsBase?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  theme?: 'light' | 'dark';
}
