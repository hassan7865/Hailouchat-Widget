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
      <div className="bg-[#1E464A] px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-medium">Chat</span>
      </div>
    </div>
  );
};
