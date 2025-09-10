const securityService = require('../services/securityService');
const databaseService = require('../services/databaseService');

// ==================== SECURITY MIDDLEWARE ====================

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = securityService.sanitizeInput(req.body[key]);
        }
      }
    }

    // Sanitize query parameters
    if (req.query) {
      for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
          req.query[key] = securityService.sanitizeInput(req.query[key]);
        }
      }
    }

    // Sanitize params
    if (req.params) {
      for (const key in req.params) {
        if (typeof req.params[key] === 'string') {
          req.params[key] = securityService.sanitizeInput(req.params[key]);
        }
      }
    }

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid input data'
    });
  }
};

// Threat detection middleware
const detectThreats = (req, res, next) => {
  try {
    if (securityService.detectSuspiciousActivity(req, req.user)) {
      securityService.logSecurityEvent('threat_detected', {
        ip: securityService.getClientIP(req),
        userAgent: req.headers['user-agent'],
        userId: req.user?._id,
        path: req.path,
        method: req.method
      });

      return res.status(403).json({
        success: false,
        message: 'Request blocked due to security policy'
      });
    }

    next();
  } catch (error) {
    console.error('Threat detection error:', error);
    next();
  }
};

// IP whitelist middleware
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    try {
      const clientIP = securityService.getClientIP(req);
      
      if (!securityService.isIPAllowed(clientIP, allowedIPs)) {
        securityService.logSecurityEvent('ip_blocked', {
          ip: clientIP,
          path: req.path,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied from this IP address'
        });
      }

      next();
    } catch (error) {
      console.error('IP whitelist error:', error);
      next();
    }
  };
};

// IP blacklist middleware
const ipBlacklist = (blockedIPs = []) => {
  return (req, res, next) => {
    try {
      const clientIP = securityService.getClientIP(req);
      
      if (securityService.isIPBlocked(clientIP, blockedIPs)) {
        securityService.logSecurityEvent('blocked_ip_access', {
          ip: clientIP,
          path: req.path,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      next();
    } catch (error) {
      console.error('IP blacklist error:', error);
      next();
    }
  };
};

// Permission-based access control
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userPermissions = req.user.permissions || [];
      
      if (!securityService.hasPermission(userPermissions, permission)) {
        securityService.logSecurityEvent('permission_denied', {
          userId: req.user._id,
          permission,
          path: req.path,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// API key validation middleware
const validateAPIKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    if (!securityService.validateAPIKey(apiKey)) {
      securityService.logSecurityEvent('invalid_api_key', {
        ip: securityService.getClientIP(req),
        apiKey: apiKey.substring(0, 8) + '...',
        path: req.path
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      message: 'API key validation failed'
    });
  }
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  try {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
      return next();
    }

    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;

    if (!csrfToken || !sessionToken) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token required'
      });
    }

    if (!securityService.validateCSRFToken(csrfToken, sessionToken)) {
      securityService.logSecurityEvent('csrf_attack', {
        ip: securityService.getClientIP(req),
        userId: req.user?._id,
        path: req.path
      });

      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token'
      });
    }

    next();
  } catch (error) {
    console.error('CSRF protection error:', error);
    res.status(500).json({
      success: false,
      message: 'CSRF validation failed'
    });
  }
};

