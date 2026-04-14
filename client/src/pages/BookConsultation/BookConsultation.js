import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BookingSection from '../../components/BookingSection/BookingSection';

const BookConsultation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">
      {/* Header with back button */}
      <div className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
            
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Smart Algos" 
                className="h-8 w-auto object-contain"
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
                  maxWidth: '120px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <BookingSection />

      {/* Footer */}
      <div className="border-t border-white/10 bg-[#0f172a]/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} Smart Algos · AI Powered Trading Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookConsultation;
