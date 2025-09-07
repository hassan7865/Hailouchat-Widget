import React, { useRef, useEffect, type JSX } from 'react';
import { Bot, User, Clock } from 'lucide-react';
import { formatTime } from '../../utils/messageUtils';
import type { Message } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const renderMessage = (msg: Message): JSX.Element => {
    const isVisitor = msg.sender_type === 'visitor';
    const isSystem = msg.sender_type === 'system';
    
    return (
        <div key={msg.id} className={`flex ${isVisitor ? 'justify-end' : 'justify-start'} mb-2 sm:mb-4 px-1`}>
          <div className={`flex max-w-[85%] sm:max-w-xs lg:max-w-md ${isVisitor ? 'flex-row-reverse' : 'flex-row'} items-end gap-1 sm:gap-2`}>
          {!isVisitor && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              {isSystem ? (
                <Clock className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
          )}
          
          <div className={`px-2 sm:px-4 py-2 rounded-2xl ${
            isVisitor 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : isSystem
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-gray-200 text-gray-800 rounded-bl-md'
          }`}>
            <p className="text-xs sm:text-sm leading-relaxed">{msg.message}</p>
            <p className={`text-xs mt-1 ${
              isVisitor ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(msg.timestamp)}
            </p>
          </div>
          
          {isVisitor && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 bg-gray-50 space-y-2 sm:space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages yet...</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map(renderMessage)}
          
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
