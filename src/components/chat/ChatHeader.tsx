import React from 'react';
import { Square, Minus } from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';


interface ChatHeaderProps {
  connectionStatus: ConnectionStatus;
  onClose: () => void;
  isMobile?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  connectionStatus,
  onClose,
  isMobile = false
}) => {
  console.log('Connection Status:', connectionStatus);
  return (

    <div className={`bg-[#17494d] ${isMobile ? 'p-4' : 'p-3'} flex items-center justify-between text-white`}>
      {/* Left side - empty for balance */}
      <div className="w-20"></div>
      
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
  );
};
