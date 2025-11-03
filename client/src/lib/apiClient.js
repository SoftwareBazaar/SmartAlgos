import axios from 'axios';
import { removeToken, clearAuth, isValidTokenFormat } from '../utils/authStorage';

// Get API base URL from environment or use defaults
const getBaseURL = () => {
  // Priority: REACT_APP_API_URL > auto-detect > default
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // Production - Railway backend
  return 'https://web-production-fdb58.up.railway.app';
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

// Request interceptor
apiClient.interceptors.request.use((config) => {
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

  // Log requests in development
  if (isDevRuntime) {
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
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const url = error.config?.url;
      const isAdminContext = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
      
      console.error(`[API Error ${status}] ${url}`, {
        status,
        data: error.response.data,
        url: error.config?.baseURL + url
      });

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
        } else {
          // For auth check endpoint, just log but don't clear
          console.warn('[API Client] 401 on auth check - keeping cached session');
        }
        // Do not auto-redirect on 401; let the view/state decide.
      } else if (status === 404) {
        console.warn(`[404 Not Found] Endpoint: ${error.config?.baseURL}${url}`);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Network Error] No response received', error.message);
    } else {
      // Something else happened
      console.error('[API Error]', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

