const jwt = require('jsonwebtoken');
const databaseService = require('../services/databaseService');
const marketDataService = require('../services/marketDataService');
const aiSignalService = require('../services/aiSignalService');
const realtimeMarketService = require('../services/realtimeMarketService');

// Store active connections
const activeConnections = new Map();

// Setup WebSocket handlers
const setupWebSocketHandlers = (io) => {
  // Set up real-time market data event listeners
  realtimeMarketService.on('price_update', (data) => {
    const { symbol, subscriberId, data: priceData } = data;
    
    // Send to specific subscriber
    const socket = io.sockets.sockets.get(subscriberId);
    if (socket) {
      socket.emit('price_update', priceData);
    }
    
    // Also broadcast to symbol room
    io.to(`market_${symbol}`).emit('market_data_update', priceData);
  });

  realtimeMarketService.on('error', (error) => {
    console.error('Real-time market service error:', error);
    
    // Broadcast error to relevant subscribers
    io.to(`market_${error.symbol}`).emit('market_data_error', {
      symbol: error.symbol,
      message: error.error,
      timestamp: error.timestamp
    });
  });

  realtimeMarketService.on('service_status', (status) => {
    // Broadcast service status to admin users (if needed)
    io.to('subscription_institutional').emit('market_service_status', status);
  });
  // Authentication middleware for WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await databaseService.getUserById(decoded.userId);
      
      if (!user || !user.is_active) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle new connections
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected via WebSocket`);
    
    // Store connection
    activeConnections.set(socket.userId, socket);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Join user to subscription-based rooms
    const subscriptionType = socket.user.subscription_type || 'free';
    socket.join(`subscription_${subscriptionType}`);
    
    // Join user to asset-specific rooms based on preferences
    if (socket.user.preferred_assets && socket.user.preferred_assets.length > 0) {
      socket.user.preferred_assets.forEach(asset => {
        socket.join(`asset_${asset}`);
      });
    }

    // Handle market data subscription
    socket.on('subscribe_market_data', async (data) => {
      try {
        const { symbols, markets } = data;
        
        if (symbols && Array.isArray(symbols)) {
          symbols.forEach(symbol => {
            socket.join(`market_${symbol}`);
            // Subscribe to real-time data for this symbol
            realtimeMarketService.subscribe(symbol, socket.id);
          });
        }
        
        if (markets && Array.isArray(markets)) {
          markets.forEach(market => {
            socket.join(`market_${market}`);
          });
        }
        
        socket.emit('market_data_subscribed', {
          success: true,
          message: 'Successfully subscribed to market data',
          symbols: symbols || [],
          markets: markets || []
        });
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to subscribe to market data',
          error: error.message
        });
      }
    });

    // Handle market data unsubscription
    socket.on('unsubscribe_market_data', async (data) => {
      try {
        const { symbols } = data;
        
        if (symbols && Array.isArray(symbols)) {
          symbols.forEach(symbol => {
            socket.leave(`market_${symbol}`);
            // Unsubscribe from real-time data for this symbol
            realtimeMarketService.unsubscribe(symbol, socket.id);
          });
        }
        
        socket.emit('market_data_unsubscribed', {
          success: true,
          message: 'Successfully unsubscribed from market data',
          symbols: symbols || []
        });
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to unsubscribe from market data',
          error: error.message
        });
      }
    });

    // Handle trading signal subscription
    socket.on('subscribe_signals', async (data) => {
      try {
        const { assetTypes, markets, subscriptionTier } = data;
        
        // Check if user has access to requested signal tier
        const userTier = socket.user.subscription.type;
        const tierLevels = { 'free': 0, 'basic': 1, 'professional': 2, 'institutional': 3 };
        
        if (tierLevels[userTier] < tierLevels[subscriptionTier || 'free']) {
          socket.emit('error', {
            message: 'Insufficient subscription level for requested signals'
          });
          return;
        }
        
        if (assetTypes && Array.isArray(assetTypes)) {
          assetTypes.forEach(type => {
            socket.join(`signals_${type}`);
          });
        }
        
        if (markets && Array.isArray(markets)) {
          markets.forEach(market => {
            socket.join(`signals_${market}`);
          });
        }
        
        socket.emit('signals_subscribed', {
          success: true,
          message: 'Successfully subscribed to trading signals',
          assetTypes: assetTypes || [],
          markets: markets || []
        });
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to subscribe to signals',
          error: error.message
        });
      }
    });

    // Handle EA performance subscription
    socket.on('subscribe_ea_performance', async (data) => {
      try {
        const { eaIds } = data;
        
        if (eaIds && Array.isArray(eaIds)) {
          eaIds.forEach(eaId => {
            socket.join(`ea_performance_${eaId}`);
          });
        }
        
        socket.emit('ea_performance_subscribed', {
          success: true,
          message: 'Successfully subscribed to EA performance updates',
          eaIds: eaIds || []
        });
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to subscribe to EA performance',
          error: error.message
        });
      }
    });

    // Handle HFT bot performance subscription
    socket.on('subscribe_hft_performance', async (data) => {
      try {
        const { botIds } = data;
        
        if (botIds && Array.isArray(botIds)) {
          botIds.forEach(botId => {
            socket.join(`hft_performance_${botId}`);
          });
        }
        
        socket.emit('hft_performance_subscribed', {
          success: true,
          message: 'Successfully subscribed to HFT bot performance updates',
          botIds: botIds || []
        });
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to subscribe to HFT performance',
          error: error.message
        });
      }
    });

    // Handle portfolio updates subscription
    socket.on('subscribe_portfolio', () => {
      socket.join(`portfolio_${socket.userId}`);
      socket.emit('portfolio_subscribed', {
        success: true,
        message: 'Successfully subscribed to portfolio updates'
      });
    });

    // Handle news subscription
    socket.on('subscribe_news', async (data) => {
      try {
        const { categories, markets } = data;
        
        if (categories && Array.isArray(categories)) {
          categories.forEach(category => {
            socket.join(`news_${category}`);
          });
        }
        
        if (markets && Array.isArray(markets)) {
          markets.forEach(market => {
            socket.join(`news_${market}`);
          });
        }
        
        socket.emit('news_subscribed', {
          success: true,
          message: 'Successfully subscribed to news updates',
          categories: categories || [],
          markets: markets || []
        });
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to subscribe to news',
          error: error.message
        });
      }
    });

    // Handle chat/messaging
    socket.on('send_message', async (data) => {
      try {
        const { room, message, type = 'text' } = data;
        
        // Validate message
        if (!message || message.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }
        
        if (message.length > 1000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }
        
        const messageData = {
          userId: socket.userId,
          userName: socket.user.fullName,
          message: message.trim(),
          type,
          timestamp: new Date(),
          room
        };
        
        // Broadcast to room
        io.to(room).emit('new_message', messageData);
        
        // Store message in database (implement Message model if needed)
        // await Message.create(messageData);
        
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to send message',
          error: error.message
        });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { room } = data;
      socket.to(room).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.fullName,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { room } = data;
      socket.to(room).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.fullName,
        isTyping: false
      });
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`);
      activeConnections.delete(socket.userId);
      
      // Unsubscribe from all real-time market data
      realtimeMarketService.unsubscribeAll(socket.id);
    });

    // Send welcome message
    socket.emit('connected', {
      success: true,
      message: 'Connected to Smart Algos WebSocket',
      userId: socket.userId,
      subscription: socket.user.subscription_type || 'free',
      timestamp: new Date()
    });
  });
};

