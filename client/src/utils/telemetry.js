/**
 * Telemetry utility for tracking user events and errors
 * Provides consistent logging and analytics across the application
 */

const TELEMETRY_ENABLED = process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_TELEMETRY === 'true';

/**
 * Track a user event
 * @param {string} eventName - Name of the event
 * @param {object} properties - Event properties/metadata
 */
export const trackEvent = (eventName, properties = {}) => {
  if (!TELEMETRY_ENABLED) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', eventName, properties);
    }
    return;
  }

  try {
    // In production, send to analytics service
    // For now, log to console and localStorage for debugging
    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    // Store recent events in localStorage (max 100)
    if (typeof localStorage !== 'undefined') {
      try {
        const events = JSON.parse(localStorage.getItem('telemetry_events') || '[]');
        events.push(event);
        // Keep only last 100 events
        const recentEvents = events.slice(-100);
        localStorage.setItem('telemetry_events', JSON.stringify(recentEvents));
      } catch (e) {
        console.warn('[Telemetry] Failed to store event:', e);
      }
    }

    // TODO: Send to analytics service (e.g., Google Analytics, Mixpanel, etc.)
    // if (window.gtag) {
    //   window.gtag('event', eventName, properties);
    // }
  } catch (error) {
    console.error('[Telemetry] Error tracking event:', error);
  }
};

/**
 * Track a payment/subscription event
 * @param {string} eventType - Type of payment event
 * @param {object} data - Payment data
 */
export const trackPaymentEvent = (eventType, data = {}) => {
  trackEvent(`payment_${eventType}`, {
    ...data,
    category: 'payment'
  });
};

/**
 * Track subscription events
 * @param {string} eventType - Type of subscription event
 * @param {object} data - Subscription data
 */
export const trackSubscriptionEvent = (eventType, data = {}) => {
  trackEvent(`subscription_${eventType}`, {
    ...data,
    category: 'subscription'
  });
};

/**
 * Track errors
 * @param {Error|string} error - Error object or message
 * @param {object} context - Additional context
 */
export const trackError = (error, context = {}) => {
  const errorData = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
    category: 'error'
  };

  trackEvent('error', errorData);

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Telemetry Error]', errorData);
  }
};

/**
 * Track page views
 * @param {string} pageName - Name of the page
 * @param {object} properties - Additional properties
 */
export const trackPageView = (pageName, properties = {}) => {
  trackEvent('page_view', {
    page: pageName,
    ...properties
  });
};

