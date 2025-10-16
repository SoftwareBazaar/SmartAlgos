#!/usr/bin/env node

// Railway startup script - optimized for quick health checks
console.log('🚀 Starting Smart Algos server for Railway...');

// Set environment variables for Railway
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 5000;

// Start the server
require('./server.js');

console.log('✅ Server startup initiated');