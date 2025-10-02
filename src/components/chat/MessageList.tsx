import React, { useRef, useEffect, type JSX } from 'react';
import { Bot, User, Clock, Check } from 'lucide-react';
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
        <div key={msg.id} className={`flex ${isVisitor ? 'justify-end' : 'justify-start'} mb-2 px-3`}>
          <div className={`flex max-w-[85%] ${isVisitor ? 'flex-row-reverse' : 'flex-row'} items-end gap-1.5`}>
          {!isVisitor && (
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E464A] flex items-center justify-center">
              {isSystem ? (
                <Clock className="w-3 h-3 text-white" />
              ) : (
                <Bot className="w-3 h-3 text-white" />
              )}
            </div>
          )}
          
          <div className={`px-3 py-2 rounded-2xl ${
            isVisitor 
              ? 'bg-[#1E464A] text-white rounded-br-md' 
              : isSystem
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-gray-200 text-gray-800 rounded-bl-md'
          }`}>
            <p className="text-xs leading-relaxed">{msg.message}</p>
            {(isVisitor || (!isVisitor && !isSystem)) && (
              <div className="flex items-center justify-end mt-0.5">
                {msg.status === 'read' ? (
                  <div className="flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5 text-white" />
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                ) : msg.status === 'delivered' ? (
                  <Check className="w-2.5 h-2.5 text-white" />
                ) : (
                  <div className="w-2.5 h-2.5 border border-white rounded-full"></div>
                )}
              </div>
            )}
          </div>
          
          {isVisitor && (
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Filter out system messages for visitor display
  const visibleMessages = messages.filter(msg => msg.sender_type !== 'system');

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
      {visibleMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-3">
          <div className="text-center text-gray-500">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No messages yet...</p>
          </div>
        </div>
      ) : (
        <>
          {visibleMessages.map(renderMessage)}
          
          {isTyping && (
            <div className="flex justify-start mb-3 px-3">
              <div className="flex items-end gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[#1E464A] flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-gray-200 px-3 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
