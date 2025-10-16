#!/usr/bin/env node

// Minimal Railway server - starts FAST for health checks
console.log('🚀 Starting minimal Railway server...');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// CRITICAL: Health check FIRST - Railway needs this immediately
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 5000,
    message: 'Railway health check responding'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 5000,
    message: 'API health check responding'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Algos Trading Platform',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Start server immediately
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check available at /health and /api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

console.log('✅ Minimal server started successfully');
