export interface Message {
  id: string;
  sender_type: 'visitor' | 'client_agent' | 'system';
  sender_id?: string;
  sender_name?: string | null;
  message: string;
  timestamp: string;
  status?: 'delivered' | 'read';
  type?: 'text' | 'attachment';
  attachment?: {
    file_name: string;
    url: string;
    mime_type?: string;
    size?: number;
  };
  system_message_type?: string;
  hide_from_visitor?: boolean;
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
  page_title?: string;
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
  type: 'chat_message' | 'attachment_message' | 'typing_indicator' | 'chat_connected' | 'message_seen';
  sender_type?: 'visitor' | 'client_agent' | 'system';
  sender_id?: string;
  sender_name?: string | null;
  message?: string;
  timestamp?: string;
  is_typing?: boolean;
  message_id?: string;
  attachment?: {
    file_name: string;
    url: string;
    mime_type?: string;
    size?: number;
    s3_key?: string;
  };
  system_message_type?: string;
  hide_from_visitor?: boolean;
}

export interface OutgoingMessage {
  type: 'chat_message' | 'typing_indicator' | 'message_seen' | 'close_session';
  message?: string;
  is_typing?: boolean;
  message_id?: string;
  sender_type?: 'visitor' | 'client_agent' | 'system';
  timestamp?: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

export interface ChatWidgetProps {
  clientId: string;
  apiBase?: string;
  wsBase?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  theme?: 'light' | 'dark';
  isMobile?: boolean;
}
