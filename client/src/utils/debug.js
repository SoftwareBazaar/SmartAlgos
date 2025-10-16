/**
 * Debug utility for handling console logs in production
 * Automatically disables debug logs in production builds
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const debug = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args) => {
    // Always show warnings, even in production
    console.warn(...args);
  },
  
  error: (...args) => {
    // Always show errors, even in production
    console.error(...args);
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  // Group console logs for better readability in development
  group: (label) => {
    if (isDevelopment && console.group) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (isDevelopment && console.groupEnd) {
      console.groupEnd();
    }
  },
  
  // Conditional logging based on feature flag
  feature: (featureName, ...args) => {
    if (isDevelopment) {
      console.log(`[${featureName}]`, ...args);
    }
  }
};

export default debug;

