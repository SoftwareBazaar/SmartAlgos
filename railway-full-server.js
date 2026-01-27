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
  // CSP is now handled by Helmet middleware globally
  res.status(200).json({
    status: 'OK',
    version: 'v2.1-CSP-HELMET-REFINED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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

  // LOGGING MIDDLEWARE - To debug CSP issues
  app.use((req, res, next) => {
    console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Intercept header setting to log CSP
    const originalSetHeader = res.setHeader;
    res.setHeader = function (name, value) {
      if (name.toLowerCase() === 'content-security-policy') {
        console.log(`🔒 [CSP] Setting CSP for ${req.url}`);
        // Log a summary of the CSP to avoid flooding logs
        const summary = value.split(';').map(s => s.trim().split(' ')[0]).join(', ');
        console.log(`🔒 [CSP] Directives: ${summary}`);
      }
      return originalSetHeader.apply(this, arguments);
    };
    next();
  });

  // Basic middleware
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.PUBLIC_URL,
    'http://localhost:3000',
    'http://localhost:5000',
    'https://localhost:3000',
    'https://localhost:5000',
    'https://smartalgosts.com',
    'https://www.smartalgosts.com'
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          // Allow non-browser (curl/postman) or same-origin requests
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Also allow subdomains of Railway app (custom domains)
        if (/\.up\.railway\.app$/.test(origin.replace(/^https?:\/\//, ''))) {
          return callback(null, true);
        }

        console.warn(`[CORS] Blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token'
      ],
      exposedHeaders: ['Set-Cookie'],
      optionsSuccessStatus: 204
    })
  );

  // STRUCTURED CSP CONFIGURATION - Using Helmet
  app.use(helmet({
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
          "https://connect.facebook.net", // Common tracker causing issues
          "https://*.google.com",
          "https://*.gstatic.com"
        ],
        // Removed scriptSrcElem to avoid 'invalid path' errors with rigorous browsers
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
          "https://*.supabase.co"             // Supabase Storage
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        upgradeInsecureRequests: [],
      }
    },
    crossOriginEmbedderPolicy: false,          // Allow external resources
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  app.use(compression());
  app.use(morgan('combined'));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize Socket.IO with CORS allowing our frontend
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'https://smartalgosts.com',
        'https://www.smartalgosts.com'
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

  // CRITICAL: Load CSRF routes FIRST and register immediately
  let csrfRoutes = null;
  try {
    console.log('   Loading CSRF routes...');
    csrfRoutes = require('./routes/csrf');
    app.use('/api', csrfRoutes);
    console.log('   ✅ CSRF routes loaded and registered');
  } catch (error) {
    console.error('❌ CRITICAL: CSRF routes failed to load:', error.message);
  }

  // Load auth middleware early
  let auth = null;
  try {
    console.log('   Loading auth middleware...');
    const authModule = require('./middleware/auth');
    auth = authModule.auth;
    console.log('   ✅ Auth middleware loaded');
  } catch (error) {
    console.error('❌ CRITICAL: Auth middleware failed to load:', error.message);
  }

  try {
    console.log('📦 Loading route modules...');

    console.log('   Loading auth routes...');
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('   ✅ Auth routes loaded and registered');

    console.log('   Loading user routes...');
    const usersRoutes = require('./routes/users');
    app.use('/api/users', usersRoutes);
    console.log('   ✅ User routes loaded and registered');

    console.log('   Loading EA routes...');
    const eaRoutes = require('./routes/eas');
    app.use('/api/eas', eaRoutes);
    console.log('   ✅ EA routes loaded and registered');

    console.log('   Loading subscription routes...');
    const subscriptionRoutes = require('./routes/subscriptions');
    app.use('/api/subscriptions', subscriptionRoutes);
    console.log('   ✅ Subscription routes loaded and registered');

    console.log('   Loading downloads routes...');
    const downloadsRoutes = require('./routes/downloads');
    app.use('/api/downloads', downloadsRoutes);
    console.log('   ✅ Downloads routes loaded and registered');

    console.log('   Loading crypto payment routes...');
    const cryptoPaymentRoutes = require('./routes/cryptoPayments');
    app.use('/api/payments/crypto', cryptoPaymentRoutes);
    console.log('   ✅ Crypto payment routes loaded and registered');

    console.log('   Loading Paystack payment routes...');
    const paystackPaymentRoutes = require('./routes/paystackPayments');
    app.use('/api/payments/paystack', paystackPaymentRoutes);
    console.log('   ✅ Paystack payment routes loaded and registered');

    console.log('   Loading test email route...');
    const testEmailRoute = require('./routes/testEmail');
    app.use('/api/test-email', testEmailRoute);
    console.log('   ✅ Test email route loaded and registered');

    console.log('   Loading payment routes...');
    const paymentRoutes = require('./routes/payments');
    app.use('/api/payments', paymentRoutes);
    console.log('   ✅ Payment routes loaded and registered');

    console.log('   Loading M-Pesa routes...');
    const mpesaRoutes = require('./routes/mpesa');
    app.use('/api/mpesa', mpesaRoutes);
    console.log('   ✅ M-Pesa routes loaded and registered');

    console.log('   Loading portfolio routes...');
    const portfolioRoutes = require('./routes/portfolio');
    app.use('/api/portfolio', portfolioRoutes);
    console.log('   ✅ Portfolio routes loaded and registered');

    console.log('   Loading analysis routes...');
    const analysisRoutes = require('./routes/analysis');
    if (auth) {
      app.use('/api/analysis', auth, analysisRoutes);
      console.log('   ✅ Analysis routes loaded and registered (with auth)');
    } else {
      app.use('/api/analysis', analysisRoutes);
      console.log('   ⚠️  Analysis routes loaded without auth middleware');
    }

    console.log('   Loading admin routes...');
    const adminRoutes = require('./admin-panel');
    app.use('/api/admin', adminRoutes);
    console.log('   ✅ Admin routes loaded and registered');

    console.log('✅ Essential routes loaded and registered');
    console.log('   - /api/csrf-token (CSRF routes)');
    console.log('   - /api/auth');
    console.log('   - /api/users');
    console.log('   - /api/eas');
    console.log('   - /api/subscriptions');
    console.log('   - /api/downloads');
    console.log('   - /api/payments/crypto');
    console.log('   - /api/payments');
    console.log('   - /api/mpesa');
    console.log('   - /api/portfolio');
    console.log('   - /api/analysis');
    console.log('   - /api/admin');
  } catch (error) {
    console.error('❌ CRITICAL: Routes loading error:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Full error object:', error);
    // Don't throw - let healthcheck still work, but log detailed error
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
  try {
    console.log('📦 Loading utilities routes...');
    const utilitiesRoutes = require('./routes/utilities');
    app.use('/api/utilities', utilitiesRoutes);
    console.log('✅ Utilities routes loaded');
    console.log('   - POST /api/utilities/upload-image');
    console.log('   - GET /api/utilities');
    console.log('   - POST /api/utilities');
    console.log('   - PUT /api/utilities/:id');
    console.log('   - DELETE /api/utilities/:id');
  } catch (error) {
    console.error('❌ CRITICAL: Utilities routes failed to load!');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error stack:', error.stack);
    // Create a basic fallback route
    app.post('/api/utilities/upload-image', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Utilities routes not loaded - check server logs'
      });
    });
  }

  // Load custom EA routes
  try {
    console.log('📦 Loading custom EA routes...');
    const customEARoutes = require('./routes/customEA');
    app.use('/api/custom-ea', customEARoutes);
    console.log('✅ Custom EA routes loaded');
  } catch (error) {
    console.error('❌ Custom EA routes failed to load:', error.message);
    console.error('❌ Stack:', error.stack);
  }

  // Load image proxy routes (CRITICAL for utility images)
  try {
    console.log('🖼️  Loading image proxy routes...');
    const imagesRoutes = require('./routes/images');
    app.use('/api/images', imagesRoutes);
    console.log('✅ Image proxy routes loaded');
    console.log('   - GET /api/images/proxy?url=...');
    console.log('   - GET /api/images/fallback/:type');
  } catch (error) {
    console.error('❌ CRITICAL: Image proxy routes failed to load!');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    // Create basic fallback
    app.get('/api/images/proxy', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Image proxy not available - check server logs'
      });
    });
  }

  // 404 handler for API routes - MUST be BEFORE frontend catch-all
  // This catches any unmatched API routes
  app.use('/api/*', (req, res) => {
    console.warn(`⚠️  API route not found: ${req.method} ${req.path}`);
    res.status(404).json({
      success: false,
      message: 'API route not found',
      path: req.path,
      method: req.method
    });
  });

  // ========================================
  // FRONTEND SERVING - Serve React app
  // ========================================
  console.log('Configuring frontend serving...');

  // Check if client build exists
  const clientBuildPath = path.join(__dirname, 'client', 'build');
  const clientBuildExists = fs.existsSync(clientBuildPath);

  if (clientBuildExists) {
    console.log('✅ Client build found, serving React app');

    // Serve static files from React build (CSS, JS, images, etc.)
    app.use(express.static(clientBuildPath));

    // Handle React routing - serve index.html for all non-API routes
    // This MUST be LAST, after all API routes
    app.get('*', (req, res) => {
      // Double-check: don't serve index.html for API routes
      if (req.path.startsWith('/api/')) {
        // This should never happen since API 404 handler is above
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

// Ensure London Breakout Bot exists in database
const ensureLondonBreakoutBot = async () => {
  try {
    const databaseService = require('./services/databaseService');
    const eas = await databaseService.getEAs({ search: 'London Breakout' });

    console.log(`[Startup] Found ${eas.length} London Breakout Bot(s)`);

    if (eas.length === 0) {
      console.log('🚀 [Startup] London Breakout Bot not found, injecting...');
      const botData = {
        name: "London Breakout Bot v1.0",
        description: "High-performance session breakout strategy for Gold, US30, and Nasdaq. Automatically captures volatility at 10:00 AM London open.",
        category: "trend",
        price_weekly: 10.00,
        price_monthly: 29.00,
        price_yearly: 199.00,
        win_rate: 72,
        max_drawdown: 8.5,
        supported_pairs: ['XAUUSD', 'US30', 'NAS100'],
        timeframes: ['M15', 'M30'],
        version: "1.0.0",
        strategy_type: "trend",
        ea_file_path: "/uploads/LondonBreakoutv1.ex4",
        set_file_path: "/uploads/LondonBreakout.set",
        manual_file_path: "/uploads/LondonBreakout_Manual.pdf",
        is_active: true,
        status: "approved",
        image: "https://placehold.co/600x400/10b981/ffffff?text=London+Breakout+Bot",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await databaseService.createEA(botData);
      console.log('✅ [Startup] London Breakout Bot injected successfully');
    } else {
      const existingBot = eas[0];
      console.log(`✅ [Startup] London Breakout Bot exists (ID: ${existingBot.id})`);
      console.log(`   - Image: ${existingBot.image || 'None'}`);
      console.log(`   - Files: EA=${!!existingBot.ea_file_path}, Set=${!!existingBot.set_file_path}`);

      const updates = {};

      // Self-heal: Fix broken placeholder image
      if (existingBot.image && existingBot.image.includes('placeholder-breakout.png')) {
        console.log('⚠️ [Startup] Detected broken placeholder image. Fixing...');
        updates.image = "https://placehold.co/600x400/10b981/ffffff?text=London+Breakout+Bot";
      }

      // Self-heal: Missing file paths
      if (!existingBot.ea_file_path || !existingBot.set_file_path || !existingBot.manual_file_path) {
        console.log('⚠️ [Startup] Missing file paths detected. Fixing...');
        updates.ea_file_path = "/uploads/LondonBreakoutv1.ex4";
        updates.set_file_path = "/uploads/LondonBreakout.set";
        updates.manual_file_path = "/uploads/LondonBreakout_Manual.pdf";
        updates.version = existingBot.version || "1.0.0";
        updates.strategy_type = existingBot.strategy_type || "trend";
      }

      if (Object.keys(updates).length > 0) {
        await databaseService.updateEA(existingBot.id, updates);
        console.log('✅ [Startup] London Breakout Bot healed with updates:', Object.keys(updates));
      } else {
        console.log('✅ [Startup] London Breakout Bot is healthy');
      }
    }
  } catch (error) {
    console.error('⚠️ [Startup] Failed to ensure London Breakout Bot:', error.message);
  }
};

// Set server timeout for long-running operations
server.timeout = 60000; // 60 seconds

server.listen(PORT, HOST, async () => {
  console.log(`✅ Smart Algos API running on http://${HOST}:${PORT}`);
  console.log(`📁 Health check available at /api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Railway deployment ready - health check should respond immediately`);

  // Check email service configuration
  console.log('\n📧 Checking Email Service Configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? `✅ ${process.env.EMAIL_USER}` : '❌ NOT SET');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com (default)');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '587 (default)');
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('✅ Email service is configured and ready');
    console.log('📬 Emails will be sent from:', process.env.EMAIL_USER);
  } else {
    console.warn('⚠️ Email service NOT configured - emails will not be sent');
    console.warn('💡 Add EMAIL_USER and EMAIL_PASSWORD to Railway variables');
  }
  console.log('');

  // Run bot injection after server is up
  await ensureLondonBreakoutBot();
});
