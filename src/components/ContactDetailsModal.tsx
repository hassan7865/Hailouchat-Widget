import React, { useState, useEffect } from 'react';

interface ContactDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, email: string) => void;
  fetchVisitorDetails?: () => Promise<{ firstName: string; email: string } | null>;
}

export const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fetchVisitorDetails
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadVisitorDetails = async () => {
      if (isOpen && fetchVisitorDetails) {
        setLoading(true);
        const details = await fetchVisitorDetails();
        if (details) {
          setName(details.firstName);
          setEmail(details.email);
        }
        setLoading(false);
      }
    };
    
    loadVisitorDetails();
  }, [isOpen, fetchVisitorDetails]);

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

  const handleSave = () => {
    onSave(name, email);
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
        className="bg-white rounded-sm shadow-lg p-6 w-full mx-2 mb-1 "
      >
        {/* Header */}
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Edit contact details
        </h2>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#17494d] focus:border-transparent"
              placeholder={loading ? "Loading..." : "Enter your name"}
              disabled={loading}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#17494d] focus:border-transparent"
              placeholder={loading ? "Loading..." : "Enter your email"}
              disabled={loading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium text-[#17494d] bg-white border border-[#17494d] rounded cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs font-medium text-white bg-[#17494d] rounded cursor-pointer hover:bg-[#0f3a3d] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
