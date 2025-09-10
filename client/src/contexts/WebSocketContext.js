import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const { user } = useAuth();
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setConnected(true);
        setReconnecting(false);
        reconnectAttemptsRef.current = 0;
        
        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setConnected(false);
        
        // Attempt to reconnect if not manually disconnected
        if (reason !== 'io client disconnect') {
          attemptReconnect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
        setReconnecting(true);
        
        if (error.message === 'Authentication error') {
          toast.error('WebSocket authentication failed');
          newSocket.disconnect();
        } else {
          attemptReconnect();
        }
      });

      // Market data events
      newSocket.on('market_data_update', (data) => {
        // Handle market data updates
        console.log('Market data update:', data);
      });

      newSocket.on('new_trading_signal', (signal) => {
        // Handle new trading signals
        console.log('New trading signal:', signal);
        toast.success(`New signal: ${signal.asset.symbol} - ${signal.signalType.toUpperCase()}`);
      });

      newSocket.on('ea_performance_update', (data) => {
        // Handle EA performance updates
        console.log('EA performance update:', data);
      });

      newSocket.on('hft_performance_update', (data) => {
        // Handle HFT bot performance updates
        console.log('HFT performance update:', data);
      });

      newSocket.on('portfolio_update', (data) => {
        // Handle portfolio updates
        console.log('Portfolio update:', data);
      });

      newSocket.on('news_update', (news) => {
        // Handle news updates
        console.log('News update:', news);
        toast.info(`Market News: ${news.title}`);
      });

      newSocket.on('notification', (notification) => {
        // Handle notifications
        console.log('Notification:', notification);
        toast(notification.message, {
          icon: notification.type === 'success' ? '✅' : 
                notification.type === 'error' ? '❌' : 
                notification.type === 'warning' ? '⚠️' : 'ℹ️'
        });
      });

      newSocket.on('system_announcement', (announcement) => {
        // Handle system announcements
        console.log('System announcement:', announcement);
        toast(announcement.message, {
          duration: 8000,
          icon: '📢'
        });
      });

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        toast.error(error.message || 'WebSocket error occurred');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    };
  }, [user]);

  // Reconnection logic
  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      setReconnecting(false);
      toast.error('Connection lost. Please refresh the page.');
      return;
    }

    reconnectAttemptsRef.current += 1;
    setReconnecting(true);

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.connect();
      }
    }, delay);
  };

  // Subscribe to market data
  const subscribeMarketData = (symbols, markets) => {
    if (socket && connected) {
      socket.emit('subscribe_market_data', { symbols, markets });
    }
  };

  // Subscribe to trading signals
  const subscribeSignals = (assetTypes, markets, subscriptionTier) => {
    if (socket && connected) {
      socket.emit('subscribe_signals', { assetTypes, markets, subscriptionTier });
    }
  };

  // Subscribe to EA performance
  const subscribeEAPerformance = (eaIds) => {
    if (socket && connected) {
      socket.emit('subscribe_ea_performance', { eaIds });
    }
  };

  // Subscribe to HFT performance
  const subscribeHFTPerformance = (botIds) => {
    if (socket && connected) {
      socket.emit('subscribe_hft_performance', { botIds });
    }
  };

  // Subscribe to portfolio updates
  const subscribePortfolio = () => {
    if (socket && connected) {
      socket.emit('subscribe_portfolio');
    }
  };

  // Subscribe to news
  const subscribeNews = (categories, markets) => {
    if (socket && connected) {
      socket.emit('subscribe_news', { categories, markets });
    }
  };

  // Send message to a room
  const sendMessage = (room, message, type = 'text') => {
    if (socket && connected) {
      socket.emit('send_message', { room, message, type });
    }
  };

  // Start typing indicator
  const startTyping = (room) => {
    if (socket && connected) {
      socket.emit('typing_start', { room });
    }
  };

  // Stop typing indicator
  const stopTyping = (room) => {
    if (socket && connected) {
      socket.emit('typing_stop', { room });
    }
  };

  // Ping server
  const ping = () => {
    if (socket && connected) {
      socket.emit('ping');
    }
  };

  const value = {
    socket,
    connected,
    reconnecting,
    subscribeMarketData,
    subscribeSignals,
    subscribeEAPerformance,
    subscribeHFTPerformance,
    subscribePortfolio,
    subscribeNews,
    sendMessage,
    startTyping,
    stopTyping,
    ping,
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

export default WebSocketContext;