// Broadcast market data to subscribers
const broadcastMarketData = (io, data) => {
  const { symbol, market, price, change, volume, timestamp } = data;
  
  // Broadcast to symbol-specific room
  io.to(`market_${symbol}`).emit('market_data_update', {
    symbol,
    market,
    price,
    change,
    volume,
    timestamp
  });
  
  // Broadcast to market-specific room
  io.to(`market_${market}`).emit('market_data_update', {
    symbol,
    market,
    price,
    change,
    volume,
    timestamp
  });
};

// Broadcast trading signal to subscribers
const broadcastTradingSignal = (io, signal) => {
  const { asset, signalType, subscriptionTier } = signal;
  
  // Broadcast to asset type room
  io.to(`signals_${asset.type}`).emit('new_trading_signal', signal);
  
  // Broadcast to market room
  io.to(`signals_${asset.market}`).emit('new_trading_signal', signal);
  
  // Broadcast to subscription tier room
  io.to(`subscription_${subscriptionTier}`).emit('new_trading_signal', signal);
};

// Broadcast EA performance update
const broadcastEAPerformance = (io, eaId, performance) => {
  io.to(`ea_performance_${eaId}`).emit('ea_performance_update', {
    eaId,
    performance,
    timestamp: new Date()
  });
};

// Broadcast HFT bot performance update
const broadcastHFTPerformance = (io, botId, performance) => {
  io.to(`hft_performance_${botId}`).emit('hft_performance_update', {
    botId,
    performance,
    timestamp: new Date()
  });
};

// Broadcast portfolio update
const broadcastPortfolioUpdate = (io, userId, portfolio) => {
  io.to(`portfolio_${userId}`).emit('portfolio_update', {
    portfolio,
    timestamp: new Date()
  });
};

// Broadcast news update
const broadcastNews = (io, news) => {
  const { categories, markets } = news;
  
  if (categories && Array.isArray(categories)) {
    categories.forEach(category => {
      io.to(`news_${category}`).emit('news_update', news);
    });
  }
  
  if (markets && Array.isArray(markets)) {
    markets.forEach(market => {
      io.to(`news_${market}`).emit('news_update', news);
    });
  }
};

// Send notification to specific user
const sendNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date()
  });
};

// Broadcast system announcement
const broadcastAnnouncement = (io, announcement) => {
  io.emit('system_announcement', {
    ...announcement,
    timestamp: new Date()
  });
};

// Get active connections count
const getActiveConnectionsCount = () => {
  return activeConnections.size;
};

// Get user connection status
const isUserConnected = (userId) => {
  return activeConnections.has(userId);
};

module.exports = {
  setupWebSocketHandlers,
  broadcastMarketData,
  broadcastTradingSignal,
  broadcastEAPerformance,
  broadcastHFTPerformance,
  broadcastPortfolioUpdate,
  broadcastNews,
  sendNotification,
  broadcastAnnouncement,
  getActiveConnectionsCount,
  isUserConnected
};
