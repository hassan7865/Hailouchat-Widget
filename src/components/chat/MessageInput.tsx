import React, { useState } from 'react';
import { Paperclip, Clipboard, MoreHorizontal, FileText, X } from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';


interface MessageInputProps {
  onSendMessage: (message: string) => void | Promise<void>;
  onTypingChange: (isTyping: boolean) => void;
  onFileUpload?: (file: File) => Promise<void>;
  connectionStatus: ConnectionStatus;
  isMobile?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onTypingChange,
  onFileUpload,
  connectionStatus,
  isMobile = false,
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const typingTimeoutRef = React.useRef<number | null>(null);

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

  return (
    <div className="bg-white border-t border-gray-200 flex-shrink-0" style={{ minHeight: '60px' }}>
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
            rows={isMobile ? 1 : 2}
            className={`${isMobile ? 'flex-1 min-w-0 px-4 py-3 text-base resize-none' : 'w-full px-3 py-2 text-xs resize-none'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007B8A] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
            style={{ minHeight: isMobile ? '44px' : '60px' }}
          />
        </div>
      </div>

      {/* Footer Action Bar - Desktop only */}
      {!isMobile && (
        <div className="justify-end pb-3 flex items-center gap-3 ">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Clipboard className="w-3 h-3 text-gray-600" />
          </button>
          <label className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <Paperclip className="w-3 h-3 text-gray-600" />
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={connectionStatus !== 'connected'}
            />
          </label>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};
