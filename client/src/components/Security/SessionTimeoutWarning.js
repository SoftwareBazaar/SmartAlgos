import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { initializeSessionTimeout, clearSessionTimeout, extendSession, formatRemainingTime } from '../../utils/sessionTimeout';
import Button from '../UI/Button';

/**
 * Session Timeout Warning Component
 * Displays a warning when session is about to expire
 */
const SessionTimeoutWarning = () => {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const handleWarning = (timeRemaining) => {
      setRemainingTime(timeRemaining);
      setShowWarning(true);
    };

    const handleTimeout = () => {
      setShowWarning(false);
      // Logout user on session timeout
      logout();
    };

    // Initialize session timeout monitoring
    const cleanup = initializeSessionTimeout(handleWarning, handleTimeout);

    // Cleanup on unmount
    return () => {
      cleanup();
      clearSessionTimeout();
    };
  }, [logout]);

  const handleExtendSession = () => {
    extendSession();
    setShowWarning(false);
  };

  const handleLogout = () => {
    clearSessionTimeout();
    logout();
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Session About to Expire
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your session will expire in {formatRemainingTime(remainingTime)} due to inactivity. 
              Would you like to extend your session?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleExtendSession}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Extend Session
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;

