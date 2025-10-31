/**
 * Centralized formatting utilities for dates, currency, and numbers
 * Uses Intl API for locale-aware formatting
 */

/**
 * Safely parse a date value (handles various input formats)
 * @param {any} value - Date string, number (timestamp), or Date object
 * @returns {Date|null} - Parsed Date or null if invalid
 */
export const safeParseDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  try {
    // Handle Date objects
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    // Handle numeric timestamps
    if (typeof value === 'number') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }

    // Handle string timestamps
    const numeric = Number(value);
    if (!isNaN(numeric) && String(value).trim().length >= 10 && String(value).trim().length <= 13) {
      const millis = String(value).trim().length === 10 ? numeric * 1000 : numeric;
      const d = new Date(millis);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }

    // Handle ISO strings and other date strings
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d;
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Format a date value for display (date only)
 * @param {any} value - Date value to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string or fallback text
 */
export const formatDate = (value, locale = 'en-US', options = {}) => {
  const date = safeParseDate(value);
  if (!date) {
    return options.fallback || 'Invalid Date';
  }

  try {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch (error) {
    return options.fallback || 'Invalid Date';
  }
};

/**
 * Format a datetime value for display (date + time)
 * @param {any} value - Date value to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted datetime string or fallback text
 */
export const formatDateTime = (value, locale = 'en-US', options = {}) => {
  const date = safeParseDate(value);
  if (!date) {
    return options.fallback || 'Invalid Date';
  }

  try {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch (error) {
    return options.fallback || 'Invalid Date';
  }
};

/**
 * Format a date value for display (time only)
 * @param {any} value - Date value to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted time string or fallback text
 */
export const formatTime = (value, locale = 'en-US', options = {}) => {
  const date = safeParseDate(value);
  if (!date) {
    return options.fallback || 'Invalid Date';
  }

  try {
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch (error) {
    return options.fallback || 'Invalid Date';
  }
};

/**
 * Format a currency amount for display
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US', options = {}) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return options.fallback || '$0.00';
  }

  try {
    const defaultOptions = {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    };
    return new Intl.NumberFormat(locale, defaultOptions).format(numAmount);
  } catch (error) {
    // Fallback formatting
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'KES' ? 'KSh ' : '';
    return `${symbol}${numAmount.toFixed(2)}`;
  }
};

/**
 * Format a number for display
 * @param {number|string} value - Number to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value, locale = 'en-US', options = {}) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue === null || numValue === undefined) {
    return options.fallback || '0';
  }

  try {
    const defaultOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    };
    return new Intl.NumberFormat(locale, defaultOptions).format(numValue);
  } catch (error) {
    return String(numValue);
  }
};

/**
 * Format a percentage value
 * @param {number|string} value - Percentage value (e.g., 0.15 for 15%)
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, locale = 'en-US', options = {}) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue === null || numValue === undefined) {
    return options.fallback || '0%';
  }

  try {
    const defaultOptions = {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
      ...options
    };
    return new Intl.NumberFormat(locale, defaultOptions).format(numValue);
  } catch (error) {
    return `${(numValue * 100).toFixed(2)}%`;
  }
};

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * @param {any} value - Date value to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (value, locale = 'en-US') => {
  const date = safeParseDate(value);
  if (!date) {
    return 'Invalid Date';
  }

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = Math.floor((date - now) / 1000);

    const intervals = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'week', seconds: 604800 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 }
    ];

    for (const { unit, seconds } of intervals) {
      const interval = Math.floor(Math.abs(diffInSeconds) / seconds);
      if (interval >= 1) {
        return rtf.format(-interval, unit);
      }
    }

    return rtf.format(diffInSeconds, 'second');
  } catch (error) {
    return formatDateTime(value, locale);
  }
};

