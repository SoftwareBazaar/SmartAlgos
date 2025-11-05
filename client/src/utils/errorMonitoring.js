/**
 * Error Monitoring Setup
 * Integrates with Sentry for production error tracking
 */

let errorMonitoringInitialized = false;

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
      import('@sentry/react').then((Sentry) => {
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
        console.warn('[Error Monitoring] Failed to load Sentry:', error);
      });
    } else {
      console.log('[Error Monitoring] Sentry DSN not configured, using console logging');
      errorMonitoringInitialized = true;
    }
  } catch (error) {
    console.warn('[Error Monitoring] Initialization error:', error);
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
      import('@sentry/react').then((Sentry) => {
        Sentry.captureException(error, {
          extra: context,
        });
      }).catch(() => {
        console.error('[Error]', error, context);
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
      import('@sentry/react').then((Sentry) => {
        Sentry.captureMessage(message, {
          level: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error',
          extra: context,
        });
      }).catch(() => {
        console.log(`[${level.toUpperCase()}]`, message, context);
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
      import('@sentry/react').then((Sentry) => {
        Sentry.setUser({
          id: user?.id || user?.userId,
          email: user?.email,
          username: user?.username || `${user?.first_name} ${user?.last_name}`,
        });
      }).catch(() => {
        // Ignore Sentry errors
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
      import('@sentry/react').then((Sentry) => {
        Sentry.setUser(null);
      }).catch(() => {
        // Ignore Sentry errors
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

