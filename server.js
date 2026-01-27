const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
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
const paystackPaymentRoutes = require('./routes/paystackPayments');
const mpesaRoutes = require('./routes/mpesa');
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
const csrfRoutes = require('./routes/csrf');
const { validateCSRF } = require('./routes/csrf');

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
const databaseService = require('./services/databaseService');

// Import WebSocket handlers
const { setupWebSocketHandlers } = require('./websocket/handlers');

const app = express();

// Log server version on startup
console.log('');
console.log('🚀 ============================================');
console.log('🚀 SERVER VERSION: v2.0-CSP-FIX-EMERGENCY');
console.log('🚀 HELMET: DISABLED');
console.log('🚀 CSP: CUSTOM HEADER WITH SUPABASE');
console.log('🚀 Deploy Time:', new Date().toISOString());
console.log('🚀 ============================================');
console.log('');

// ========================================
// CRITICAL: HEALTH CHECK MUST BE ABSOLUTE FIRST
// Railway needs this to respond IMMEDIATELY
// ========================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    version: 'v2.1-CSP-HELMET-REFINED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 5000,
    message: 'Health check responding immediately',
    csp: {
      location: 'Global Helmet Configuration',
      supabaseIncluded: true,
      paystackIncluded: true,
      helmetEnabled: true
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

// CSP Verification endpoint - FORCE REBUILD v2
app.get('/api/verify-csp', (req, res) => {
  const cspHeader = res.getHeader('Content-Security-Policy');
  res.json({
    serverVersion: 'v2.0-CSP-FIX',
    deployTime: new Date().toISOString(),
    cspHeader: cspHeader || 'NO CSP HEADER SET',
    supabaseIncluded: cspHeader ? cspHeader.includes('ncikobfahncdgwvkfivz.supabase.co') : false,
    helmetDisabled: true
  });
});

// Debug endpoint to check all routes
app.get('/api/debug-routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    }
  });
  res.json({ routes, timestamp: new Date().toISOString() });
});

const server = createServer(app);

// Set server timeout for large file uploads
server.timeout = 120000; // 2 minutes

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "https://web-production-fdb58.up.railway.app",
      "https://smartalgos-production.up.railway.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const isProduction = process.env.NODE_ENV === "production";
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const railwayUrl = process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : "https://web-production-fdb58.up.railway.app";
const baseOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];
const mergedOrigins = [
  process.env.CLIENT_URL,
  vercelUrl,
  railwayUrl,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
  ...baseOrigins
]
  .filter(Boolean)
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const allowedOrigins = Array.from(new Set(mergedOrigins));

