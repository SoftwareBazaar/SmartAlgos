#!/usr/bin/env node

// Force Railway to use minimal configuration
const fs = require('fs');

console.log('🚀 Forcing Railway minimal configuration...');

// 1. Replace package.json with minimal version
const minimalPackage = {
  "name": "smart-algos-trading-platform",
  "version": "1.0.0",
  "description": "Smart Algos Trading Platform - Minimal for Railway",
  "main": "railway-full-server.js",
  "scripts": {
    "start": "node railway-full-server.js"
  },
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
    "moment": "^2.29.4",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.7.2",
    "uuid": "^9.0.1",
    "validator": "^13.11.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
};

fs.writeFileSync('package.json', JSON.stringify(minimalPackage, null, 2));
console.log('✅ Replaced package.json with minimal version');

// 2. Create optimized .npmrc
const npmrcContent = `registry=https://registry.npmjs.org/
fund=false
audit=false
progress=false
loglevel=error
cache-min=86400
prefer-offline=true
`;
fs.writeFileSync('.npmrc', npmrcContent);
console.log('✅ Optimized .npmrc created');

// 3. Update nixpacks.toml for faster builds
const nixpacksConfig = `[phases.setup]
nixPkgs = ["nodejs_22", "npm-9_x"]

[phases.install]
cmds = ["npm ci --only=production --silent --no-audit --no-fund"]

[phases.build]
cmds = ["echo 'Build step completed'"]

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
console.log('✅ Optimized nixpacks.toml created');

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

console.log('🎉 Railway minimal configuration complete!');
console.log('');
console.log('Dependencies reduced to 15 essential packages:');
console.log('- @supabase/supabase-js (Database)');
console.log('- express (Web framework)');
console.log('- socket.io (WebSocket)');
console.log('- jsonwebtoken (Authentication)');
console.log('- And 11 other essential packages');
console.log('');
console.log('Next steps:');
console.log('1. Commit: git add . && git commit -m "Force Railway minimal build"');
console.log('2. Push: git push origin master');
console.log('3. Railway will use minimal configuration');
