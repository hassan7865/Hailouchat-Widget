import React from 'react';
import { Bot, Wifi, WifiOff, X } from 'lucide-react';
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
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 sm:p-4 flex items-center justify-between text-white">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
        </div>
        <div>
          <h3 className="font-semibold text-sm sm:text-lg">Support Chat</h3>
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm opacity-90">
            {connectionStatus === 'connected' ? (
              <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            ) : connectionStatus === 'connecting' ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            )}
            <span className="capitalize text-white">{connectionStatus}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <button
          onClick={onClose}
          className="p-1 sm:p-2  hover:bg-opacity-10 rounded-lg transition-colors duration-200"
          type="button"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
