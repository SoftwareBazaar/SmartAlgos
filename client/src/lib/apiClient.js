import axios from 'axios';
import { removeToken, clearAuth, isValidTokenFormat } from '../utils/authStorage';
import { getErrorMessage, logError, isProduction } from '../utils/errorHandler';

// Import axios for CSRF token fetching (needed before apiClient is created)
const axiosForCSRF = axios.create({
  withCredentials: true,
  timeout: 5000
});

// Get API base URL from environment or use defaults
const getRuntimeOrigin = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const { origin } = window.location;
  if (!origin) {
    return null;
  }

  // If we're running on localhost (CRA dev server), do not use window origin
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
  if (isLocalhost) {
    return null;
  }

  return origin;
};

const getBaseURL = () => {
  // Priority: REACT_APP_API_URL > auto-detect > default
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  const runtimeOrigin = getRuntimeOrigin();
  if (runtimeOrigin) {
    return runtimeOrigin;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // Production fallback - use current origin (works on Vercel and other hosts)
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return '';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 60000, // 60 second timeout (increased from 30s to handle slower operations)
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log(`[API Client] Base URL: ${getBaseURL()}`);
console.log(`[API Client] Environment: ${process.env.NODE_ENV || 'development'}`);

// CSRF token management
let csrfToken = null;
let csrfTokenExpiry = 0;

const getCSRFToken = async () => {
  // Check if we have a valid token
  if (csrfToken && Date.now() < csrfTokenExpiry) {
    return csrfToken;
  }

  // Fetch new token
  try {
    const response = await axiosForCSRF.get(`${getBaseURL()}/api/csrf-token`);
    
    if (response.data?.success && response.data?.csrfToken) {
      csrfToken = response.data.csrfToken;
      csrfTokenExpiry = Date.now() + (response.data.expiresIn * 1000) - 60000; // Refresh 1 min before expiry
      return csrfToken;
    }
  } catch (error) {
    console.warn('[API Client] Failed to fetch CSRF token:', error.message);
    // Don't block requests if CSRF token fetch fails (will be handled by server)
  }

  return null;
};

// Request interceptor
apiClient.interceptors.request.use(async (config) => {
  const isAdminContext = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
  let token = isAdminContext ? localStorage.getItem('admin_token') : localStorage.getItem('token');
  const runtimeEnv = typeof window !== 'undefined' && window.env ? window.env.nodeEnv : undefined;
  const isDevRuntime = (process.env.NODE_ENV && process.env.NODE_ENV !== 'production')
    || (!process.env.NODE_ENV && runtimeEnv && runtimeEnv !== 'production')
    || runtimeEnv === 'development';

  // Check if token format is valid
  if (token && !isValidTokenFormat(token)) {
    console.warn('[API Client] Detected invalid token format, clearing it...');
    if (isAdminContext) {
      removeToken('admin');
    } else {
      clearAuth('user');
    }
    token = null;
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else if (isDevRuntime) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = 'Bearer test_token';
    }
  }

  // Add CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase())) {
    const token = await getCSRFToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers['X-CSRF-Token'] = token;
    }
  }

  // Log requests only in development
  if (isDevRuntime && !isProduction) {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }

  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url;
    const isAdminContext = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
    
    // Log error with appropriate level of detail
    logError(error, `API ${error.config?.method?.toUpperCase()} ${url}`);

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;

      // Handle specific error cases
      if (status === 401) {
        // Only clear auth on 401 if it's NOT the initial auth check endpoint
        // During page refresh, /api/auth/me might fail but token could still be valid
        const isAuthCheck = url && (url.includes('/api/auth/me') || url.includes('/auth/me'));
        
        if (!isAuthCheck) {
          // For other endpoints, clear auth on 401
          if (isAdminContext) {
            removeToken('admin');
          } else {
            clearAuth('user');
          }
          delete apiClient.defaults.headers.common.Authorization;
        } else if (!isProduction) {
          // For auth check endpoint, just log but don't clear (dev only)
          console.warn('[API Client] 401 on auth check - keeping cached session');
        }
      }
      
      // Enhance error with user-friendly message
      error.userMessage = getErrorMessage(error);
    } else if (error.request) {
      // Request made but no response received
      error.userMessage = getErrorMessage(error);
    } else {
      // Something else happened
      error.userMessage = getErrorMessage(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

