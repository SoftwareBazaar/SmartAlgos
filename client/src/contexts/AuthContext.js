import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { adminLogin as bulletproofAdminLogin, getCurrentUser, logout as bulletproofLogout } from '../utils/auth';
import { getToken, setToken, setUser, getUser, removeToken, removeUser, clearAuth, isValidTokenFormat } from '../utils/authStorage';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Apply persisted authorization header
  useEffect(() => {
    const token = getToken('user');
    if (token && isValidTokenFormat(token)) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('=== CHECKING AUTH ON APP LOAD ===');

        // Hydrate user immediately from localStorage to avoid logout flicker
        const cachedUser = getUser();
        const cachedToken = getToken('user');
        if (cachedToken && cachedUser && isValidTokenFormat(cachedToken)) {
          dispatch({ type: 'SET_USER', payload: cachedUser });
          apiClient.defaults.headers.common.Authorization = `Bearer ${cachedToken}`;
        } else if (cachedToken && !isValidTokenFormat(cachedToken)) {
          // Clear invalid tokens
          console.log('Clearing invalid token format');
          clearAuth('user');
        }

        // Validate session with backend in the background
        const userData = await getCurrentUser();
        if (userData && userData.user) {
          dispatch({ type: 'SET_USER', payload: userData.user });
          setUser(userData.user);
        }
      } catch (error) {
        console.warn('Auth background check failed (non-fatal):', error?.message || error);
        // Keep cached session; do not clear on transient errors
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Validate and store token using authStorage utility
        if (!isValidTokenFormat(token)) {
          throw new Error('Invalid token format received from server');
        }
        
        setToken(token, 'user');
        setUser(user);
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        
        dispatch({ type: 'SET_USER', payload: user });
        toast.success('Login successful!');
        return { success: true, message: 'Login successful!' };
      } else {
        const message = response.data.message || 'Login failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        return { success: false, message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Admin login function - NO PERSISTENT STORAGE
  const adminLogin = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('=== ADMIN LOGIN STARTED ===');
      
      // Use bulletproof admin login
      const data = await bulletproofAdminLogin(email, password);
      
      if (data.token && data.user) {
        // CRITICAL: DO NOT store tokens in localStorage for admin
        // Admin sessions should be temporary and require re-authentication
        console.log('✓ Admin login completed - NO PERSISTENT STORAGE');
        
        // Set token only for current session (in memory)
        apiClient.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        
        // Normalize user data
        const normalizedUser = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          role: data.user.role,
          isActive: data.user.is_active,
          isEmailVerified: data.user.is_email_verified,
          subscription: {
            type: data.user.subscription_type || 'basic',
            status: data.user.subscription_status || 'active',
            startDate: data.user.subscription_start_date,
            endDate: data.user.subscription_end_date
          },
          preferences: data.user.preferences || {},
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at,
          // Add session timestamp for admin
          sessionStart: new Date().toISOString(),
          isAdminSession: true
        };
        
        dispatch({ type: 'SET_USER', payload: normalizedUser });
        toast.success('Admin login successful! Session will expire on browser close.');
        return { success: true };
      } else {
        throw new Error('No token or user received');
      }
    } catch (error) {
      console.error('=== ADMIN LOGIN FAILED ===');
      console.error('Error:', error);
      
      const message = error.message || 'Admin login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Determine if this is an admin registration
      const isAdminRegistration = userData.role === 'admin';
      const endpoint = isAdminRegistration ? '/api/auth/admin/register' : '/api/auth/register';
      
      const response = await apiClient.post(endpoint, userData);
      
      const { token, user } = response.data;
      
      // Validate and store token using authStorage utility
      if (isValidTokenFormat(token)) {
        setToken(token, 'user');
        setUser(user);
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        throw new Error('Invalid token format received');
      }
      const successMessage = isAdminRegistration ? 'Admin registration successful!' : 'Registration successful!';
      toast.success(successMessage);
      return { success: true };
    } catch (error) {
      let message = error.response?.data?.message || 'Registration failed';
      
      // Provide more helpful error messages
      if (message.includes('already exists')) {
        message = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.response?.status === 400) {
        message = error.response?.data?.errors?.[0]?.msg || message;
      } else if (error.response?.status === 500) {
        message = 'Server error. Please try again later.';
      }
      
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('=== LOGOUT STARTED ===');
      
      // Use bulletproof logout
      await bulletproofLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all tokens and user data using authStorage utility
      clearAuth('user');
      delete apiClient.defaults.headers.common.Authorization;
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
      
      console.log('✓ Logout completed');
      // Redirect to login page
      window.location.href = '/auth/login';
    }
  };

  // Admin logout function - Enhanced security
  const adminLogout = async () => {
    try {
      console.log('=== ADMIN LOGOUT STARTED ===');
      
      // Use bulletproof logout
      await bulletproofLogout();
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      // Clear all tokens and user data - CRITICAL for admin security
      clearAuth('admin');
      removeToken('user'); // Also clear regular user token if any
      removeUser();
      delete apiClient.defaults.headers.common.Authorization;
      dispatch({ type: 'LOGOUT' });
      toast.success('Admin session ended. Please login again for security.');
      
      console.log('✓ Admin logout completed - all data cleared');
      // Redirect to admin login page
      window.location.href = '/auth/admin/login';
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.put('/api/users/profile', profileData);
      dispatch({ type: 'UPDATE_USER', payload: response.data.data });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await apiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await apiClient.post('/api/auth/forgot-password', { email });
      toast.success('Password reset link sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      await apiClient.post('/api/auth/reset-password', { token, password });
      toast.success('Password reset successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      await apiClient.post('/api/auth/verify-email', { token });
      toast.success('Email verified successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Resend verification email
  const resendVerification = async () => {
    try {
      await apiClient.post('/api/auth/resend-verification');
      toast.success('Verification email sent');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    login,
    adminLogin,
    register,
    logout,
    adminLogout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
