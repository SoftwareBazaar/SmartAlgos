// utils/auth.js - BULLETPROOF Frontend Auth

import { setToken, removeToken, cleanAndValidateToken, clearAuth } from './authStorage';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

/**
 * Debug function
 */
async function debugAuth() {
  try {
    const response = await fetch(`${API_URL}/api/auth/debug`, {
      credentials: 'include'
    });
    const data = await response.json();
    console.log('Auth Debug Info:', data);
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

/**
 * Login user
 */
export async function login(email, password) {
  try {
    console.log('Attempting login for:', email);
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (!data.token) {
      throw new Error('No token received from server');
    }

    // Clean and validate token before storing
    const cleanToken = cleanAndValidateToken(data.token, 'user');
    setToken(cleanToken, 'user');
    console.log('✓ Token stored successfully');
    
    return data;
    
  } catch (error) {
    console.error('Login error:', error);
    removeToken('user');
    throw error;
  }
}

/**
 * Admin login function
 */
export async function adminLogin(email, password) {
  try {
    console.log('Attempting admin login for:', email);
    
    const response = await fetch(`${API_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('Admin login response:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Admin login failed');
    }

    if (!data.token) {
      throw new Error('No token received from server');
    }

    // Clean and validate token before storing
    const cleanToken = cleanAndValidateToken(data.token, 'admin');
    setToken(cleanToken, 'admin');
    console.log('✓ Admin token stored successfully');
    
    return data;
    
  } catch (error) {
    console.error('Admin login error:', error);
    removeToken('admin');
    throw error;
  }
}

/**
 * Logout user
 */
export async function logout(role = 'user') {
  try {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth(role);
    if (role === 'admin') {
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
        return;
      }
    } else {
      window.location.href = '/auth/login';
      return;
    }
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const token = getToken('user');
    
    if (!token) {
      console.log('No token found');
      return null;
    }

    console.log('Verifying token...');
    console.log('Token length:', token.length);
    console.log('Token type:', token.startsWith('dev_token_') ? 'DEV TOKEN' : 'OTHER');

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });

    console.log('Auth check response status:', response.status);

    if (!response.ok) {
      // Only clear token if it's a real auth failure (401), not network errors
      if (response.status === 401) {
        const error = await response.json().catch(() => ({}));
        console.error('Auth check failed (401):', error);
        // Don't clear token here - let the caller decide
        // The token might still be valid, just needs refresh
        return null;
      }
      // For other errors (500, 503, etc), keep the token
      const error = await response.json().catch(() => ({}));
      console.warn('Auth check failed (non-401):', response.status, error);
      return null; // Return null but don't clear token
    }

    const data = await response.json();
    console.log('✓ User verified:', data.user.email);
    
    return data;
    
  } catch (error) {
    // Network errors, timeouts, etc - DO NOT clear token
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      console.warn('Network error during auth check (keeping cached session):', error.message);
    } else {
      console.warn('Auth check error (keeping cached session):', error.message);
    }
    // Return null but keep the token in localStorage
    // The cached session will be used until backend is available
    return null;
  }
}

/**
 * Make authenticated API request
 */
export async function fetchWithAuth(url, options = {}) {
  const token = getToken('user');

  if (!token) {
    throw new Error('No authentication token');
  }

  console.log('Making authenticated request to:', url);
  console.log('Using token:', token.substring(0, 20) + '...');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    credentials: 'include'
  };

  const response = await fetch(`${API_URL}${url}`, config);

  console.log('Response status:', response.status);

  if (response.status === 401) {
    console.error('401 Unauthorized - redirecting to login');
    const errorData = await response.json();
    console.error('Error details:', errorData);
    
    removeToken('user');
    window.location.href = '/auth/login';
    throw new Error('Session expired');
  }

  return response;
}

// Export debug function
export { debugAuth };
