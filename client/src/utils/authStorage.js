/**
 * Centralized authentication storage utility
 * Provides consistent API for managing auth tokens and user data
 * Currently uses localStorage; can be extended to support httpOnly cookies
 */

const TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'admin_token';
const USER_KEY = 'user';

/**
 * Get authentication token
 * @param {string} role - 'user' or 'admin'
 * @returns {string|null} Token or null if not found
 */
export const getToken = (role = 'user') => {
  try {
    const key = role === 'admin' ? ADMIN_TOKEN_KEY : TOKEN_KEY;
    return localStorage.getItem(key);
  } catch (error) {
    console.error('[AuthStorage] Error getting token:', error);
    return null;
  }
};

/**
 * Set authentication token
 * @param {string} token - Token to store
 * @param {string} role - 'user' or 'admin'
 */
export const setToken = (token, role = 'user') => {
  try {
    const key = role === 'admin' ? ADMIN_TOKEN_KEY : TOKEN_KEY;
    if (token) {
      localStorage.setItem(key, token.trim());
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('[AuthStorage] Error setting token:', error);
    throw error;
  }
};

/**
 * Remove authentication token
 * @param {string} role - 'user' or 'admin'
 */
export const removeToken = (role = 'user') => {
  try {
    const key = role === 'admin' ? ADMIN_TOKEN_KEY : TOKEN_KEY;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[AuthStorage] Error removing token:', error);
  }
};

/**
 * Get stored user data
 * @returns {object|null} User object or null
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('[AuthStorage] Error getting user:', error);
    return null;
  }
};

/**
 * Set user data
 * @param {object} user - User object to store
 */
export const setUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (error) {
    console.error('[AuthStorage] Error setting user:', error);
    throw error;
  }
};

/**
 * Remove user data
 */
export const removeUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('[AuthStorage] Error removing user:', error);
  }
};

/**
 * Clear all authentication data
 * @param {string} role - 'user' or 'admin' (optional, clears both if not specified)
 */
export const clearAuth = (role) => {
  try {
    if (role === 'admin') {
      removeToken('admin');
    } else if (role === 'user') {
      removeToken('user');
      removeUser();
    } else {
      // Clear everything
      removeToken('user');
      removeToken('admin');
      removeUser();
    }
  } catch (error) {
    console.error('[AuthStorage] Error clearing auth:', error);
  }
};

/**
 * Check if user is authenticated
 * @param {string} role - 'user' or 'admin'
 * @returns {boolean}
 */
export const isAuthenticated = (role = 'user') => {
  const token = getToken(role);
  return !!token && token.trim().length > 0;
};

/**
 * Validate token format (checks for old JWT tokens)
 * @param {string} token - Token to validate
 * @returns {boolean} True if token format is valid
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // Check for old JWT format (3 segments separated by dots)
  const segments = token.trim().split('.');
  if (segments.length === 3) {
    return false; // Old JWT format
  }
  
  return token.trim().length > 0;
};

/**
 * Clean and validate token before storage
 * @param {string} token - Raw token from server
 * @param {string} role - 'user' or 'admin'
 * @returns {string} Cleaned token
 * @throws {Error} If token format is invalid
 */
export const cleanAndValidateToken = (token, role = 'user') => {
  if (!token || typeof token !== 'string') {
    throw new Error('Token is required and must be a string');
  }
  
  const cleanToken = token.trim();
  
  if (!isValidTokenFormat(cleanToken)) {
    throw new Error(`Invalid token format for ${role} role`);
  }
  
  // Additional validation for admin tokens
  if (role === 'admin' && !cleanToken.startsWith('dev_token_')) {
    console.warn('[AuthStorage] Admin token does not match expected format');
  }
  
  return cleanToken;
};

