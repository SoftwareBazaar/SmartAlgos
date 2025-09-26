const databaseService = require('../services/databaseService');
const securityService = require('../services/securityService');
const userService = require('../services/userService');

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Allow test token in development mode
    if (token === 'test_token' && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
      req.user = userService.normalizeUser({
        id: 'test_user_123',
        email: 'test@example.com',
        role: 'user',
        is_active: true,
        is_email_verified: true,
        subscription_type: 'basic',
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        preferences: {}
      });
      return next();
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = securityService.verifyToken(token);
    const rawUser = await databaseService.getUserById(decoded.userId);

    if (!rawUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (rawUser.is_active === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    if (rawUser.lock_until && new Date() < new Date(rawUser.lock_until)) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.'
      });
    }

    const normalizedUser = userService.normalizeUser(rawUser);

    if (!normalizedUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to hydrate user profile.'
      });
    }

    req.user = normalizedUser;
    req.userRaw = rawUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Middleware to check subscription tier
const requireSubscription = (requiredTier) => {
  const tierLevels = {
    'free': 0,
    'basic': 1,
    'professional': 2,
    'institutional': 3
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const subscription = req.user.subscription || userService.DEFAULT_SUBSCRIPTION;
    const userTier = subscription.type;
    const userTierLevel = tierLevels[userTier] || 0;
    const requiredTierLevel = tierLevels[requiredTier] || 0;

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        success: false,
        message: `This feature requires ${requiredTier} subscription or higher.`,
        currentTier: userTier,
        requiredTier: requiredTier
      });
    }

    const subscriptionEndDate = parseDate(subscription.endDate || subscription.end_date);
    const isExpired = Boolean(subscriptionEndDate) && subscriptionEndDate < new Date();

    if (!subscription.isActive || isExpired) {
      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please renew to access this feature.',
        subscriptionExpired: true,
        subscriptionEndDate: subscriptionEndDate ? subscriptionEndDate.toISOString() : null
      });
    }

    next();
  };
};

// Middleware to check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.is_email_verified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required to access this feature.',
      emailVerified: false
    });
  }

  next();
};

// Middleware to check KYC verification for premium features
const requireKYC = (req, res, next) => {
  if (!req.user.is_kyc_verified) {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required for this feature.',
      kycVerified: false
    });
  }

  next();
};

// Middleware to check trading experience level
const requireTradingExperience = (minLevel) => {
  const experienceLevels = {
    'beginner': 0,
    'intermediate': 1,
    'advanced': 2,
    'expert': 3
  };

  return (req, res, next) => {
    const userLevel = req.user.trading_experience;
    const userLevelValue = experienceLevels[userLevel] || 0;
    const requiredLevelValue = experienceLevels[minLevel] || 0;

    if (userLevelValue < requiredLevelValue) {
      return res.status(403).json({
        success: false,
        message: `This feature requires ${minLevel} trading experience or higher.`,
        currentLevel: userLevel,
        requiredLevel: minLevel
      });
    }

    next();
  };
};

// Middleware to check if user is creator/owner
const requireOwnership = (tableName, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await databaseService.getClient()
        .from(tableName)
        .select('*')
        .eq('id', resourceId)
        .single();

      if (!resource.data) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      // Check if user is the creator/owner
      if (resource.data.creator_id && resource.data.creator_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not the owner of this resource.'
        });
      }

      req.resource = resource.data;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during ownership verification.'
      });
    }
  };
};

// Middleware to update user activity
const updateActivity = async (req, res, next) => {
  try {
    if (req.user && req.user.userId) {
      await userService.updateLastActivity(req.user.userId, {
        ip: securityService.getClientIP(req),
        userAgent: req.headers['user-agent']
      });
    }
    next();
  } catch (error) {
    console.error('Activity update error:', error);
    // Don't block the request if activity update fails
    next();
  }
};

// Middleware to check rate limiting for specific actions
const createActionRateLimit = (maxRequests, windowMs, actionName) => {
  const attempts = new Map();

  return (req, res, next) => {
    // Skip rate limiting completely in development or if NODE_ENV is not set
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log(`🔓 Skipping rate limit in development mode`);
      return next();
    }

    // For unauthenticated routes, use IP address instead of user ID
    const identifier = req.user ? req.user.userId.toString() : req.ip;
    const key = `${identifier}_${actionName}`;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const attempt = attempts.get(key);
    
    if (now > attempt.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (attempt.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: `Too many ${actionName} attempts. Please try again later.`,
        retryAfter: Math.ceil((attempt.resetTime - now) / 1000)
      });
    }

    attempt.count++;
    next();
  };
};

module.exports = {
  auth,
  requireSubscription,
  requireVerification,
  requireKYC,
  requireTradingExperience,
  requireOwnership,
  updateActivity,
  createActionRateLimit
};



