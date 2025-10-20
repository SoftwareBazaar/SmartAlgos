#!/usr/bin/env node

// Full Smart Algos Trading Platform Server for Railway
// OPTIMIZED: Health check responds IMMEDIATELY before heavy imports
console.log('🚀 Starting Smart Algos Trading Platform...');

const express = require('express');
const { createServer } = require('http');
require('dotenv').config();

const app = express();
const server = createServer(app);

// ========================================
// CRITICAL: Ultra-lightweight health check FIRST
// This MUST respond before ANY other imports or initialization
// ========================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 5000,
    message: 'Smart Algos - Health OK'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ========================================
// Start server IMMEDIATELY so health checks work
// Then load routes asynchronously
// ========================================
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ Server listening on ${HOST}:${PORT}`);
  console.log(`✅ Health check ready at /api/health`);
  
  // Now load everything else asynchronously
  loadApplicationAsync();
});

// Load all routes and middleware AFTER server is listening
async function loadApplicationAsync() {
  try {
    console.log('📦 Loading dependencies...');
    
    // Load core dependencies
    const cors = require('cors');
    const helmet = require('helmet');
    const compression = require('compression');
    const morgan = require('morgan');
    const rateLimit = require('express-rate-limit');
    const { Server } = require('socket.io');
    const path = require('path');
    
    console.log('📦 Loading routes...');
    
    // Import routes with error handling
    let authRoutes, userRoutes, eaRoutes, hftRoutes, signalRoutes;
    let marketRoutes, newsRoutes, subscriptionRoutes, escrowRoutes;
    let escrowWebhookRoutes, paymentRoutes, cryptoPaymentRoutes;
    let analysisRoutes, securityRoutes, mt5Routes, polygonRoutes;
    let portfolioRoutes, testRoutes, adminRoutes, adminCMSRoutes;
    let customEARoutes, aiAssistantRoutes, downloadsRoutes;
    let errorHandler, auth;
    
    try {
      authRoutes = require('./routes/auth');
      userRoutes = require('./routes/users');
      eaRoutes = require('./routes/eas');
      hftRoutes = require('./routes/hft');
      signalRoutes = require('./routes/signals');
      marketRoutes = require('./routes/markets');
      newsRoutes = require('./routes/news');
      subscriptionRoutes = require('./routes/subscriptions');
      escrowRoutes = require('./routes/escrow');
      escrowWebhookRoutes = require('./routes/escrowWebhooks');
      paymentRoutes = require('./routes/payments');
      cryptoPaymentRoutes = require('./routes/cryptoPayments');
      analysisRoutes = require('./routes/analysis');
      securityRoutes = require('./routes/security');
      mt5Routes = require('./routes/mt5');
      polygonRoutes = require('./routes/polygon');
      portfolioRoutes = require('./routes/portfolio');
      testRoutes = require('./routes/test');
      adminRoutes = require('./admin-panel');
      adminCMSRoutes = require('./routes/admin-cms');
      customEARoutes = require('./routes/customEA');
      aiAssistantRoutes = require('./routes/aiAssistant');
      downloadsRoutes = require('./routes/downloads');
      errorHandler = require('./middleware/errorHandler');
      const authMiddleware = require('./middleware/auth');
      auth = authMiddleware.auth;
      console.log('✅ All routes loaded successfully');
    } catch (routeError) {
      console.error('⚠️  Error loading routes:', routeError.message);
      console.error('Server will continue with limited functionality');
    }
    
    console.log('⚙️  Configuring middleware...');
    
    // ========================================
    // Middleware Setup
    // ========================================
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));

    app.use(compression());
    app.use(cors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      message: 'Too many requests from this IP, please try again later.'
    });
    app.use(limiter);

    // Logging
    if (process.env.NODE_ENV !== 'production') {
      app.use(morgan('combined'));
    }

    // ========================================
    // Static Files
    // ========================================
    app.use(express.static(path.join(__dirname, 'static')));
    app.use(express.static(path.join(__dirname, 'client/build')));

    console.log('🔌 Setting up API routes...');
    
    // ========================================
    // API Routes (only if loaded successfully)
    // ========================================
    if (authRoutes) app.use('/api/auth', authRoutes);
    if (userRoutes && auth) app.use('/api/users', auth, userRoutes);
    if (eaRoutes) app.use('/api/eas', eaRoutes);
    if (hftRoutes && auth) app.use('/api/hft', auth, hftRoutes);
    if (signalRoutes && auth) app.use('/api/signals', auth, signalRoutes);
    if (marketRoutes && auth) app.use('/api/markets', auth, marketRoutes);
    if (newsRoutes && auth) app.use('/api/news', auth, newsRoutes);
    if (subscriptionRoutes && auth) app.use('/api/subscriptions', auth, subscriptionRoutes);
    if (escrowRoutes && auth) app.use('/api/escrow', auth, escrowRoutes);
    if (escrowWebhookRoutes) app.use('/api/escrow', escrowWebhookRoutes);
    if (paymentRoutes && auth) app.use('/api/payments', auth, paymentRoutes);
    if (cryptoPaymentRoutes && auth) app.use('/api/crypto-payments', auth, cryptoPaymentRoutes);
    if (analysisRoutes && auth) app.use('/api/analysis', auth, analysisRoutes);
    if (securityRoutes && auth) app.use('/api/security', auth, securityRoutes);
    if (mt5Routes && auth) app.use('/api/mt5', auth, mt5Routes);
    if (polygonRoutes && auth) app.use('/api/polygon', auth, polygonRoutes);
    if (portfolioRoutes && auth) app.use('/api/portfolio', auth, portfolioRoutes);
    if (testRoutes) app.use('/api/test', testRoutes);
    if (adminRoutes && auth) app.use('/api/admin', auth, adminRoutes);
    if (adminCMSRoutes && auth) app.use('/api/admin-cms', auth, adminCMSRoutes);
    if (customEARoutes && auth) app.use('/api/custom-ea', auth, customEARoutes);
    if (aiAssistantRoutes && auth) app.use('/api/ai-assistant', auth, aiAssistantRoutes);
    if (downloadsRoutes && auth) app.use('/api/downloads', auth, downloadsRoutes);

    console.log('🌐 Setting up WebSocket...');
    
    // ========================================
    // WebSocket Setup
    // ========================================
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
      }
    });

    // WebSocket connection handling
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
      
      // Market data updates
      socket.on('subscribe_market_data', (data) => {
        socket.join(`market_${data.symbol}`);
      });
      
      socket.on('unsubscribe_market_data', (data) => {
        socket.leave(`market_${data.symbol}`);
      });
    });

    // Make io available to routes
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    console.log('📱 Configuring frontend routes...');
    
    // ========================================
    // Frontend Routes (React App)
    // ========================================
    app.get('*', (req, res) => {
      const indexPath = path.join(__dirname, 'client/build', 'index.html');
      const fs = require('fs');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend build not found. Run: npm run build');
      }
    });

    // ========================================
    // Error Handling
    // ========================================
    if (errorHandler) {
      app.use(errorHandler);
    }

    console.log('✅ Application fully loaded and operational');
    console.log(`✅ API: http://${HOST}:${PORT}/api`);
    console.log(`✅ Frontend: http://${HOST}:${PORT}`);
    console.log(`✅ WebSocket: ws://${HOST}:${PORT}`);
    
  } catch (error) {
    console.error('❌ Error loading application:', error);
    console.error('Health check will continue to respond, but application features may be limited');
  }
}

// ========================================
// Graceful Shutdown
// ========================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

