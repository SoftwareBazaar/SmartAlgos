/**
 * Session Timeout Management
 * Handles automatic session expiration and user warnings
 */

const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes total session timeout

let warningTimer = null;
let timeoutTimer = null;
let lastActivity = Date.now();

/**
 * Initialize session timeout monitoring
 * @param {Function} onWarning - Callback when warning should be shown
 * @param {Function} onTimeout - Callback when session expires
 */
export const initializeSessionTimeout = (onWarning, onTimeout) => {
  // Clear any existing timers
  clearSessionTimeout();

  // Reset activity timestamp
  lastActivity = Date.now();

  // Set up activity listeners
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  const updateActivity = () => {
    lastActivity = Date.now();
    resetSessionTimeout(onWarning, onTimeout);
  };

  events.forEach(event => {
    document.addEventListener(event, updateActivity, true);
  });

  // Initialize timers
  resetSessionTimeout(onWarning, onTimeout);

  // Cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, updateActivity, true);
    });
    clearSessionTimeout();
  };
};

/**
 * Reset session timeout timers
 */
const resetSessionTimeout = (onWarning, onTimeout) => {
  clearSessionTimeout();

  const timeSinceActivity = Date.now() - lastActivity;
  const remainingTime = SESSION_TIMEOUT - timeSinceActivity;

  if (remainingTime <= 0) {
    // Already timed out
    onTimeout?.();
    return;
  }

  // Set warning timer
  const warningTime = remainingTime - SESSION_WARNING_TIME;
  if (warningTime > 0) {
    warningTimer = setTimeout(() => {
      onWarning?.(remainingTime - warningTime);
    }, warningTime);
  } else {
    // Show warning immediately
    onWarning?.(remainingTime);
  }

  // Set timeout timer
  timeoutTimer = setTimeout(() => {
    onTimeout?.();
  }, remainingTime);
};

/**
 * Clear all session timeout timers
 */
export const clearSessionTimeout = () => {
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
  }
};

/**
 * Extend session timeout (called on user action)
 */
export const extendSession = () => {
  lastActivity = Date.now();
};

/**
 * Get remaining session time in milliseconds
 */
export const getRemainingSessionTime = () => {
  const timeSinceActivity = Date.now() - lastActivity;
  return Math.max(0, SESSION_TIMEOUT - timeSinceActivity);
};

/**
 * Format remaining time as human-readable string
 */
export const formatRemainingTime = (milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
};

export default {
  initializeSessionTimeout,
  clearSessionTimeout,
  extendSession,
  getRemainingSessionTime,
  formatRemainingTime
};

