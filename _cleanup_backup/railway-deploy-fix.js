#!/usr/bin/env node

// Railway Deployment Fix Script
// This script optimizes the deployment process for Railway

const fs = require('fs');
const path = require('path');

console.log('🚀 Railway Deployment Fix Starting...');

// 1. Create optimized package.json for Railway
const optimizedPackageJson = {
  "name": "smart-algos-trading-platform",
  "version": "1.0.0",
  "description": "Comprehensive algorithmic trading and investment solutions platform",
  "main": "server.js",
  "scripts": {
    "start": "node railway-full-server.js",
    "build": "echo 'Build step skipped for Railway'",
    "prestart": "node ensure-upload-dirs.js"
  },
  "keywords": [
    "trading",
    "algorithmic-trading",
    "forex",
    "cryptocurrency",
    "stock-analysis",
    "ai-signals",
    "investment"
  ],
  "author": "Smart Algos Team",
  "license": "MIT",
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "axios": "^1.5.0",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.2",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.2",
    "nodemailer": "^7.0.9",
    "qrcode": "^1.5.4",
    "socket.io": "^4.7.2",
    "uuid": "^9.0.1",
    "validator": "^13.11.0",
    "ws": "^8.14.2"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
};

// 2. Write optimized package.json
fs.writeFileSync('package.json', JSON.stringify(optimizedPackageJson, null, 2));
console.log('✅ Optimized package.json created');

// 3. Create .npmrc for faster installs
const npmrcContent = `registry=https://registry.npmjs.org/
fund=false
audit=false
progress=false
loglevel=error
`;
fs.writeFileSync('.npmrc', npmrcContent);
console.log('✅ .npmrc created for faster installs');

// 4. Create Railway-specific start script
const railwayStartScript = `#!/usr/bin/env node

// Railway-optimized startup script
console.log('🚀 Starting Smart Algos on Railway...');

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server
require('./railway-full-server.js');
`;

fs.writeFileSync('start-railway.js', railwayStartScript);
console.log('✅ Railway start script created');

// 5. Update railway.json for better build process
const railwayConfig = {
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci --only=production"
  },
  "deploy": {
    "startCommand": "node railway-full-server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
};

fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
console.log('✅ Railway config optimized');

console.log('🎉 Railway deployment fix complete!');
console.log('');
console.log('Next steps:');
console.log('1. Commit these changes: git add . && git commit -m "Fix Railway build timeout"');
console.log('2. Push to GitHub: git push origin master');
console.log('3. Railway will auto-deploy with optimized build process');
