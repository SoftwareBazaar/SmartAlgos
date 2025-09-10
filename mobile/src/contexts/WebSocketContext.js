import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/apiService';

const WebSocketContext = createContext();

const initialState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  marketData: {},
  signals: [],
  notifications: [],
  portfolio: {},
  lastUpdate: null,
  subscriptions: new Set(),
};

const websocketReducer = (state, action) => {
  switch (action.type) {
    case 'CONNECTION_START':
      return {
        ...state,
        isConnecting: true,
        connectionError: null,
      };
    case 'CONNECTION_SUCCESS':
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        connectionError: null,
        lastUpdate: new Date(),
      };
    case 'CONNECTION_FAILURE':
      return {
        ...state,
        isConnected: false,
        isConnecting: false,
        connectionError: action.payload,
      };
    case 'CONNECTION_CLOSE':
      return {
        ...state,
        isConnected: false,
        isConnecting: false,
      };
    case 'UPDATE_MARKET_DATA':
      return {
        ...state,
        marketData: {
          ...state.marketData,
          ...action.payload,
        },
        lastUpdate: new Date(),
      };
    case 'UPDATE_SIGNALS':
      return {
        ...state,
        signals: action.payload,
        lastUpdate: new Date(),
      };
    case 'ADD_SIGNAL':
      return {
        ...state,
        signals: [action.payload, ...state.signals.slice(0, 99)], // Keep last 100 signals
        lastUpdate: new Date(),
      };
    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        lastUpdate: new Date(),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 99)], // Keep last 100 notifications
        lastUpdate: new Date(),
      };
    case 'UPDATE_PORTFOLIO':
      return {
        ...state,
        portfolio: action.payload,
        lastUpdate: new Date(),
      };
    case 'ADD_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: new Set([...state.subscriptions, action.payload]),
      };
    case 'REMOVE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: new Set([...state.subscriptions].filter(sub => sub !== action.payload)),
      };
    case 'CLEAR_DATA':
      return {
        ...state,
        marketData: {},
        signals: [],
        notifications: [],
        portfolio: {},
        subscriptions: new Set(),
      };
    default:
      return state;
  }
};

export const WebSocketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(websocketReducer, initialState);
  const { user, token, isAuthenticated } = useAuth();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (isAuthenticated && !state.isConnected) {
          connect();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        // Keep connection alive but reduce heartbeat frequency
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = setInterval(sendHeartbeat, 60000); // 1 minute
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isAuthenticated, state.isConnected]);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN || state.isConnecting) {
      return;
    }

    try {
      dispatch({ type: 'CONNECTION_START' });

      // Use WebSocket for real-time connection
      const wsUrl = `wss://api.smartalgos.com/ws?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        dispatch({ type: 'CONNECTION_SUCCESS' });
        
        // Send authentication
        sendMessage({
          type: 'auth',
          token,
          userId: user._id,
        });

        // Start heartbeat
        startHeartbeat();

        // Subscribe to default channels
        subscribeToDefaultChannels();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        dispatch({ type: 'CONNECTION_CLOSE' });
        stopHeartbeat();
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && isAuthenticated) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch({ type: 'CONNECTION_FAILURE', payload: 'Connection error' });
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      dispatch({ type: 'CONNECTION_FAILURE', payload: error.message });
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    dispatch({ type: 'CONNECTION_CLOSE' });
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      return;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && !state.isConnected) {
        console.log('Attempting to reconnect...');
        connect();
      }
      reconnectTimeoutRef.current = null;
    }, 5000); // Reconnect after 5 seconds
  };

  const startHeartbeat = () => {
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // 30 seconds
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const sendHeartbeat = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendMessage({ type: 'ping' });
    }
  };

  const sendMessage = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleMessage = (data) => {
    switch (data.type) {
      case 'pong':
        // Heartbeat response
        break;
      case 'market_data_update':
        dispatch({ type: 'UPDATE_MARKET_DATA', payload: data.data });
        break;
      case 'signal_update':
        dispatch({ type: 'ADD_SIGNAL', payload: data.data });
        break;
      case 'notification':
        dispatch({ type: 'ADD_NOTIFICATION', payload: data.data });
        showNotification(data.data);
        break;
      case 'portfolio_update':
        dispatch({ type: 'UPDATE_PORTFOLIO', payload: data.data });
        break;
      case 'error':
        console.error('WebSocket error:', data.message);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const showNotification = (notification) => {
    showMessage({
      message: notification.title,
      description: notification.message,
      type: notification.type === 'error' ? 'danger' : notification.type,
      duration: 4000,
    });
  };

  const subscribeToDefaultChannels = () => {
    // Subscribe to user-specific channels
    subscribe('user_notifications');
    subscribe('user_portfolio');
    subscribe('user_signals');
    
    // Subscribe to market data
    subscribe('market_data');
    subscribe('market_alerts');
  };

  const subscribe = (channel) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendMessage({
        type: 'subscribe',
        channel,
        userId: user._id,
      });
      dispatch({ type: 'ADD_SUBSCRIPTION', payload: channel });
    }
  };

  const unsubscribe = (channel) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendMessage({
        type: 'unsubscribe',
        channel,
        userId: user._id,
      });
      dispatch({ type: 'REMOVE_SUBSCRIPTION', payload: channel });
    }
  };

  const subscribeToSymbol = (symbol, market = 'US') => {
    const channel = `market_${market}_${symbol}`;
    subscribe(channel);
  };

  const unsubscribeFromSymbol = (symbol, market = 'US') => {
    const channel = `market_${market}_${symbol}`;
    unsubscribe(channel);
  };

  const subscribeToEA = (eaId) => {
    const channel = `ea_${eaId}`;
    subscribe(channel);
  };

  const unsubscribeFromEA = (eaId) => {
    const channel = `ea_${eaId}`;
    unsubscribe(channel);
  };

  const subscribeToHFT = (hftId) => {
    const channel = `hft_${hftId}`;
    subscribe(channel);
  };

  const unsubscribeFromHFT = (hftId) => {
    const channel = `hft_${hftId}`;
    unsubscribe(channel);
  };

  const getMarketData = (symbol, market = 'US') => {
    return state.marketData[`${market}_${symbol}`] || null;
  };

  const getLatestSignals = (limit = 10) => {
    return state.signals.slice(0, limit);
  };

  const getLatestNotifications = (limit = 10) => {
    return state.notifications.slice(0, limit);
  };

  const clearData = () => {
    dispatch({ type: 'CLEAR_DATA' });
  };

  const value = {
    ...state,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    subscribeToEA,
    unsubscribeFromEA,
    subscribeToHFT,
    unsubscribeFromHFT,
    getMarketData,
    getLatestSignals,
    getLatestNotifications,
    clearData,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
