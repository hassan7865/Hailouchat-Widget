import React, { useRef, useEffect, type JSX } from 'react';
import { Bot, User, Check, FileText } from 'lucide-react';
import type { Message } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  isMobile?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, isMobile = false }) => {
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
    
    // Special rendering for system messages
    if (isSystem) {
      return (
        <div key={msg.id} className="flex justify-center mb-2 px-3">
          <p className="text-sm text-gray-500 text-center">
            {msg.message}
          </p>
        </div>
      );
    }
    
    return (
        <div key={msg.id} className={`flex ${isVisitor ? 'justify-end' : 'justify-start'} mb-2 ${isMobile ? 'px-4' : 'px-3'}`}>
          <div className={`flex max-w-[85%] ${isVisitor ? 'flex-row-reverse' : 'flex-row'} items-end ${isMobile ? 'gap-2' : 'gap-1.5'}`}>
          {!isVisitor && (
            <div className={`flex-shrink-0 ${isMobile ? 'w-8 h-8' : 'w-6 h-6'} rounded-full bg-[#1E464A] flex items-center justify-center`}>
              <Bot className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-white`} />
            </div>
          )}
          
          <div className="flex flex-col gap-0.5">
            {/* Show agent name for agent messages */}
            {!isVisitor && msg.sender_name && (
              <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-600 font-medium`}>
                {msg.sender_name}
              </span>
            )}
            
            <div className={`${isMobile ? 'px-4 py-3' : 'px-3 py-2'} rounded-2xl ${
              isVisitor 
                ? 'bg-[#1E464A] text-white rounded-br-md' 
                : 'bg-gray-200 text-gray-800 rounded-bl-md'
            }`}>
              {msg.type === 'attachment' && msg.attachment ? (
                <div className="flex items-center gap-2">
                  <FileText className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} ${isVisitor ? 'text-white' : 'text-gray-600'}`} />
                  <a
                    href={msg.attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isMobile ? 'text-base' : 'text-xs'} ${isVisitor ? 'text-white underline' : 'text-blue-600 hover:underline'} truncate max-w-48`}
                    title={msg.attachment.file_name}
                  >
                    {msg.attachment.file_name}
                  </a>
                </div>
              ) : (
                <p className={`${isMobile ? 'text-base' : 'text-xs'} leading-relaxed`}>{msg.message}</p>
              )}
              {isVisitor && (
                <div className="flex items-center justify-end mt-0.5">
                  {msg.status === 'read' ? (
                    <div className="flex items-center gap-0.5">
                      <Check className={`${isMobile ? 'w-3 h-3' : 'w-2.5 h-2.5'} text-white`} />
                      <Check className={`${isMobile ? 'w-3 h-3' : 'w-2.5 h-2.5'} text-white`} />
                    </div>
                  ) : msg.status === 'delivered' ? (
                    <Check className={`${isMobile ? 'w-3 h-3' : 'w-2.5 h-2.5'} text-white`} />
                  ) : (
                    <div className={`${isMobile ? 'w-3 h-3' : 'w-2.5 h-2.5'} border border-white rounded-full`}></div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isVisitor && (
            <div className={`flex-shrink-0 ${isMobile ? 'w-8 h-8' : 'w-6 h-6'} rounded-full bg-gray-500 flex items-center justify-center`}>
              <User className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-white`} />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Process messages: replace visitor-specific messages with "Chat ended"
  const visibleMessages = messages.map(msg => {
    // For system messages marked to hide from visitor, replace with "Chat ended"
    if (msg.sender_type === 'system' && msg.hide_from_visitor === true) {
      // Check if it's a visitor left/ended message
      if (msg.system_message_type === 'visitor_left' || 
          msg.system_message_type === 'visitor_ended_chat') {
        return {
          ...msg,
          message: 'Chat ended',
          hide_from_visitor: false // Show the modified message
        };
      }
      // For visitor_joined, don't show at all
      if (msg.system_message_type === 'visitor_joined') {
        return null;
      }
    }
    return msg;
  }).filter((msg): msg is Message => msg !== null); // Remove null entries

  return (
    <div className={`h-full overflow-y-auto overflow-x-hidden bg-white ${isMobile ? 'pb-2' : ''}`}>
      {visibleMessages.length === 0 ? (
        <div className={`flex flex-col items-center justify-center h-full ${isMobile ? 'p-4' : 'p-3'}`}>
          <div className="text-center text-gray-500">
            <Bot className={`${isMobile ? 'w-12 h-12' : 'w-8 h-8'} mx-auto mb-2 opacity-50`} />
            <p className={`${isMobile ? 'text-base' : 'text-xs'}`}>No messages yet...</p>
          </div>
        </div>
      ) : (
        <>
          {visibleMessages.map(renderMessage)}
          
          {isTyping && (
            <div className={`flex justify-start mb-3 ${isMobile ? 'px-4' : 'px-3'}`}>
              <div className={`flex items-end ${isMobile ? 'gap-2' : 'gap-1.5'}`}>
                <div className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} rounded-full bg-[#1E464A] flex items-center justify-center`}>
                  <Bot className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-white`} />
                </div>
                <div className={`bg-gray-200 ${isMobile ? 'px-4 py-3' : 'px-3 py-2'} rounded-2xl rounded-bl-md`}>
                  <div className={`flex ${isMobile ? 'gap-1' : 'gap-0.5'}`}>
                    <div className={`${isMobile ? 'w-2 h-2' : 'w-1.5 h-1.5'} bg-gray-500 rounded-full animate-bounce`}></div>
                    <div className={`${isMobile ? 'w-2 h-2' : 'w-1.5 h-1.5'} bg-gray-500 rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`${isMobile ? 'w-2 h-2' : 'w-1.5 h-1.5'} bg-gray-500 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
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
