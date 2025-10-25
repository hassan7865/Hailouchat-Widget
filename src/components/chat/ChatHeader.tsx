import React, { useState } from 'react';
import { MoreVertical, MessageSquare, User, Minus, Square } from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';


interface ChatHeaderProps {
  connectionStatus: ConnectionStatus;
  onClose: () => void;
  isMobile?: boolean;
  onEndChat?: () => void;
  onOpenContactModal?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  connectionStatus,
  onClose,
  isMobile = false,
  onEndChat,
  onOpenContactModal
}) => {
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  
  console.log('Connection Status:', connectionStatus);
  
  const handleMobileOptionsToggle = () => {
    setShowMobileOptions(!showMobileOptions);
  };

  return (
    <div className="bg-[#17494d] text-white relative">
      {/* Main Header */}
      <div className={`${isMobile ? 'p-4' : 'pt-2 pb-3'} flex items-center justify-between`}>
        {/* Left side - Mobile options button or empty space */}
        <div className="w-20">
          {isMobile && (
            <button
              onClick={handleMobileOptionsToggle}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              type="button"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        
        {/* Center - Chat with us text */}
        <div className="flex-1 flex justify-center">
          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-sm'}`}>Chat with us</h3>
        </div>
        
        {/* Right side - Square and Minimize buttons */}
        <div className="flex items-center gap-1 w-20 justify-end">
          <button
            className={`${isMobile ? 'p-2' : 'p-1.5'} hover:bg-white/10 rounded-lg transition-colors duration-200`}
            type="button"
          >
            <Square className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-white`} />
          </button>
          <button
            onClick={onClose}
            className={`${isMobile ? 'p-2' : 'p-1.5'} hover:bg-white/10 rounded-lg transition-colors duration-200`}
            type="button"
          >
            <Minus className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-white`} />
          </button>
        </div>
      </div>

      {/* Mobile Options Dropdown */}
      {isMobile && showMobileOptions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-50 rounded-b-lg">
          <div className="p-4 space-y-2">
            <button
              onClick={() => {
                onEndChat?.();
                setShowMobileOptions(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-left"
              type="button"
            >
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">End Chat</span>
            </button>
            <button
              onClick={() => {
                onOpenContactModal?.();
                setShowMobileOptions(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-left"
              type="button"
            >
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Edit Contact Details</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};