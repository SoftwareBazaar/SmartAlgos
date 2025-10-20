#!/usr/bin/env node

// Ultra-minimal Smart Algos Trading Platform Server for Railway
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
    uptime: process.uptime()
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
// Now load the heavy dependencies
// ========================================
console.log('Loading middleware and routes...');

try {
  const cors = require('cors');
  const helmet = require('helmet');
  const compression = require('compression');
  const morgan = require('morgan');
  const rateLimit = require('express-rate-limit');
  const { Server } = require('socket.io');
  const path = require('path');

  // Basic middleware
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Serve static files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Import routes (only the essential ones)
  console.log('Loading essential routes...');
  
  try {
    const authRoutes = require('./routes/auth');
    const eaRoutes = require('./routes/eas');
    const subscriptionRoutes = require('./routes/subscriptions');
    
    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/eas', eaRoutes);
    app.use('/api/subscriptions', subscriptionRoutes);
    
    console.log('✅ Essential routes loaded');
  } catch (error) {
    console.warn('⚠️ Some routes failed to load:', error.message);
  }

  // Basic routes
  app.get('/', (req, res) => {
    res.json({
      message: 'Smart Algos Trading Platform',
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  });

  console.log('✅ Server configuration complete');

} catch (error) {
  console.error('❌ Error loading server components:', error);
  
  // Fallback minimal server
  app.get('/', (req, res) => {
    res.json({
      message: 'Smart Algos Trading Platform - Minimal Mode',
      status: 'OK',
      timestamp: new Date().toISOString(),
      error: 'Some components failed to load'
    });
  });
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ Smart Algos API running on http://${HOST}:${PORT}`);
  console.log(`📁 Health check available at /api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Railway deployment ready - health check should respond immediately`);
});
