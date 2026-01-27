#!/usr/bin/env node

// Fix package.json with correct dependencies
const fs = require('fs');

console.log('🔧 Fixing package.json dependencies...');

// Corrected package.json with all actually used dependencies
const correctedPackage = {
  "name": "smart-algos-trading-platform",
  "version": "1.0.0",
  "description": "Smart Algos Trading Platform - Corrected for Railway",
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
    "node-cron": "^3.0.2",
    "nodemailer": "^7.0.9",
    "qrcode": "^1.5.4",
    "socket.io": "^4.7.2",
    "uuid": "^9.0.1",
    "validator": "^13.11.0",
    "ws": "^8.14.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
};

// Write corrected package.json
fs.writeFileSync('package.json', JSON.stringify(correctedPackage, null, 2));
console.log('✅ Corrected package.json created with all required dependencies');

// Update nixpacks.toml to be more permissive
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
console.log('✅ Updated nixpacks.toml');

console.log('🎉 Package dependencies fixed!');
console.log('');
console.log('Dependencies included (22 packages):');
console.log('- @supabase/supabase-js (Database)');
console.log('- express, cors, helmet (Web framework)');
console.log('- socket.io, ws (WebSocket support)');
console.log('- jsonwebtoken, bcryptjs (Authentication)');
console.log('- multer (File uploads)');
console.log('- nodemailer (Email)');
console.log('- qrcode (QR codes)');
console.log('- node-cron (Scheduled tasks)');
console.log('- And 13 other essential packages');
console.log('');
console.log('Next steps:');
console.log('1. Commit: git add . && git commit -m "Fix missing dependencies"');
console.log('2. Push: git push origin master');
console.log('3. Railway should now build successfully');
