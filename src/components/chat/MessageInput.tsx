import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';


interface MessageInputProps {
  onSendMessage: (message: string) => void;
  connectionStatus: ConnectionStatus;
  sessionId: string | null;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  connectionStatus, 
  sessionId 
}) => {
  const [newMessage, setNewMessage] = useState<string>('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>): void => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  const sendMessage = (): void => {
    if (!newMessage.trim() || connectionStatus !== 'connected') return;

    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  return (
    <div className="border-t border-gray-200 p-2 sm:p-4 bg-white overflow-hidden">
      <div className="flex items-end gap-2 sm:gap-3 w-full">
        <div className="flex-1">
          <textarea
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onInput={handleTextareaInput}
            placeholder="Type your message..."
            disabled={connectionStatus !== 'connected'}
            rows={1}
            className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base overflow-hidden"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={connectionStatus !== 'connected' || !newMessage.trim()}
          className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 disabled:transform-none shadow-lg"
          type="button"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-orange-500' :
            connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-red-500'
          }`}></div>
          <span className="capitalize">{connectionStatus}</span>
        </div>
        {sessionId && (
          <span>Session: {sessionId.substring(0, 8)}...</span>
        )}
      </div>
    </div>
  );
};
