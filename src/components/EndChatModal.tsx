import React, { useEffect } from 'react';

interface EndChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const EndChatModal: React.FC<EndChatModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-opacity-30 flex items-end justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-t-lg shadow-lg p-6 w-full max-w-sm mx-4 mb-4"
      >
        {/* Message */}
        <p className="text-sm text-gray-900 mb-6">
          Are you sure you want to end this chat?
        </p>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#17494d] bg-white border border-[#17494d] rounded cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-medium text-white bg-[#17494d] rounded cursor-pointer hover:bg-[#0f3a3d] transition-colors"
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
};
