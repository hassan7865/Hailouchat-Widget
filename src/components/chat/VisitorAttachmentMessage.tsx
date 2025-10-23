import React from 'react';
import { FileText } from 'lucide-react';

interface VisitorAttachmentMessageProps {
  attachment: {
    file_name: string;
    url: string;
    mime_type?: string;
    size?: number;
  };
  isMobile?: boolean;
}

const VisitorAttachmentMessage: React.FC<VisitorAttachmentMessageProps> = ({
  attachment,
  isMobile = false
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-xs shadow-sm">
      <div className="flex items-start gap-2">
        {/* Blue file icon */}
        <div className="flex-shrink-0">
          <FileText className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} text-blue-500`} />
        </div>
        
        {/* File details */}
        <div className="flex-1 min-w-0">
          {/* File name */}
          <div 
            className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600`}
            onClick={handleDownload}
            title={attachment.file_name}
          >
            {attachment.file_name}
          </div>
          
          {/* File size and download link */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-600`}>
              {formatFileSize(attachment.size)}
            </span>
            <button
              onClick={handleDownload}
              className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-blue-600 underline hover:text-blue-800 cursor-pointer`}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorAttachmentMessage;
