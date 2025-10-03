import React, { useState } from 'react';
import { Paperclip, Clipboard, MoreHorizontal } from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';


interface MessageInputProps {
  onSendMessage: (message: string) => void | Promise<void>;
  onTypingChange: (isTyping: boolean) => void;
  connectionStatus: ConnectionStatus;
  isMobile?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onTypingChange,
  connectionStatus,
  isMobile = false,
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = React.useRef<number | null>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingChange(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingChange(false);
    }, 1000);
  };

  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || connectionStatus !== 'connected') return;

    // Stop typing indicator when sending message
    if (isTyping) {
      setIsTyping(false);
      onTypingChange(false);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    await onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  return (
    <div className="bg-white border-t border-gray-200 flex-shrink-0" style={{ minHeight: '60px' }}>
      {/* Input Field */}
      <div className="p-3">
        <div className={`relative ${isMobile ? 'flex items-center gap-3' : 'block'}`}>
          {/* Attachment button - show on mobile before input */}
          {isMobile && (
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message here..."
            disabled={connectionStatus !== 'connected'}
            rows={isMobile ? 1 : 2}
            className={`${isMobile ? 'flex-1 min-w-0 px-4 py-3 text-base resize-none' : 'w-full px-3 py-2 text-xs resize-none'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007B8A] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
            style={{ minHeight: isMobile ? '44px' : '60px' }}
          />
        </div>
      </div>

      {/* Footer Action Bar - Desktop only */}
      {!isMobile && (
        <div className="justify-end pb-3 flex items-center gap-3 ">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Clipboard className="w-3 h-3 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-3 h-3 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};
