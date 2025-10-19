import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Clipboard, MoreHorizontal, FileText, X } from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';
import { Tooltip } from '../Tooltip';
import { ContactDetailsModal } from '../ContactDetailsModal';
import { EndChatModal } from '../EndChatModal';


interface MessageInputProps {
  onSendMessage: (message: string) => void | Promise<void>;
  onTypingChange: (isTyping: boolean) => void;
  onFileUpload?: (file: File) => Promise<void>;
  connectionStatus: ConnectionStatus;
  isMobile?: boolean;
  onEndChat?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onTypingChange,
  onFileUpload,
  connectionStatus,
  isMobile = false,
  onEndChat,
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showEndChatModal, setShowEndChatModal] = useState<boolean>(false);
  const typingTimeoutRef = React.useRef<number | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingChange(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingChange(false);
    }, 1000);
  };

  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || connectionStatus !== 'connected') return;

    // Stop typing indicator when sending message
    if (isTyping) {
      setIsTyping(false);
      onTypingChange(false);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    await onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !onFileUpload) return;

    setPendingFiles(prev => [...prev, ...files]);
    
    // Auto-upload each file
    for (const file of files) {
      const fileKey = `${file.name}-${Date.now()}`;
      setUploadingFiles(prev => new Set(prev).add(fileKey));
      
      try {
        await onFileUpload(file);
        setPendingFiles(prev => prev.filter(f => f !== file));
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileKey);
          return newSet;
        });
      }
    }
    
    e.currentTarget.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleMoreMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMoreMenu(prev => !prev);
  };

  const handleEditContactDetails = () => {
    setShowMoreMenu(false);
    setShowContactModal(true);
  };

  const handleSaveContactDetails = (name: string, email: string) => {
    console.log('Saving contact details:', { name, email });
    // Here you can add logic to save the contact details
    // For now, just logging them
  };

  const handleEndChat = () => {
    setShowMoreMenu(false);
    setShowEndChatModal(true);
  };

  const handleConfirmEndChat = () => {
    onEndChat?.();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);


  return (
    <div className="bg-white border-t border-gray-200 flex-shrink-0" style={{ minHeight: '60px', position: 'relative', zIndex: 100, overflow: 'visible' }}>
      {/* Input Field */}
      <div className="p-3">
        {/* Pending files chips */}
        {pendingFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {pendingFiles.map((file, idx) => {
              const fileKey = `${file.name}-${Date.now()}`;
              const isUploading = uploadingFiles.has(fileKey);
              
              return (
                <div key={idx} className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md text-xs text-blue-700">
                  <FileText className="w-3 h-3 text-blue-600" />
                  <span className="truncate max-w-32" title={file.name}>{file.name}</span>
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="hover:text-blue-900"
                      aria-label="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <div className={`relative ${isMobile ? 'flex items-center gap-3' : 'block'}`}>
          {/* Attachment button - show on mobile before input */}
          {isMobile && (
            <label className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 cursor-pointer">
              <Paperclip className="w-5 h-5 text-gray-600" />
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={connectionStatus !== 'connected'}
              />
            </label>
          )}
          
          <textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message here..."
            disabled={connectionStatus !== 'connected'}
            rows={isMobile ? 1 : 3}
            className={`${isMobile ? 'flex-1 min-w-0 px-4 py-3 text-base resize-none' : 'w-full px-3 py-2 text-xs resize-none'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007B8A] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
            style={{ minHeight: isMobile ? '44px' : '60px' }}
          />
        </div>
      </div>

      {/* Footer Action Bar - Desktop only */}
      {!isMobile && (
        <div className="justify-end flex items-center gap-3 " style={{position: 'relative', overflow: 'visible' ,height: "5vh"}}>
          <Tooltip content="Copy text" position="top">
            <button type="button" className="p-1.5 hover:bg-gray-100 hover:scale-110 rounded-lg transition-all duration-200 cursor-pointer">
              <Clipboard className="w-3 h-3 text-gray-600" />
            </button>
          </Tooltip>
          <Tooltip content="Attach file" position="top">
            <label className="p-1.5 hover:bg-gray-100 hover:scale-110 rounded-lg transition-all duration-200 cursor-pointer">
              <Paperclip className="w-3 h-3 text-gray-600" />
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={connectionStatus !== 'connected'}
              />
            </label>
          </Tooltip>
          <div className="relative" ref={moreMenuRef}>
            <Tooltip content="More options" position="top">
              <button 
                type="button"
                onClick={toggleMoreMenu}
                className={`p-1.5 hover:bg-gray-100 hover:scale-110 rounded-lg transition-all duration-200 cursor-pointer ${showMoreMenu ? 'bg-gray-200' : ''}`}
              >
                <MoreHorizontal className="w-3 h-3 text-gray-600" />
              </button>
            </Tooltip>
            
            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div 
                className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                style={{ zIndex: 9999, width: '100vw' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleEditContactDetails}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Edit contact detail
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  type="button"
                  onClick={handleEndChat}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  End Chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Details Modal */}
      <ContactDetailsModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSave={handleSaveContactDetails}
        initialName="Test"
        initialEmail=""
      />

      {/* End Chat Confirmation Modal */}
      <EndChatModal
        isOpen={showEndChatModal}
        onClose={() => setShowEndChatModal(false)}
        onConfirm={handleConfirmEndChat}
      />
    </div>
  );
};
