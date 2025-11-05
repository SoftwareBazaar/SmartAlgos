const express = require('express');
const router = express.Router();
const securityService = require('../services/securityService');

// In-memory CSRF token store (in production, use Redis or database)
const csrfTokens = new Map();

// Clean up old tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(token);
    }
  }
}, 5 * 60 * 1000);

// @route   GET /api/csrf-token
// @desc    Get CSRF token for form submissions
// @access  Public
router.get('/csrf-token', (req, res) => {
  try {
    const token = securityService.generateCSRFToken();
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour expiry
    
    // Store token with expiry
    csrfTokens.set(token, {
      expires,
      createdAt: Date.now()
    });
    
    res.json({
      success: true,
      csrfToken: token,
      expiresIn: 3600 // seconds
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSRF token'
    });
  }
});

// Middleware to validate CSRF token
const validateCSRF = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Skip CSRF for health checks and public endpoints
  if (req.path === '/health' || req.path === '/api/health' || req.path === '/api/csrf-token') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;
  
  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token required'
    });
  }

  // Check if token exists and is valid
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    securityService.logSecurityEvent('csrf_attack', {
      ip: securityService.getClientIP(req),
      path: req.path,
      reason: 'invalid_token'
    });
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  // Check if token expired
  if (Date.now() > tokenData.expires) {
    csrfTokens.delete(token);
    securityService.logSecurityEvent('csrf_attack', {
      ip: securityService.getClientIP(req),
      path: req.path,
      reason: 'expired_token'
    });
    return res.status(403).json({
      success: false,
      message: 'CSRF token expired'
    });
  }

  // Token is valid, continue
  next();
};

module.exports = router;
module.exports.validateCSRF = validateCSRF;

