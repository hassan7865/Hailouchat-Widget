import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <div 
      className="cursor-pointer transform hover:scale-105 transition-transform duration-200 pointer-events-auto"
      onClick={onClick}
    >
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow duration-300 hover:from-teal-700 hover:to-teal-800">
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full animate-ping opacity-75"></div>
      </div>
    </div>
  );
};
