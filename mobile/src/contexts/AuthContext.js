import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { apiClient } from '../services/apiService';
import { initializeBiometrics } from '../services/biometricService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricEnabled: false,
  lastActivity: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastActivity: new Date(),
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        lastActivity: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        biometricEnabled: false,
        lastActivity: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_BIOMETRIC':
      return {
        ...state,
        biometricEnabled: action.payload,
      };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date(),
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');

      if (token && userData) {
        // Verify token with server
        const response = await apiClient.get('/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: JSON.parse(userData),
              token,
            },
          });

          if (biometricEnabled === 'true') {
            dispatch({ type: 'SET_BIOMETRIC', payload: true });
          }
        } else {
          await logout();
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: 'No valid session found' });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await logout();
    }
  };

  const login = async (email, password, useBiometric = false) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await apiClient.post('/auth/login', {
        email,
        password,
        deviceInfo: await getDeviceInfo(),
      });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store auth data
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));

        // Enable biometric if requested
        if (useBiometric) {
          const biometricResult = await initializeBiometrics();
          if (biometricResult.success) {
            await AsyncStorage.setItem('biometricEnabled', 'true');
            dispatch({ type: 'SET_BIOMETRIC', payload: true });
          }
        }

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });

        showMessage({
          message: 'Login Successful',
          description: `Welcome back, ${user.firstName}!`,
          type: 'success',
        });

        return { success: true };
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.data.message });
        showMessage({
          message: 'Login Failed',
          description: response.data.message,
          type: 'danger',
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      showMessage({
        message: 'Login Error',
        description: errorMessage,
        type: 'danger',
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await apiClient.post('/auth/register', {
        ...userData,
        deviceInfo: await getDeviceInfo(),
      });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store auth data
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });

        showMessage({
          message: 'Registration Successful',
          description: `Welcome to Smart Algos, ${user.firstName}!`,
          type: 'success',
        });

        return { success: true };
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.data.message });
        showMessage({
          message: 'Registration Failed',
          description: response.data.message,
          type: 'danger',
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      showMessage({
        message: 'Registration Error',
        description: errorMessage,
        type: 'danger',
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.multiRemove(['authToken', 'userData', 'biometricEnabled']);
      
      // Call logout API
      if (state.token) {
        await apiClient.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${state.token}` }
        });
      }

      dispatch({ type: 'LOGOUT' });

      showMessage({
        message: 'Logged Out',
        description: 'You have been successfully logged out.',
        type: 'info',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const response = await apiClient.put('/users/profile', updateData, {
        headers: { Authorization: `Bearer ${state.token}` }
      });

      if (response.data.success) {
        const updatedUser = response.data.data;
        
        // Update stored user data
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });

        showMessage({
          message: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
          type: 'success',
        });

        return { success: true };
      } else {
        showMessage({
          message: 'Update Failed',
          description: response.data.message,
          type: 'danger',
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed. Please try again.';
      showMessage({
        message: 'Update Error',
        description: errorMessage,
        type: 'danger',
      });
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${state.token}` }
      });

      if (response.data.success) {
        showMessage({
          message: 'Password Changed',
          description: 'Your password has been changed successfully.',
          type: 'success',
        });
        return { success: true };
      } else {
        showMessage({
          message: 'Password Change Failed',
          description: response.data.message,
          type: 'danger',
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed. Please try again.';
      showMessage({
        message: 'Password Change Error',
        description: errorMessage,
        type: 'danger',
      });
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });

      if (response.data.success) {
        showMessage({
          message: 'Reset Link Sent',
          description: 'Please check your email for password reset instructions.',
          type: 'success',
        });
        return { success: true };
      } else {
        showMessage({
          message: 'Reset Failed',
          description: response.data.message,
          type: 'danger',
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.';
      showMessage({
        message: 'Reset Error',
        description: errorMessage,
        type: 'danger',
      });
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.data.success) {
        showMessage({
          message: 'Password Reset',
          description: 'Your password has been reset successfully.',
          type: 'success',
        });
        return { success: true };
      } else {
        showMessage({
          message: 'Reset Failed',
          description: response.data.message,
          type: 'danger',
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.';
      showMessage({
        message: 'Reset Error',
        description: errorMessage,
        type: 'danger',
      });
      return { success: false, error: errorMessage };
    }
  };

  const enableBiometric = async () => {
    try {
      const result = await initializeBiometrics();
      if (result.success) {
        await AsyncStorage.setItem('biometricEnabled', 'true');
        dispatch({ type: 'SET_BIOMETRIC', payload: true });
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const disableBiometric = async () => {
    try {
      await AsyncStorage.setItem('biometricEnabled', 'false');
      dispatch({ type: 'SET_BIOMETRIC', payload: false });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateActivity = () => {
    dispatch({ type: 'UPDATE_ACTIVITY' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const getDeviceInfo = async () => {
    const deviceInfo = await AsyncStorage.getItem('deviceInfo');
    return deviceInfo ? JSON.parse(deviceInfo) : null;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    enableBiometric,
    disableBiometric,
    updateActivity,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
