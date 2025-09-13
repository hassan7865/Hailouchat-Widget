import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onStartChat: () => void;
  loading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat, loading }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-teal-50 to-white">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
        <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 text-center">Welcome to Support</h3>
      <p className="text-gray-600 text-center mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base px-2">
        Get instant help from our support team. We're here to assist you with any questions or issues.
      </p>
      <button
        onClick={onStartChat}
        disabled={loading}
        className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:from-teal-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-sm sm:text-base"
        type="button"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Starting...
          </div>
        ) : (
          'Start Conversation'
        )}
      </button>
    </div>
  );
};
