// Vercel Serverless Function entry point
// This wraps the Express app for Vercel's serverless environment

require('dotenv').config();

// Set VERCEL flag so server.js skips calling server.listen()
process.env.VERCEL = '1';

const app = require('../server');

module.exports = app;
