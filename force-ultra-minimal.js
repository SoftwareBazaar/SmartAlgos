#!/usr/bin/env node

// Force ultra-minimal Railway configuration
const fs = require('fs');

console.log('🚀 Forcing ultra-minimal Railway configuration...');

// 1. Ultra-minimal package.json (15 packages only)
const ultraMinimalPackage = {
  "name": "smart-algos-trading-platform",
  "version": "1.0.0",
  "description": "Smart Algos Trading Platform - Ultra Minimal for Railway",
  "main": "railway-full-server.js",
  "scripts": {
    "start": "node railway-full-server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.7.2",
    "uuid": "^9.0.1",
    "validator": "^13.11.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
};

fs.writeFileSync('package.json', JSON.stringify(ultraMinimalPackage, null, 2));
console.log('✅ Ultra-minimal package.json created (15 packages only)');

// 2. Create ultra-optimized .npmrc
const npmrcContent = `registry=https://registry.npmjs.org/
fund=false
audit=false
progress=false
loglevel=error
cache-min=86400
prefer-offline=true
engine-strict=false
`;
fs.writeFileSync('.npmrc', npmrcContent);
console.log('✅ Ultra-optimized .npmrc created');

// 3. Create ultra-simple nixpacks.toml
const nixpacksConfig = `[phases.setup]
nixPkgs = ["nodejs_22", "npm-9_x"]

[phases.install]
cmds = ["npm install --production --silent --no-audit --no-fund"]

[phases.build]
cmds = ["echo 'Build completed successfully'"]

[start]
cmd = "node railway-full-server.js"

[variables]
NODE_ENV = "production"
NPM_CONFIG_PRODUCTION = "true"
NPM_CONFIG_AUDIT = "false"
NPM_CONFIG_FUND = "false"
NPM_CONFIG_LOGLEVEL = "error"
`;

fs.writeFileSync('nixpacks.toml', nixpacksConfig);
console.log('✅ Ultra-simple nixpacks.toml created');

// 4. Create minimal railway.json
const railwayConfig = {
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node railway-full-server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
};

fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
console.log('✅ Minimal railway.json created');

// 5. Create a simplified server file that doesn't use problematic dependencies
const simplifiedServer = `#!/usr/bin/env node

// Ultra-minimal server for Railway
console.log('🚀 Starting Smart Algos Ultra-Minimal Server...');

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

const app = express();
const server = createServer(app);

// Ultra-lightweight health check FIRST
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

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Algos Trading Platform - Ultra Minimal',
    status: 'OK',
    timestamp: new Date().toISOString()
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

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(\`✅ Ultra-minimal server running on http://\${HOST}:\${PORT}\`);
  console.log(\`📁 Health check: http://\${HOST}:\${PORT}/api/health\`);
});
`;

fs.writeFileSync('server-minimal.js', simplifiedServer);
console.log('✅ Simplified server created');

console.log('🎉 Ultra-minimal configuration complete!');
console.log('');
console.log('Dependencies reduced to 15 essential packages:');
console.log('- @supabase/supabase-js (Database)');
console.log('- express (Web framework)');
console.log('- cors, helmet, compression (Middleware)');
console.log('- socket.io (WebSocket)');
console.log('- jsonwebtoken, bcryptjs (Authentication)');
console.log('- multer (File uploads)');
console.log('- And 8 other essential packages');
console.log('');
console.log('Removed problematic dependencies:');
console.log('- lodash (using native JS)');
console.log('- node-cron (using native timers)');
console.log('- nodemailer (using external service)');
console.log('- qrcode (using external service)');
console.log('- ws (using socket.io)');
console.log('- axios (using fetch)');
console.log('- moment (using native Date)');
console.log('');
console.log('Next steps:');
console.log('1. Commit: git add . && git commit -m "Ultra-minimal Railway config"');
console.log('2. Push: git push origin master');
console.log('3. Railway should now build successfully');
