#!/usr/bin/env node

// Railway-optimized startup script
console.log('🚀 Starting Smart Algos on Railway...');

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server
require('./railway-full-server.js');
