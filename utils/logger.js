/**
 * Smart Logger - Reduces Railway log spam
 * Only logs errors and important events
 * Respects LOG_LEVEL environment variable
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

class Logger {
  constructor() {
    // Default to 'error' in production, 'debug' in development
    const envLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : 'info');
    this.level = LOG_LEVELS[envLevel] || LOG_LEVELS.error;
    
    // Rate limiting for repetitive errors
    this.errorCache = new Map();
    this.errorCacheTTL = 60000; // 1 minute
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.level;
  }

  error(message, ...args) {
    // Always log errors, but rate-limit identical errors
    const key = typeof message === 'string' ? message : JSON.stringify(message);
    const now = Date.now();
    
    if (this.errorCache.has(key)) {
      const lastLog = this.errorCache.get(key);
      if (now - lastLog < this.errorCacheTTL) {
        // Skip this error, too soon
        return;
      }
    }
    
    this.errorCache.set(key, now);
    console.error(message, ...args);
  }

  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      console.warn(message, ...args);
    }
  }

  info(message, ...args) {
    if (this.shouldLog('info')) {
      console.log(message, ...args);
    }
  }

  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', message, ...args);
    }
  }

  // Special method for high-frequency operations
  // Only logs once per minute for the same key
  throttle(key, level, message, ...args) {
    const cacheKey = `throttle_${key}`;
    const now = Date.now();
    
    if (this.errorCache.has(cacheKey)) {
      const lastLog = this.errorCache.get(cacheKey);
      if (now - lastLog < 60000) {
        return; // Skip, logged recently
      }
    }
    
    this.errorCache.set(cacheKey, now);
    this[level](message, ...args);
  }
}

// Singleton instance
const logger = new Logger();

module.exports = logger;

