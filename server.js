const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
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
const paymentRoutes = require('./routes/payments');
const analysisRoutes = require('./routes/analysis');
const securityRoutes = require('./routes/security');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { auth } = require('./middleware/auth');
const { 
  sanitizeInput, 
  detectThreats, 
  getSecurityHeaders,
  createRateLimit,
  createAuthRateLimit 
} = require('./middleware/security');
const securityService = require('./services/securityService');

// Import WebSocket handlers
const { setupWebSocketHandlers } = require('./websocket/handlers');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Enhanced Security middleware
app.use(securityService.getSecurityHeaders());

// Global rate limiting
const globalLimiter = securityService.createRateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(globalLimiter);

// Authentication rate limiting
const authLimiter = securityService.createAuthRateLimit();
app.use('/api/auth', authLimiter);

// Input sanitization
app.use(sanitizeInput);

// Threat detection
app.use(detectThreats);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static('uploads'));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/eas', auth, eaRoutes);
app.use('/api/hft', auth, hftRoutes);
app.use('/api/signals', auth, signalRoutes);
app.use('/api/markets', auth, marketRoutes);
app.use('/api/news', auth, newsRoutes);
app.use('/api/subscriptions', auth, subscriptionRoutes);
app.use('/api/escrow', auth, escrowRoutes);
app.use('/api/payments', auth, paymentRoutes);
app.use('/api/analysis', auth, analysisRoutes);
app.use('/api/security', auth, securityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Algos Trading Platform API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || 'https://ncikobfahncdgwvkfivz.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaWtvYmZhaG5jZGd3dmtmaXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDY2NDQsImV4cCI6MjA3Mjk4MjY0NH0.TKIwIpXr9c92Xi0AgoioeC2db3tonPtM1wHHMo5-7mk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase connection
supabase.from('users').select('count').limit(1)
  .then(() => {
    console.log('✅ Connected to Supabase');
  })
  .catch((error) => {
    console.error('❌ Supabase connection error:', error.message);
    console.log('⚠️  Server will continue running without database connection');
    console.log('💡 To fix this:');
    console.log('   1. Check your SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
    console.log('   2. Make sure your Supabase project is active');
  });

// Make supabase available globally
global.supabase = supabase;

// Setup WebSocket handlers
setupWebSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Smart Algos Trading Platform Server running on http://${HOST}:${PORT}`);
  console.log(`📊 WebSocket server running on ws://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
