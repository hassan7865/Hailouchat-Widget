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
      <div className="bg-[#1E464A] px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="text-white text-base font-semibold">Chat</span>
      </div>
    </div>
  );
};
