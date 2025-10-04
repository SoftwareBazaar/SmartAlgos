// utils/auth.js - BULLETPROOF Frontend Auth

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
    const cleanToken = data.token.trim();
    
    console.log('Token received, length:', cleanToken.length);
    console.log('Token segments:', cleanToken.split('.').length);

    // For dev tokens, we expect them to NOT have 3 segments (JWT format)
    if (cleanToken.split('.').length === 3) {
      console.error('JWT TOKEN FROM SERVER - This should not happen!');
      console.error('Token:', cleanToken);
      throw new Error('Received JWT token instead of dev token');
    }

    // Store token
    localStorage.setItem('auth_token', cleanToken);
    console.log('✓ Token stored successfully');
    
    return data;
    
  } catch (error) {
    console.error('Login error:', error);
    localStorage.removeItem('auth_token');
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
    const cleanToken = data.token.trim();
    
    console.log('Token received, length:', cleanToken.length);
    console.log('Token type:', cleanToken.startsWith('dev_token_') ? 'DEV TOKEN' : 'OTHER');

    // For dev tokens, we expect them to start with 'dev_token_'
    if (!cleanToken.startsWith('dev_token_')) {
      console.error('INVALID TOKEN FORMAT FROM SERVER!');
      console.error('Token:', cleanToken);
      throw new Error('Received invalid token format');
    }

    // Store token
    localStorage.setItem('auth_token', cleanToken);
    console.log('✓ Admin token stored successfully');
    
    return data;
    
  } catch (error) {
    console.error('Admin login error:', error);
    localStorage.removeItem('auth_token');
    throw error;
  }
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.log('No token in localStorage');
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
      credentials: 'include'
    });

    console.log('Auth check response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Auth check failed:', error);
      throw new Error(error.message || error.error || 'Authentication failed');
    }

    const data = await response.json();
    console.log('✓ User verified:', data.user.email);
    
    return data;
    
  } catch (error) {
    console.error('Get user error:', error);
    localStorage.removeItem('auth_token');
    return null;
  }
}

/**
 * Make authenticated API request
 */
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('auth_token');

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
    
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return response;
}

// Export debug function
export { debugAuth };
