const express = require('express');
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
const escrowWebhookRoutes = require('./routes/escrowWebhooks');
const paymentRoutes = require('./routes/payments');
const analysisRoutes = require('./routes/analysis');
const securityRoutes = require('./routes/security');
const mt5Routes = require('./routes/mt5');
const polygonRoutes = require('./routes/polygon');
const portfolioRoutes = require('./routes/portfolio');
const testRoutes = require('./routes/test');
const adminRoutes = require('./admin-panel');
const adminCMSRoutes = require('./routes/admin-cms');

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
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "https://web-production-fdb58.up.railway.app",
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

    if (matchesAllowed) {
      return callback(null, true);
    }

    if (!isProduction && origin.startsWith("http://localhost")) {
      return callback(null, true);
    }

    if (vercelUrl && origin === vercelUrl) {
      return callback(null, true);
    }

    if (railwayUrl && origin === railwayUrl) {
      return callback(null, true);
    }

    console.warn(`[cors] Blocked request from origin ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

const shouldLogRequestBodies = process.env.LOG_REQUEST_BODIES === "true" && !isProduction;

app.set("trust proxy", 1);

// Enhanced Security middleware
app.use(securityService.getSecurityHeaders());

// Global rate limiting (more lenient in development)
const globalLimiter = securityService.createRateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: isProduction ? (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100) : 1000, // 1000 requests in dev
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return !isProduction && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === 'localhost');
  }
});
app.use(globalLimiter);

// Authentication rate limiting
const authLimiter = securityService.createAuthRateLimit();
app.use('/api/auth', authLimiter);

// Input sanitization
app.use(sanitizeInput);

// Threat detection
app.use(detectThreats);

// Baseline security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware with better error handling
app.use(express.json({
  limit: '10mb',
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
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression and logging
app.use(compression());

const requestLogger = isProduction
  ? morgan('combined', { skip: (req, res) => res.statusCode < 400 })
  : morgan('dev');

app.use(requestLogger);

// Static files
app.use('/uploads', express.static('uploads'));

// Serve React static files
app.use('/static', express.static('static'));

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
app.use('/api/escrow', escrowWebhookRoutes); // Webhooks don't require auth
app.use('/api/payments', auth, paymentRoutes);
app.use('/api/analysis', auth, analysisRoutes);
app.use('/api/security', auth, securityRoutes);
app.use('/api/mt5', mt5Routes);
app.use('/api/polygon', auth, polygonRoutes);
app.use('/api/portfolio', auth, portfolioRoutes);
app.use('/api/test', testRoutes); // Test routes for debugging
app.use('/api/admin', adminRoutes); // Admin routes have their own auth middleware
app.use('/api/admin', adminCMSRoutes); // Admin CMS routes
app.use('/api/utilities', require('./routes/utilities')); // Utilities routes (public read, admin write)


// Health check endpoints (must be defined before React catch-all)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Railway healthcheck endpoint'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});


// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Smart Algos Trading Platform API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Serve React app (always serve if build exists)
const path = require('path');
const fs = require('fs');

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
      console.log('? Connected to Supabase');
    })
    .catch((error) => {
      console.error('??  Supabase connection error:', error.message);
      console.warn('Database operations may be degraded until connectivity is restored.');
    });

  global.supabase = supabaseClient;
} catch (error) {
  console.error('? Supabase initialization failed:', error.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Setup WebSocket handlers
setupWebSocketHandlers(io);


// Railway startup fix - ensure server starts even with missing env vars
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');

// Add error handling for server startup
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

if (!process.env.VERCEL) {
  try {
    server.listen(PORT, HOST, () => {
      console.log(`[startup] Smart Algos API running on http://${HOST}:${PORT}`);
      console.log(`[startup] WebSocket server ready on ws://${HOST}:${PORT}`);
      console.log(`[startup] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[startup] Railway deployment ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
// Graceful shutdown
// Graceful shutdown
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




