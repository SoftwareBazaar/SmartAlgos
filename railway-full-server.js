#!/usr/bin/env node

// Complete Smart Algos Trading Platform Server for Railway
console.log('🚀 Starting Smart Algos Trading Platform...');

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = createServer(app);

// ===============================
// Socket.IO - realtime connection
// ===============================
let io;

// ========================================
// CRITICAL: Ultra-lightweight health check FIRST
// ========================================
app.get('/health', (req, res) => {
  // FORCE SET CSP HEADER HERE
  const csp = "default-src 'self'; " +
    "img-src 'self' https://ncikobfahncdgwvkfivz.supabase.co data: blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' https://ncikobfahncdgwvkfivz.supabase.co wss://ncikobfahncdgwvkfivz.supabase.co https://web-production-fdb58.up.railway.app; " +
    "font-src 'self' data:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "frame-src 'self';";
  
  res.setHeader('Content-Security-Policy', csp);
  
  const cspHeader = res.getHeader('Content-Security-Policy');
  res.status(200).json({
    status: 'OK',
    version: 'v2.0-CSP-FIX-EMERGENCY',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    csp: {
      header: cspHeader || 'NO CSP SET',
      supabaseIncluded: cspHeader ? cspHeader.includes('ncikobfahncdgwvkfivz.supabase.co') : false,
      helmetDisabled: true
    }
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

  // Configure Express for Railway (trust proxy)
  app.set('trust proxy', 1);

  // EMERGENCY CSP FIX - Apply CSP FIRST, before other middleware
  app.use((req, res, next) => {
    try {
      const csp = "default-src 'self'; " +
        "img-src 'self' https://ncikobfahncdgwvkfivz.supabase.co data: blob:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "connect-src 'self' https://ncikobfahncdgwvkfivz.supabase.co wss://ncikobfahncdgwvkfivz.supabase.co https://web-production-fdb58.up.railway.app; " +
        "font-src 'self' data:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "frame-src 'self';";
      
      res.setHeader('Content-Security-Policy', csp);
      console.log('🔒 CSP Header Set for:', req.url);
      console.log('🔒 CSP Value:', csp);
      console.log('🔒 Headers after set:', res.getHeaders());
      next();
    } catch (error) {
      console.error('❌ CSP Error:', error);
      next();
    }
  });

  // Basic middleware
  app.use(cors());
  
  // EMERGENCY CSP FIX - Replace helmet with custom CSP
  // app.use(helmet()); // DISABLED - was blocking Supabase images
  
  app.use(compression());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Socket.IO with CORS allowing our frontend
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'https://web-production-fdb58.up.railway.app'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Basic heartbeat event
    socket.emit('connected', { time: Date.now() });

    socket.on('disconnect', () => {
      // no-op; useful for future metrics
    });
  });

  // Rate limiting DISABLED for debugging
  // const limiter = rateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   max: 100, // limit each IP to 100 requests per windowMs
  //   trustProxy: true, // Trust Railway proxy
  //   standardHeaders: true,
  //   legacyHeaders: false
  // });
  // app.use(limiter);
  
  console.log('⚠️  Rate limiting DISABLED in railway-full-server.js');

  // Serve static files from uploads with fallback to placeholder
  const uploadsDir = path.join(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadsDir));
  app.get('/uploads/*', (req, res, next) => {
    // If file not found, serve a lightweight placeholder image
    const requested = path.join(uploadsDir, req.params[0] || '');
    if (!fs.existsSync(requested)) {
      const placeholder = path.join(__dirname, 'static', 'placeholder.png');
      if (fs.existsSync(placeholder)) {
        return res.sendFile(placeholder);
      }
    }
    return next();
  });

  // Import routes (only the essential ones)
  console.log('Loading essential routes...');
  
  try {
    const authRoutes = require('./routes/auth');
    const usersRoutes = require('./routes/users'); // User routes including dashboard-stats
    const eaRoutes = require('./routes/eas');
    const subscriptionRoutes = require('./routes/subscriptions');
    const downloadsRoutes = require('./routes/downloads');
    const cryptoPaymentRoutes = require('./routes/cryptoPayments');
    const paymentRoutes = require('./routes/payments');
    const mpesaRoutes = require('./routes/mpesa');
    // MT5 routes - disabled for Railway (requires MT5 terminal installation)
    // const mt5Routes = require('./routes/mt5');
    const portfolioRoutes = require('./routes/portfolio');
    const adminRoutes = require('./admin-panel'); // Admin panel with REAL database
    
    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', usersRoutes); // User routes - MUST come before other routes that might conflict
    app.use('/api/eas', eaRoutes);
    app.use('/api/subscriptions', subscriptionRoutes);
    app.use('/api/downloads', downloadsRoutes); // EA file downloads with token verification
    app.use('/api/payments/crypto', cryptoPaymentRoutes); // Crypto payment routes - MUST come before /api/payments
    app.use('/api/payments', paymentRoutes); // General payment routes
    app.use('/api/mpesa', mpesaRoutes); // M-Pesa mobile money routes
    // app.use('/api/mt5', mt5Routes); // MT5 routes disabled (requires MT5 terminal)
    app.use('/api/portfolio', portfolioRoutes); // Portfolio routes (MT5 integration disabled)
    app.use('/api/admin', adminRoutes); // Admin panel routes
    
    console.log('✅ Essential routes loaded');
    console.log('   - /api/auth');
    console.log('   - /api/users');
    console.log('   - /api/eas');
    console.log('   - /api/subscriptions');
    console.log('   - /api/downloads');
    console.log('   - /api/payments/crypto');
    console.log('   - /api/payments');
    console.log('   - /api/mpesa');
    // console.log('   - /api/mt5'); // MT5 disabled
    console.log('   - /api/portfolio');
    console.log('   - /api/admin');
  } catch (error) {
    console.error('❌ Routes loading error:', error.message);
    console.error('Stack:', error.stack);
  }

  // Test downloads route
  app.get('/api/downloads/test', (req, res) => {
    res.json({
      success: true,
      message: 'Downloads route is working!',
      timestamp: new Date().toISOString()
    });
  });

  // Load utilities routes
  const utilitiesRoutes = require('./routes/utilities');
  app.use('/api/utilities', utilitiesRoutes);
  console.log('✅ Utilities routes loaded');

  // Load custom EA routes
  const customEARoutes = require('./routes/customEA');
  app.use('/api/custom-ea', customEARoutes);
  console.log('✅ Custom EA routes loaded');

  // ========================================
  // FRONTEND SERVING - Serve React app
  // ========================================
  console.log('Configuring frontend serving...');
  
  // Check if client build exists
  const clientBuildPath = path.join(__dirname, 'client', 'build');
  const clientBuildExists = fs.existsSync(clientBuildPath);
  
  if (clientBuildExists) {
    console.log('✅ Client build found, serving React app');
    
    // Serve static files from React build
    app.use(express.static(clientBuildPath));
    
    // Handle React routing - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({
          success: false,
          message: 'API route not found'
        });
      }
      
      // Serve React app for all other routes
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
    
    console.log('✅ React app serving configured');
  } else {
    console.log('⚠️ Client build not found, serving fallback');
    
    // Fallback: serve basic HTML if no React build
    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Smart Algos Trading Platform</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; text-align: center; }
            .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .api-link { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px; }
            .api-link:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Smart Algos Trading Platform</h1>
            <div class="status">
              <strong>✅ Server Status:</strong> Online and operational
            </div>
            <p>Welcome to the Smart Algos Trading Platform! The backend API is running successfully.</p>
            <p><strong>Available Endpoints:</strong></p>
            <a href="/api/health" class="api-link">Health Check</a>
            <a href="/api/auth" class="api-link">Authentication</a>
            <a href="/api/eas" class="api-link">Expert Advisors</a>
            <a href="/api/subscriptions" class="api-link">Subscriptions</a>
            <p><em>Note: Frontend React app is being built. Please check back in a few minutes.</em></p>
          </div>
        </body>
        </html>
      `);
    });
  }

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API route not found'
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

  // Start crypto payment monitor (automatic blockchain verification)
try {
  const cryptoPaymentMonitor = require('./services/cryptoPaymentMonitor');
  cryptoPaymentMonitor.start();
  console.log('✅ Crypto payment monitor started');
} catch (error) {
  console.warn('⚠️  Crypto payment monitor not available:', error.message);
}

console.log('✅ Server configuration complete');

} catch (error) {
  console.error('❌ Error loading server components:', error);
  
  // Fallback minimal server
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Smart Algos - Maintenance</title></head>
      <body>
        <h1>Smart Algos Trading Platform</h1>
        <p>Server is starting up. Please check back in a moment.</p>
        <p>Status: <a href="/api/health">Health Check</a></p>
      </body>
      </html>
    `);
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