if (!isProduction && !process.env.VERCEL) {
  console.log('[startup] CORS allowed origins:', allowedOrigins);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    const matchesAllowed = allowedOrigins.some((allowed) => {
      if (!allowed) {
        return false;
      }

      if (allowed === '*') {
        return true;
      }

      const normalizedAllowed = allowed.endsWith('/') ? allowed.slice(0, -1) : allowed;

      if (!normalizedAllowed.includes('://')) {
        try {
          const originHost = new URL(normalizedOrigin).host;
          return originHost === normalizedAllowed;
        } catch (error) {
          return normalizedOrigin === normalizedAllowed;
        }
      }

      return normalizedOrigin === normalizedAllowed;
    });

    // Return the specific origin (not true) when credentials are enabled
    if (matchesAllowed) {
      return callback(null, normalizedOrigin);
    }

    if (!isProduction && origin.startsWith("http://localhost")) {
      return callback(null, normalizedOrigin);
    }

    if (vercelUrl && origin === vercelUrl) {
      return callback(null, normalizedOrigin);
    }

    if (railwayUrl && origin === railwayUrl) {
      return callback(null, normalizedOrigin);
    }

    console.warn(`[cors] Blocked request from origin ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

const shouldLogRequestBodies = process.env.LOG_REQUEST_BODIES === "true" && !isProduction;

app.set("trust proxy", 1);

// Health check already registered at the top of the file (before server creation)

// Baseline security headers with relaxed CSP for images and external resources
// SUPABASE STORAGE: Allow images from Supabase storage buckets
// NOTE: CSP is now set in client/public/index.html meta tag to avoid conflicts
const supabaseUrl = process.env.SUPABASE_URL || 'https://ncikobfahncdgwvkfivz.supabase.co';

// LOGGING MIDDLEWARE - To debug CSP issues
app.use((req, res, next) => {
  // Only log if not a health check to avoid noise
  if (req.url !== '/health' && req.url !== '/api/health') {
    // Intercept header setting to log CSP
    const originalSetHeader = res.setHeader;
    res.setHeader = function (name, value) {
      if (name && name.toLowerCase() === 'content-security-policy') {
        process.stdout.write(`🔒 [CSP] Setting CSP for ${req.url}\n`);
      }
      return originalSetHeader.apply(this, arguments);
    };
  }
  next();
});

// CSP Configuration using Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://js.paystack.co",
          "https://*.paystack.co",
          "https://*.paystack.com",
          "https://*.supabase.co",
          "https://fonts.googleapis.com",
          "https://connect.facebook.net",
          "https://*.google.com",
          "https://*.gstatic.com"
        ],
        // Removed scriptSrcElem
        connectSrc: [
          "'self'",
          "https://api.paystack.co",
          "https://*.paystack.co",
          "https://*.paystack.com",
          "https://*.supabase.co",
          "wss://*.supabase.co",
          "https://web-production-fdb58.up.railway.app",
          "https://smartalgos-production.up.railway.app",
          "https://*.google-analytics.com"
        ],
        frameSrc: [
          "'self'",
          "https://js.paystack.co",
          "https://*.paystack.co",
          "https://*.paystack.com",
          "https://checkout.paystack.com",
          "https://*.supabase.co"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://*.paystack.co",
          "https://*.paystack.com",
          "https://paystack.com"
        ],
        // Removed styleSrcElem
        fontSrc: [
          "'self'",
          "data:",
          "https://fonts.gstatic.com",         // Google Fonts
          "https://*.paystack.co",
          "https://*.paystack.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",                           // Allow Secure External Images
          "https://*.supabase.co",            // Supabase Storage
          "https://*.paystack.co",
          "https://*.paystack.com"
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        upgradeInsecureRequests: [],
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Global rate limiting - Production-ready limits
const globalLimiter = securityService.createRateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: isProduction ? (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100) : 200, // 100 requests per 15 min in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Apply global rate limiting to all API routes
app.use('/api', globalLimiter);

// More strict rate limiting for authentication endpoints
const authLimiter = securityService.createAuthRateLimit();
// Auth routes already have their own rate limiting in routes/auth.js

// Input sanitization
app.use(sanitizeInput);

// Threat detection
app.use(detectThreats);

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware with better error handling
app.use(express.json({
  limit: '50mb', // Increased from 10mb for large image uploads
  strict: false,
  type: 'application/json',
  verify: (req, res, buf) => {
    if (!buf || buf.length === 0) {
      req.body = {};
      return;
    }

    const bodyText = buf.toString();

    if (shouldLogRequestBodies) {
      console.debug('[request] raw body:', bodyText);
    }

    if (bodyText === 'null' || bodyText.trim() === '' || bodyText === 'undefined') {
      req.body = {};
    }
  }
}));

// Custom JSON error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON parsing error:', error.message);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    console.error('Request headers:', req.headers);

    // Don't send response if headers already sent
    if (res.headersSent) {
      return next(error);
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      error: error.message,
      url: req.url,
      method: req.method
    });
  }
  next(error);
});
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increased from 10mb for large image uploads

// Compression and logging
app.use(compression());

const requestLogger = isProduction
  ? morgan('combined', { skip: (req, res) => res.statusCode < 400 })
  : morgan('dev');

app.use(requestLogger);

// Static files - serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath, stat, req) => {
    // Set proper content type for images
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.set('Content-Type', 'image/' + path.extname(filePath).slice(1));
    }
    // Allow cross-origin access - use specific origin if available, otherwise allow all
    const origin = req.headers.origin;
    if (origin && (origin.startsWith('http://localhost') || origin.includes('railway.app') || origin.includes('vercel.app'))) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Credentials', 'true');
    } else {
      res.set('Access-Control-Allow-Origin', '*');
    }
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Serve React static files
app.use('/static', express.static('static'));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Image proxy for CORS issues
const { addImageProxy, addFallbackImage } = require('./fix-image-display');
addImageProxy(app);
addFallbackImage(app);

// CSRF token endpoint (must be before CSRF validation)
app.use('/api', csrfRoutes);

// API Routes with CSRF protection for state-changing operations
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, validateCSRF, userRoutes);
app.use('/api/eas', eaRoutes); // Public routes - auth handled per-endpoint
app.use('/api/hft', auth, validateCSRF, hftRoutes);
app.use('/api/signals', auth, validateCSRF, signalRoutes);
app.use('/api/markets', auth, marketRoutes); // Read-only, no CSRF needed
app.use('/api/simple-markets', require('./routes/simpleMarkets')); // Direct API calls, no complex services
app.use('/api/news', auth, newsRoutes); // Read-only, no CSRF needed
app.use('/api/subscriptions', auth, validateCSRF, subscriptionRoutes);
app.use('/api/escrow', auth, validateCSRF, escrowRoutes);
app.use('/api/escrow', escrowWebhookRoutes); // Webhooks don't require auth or CSRF
app.use('/api/payments/crypto', cryptoPaymentRoutes); // MUST come before /api/payments
app.use('/api/payments/paystack', paystackPaymentRoutes); // Dedicated Paystack subscription routes
app.use('/api/payments', auth, validateCSRF, paymentRoutes);
app.use('/api/mpesa', mpesaRoutes); // M-Pesa routes (callback doesn't require auth)
app.use('/api/analysis', auth, analysisRoutes); // Read-only, no CSRF needed
app.use('/api/security', auth, validateCSRF, securityRoutes);
app.use('/api/mt5', mt5Routes);
app.use('/api/polygon', auth, polygonRoutes); // Read-only, no CSRF needed
app.use('/api/portfolio', auth, validateCSRF, portfolioRoutes);
app.use('/api/test', testRoutes); // Test routes for debugging
app.use('/api/admin', adminRoutes); // Admin routes have their own auth middleware
app.use('/api/admin', adminCMSRoutes); // Admin CMS routes
app.use('/api/utilities', require('./routes/utilities')); // Utilities routes (public read, admin write)
app.use('/api/economic-calendar', require('./routes/economic-calendar')); // Economic calendar routes (public)
app.use('/api/custom-ea', auth, validateCSRF, customEARoutes); // Custom EA development service
app.use('/api/ai-assistant', auth, validateCSRF, aiAssistantRoutes); // AI EA Assistant
app.use('/api/downloads', downloadsRoutes); // EA file downloads with token verification


// Health check endpoints moved to top of file (before middleware)


// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Smart Algos Trading Platform API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Serve React app (always serve if build exists)
// Check if React build exists
const buildPath = path.join(__dirname, 'client/build');
const indexPath = path.join(buildPath, 'index.html');

if (fs.existsSync(indexPath)) {
  console.log('📱 Serving React frontend from:', buildPath);

  // Serve static files from React build
  app.use(express.static(buildPath));

  // Handle React routing - return all non-API requests to React app
  app.get('*', (req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith('/api/')) {
      return next();
    }

    // Skip if it's the health endpoint
    if (req.path === '/health') {
      return next();
    }

    res.sendFile(indexPath);
  });
} else {
  console.log('⚠️  React build not found at:', buildPath);
  console.log('💡 Run "npm run build" to create the React build');
}

// Error handling middleware
app.use(errorHandler);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API route not found',
    path: req.originalUrl
  });
});

// Railway startup fix - START SERVER FIRST before any heavy initialization
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');

// Add error handling for server startup
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

if (!process.env.VERCEL) {
  try {
    // Start server FIRST so health check can respond immediately
    server.listen(PORT, HOST, () => {
      console.log(`[startup] Smart Algos API running on http://${HOST}:${PORT}`);
      console.log(`[startup] WebSocket server ready on ws://${HOST}:${PORT}`);
      console.log(`[startup] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[startup] Health check available at /health`);
      console.log(`[startup] Railway deployment ready - health check should respond immediately`);

      // Now initialize database and other services AFTER server is listening
      initializeServices();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize services after server is up (non-blocking for health checks)
function initializeServices() {
  // Supabase connection health-check
  try {
    const supabaseClient = databaseService.getClient();

    if (!supabaseClient) {
      throw new Error('Supabase client unavailable');
    }

    supabaseClient
      .from('users_accounts')
      .select('id', { count: 'exact', head: true })
      .limit(1)
      .then(() => {
        console.log('✅ Connected to Supabase');
      })
      .catch((error) => {
        console.error('⚠️  Supabase connection error:', error.message);
        console.warn('Database operations may be degraded until connectivity is restored.');
      });

    global.supabase = supabaseClient;
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error.message);
    // Don't exit in production - let service run with degraded functionality
    console.warn('Service will continue with limited functionality');
  }

  // Setup WebSocket handlers
  try {
    setupWebSocketHandlers(io);
    console.log('✅ WebSocket handlers initialized');
  } catch (error) {
    console.error('⚠️  WebSocket initialization error:', error.message);
  }
}

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

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  console.error('Promise:', promise);
  // In production, you might want to log to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Don't exit in production, log and continue
    console.error('Application will continue running, but this should be investigated');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Exit process after logging - uncaught exceptions are serious
  if (process.env.NODE_ENV === 'production') {
    console.error('Exiting due to uncaught exception...');
    process.exit(1);
  }
});

module.exports = app;




