const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');

class SecurityService {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    this.algorithm = 'aes-256-gcm';
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpire = process.env.JWT_EXPIRE || '7d';
  }

  // ==================== ENCRYPTION & DECRYPTION ====================

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('smart-algos', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedData) {
    try {
      const { encrypted, iv, authTag } = encryptedData;
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('smart-algos', 'utf8'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  // ==================== PASSWORD SECURITY ====================

  async hashPassword(password) {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Password hashing failed');
    }
  }

  async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Password verification error:', error);
      throw new Error('Password verification failed');
    }
  }

  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= minLength;

    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough].filter(Boolean).length;
    
    return {
      isValid: score >= 4,
      score,
      requirements: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
        isLongEnough
      }
    };
  }

  // ==================== JWT TOKEN MANAGEMENT ====================

  generateToken(payload, expiresIn = this.jwtExpire) {
    try {
      return jwt.sign(payload, this.jwtSecret, { expiresIn });
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Token generation failed');
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Invalid token');
    }
  }

  generateRefreshToken(userId) {
    const payload = {
      userId,
      type: 'refresh',
      timestamp: Date.now()
    };
    return this.generateToken(payload, '30d');
  }

  generateAccessToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      subscription: user.subscription.type,
      permissions: this.getUserPermissions(user)
    };
    return this.generateToken(payload, '1h');
  }

  // ==================== PERMISSION MANAGEMENT ====================

  getUserPermissions(user) {
    const basePermissions = ['read:profile', 'update:profile'];
    
    switch (user.role) {
      case 'admin':
        return [
          ...basePermissions,
          'read:all', 'write:all', 'delete:all',
          'manage:users', 'manage:content', 'manage:payments',
          'view:analytics', 'manage:system'
        ];
      case 'moderator':
        return [
          ...basePermissions,
          'read:users', 'manage:content', 'view:analytics'
        ];
      case 'creator':
        return [
          ...basePermissions,
          'create:ea', 'create:hft', 'create:signals',
          'manage:own_content', 'view:own_analytics'
        ];
      case 'user':
        return [
          ...basePermissions,
          'subscribe:services', 'view:market_data'
        ];
      default:
        return basePermissions;
    }
  }

  hasPermission(userPermissions, requiredPermission) {
    return userPermissions.includes(requiredPermission) || userPermissions.includes('admin');
  }

  // ==================== INPUT VALIDATION & SANITIZATION ====================

  sanitizeInput(input) {
    if (typeof input === 'string') {
      return validator.escape(input.trim());
    }
    return input;
  }

  validateEmail(email) {
    return validator.isEmail(email) && email.length <= 254;
  }

  validatePhoneNumber(phone) {
    return validator.isMobilePhone(phone, 'any');
  }

  validateURL(url) {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true
    });
  }

  validateMongoId(id) {
    return validator.isMongoId(id);
  }

  // ==================== RATE LIMITING ====================

  createRateLimit(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      ...options
    };

    return rateLimit(defaultOptions);
  }

  createStrictRateLimit(options = {}) {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        message: 'Too many attempts, please try again later.'
      },
      ...options
    });
  }

  createAuthRateLimit() {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
      }
    });
  }

  // ==================== SECURITY HEADERS ====================

  getSecurityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "wss:", "https:"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  // ==================== SESSION SECURITY ====================

  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  validateCSRFToken(token, sessionToken) {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  }

  // ==================== API SECURITY ====================

  validateAPIKey(apiKey) {
    // In production, validate against database
    const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
    return validKeys.includes(apiKey);
  }

  generateAPIKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // ==================== FILE UPLOAD SECURITY ====================

  validateFileType(filename, allowedTypes = []) {
    const extension = filename.split('.').pop().toLowerCase();
    return allowedTypes.includes(extension);
  }

  validateFileSize(size, maxSize = 10 * 1024 * 1024) { // 10MB default
    return size <= maxSize;
  }

  sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  // ==================== IP & GEO SECURITY ====================

  isIPAllowed(ip, allowedIPs = []) {
    if (allowedIPs.length === 0) return true;
    return allowedIPs.includes(ip);
  }

  isIPBlocked(ip, blockedIPs = []) {
    return blockedIPs.includes(ip);
  }

  getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           'unknown';
  }

  // ==================== AUDIT LOGGING ====================

  logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: this.getEventSeverity(event)
    };

    // In production, send to security monitoring system
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
  }

  getEventSeverity(event) {
    const highSeverityEvents = [
      'login_failed_multiple',
      'suspicious_activity',
      'unauthorized_access',
      'data_breach_attempt'
    ];

    const mediumSeverityEvents = [
      'login_failed',
      'password_change',
      'permission_denied',
      'rate_limit_exceeded'
    ];

    if (highSeverityEvents.includes(event)) return 'HIGH';
    if (mediumSeverityEvents.includes(event)) return 'MEDIUM';
    return 'LOW';
  }

  // ==================== THREAT DETECTION ====================

  detectSuspiciousActivity(req, user = null) {
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /<script/i,
      /eval\(/i,
      /expression\(/i,
      /vbscript/i,
      /onload/i,
      /onerror/i
    ];

    const userAgent = req.headers['user-agent'] || '';
    const body = JSON.stringify(req.body || {});
    const query = JSON.stringify(req.query || {});

    const allInput = `${userAgent} ${body} ${query}`;

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(allInput)) {
        this.logSecurityEvent('suspicious_activity', {
          ip: this.getClientIP(req),
          userAgent,
          userId: user?._id,
          pattern: pattern.toString()
        });
        return true;
      }
    }

    return false;
  }

  // ==================== DATA INTEGRITY ====================

  generateChecksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  verifyChecksum(data, expectedChecksum) {
    const actualChecksum = this.generateChecksum(data);
    return crypto.timingSafeEqual(
      Buffer.from(actualChecksum, 'hex'),
      Buffer.from(expectedChecksum, 'hex')
    );
  }

  // ==================== BACKUP & RECOVERY ====================

  generateBackupKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  encryptBackup(data, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptBackup(encryptedData, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
}

// Create singleton instance
const securityService = new SecurityService();

module.exports = securityService;
