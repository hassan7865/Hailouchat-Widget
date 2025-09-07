import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  unreadCount: number;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick, unreadCount }) => {
  return (
    <div 
      className="cursor-pointer transform hover:scale-105 transition-transform duration-200 pointer-events-auto"
      onClick={onClick}
    >
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow duration-300">
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-ping opacity-75"></div>
      </div>
    </div>
  );
};
