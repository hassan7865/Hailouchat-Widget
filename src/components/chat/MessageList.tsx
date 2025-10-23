import React, { useRef, useEffect, useState, type JSX } from 'react';
import { Bot, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Message } from '../../types/chat';
import VisitorAttachmentMessage from './VisitorAttachmentMessage';
import VisitorUploadingAttachment from './VisitorUploadingAttachment';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  uploadingFiles: Set<string>;
  isMobile?: boolean;
  sessionId?: string;
  clientId?: string;
  apiBase?: string;
  onShowRatingFormChange?: (show: boolean) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isTyping, 
  uploadingFiles,
  isMobile = false, 
  sessionId, 
  clientId, 
  apiBase,
  onShowRatingFormChange
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState<'thumbs_up' | 'thumbs_down' | null>(null);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // Notify parent when showRatingForm changes
  useEffect(() => {
    onShowRatingFormChange?.(showRatingForm);
  }, [showRatingForm, onShowRatingFormChange]);

  const scrollToBottom = (): void => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      if (messagesEndRef.current) {
        // Try scrollIntoView first
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        
        // Fallback: scroll the parent container to bottom
        const container = messagesEndRef.current.closest('.overflow-y-auto');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, uploadingFiles]);

  // Check if there's a rating request message and it hasn't been submitted yet
  const hasRatingRequest = messages.some(msg => 
    msg.sender_type === 'system' && msg.system_message_type === 'rating_request'
  ) && !ratingSubmitted;

  const handleSubmitRating = async () => {
    if (!selectedRating || !sessionId || !clientId || !apiBase) return;
    
    setIsSubmittingRating(true);
    try {
      const response = await fetch(`${apiBase}/chat/session-rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_key: clientId,
          session_id: sessionId,
          rating: selectedRating,
          note: ratingComment.trim() || null
        })
      });
      
      if (response.ok) {
        setRatingSubmitted(true);
        setShowRatingForm(false); // Close the form
        setSelectedRating(null);
        setRatingComment('');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

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
                ? (msg.type === 'attachment' ? 'bg-transparent' : 'bg-[#1E464A] text-white rounded-br-md')
                : (msg.type === 'attachment' ? 'bg-transparent' : 'bg-gray-200 text-gray-800 rounded-bl-md')
            }`}>
              {msg.type === 'attachment' && msg.attachment ? (
                <VisitorAttachmentMessage
                  attachment={msg.attachment}
                  isMobile={isMobile}
                />
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
          
        </div>
      </div>
    );
  };

  // Process messages: replace visitor-specific messages with "Chat ended"
  const visibleMessages = messages.map(msg => {
    // Hide rating request messages from visitor since we have header buttons
    if (msg.sender_type === 'system' && msg.system_message_type === 'rating_request') {
      return null; // Don't show rating request messages
    }
    
    // Transform rating confirmation messages to show "Chat rated Good/Bad"
    if (msg.sender_type === 'system' && 
        (msg.system_message_type === 'rating_confirmation' || 
         msg.message.includes('has rated 👍') || msg.message.includes('has rated 👎'))) {
      const isGood = msg.message.includes('👍');
      return {
        ...msg,
        message: `Chat rated ${isGood ? 'Good' : 'Bad'}`
      };
    }
    
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

  // Show rating form instead of chat content when form is open
  if (hasRatingRequest && showRatingForm) {
    return (
      <div className={`h-full overflow-y-auto overflow-x-hidden bg-white ${isMobile ? 'pb-2' : ''}`}>
        <div className={`flex justify-center items-center h-full ${isMobile ? 'px-4' : 'px-3'}`}>
          <div className="bg-white border border-gray-200 rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900 text-center mb-4">Please rate this chat</h3>
            
            {/* Rating Icons */}
            <div className="flex justify-center gap-6 mb-4">
              <button
                onClick={() => setSelectedRating('thumbs_up')}
                className={`p-2 rounded-full transition-colors ${
                  selectedRating === 'thumbs_up' 
                    ? 'bg-[#1E464A] text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ThumbsUp className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSelectedRating('thumbs_down')}
                className={`p-2 rounded-full transition-colors ${
                  selectedRating === 'thumbs_down' 
                    ? 'bg-[#1E464A] text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ThumbsDown className="w-6 h-6" />
              </button>
            </div>
            
            {/* Comment Section */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Leave a comment (optional)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded resize-none"
                rows={2}
                placeholder="Tell us about your experience..."
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowRatingForm(false)}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={!selectedRating || isSubmittingRating}
                className="flex-1 px-3 py-2 text-xs bg-[#1E464A] text-white rounded hover:bg-[#2a5a5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingRating ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          
          {/* Uploading Progress Messages */}
          {Array.from(uploadingFiles).map((fileKey) => {
            // Extract filename from the fileKey (format: "filename-timestamp")
            const fileName = fileKey.split('-').slice(0, -1).join('-');
            
            return (
              <div key={fileKey} className={`flex justify-end mb-2 ${isMobile ? 'px-4' : 'px-3'}`}>
                <VisitorUploadingAttachment
                  fileName={fileName}
                  isMobile={isMobile}
                />
              </div>
            );
          })}
          
          {/* Rating Interface - Show button when rating request exists */}
          {hasRatingRequest && !showRatingForm && (
            <div className={`flex justify-center mb-3 ${isMobile ? 'px-4' : 'px-3'}`}>
              <button
                onClick={() => setShowRatingForm(true)}
                className="px-4 py-2 bg-[#1E464A] text-white rounded-lg hover:bg-[#2a5a5e] transition-colors text-sm font-medium"
              >
                Rate this Chat
              </button>
            </div>
          )}

          
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