// File upload security middleware
const secureFileUpload = (options = {}) => {
  const {
    allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    maxSize = 10 * 1024 * 1024, // 10MB
    maxFiles = 5
  } = options;

  return (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      // Check number of files
      if (req.files.length > maxFiles) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxFiles} files allowed`
        });
      }

      // Validate each file
      for (const file of req.files) {
        // Check file type
        if (!securityService.validateFileType(file.originalname, allowedTypes)) {
          securityService.logSecurityEvent('invalid_file_type', {
            userId: req.user?._id,
            filename: file.originalname,
            type: file.mimetype
          });

          return res.status(400).json({
            success: false,
            message: 'Invalid file type'
          });
        }

        // Check file size
        if (!securityService.validateFileSize(file.size, maxSize)) {
          securityService.logSecurityEvent('file_too_large', {
            userId: req.user?._id,
            filename: file.originalname,
            size: file.size
          });

          return res.status(400).json({
            success: false,
            message: 'File too large'
          });
        }

        // Sanitize filename
        file.originalname = securityService.sanitizeFilename(file.originalname);
      }

      next();
    } catch (error) {
      console.error('File upload security error:', error);
      res.status(500).json({
        success: false,
        message: 'File upload validation failed'
      });
    }
  };
};

// Account lockout middleware
const accountLockout = (maxAttempts = 5, lockoutDuration = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    try {
      const identifier = req.body.email || req.body.username || securityService.getClientIP(req);
      const now = Date.now();
      
      const userAttempts = attempts.get(identifier) || { count: 0, lastAttempt: 0, lockedUntil: 0 };

      // Check if account is locked
      if (userAttempts.lockedUntil > now) {
        const remainingTime = Math.ceil((userAttempts.lockedUntil - now) / 1000 / 60);
        
        securityService.logSecurityEvent('account_locked', {
          identifier,
          remainingTime,
          ip: securityService.getClientIP(req)
        });

        return res.status(423).json({
          success: false,
          message: `Account locked. Try again in ${remainingTime} minutes.`
        });
      }

      // Reset attempts if lockout period has passed
      if (userAttempts.lastAttempt + lockoutDuration < now) {
        userAttempts.count = 0;
        userAttempts.lockedUntil = 0;
      }

      req.accountLockout = {
        identifier,
        attempts: userAttempts,
        isLocked: userAttempts.lockedUntil > now
      };

      next();
    } catch (error) {
      console.error('Account lockout error:', error);
      next();
    }
  };
};

// Update lockout attempts
const updateLockoutAttempts = (req, success = false) => {
  try {
    if (!req.accountLockout) return;

    const { identifier, attempts } = req.accountLockout;
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes

    if (success) {
      // Reset attempts on successful login
      attempts.count = 0;
      attempts.lockedUntil = 0;
    } else {
      // Increment failed attempts
      attempts.count += 1;
      attempts.lastAttempt = Date.now();

      if (attempts.count >= 5) {
        attempts.lockedUntil = Date.now() + lockoutDuration;
        
        securityService.logSecurityEvent('account_locked_out', {
          identifier,
          attempts: attempts.count,
          ip: securityService.getClientIP(req)
        });
      }
    }

    // Store updated attempts
    const attemptsMap = require('../services/securityService').attempts || new Map();
    attemptsMap.set(identifier, attempts);
  } catch (error) {
    console.error('Update lockout attempts error:', error);
  }
};

// Data integrity middleware
const validateDataIntegrity = (req, res, next) => {
  try {
    const checksum = req.headers['x-data-checksum'];
    
    if (checksum && req.body) {
      const calculatedChecksum = securityService.generateChecksum(req.body);
      
      if (!securityService.verifyChecksum(req.body, checksum)) {
        securityService.logSecurityEvent('data_integrity_failed', {
          userId: req.user?._id,
          ip: securityService.getClientIP(req),
          path: req.path
        });

        return res.status(400).json({
          success: false,
          message: 'Data integrity check failed'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Data integrity validation error:', error);
    next();
  }
};

// Session security middleware
const secureSession = (req, res, next) => {
  try {
    // Regenerate session ID on login
    if (req.session && req.user && !req.session.regenerated) {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return next();
        }
        
        req.session.regenerated = true;
        req.session.userId = req.user._id;
        req.session.csrfToken = securityService.generateCSRFToken();
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    console.error('Session security error:', error);
    next();
  }
};

// Audit logging middleware
const auditLog = (action) => {
  return (req, res, next) => {
    try {
      const originalSend = res.send;
      
      res.send = function(data) {
        // Log the action after response is sent
        securityService.logSecurityEvent('audit_log', {
          action,
          userId: req.user?._id,
          ip: securityService.getClientIP(req),
          userAgent: req.headers['user-agent'],
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString()
        });

        originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Audit logging error:', error);
      next();
    }
  };
};

// Enhanced authentication middleware
const enhancedAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = securityService.verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      securityService.logSecurityEvent('invalid_token', {
        userId: decoded.userId,
        ip: securityService.getClientIP(req)
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Add user permissions to request
    user.permissions = securityService.getUserPermissions(user);
    req.user = user;
    
    next();
  } catch (error) {
    securityService.logSecurityEvent('auth_error', {
      error: error.message,
      ip: securityService.getClientIP(req)
    });

    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = {
  sanitizeInput,
  detectThreats,
  ipWhitelist,
  ipBlacklist,
  requirePermission,
  validateAPIKey,
  csrfProtection,
  secureFileUpload,
  accountLockout,
  updateLockoutAttempts,
  validateDataIntegrity,
  secureSession,
  auditLog,
  enhancedAuth
};
