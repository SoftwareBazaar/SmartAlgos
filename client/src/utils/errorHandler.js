/**
 * Centralized error handling utility
 * Provides user-friendly error messages and hides technical details in production
 */

export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get user-friendly error message from API error
 * @param {Error} error - Axios error or generic error
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle network errors
  if (!error.response) {
    if (error.request) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (error.message) {
      // In development, show more details
      if (!isProduction) {
        return error.message;
      }
      return 'An unexpected error occurred. Please try again.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  const { status, data } = error.response;

  // Extract message from response
  let message = data?.message || data?.error || 'An error occurred';

  // Handle specific status codes
  switch (status) {
    case 400:
      if (typeof message === 'string') {
        return message;
      }
      return 'Invalid request. Please check your input and try again.';
    
    case 401:
      // If the server provided a specific message (e.g. Google token error, invalid password), use it
      if (typeof message === 'string' && message !== 'An error occurred') {
        return message;
      }
      return 'Your session has expired. Please log in again.';
    
    case 403:
      return 'You do not have permission to perform this action.';
    
    case 404:
      return 'The requested resource was not found.';
    
    case 409:
      return 'This action conflicts with existing data. Please refresh and try again.';
    
    case 422:
      // Validation errors
      if (data?.errors && Array.isArray(data.errors)) {
        const firstError = data.errors[0];
        return firstError.msg || firstError.message || 'Validation error. Please check your input.';
      }
      return message || 'Validation error. Please check your input.';
    
    case 423:
      return message || 'This resource is currently locked. Please try again later.';
    
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    
    case 500:
      return 'A server error occurred. Our team has been notified. Please try again later.';
    
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again in a few moments.';
    
    default:
      // In production, show generic message for unknown errors
      if (isProduction) {
        return 'An unexpected error occurred. Please try again.';
      }
      // In development, show more details
      return message || `Error ${status}: ${error.message || 'Unknown error'}`;
  }
};

/**
 * Get detailed error information (for logging/debugging)
 * Only returns details in development mode
 * @param {Error} error - Error object
 * @returns {object|null} - Error details or null in production
 */
export const getErrorDetails = (error) => {
  if (isProduction) {
    return null; // Don't expose details in production
  }

  const details = {
    message: error.message,
    stack: error.stack,
  };

  if (error.response) {
    details.status = error.response.status;
    details.data = error.response.data;
    details.url = error.config?.url;
    details.method = error.config?.method;
  }

  if (error.request) {
    details.request = {
      url: error.config?.url,
      method: error.config?.method,
    };
  }

  return details;
};

/**
 * Log error safely (only in development or to monitoring service)
 * @param {Error} error - Error to log
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = 'Application') => {
  const details = getErrorDetails(error);
  
  if (details) {
    console.error(`[${context}]`, details);
  } else {
    // In production, you would send to error tracking service (Sentry, etc.)
    // For now, just log minimal info
    console.error(`[${context}]`, getErrorMessage(error));
  }
};

/**
 * Check if error is a network error
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

/**
 * Check if error is a timeout error
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
export const isTimeoutError = (error) => {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
};

/**
 * Format validation errors from API response
 * @param {object} responseData - API response data
 * @returns {Array<string>} - Array of error messages
 */
export const formatValidationErrors = (responseData) => {
  if (!responseData?.errors) {
    return [];
  }

  if (Array.isArray(responseData.errors)) {
    return responseData.errors.map(err => err.msg || err.message || 'Validation error');
  }

  if (typeof responseData.errors === 'object') {
    return Object.entries(responseData.errors).map(([field, message]) => {
      if (Array.isArray(message)) {
        return `${field}: ${message[0]}`;
      }
      return `${field}: ${message}`;
    });
  }

  return [];
};

export default {
  getErrorMessage,
  getErrorDetails,
  logError,
  isNetworkError,
  isTimeoutError,
  formatValidationErrors
};

