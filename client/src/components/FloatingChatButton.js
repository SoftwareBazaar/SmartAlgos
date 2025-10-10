import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatAssistant from './ChatAssistant';

const FloatingChatButton = ({ context = 'general' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
          title="Open Chat Assistant"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
        </button>
      )}

      {/* Chat Assistant */}
      <ChatAssistant 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        context={context}
      />
    </>
  );
};

export default FloatingChatButton;
