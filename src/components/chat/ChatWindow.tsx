import React, { useEffect, useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Bell, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { ConnectionStatus, Message } from '../../types/chat';


interface ChatWindowProps {
  chatStarted: boolean;
  loading: boolean;
  messages: Message[];
  isTyping: boolean;
  uploadingFiles: Set<string>;
  connectionStatus: ConnectionStatus;
  visitorId?: string;
  sessionId?: string;
  clientId?: string;
  apiBase?: string;
  onStartChat: () => void;
  onSendMessage: (message: string) => void | Promise<void>;
  onTypingChange: (isTyping: boolean) => void;
  onFileUpload?: (file: File) => Promise<void>;
  onClose: () => void;
  onEndChat?: () => void;
  onOpenContactModal?: () => void;
  isMobile?: boolean;
  onHeaderRatingChange?: (rating: 'thumbs_up' | 'thumbs_down') => void;
  showRatingForm?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatStarted,
  loading,
  messages,
  isTyping,
  uploadingFiles,
  connectionStatus,
  visitorId, // Keep for potential future use
  sessionId,
  clientId,
  apiBase,
  onStartChat,
  onSendMessage,
  onTypingChange,
  onFileUpload,
  onClose,
  onEndChat,
  onOpenContactModal,
  isMobile = false,
  onHeaderRatingChange,
  showRatingForm = false
}) => {
  const [isRatingFormOpen, setIsRatingFormOpen] = useState(false);
  const [headerRating, setHeaderRating] = useState<'thumbs_up' | 'thumbs_down' | null>(null);

  // Handle header rating button clicks
  const handleHeaderRatingClick = (rating: 'thumbs_up' | 'thumbs_down') => {
    setHeaderRating(rating);
    onHeaderRatingChange?.(rating);
  };

  // Auto-start chat when window opens if not already started
  useEffect(() => {
    if (!chatStarted && !loading) {
      onStartChat();
    }
  }, [chatStarted, loading]); // Remove onStartChat from dependencies to prevent multiple calls

  // Auto-minimize when session ends (disconnected)
  useEffect(() => {
    if (connectionStatus === 'disconnected' && chatStarted) {
      onClose();
    }
  }, [connectionStatus, chatStarted, onClose]);

  // Check if there's a rating request message (use original messages, not filtered)
  const hasRatingRequest = messages.some(msg => 
    msg.sender_type === 'system' && msg.system_message_type === 'rating_request'
  );

  // Check if visitor has already rated (look for rating confirmation messages)
  const currentRating = messages.find(msg => 
    msg.sender_type === 'system' && 
    (msg.system_message_type === 'rating_confirmation' || 
     msg.message.includes('👍') || msg.message.includes('👎'))
  )?.message?.includes('👍') ? 'thumbs_up' : 
   messages.find(msg => 
     msg.sender_type === 'system' && 
     (msg.system_message_type === 'rating_confirmation' || 
      msg.message.includes('👍') || msg.message.includes('👎'))
   )?.message?.includes('👎') ? 'thumbs_down' : null;

  // Update header rating when current rating changes
  useEffect(() => {
    if (currentRating) {
      setHeaderRating(currentRating);
    }
  }, [currentRating]);

  return (
    <div className={`w-full h-full bg-white ${isMobile ? 'rounded-none' : 'rounded-b-2xl'} flex flex-col transition-all duration-300 pointer-events-auto`}>
      
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 ">
        <ChatHeader
          connectionStatus={connectionStatus}
          onClose={onClose}
          isMobile={isMobile}
          onEndChat={onEndChat}
          onOpenContactModal={onOpenContactModal}
        />

        {/* Support Channel Section */}
        <div className={`bg-white ${isMobile ? 'p-4' : 'p-3'} border-b border-gray-100`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} bg-gray-400 rounded-full flex items-center justify-center`}>
                <Bell className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-white`} />
              </div>
              <div>
                <h4 className={`font-semibold ${isMobile ? 'text-sm' : 'text-xs'} text-gray-900 font-bold`}>Live Support</h4>
                <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-500 font-semibold`}>Customer Support</p>
              </div>
            </div>
            
            {/* Rating buttons - only show when rating request exists */}
            {hasRatingRequest && onHeaderRatingChange && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleHeaderRatingClick('thumbs_up')}
                  className={`${isMobile ? 'p-2' : 'p-1.5'} hover:bg-gray-100 rounded-full transition-colors duration-200 ${
                    headerRating === 'thumbs_up' ? 'bg-[#1E464A]' : ''
                  }`}
                  type="button"
                  title="Rate positive"
                >
                  <ThumbsUp className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} ${
                    headerRating === 'thumbs_up' ? 'text-white' : 'text-gray-400'
                  }`} />
                </button>
                <button
                  onClick={() => handleHeaderRatingClick('thumbs_down')}
                  className={`${isMobile ? 'p-2' : 'p-1.5'} hover:bg-gray-100 rounded-full transition-colors duration-200 ${
                    headerRating === 'thumbs_down' ? 'bg-[#1E464A]' : ''
                  }`}
                  type="button"
                  title="Rate negative"
                >
                  <ThumbsDown className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} ${
                    headerRating === 'thumbs_down' ? 'text-white' : 'text-gray-400'
                  }`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Section - Flexible */}
      <div className="flex-1 min-h-0">
        <MessageList
          messages={messages}
          isTyping={isTyping}
          uploadingFiles={uploadingFiles}
          isMobile={isMobile}
          sessionId={sessionId}
          clientId={clientId}
          apiBase={apiBase}
          onShowRatingFormChange={setIsRatingFormOpen}
        />
      </div>

      {/* Input Section - Fixed at Bottom - Hide when rating form is open */}
      {!isRatingFormOpen && (
        <div className="flex-shrink-0" style={{ position: 'relative', zIndex: 10 }}>
          <MessageInput
            onSendMessage={onSendMessage}
            onTypingChange={onTypingChange}
            onFileUpload={onFileUpload}
            connectionStatus={connectionStatus}
            isMobile={isMobile}
            onEndChat={onEndChat}
            onEditContactDetails={onOpenContactModal}
          />
        </div>
      )}
    </div>
  );
};
