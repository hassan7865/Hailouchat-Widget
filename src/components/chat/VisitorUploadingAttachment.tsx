import React from 'react';
import { FileText } from 'lucide-react';

interface VisitorUploadingAttachmentProps {
  fileName: string;
  isMobile?: boolean;
}

const VisitorUploadingAttachment: React.FC<VisitorUploadingAttachmentProps> = ({
  fileName,
  isMobile = false
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-xs shadow-sm">
      <div className="flex items-start gap-2 mb-2">
        {/* Blue file icon */}
        <div className="flex-shrink-0">
          <FileText className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} text-blue-500`} />
        </div>
        
        {/* File details */}
        <div className="flex-1 min-w-0">
          {/* File name */}
          <div className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium text-gray-900 truncate`} title={fileName}>
            {fileName}
          </div>
          
          {/* Uploading status */}
          <div className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-600 mt-0.5`}>
            Uploading...
          </div>
        </div>
      </div>

      {/* Green progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 rounded-full relative overflow-hidden"
          style={{
            width: '25%', // Approximately 20-25% as shown in the image
            animation: 'uploading-progress 2s ease-in-out infinite'
          }}
        />
      </div>
    </div>
  );
};

export default VisitorUploadingAttachment;
