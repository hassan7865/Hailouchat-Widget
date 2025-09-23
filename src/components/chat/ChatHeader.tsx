import React from 'react';
import { Minus, Square, Wifi, WifiOff } from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';


interface ChatHeaderProps {
  connectionStatus: ConnectionStatus;
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  connectionStatus,
  onClose
}) => {
  return (
    <div className="bg-[#1E464A] p-3 flex items-center justify-between text-white">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <Wifi className="w-3 h-3 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Chat with us</h3>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
          type="button"
        >
          <Square className="w-3 h-3 text-white" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
          type="button"
        >
          <Minus className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
};
