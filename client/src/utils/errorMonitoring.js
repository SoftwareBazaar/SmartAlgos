/**
 * Error Monitoring Setup
 * Integrates with Sentry for production error tracking
 * Note: @sentry/react is optional - app works without it
 */

let errorMonitoringInitialized = false;
let SentryModule = null;

// Helper to safely load Sentry module
const loadSentry = async () => {
  if (SentryModule !== null) {
    return SentryModule;
  }
  
  try {
    // Use eval to prevent webpack from statically analyzing this import
    const sentryModule = await new Function('return import("@sentry/react")')();
    SentryModule = sentryModule;
    return sentryModule;
  } catch (error) {
    // Module not available - return null
    SentryModule = false;
    return null;
  }
};

export const initErrorMonitoring = () => {
  if (errorMonitoringInitialized) {
    return;
  }

  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Only initialize in production or if SENTRY_DSN is explicitly set
  if (!isProduction && !process.env.REACT_APP_SENTRY_DSN) {
    console.log('[Error Monitoring] Skipping initialization in development mode');
    return;
  }

  try {
    // Dynamic import to avoid bundling Sentry in development
    if (process.env.REACT_APP_SENTRY_DSN) {
      // Use safe loader to prevent webpack from statically analyzing
      loadSentry().then((Sentry) => {
        if (!Sentry) {
          console.log('[Error Monitoring] Sentry not available, using console logging');
          errorMonitoringInitialized = true;
          return;
        }

        Sentry.init({
          dsn: process.env.REACT_APP_SENTRY_DSN,
          environment: process.env.NODE_ENV || 'development',
          integrations: [
            new Sentry.BrowserTracing(),
            new Sentry.Replay({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ],
          // Performance Monitoring
          tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% of transactions in production
          // Session Replay
          replaysSessionSampleRate: isProduction ? 0.1 : 1.0, // 10% of sessions in production
          replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
          
          beforeSend(event, hint) {
            // Filter out known non-critical errors
            if (event.exception) {
              const error = hint.originalException;
              
              // Ignore network errors that are expected (CORS, network failures)
              if (error && error.message && (
                error.message.includes('Network Error') ||
                error.message.includes('Failed to fetch') ||
                error.message.includes('CORS')
              )) {
                return null; // Don't send to Sentry
              }
            }
            
            return event;
          },
        });

        console.log('[Error Monitoring] Sentry initialized successfully');
        errorMonitoringInitialized = true;
      }).catch((error) => {
        console.warn('[Error Monitoring] Failed to load Sentry:', error.message || error);
        errorMonitoringInitialized = true; // Still mark as initialized to use console fallback
      });
    } else {
      console.log('[Error Monitoring] Sentry DSN not configured, using console logging');
      errorMonitoringInitialized = true;
    }
  } catch (error) {
    console.warn('[Error Monitoring] Initialization error:', error);
    errorMonitoringInitialized = true; // Still mark as initialized to use console fallback
  }
};

export const captureError = (error, context = {}) => {
  if (!errorMonitoringInitialized) {
    // Fallback to console logging
    console.error('[Error]', error, context);
    return;
  }

  try {
    if (process.env.REACT_APP_SENTRY_DSN) {
      // Use safe loader to prevent webpack from statically analyzing
      loadSentry().then((Sentry) => {
        if (Sentry) {
          Sentry.captureException(error, {
            extra: context,
          });
        } else {
          console.error('[Error]', error, context);
        }
      });
    } else {
      console.error('[Error]', error, context);
    }
  } catch (err) {
    console.error('[Error] Failed to capture error:', err);
    console.error('[Original Error]', error, context);
  }
};

export const captureMessage = (message, level = 'info', context = {}) => {
  if (!errorMonitoringInitialized) {
    console.log(`[${level.toUpperCase()}]`, message, context);
    return;
  }

  try {
    if (process.env.REACT_APP_SENTRY_DSN) {
      // Use safe loader to prevent webpack from statically analyzing
      loadSentry().then((Sentry) => {
        if (Sentry) {
          Sentry.captureMessage(message, {
            level: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error',
            extra: context,
          });
        } else {
          console.log(`[${level.toUpperCase()}]`, message, context);
        }
      });
    } else {
      console.log(`[${level.toUpperCase()}]`, message, context);
    }
  } catch (err) {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }
};

export const setUserContext = (user) => {
  if (!errorMonitoringInitialized) {
    return;
  }

  try {
    if (process.env.REACT_APP_SENTRY_DSN) {
      // Use safe loader to prevent webpack from statically analyzing
      loadSentry().then((Sentry) => {
        if (Sentry) {
          Sentry.setUser({
            id: user?.id || user?.userId,
            email: user?.email,
            username: user?.username || `${user?.first_name} ${user?.last_name}`,
          });
        }
      });
    }
  } catch (err) {
    // Ignore errors
  }
};

export const clearUserContext = () => {
  if (!errorMonitoringInitialized) {
    return;
  }

  try {
    if (process.env.REACT_APP_SENTRY_DSN) {
      // Use safe loader to prevent webpack from statically analyzing
      loadSentry().then((Sentry) => {
        if (Sentry) {
          Sentry.setUser(null);
        }
      });
    }
  } catch (err) {
    // Ignore errors
  }
};

export default {
  initErrorMonitoring,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
};

