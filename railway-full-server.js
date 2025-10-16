#!/usr/bin/env node

// Full Smart Algos Trading Platform Server for Railway
console.log('🚀 Starting Smart Algos Trading Platform...');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eaRoutes = require('./routes/eas');
const hftRoutes = require('./routes/hft');
const signalRoutes = require('./routes/signals');
const marketRoutes = require('./routes/markets');
const newsRoutes = require('./routes/news');
const subscriptionRoutes = require('./routes/subscriptions');
const escrowRoutes = require('./routes/escrow');
const escrowWebhookRoutes = require('./routes/escrowWebhooks');
const paymentRoutes = require('./routes/payments');
const cryptoPaymentRoutes = require('./routes/cryptoPayments');
const analysisRoutes = require('./routes/analysis');
const securityRoutes = require('./routes/security');
const mt5Routes = require('./routes/mt5');
const polygonRoutes = require('./routes/polygon');
const portfolioRoutes = require('./routes/portfolio');
const testRoutes = require('./routes/test');
const adminRoutes = require('./admin-panel');
const adminCMSRoutes = require('./routes/admin-cms');
const customEARoutes = require('./routes/customEA');
const aiAssistantRoutes = require('./routes/aiAssistant');
const downloadsRoutes = require('./routes/downloads');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { auth } = require('./middleware/auth');

const app = express();

// ========================================
// CRITICAL: Health check FIRST for Railway
// ========================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 5000,
    message: 'Smart Algos Trading Platform - Health Check'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 5000,
    message: 'API Health Check - All Systems Operational'
  });
});

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
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

// ========================================
// API Routes
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/eas', eaRoutes); // Public routes - auth handled per-endpoint
app.use('/api/hft', auth, hftRoutes);
app.use('/api/signals', auth, signalRoutes);
app.use('/api/markets', auth, marketRoutes);
app.use('/api/news', auth, newsRoutes);
app.use('/api/subscriptions', auth, subscriptionRoutes);
app.use('/api/escrow', auth, escrowRoutes);
app.use('/api/escrow', escrowWebhookRoutes); // Webhooks don't require auth
app.use('/api/payments', auth, paymentRoutes);
app.use('/api/crypto-payments', auth, cryptoPaymentRoutes);
app.use('/api/analysis', auth, analysisRoutes);
app.use('/api/security', auth, securityRoutes);
app.use('/api/mt5', auth, mt5Routes);
app.use('/api/polygon', auth, polygonRoutes);
app.use('/api/portfolio', auth, portfolioRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', auth, adminRoutes);
app.use('/api/admin-cms', auth, adminCMSRoutes);
app.use('/api/custom-ea', auth, customEARoutes);
app.use('/api/ai-assistant', auth, aiAssistantRoutes);
app.use('/api/downloads', auth, downloadsRoutes);

// ========================================
// WebSocket Setup
// ========================================
const server = createServer(app);
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

// ========================================
// Frontend Routes (React App)
// ========================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// ========================================
// Error Handling
// ========================================
app.use(errorHandler);

// ========================================
// Server Startup
// ========================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Smart Algos Trading Platform running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Frontend: http://localhost:${PORT}`);
  console.log(`✅ API: http://localhost:${PORT}/api`);
  console.log(`✅ WebSocket: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

console.log('✅ Full Smart Algos Trading Platform started successfully!');
