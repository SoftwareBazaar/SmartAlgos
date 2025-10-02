const express = require('express');
const { body, validationResult, query } = require('express-validator');
const bcrypt = require('bcryptjs');
const databaseService = require('../services/databaseService');
const mockAuthStore = require('../services/mockAuthStore');
const userService = require('../services/userService');
const securityService = require('../services/securityService');
const { auth, updateActivity } = require('../middleware/auth');

const router = express.Router();
const isPlaceholderKey = (value = '') => {
  if (!value) {
    return true;
  }

  const normalized = value.toLowerCase();
  return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
};

const explicitMockFlag = (process.env.MOCK_AUTH || '').toLowerCase();
const useMockAuth = explicitMockFlag === 'true' || (explicitMockFlag !== 'false' && isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY));

const getUserRecordById = async (id) => {
  if (!id) {
    return null;
  }

  if (useMockAuth) {
    return mockAuthStore.getUserById(id);
  }

  try {
    return await databaseService.getUserById(id);
  } catch (error) {
    if (error?.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
};

const updateUserRecord = async (id, updates) => {
  if (useMockAuth) {
    return mockAuthStore.updateUser(id, updates);
  }

  return databaseService.updateUser(id, updates);
};

function respondValidation(res, req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return false;
  }
  return true;
}

function buildProfileUpdatePayload(body) {
  const mapping = {
    firstName: 'first_name',
    lastName: 'last_name',
    phone: 'phone',
    country: 'country',
    city: 'city',
    timezone: 'timezone',
    tradingExperience: 'trading_experience',
    riskTolerance: 'risk_tolerance',
    bio: 'bio'
  };

  const updates = {};
  Object.entries(mapping).forEach(([inputKey, column]) => {
    if (body[inputKey] !== undefined) {
      updates[column] = body[inputKey];
    }
  });

  if (body.preferredAssets) {
    updates.preferred_assets = body.preferredAssets;
  }

  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString();
  }

  return updates;
}

// @route   GET /api/users/dashboard-stats
// @desc    Get dashboard statistics for user
// @access  Private
router.get('/dashboard-stats', [auth, updateActivity], async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's subscriptions count
    const { data: subscriptions } = await databaseService.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Get user's signals count
    const { data: signals } = await databaseService.supabase
      .from('trading_signals')
      .select('*')
      .eq('is_active', true);

    // Get user data for portfolio value
    const user = await getUserRecordById(userId);
    const portfolio = user?.portfolio || {};

    // Calculate stats
    const stats = {
      portfolioValue: portfolio.totalValue || 0,
      todayPnL: portfolio.todayPnL || 0,
      todayPnLPercent: portfolio.todayPnLPercent || 0,
      activeSignals: signals?.length || 0,
      winRate: portfolio.winRate || 0,
      activeSubscriptions: subscriptions?.length || 0,
      totalTrades: portfolio.totalTrades || 0,
      profitFactor: portfolio.profitFactor || 0,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics'
    });
  }
});

router.get('/profile', [auth, updateActivity], async (req, res) => {
  try {
    const raw = await getUserRecordById(req.user.userId);

    if (!raw) {
      if ((useMockAuth || (req.user?.userId || '').startsWith('test_')) && req.user) {
        return res.json({
          success: true,
          data: req.user
        });
      }

      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: userService.normalizeUser(raw)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load profile'
    });
  }
});

router.put('/profile', [
  auth,
  updateActivity,
  body('firstName').optional().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').optional().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Invalid phone number'),
  body('country').optional().isLength({ min: 2, max: 56 }).withMessage('Country must be 2-56 characters'),
  body('city').optional().isLength({ min: 2, max: 56 }).withMessage('City must be 2-56 characters'),
  body('timezone').optional().isLength({ min: 2, max: 50 }).withMessage('Timezone must be 2-50 characters'),
  body('tradingExperience').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid trading experience value'),
  body('riskTolerance').optional().isIn(['conservative', 'moderate', 'aggressive']).withMessage('Invalid risk tolerance value'),
  body('preferredAssets').optional().isArray().withMessage('Preferred assets must be an array')
], async (req, res) => {
  try {
    if (!respondValidation(res, req)) {
      return;
    }

    const updates = buildProfileUpdatePayload(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid profile fields provided'
      });
    }

    const updated = await updateUserRecord(req.user.userId, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userService.normalizeUser(updated)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

router.put('/preferences', [
  auth,
  updateActivity,
  body('notifications').optional().isObject(),
  body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
  body('language').optional().isLength({ min: 2, max: 10 }),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code')
], async (req, res) => {
  try {
    if (!respondValidation(res, req)) {
      return;
    }

    const raw = await getUserRecordById(req.user.userId);

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingPrefs = raw.preferences || {};
    const updates = {
      preferences: {
        ...existingPrefs,
        ...req.body,
        notifications: {
          ...(existingPrefs.notifications || {}),
          ...(req.body.notifications || {})
        }
      },
      updated_at: new Date().toISOString()
    };

    const updated = await updateUserRecord(req.user.userId, updates);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: userService.normalizeUser(updated).preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

router.get('/portfolio', [auth, updateActivity], async (req, res) => {
  try {
    const raw = await getUserRecordById(req.user.userId);

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const normalized = userService.normalizeUser(raw);
    const basePortfolio = normalized.portfolio || {};

    const portfolio = {
      totalValue: basePortfolio.totalValue || 0,
      totalProfit: basePortfolio.totalProfit || 0,
      totalLoss: basePortfolio.totalLoss || 0,
      winRate: basePortfolio.winRate || 0,
      maxDrawdown: basePortfolio.maxDrawdown || 0,
      allocation: basePortfolio.allocation || {},
      updatedAt: normalized.updated_at
    };

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load portfolio'
    });
  }
});

// @route   GET /api/users/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', [
  auth,
  updateActivity,
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['login', 'subscription', 'purchase', 'trade', 'signal'])
], async (req, res) => {
  try {
    if (!respondValidation(res, req)) {
      return;
    }

    const userId = req.user.userId;
    const limit = parseInt(req.query.limit, 10) || 50;
    
    // Build activity log from various sources
    const activities = [];

    // Get user's subscriptions
    const { data: subscriptions } = await databaseService.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (subscriptions) {
      subscriptions.forEach(sub => {
        activities.push({
          id: `sub_${sub.id}`,
          type: 'subscription',
          description: `Subscribed to ${sub.plan_name || 'plan'}`,
          metadata: { subscriptionId: sub.id, status: sub.status },
          timestamp: sub.created_at
        });
      });
    }

    // Get user's escrow transactions
    const { data: escrowTxs } = await databaseService.supabase
      .from('escrow_transactions')
      .select('*')
      .or(`buyer_email.eq.${req.user.email},seller_email.eq.${req.user.email}`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (escrowTxs) {
      escrowTxs.forEach(tx => {
        activities.push({
          id: `escrow_${tx.id}`,
          type: 'purchase',
          description: `Escrow transaction: ${tx.description}`,
          metadata: { amount: tx.amount, currency: tx.currency, status: tx.status },
          timestamp: tx.created_at
        });
      });
    }

    // Add login activity
    const user = await getUserRecordById(userId);
    if (user?.last_login) {
      activities.push({
        id: `login_${userId}_${user.last_login}`,
        type: 'login',
        description: 'Logged in',
        metadata: { ip: securityService.getClientIP(req) },
        timestamp: user.last_login
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Filter by type if specified
    let filtered = activities;
    if (req.query.type) {
      filtered = filtered.filter(item => item.type === req.query.type);
    }

    // Apply limit
    filtered = filtered.slice(0, limit);

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load activity'
    });
  }
});

router.post('/upload-avatar', [
  auth,
  updateActivity,
  body('avatarUrl').isURL().withMessage('Valid avatar URL is required')
], async (req, res) => {
  try {
    if (!respondValidation(res, req)) {
      return;
    }

    const updated = await updateUserRecord(req.user.userId, {
      avatar_url: req.body.avatarUrl,
      updated_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatarUrl: updated.avatar_url || req.body.avatarUrl
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update avatar'
    });
  }
});

router.delete('/account', [
  auth,
  updateActivity,
  body('password').notEmpty().withMessage('Password is required'),
  body('confirmation').equals('DELETE').withMessage('Confirmation must be DELETE')
], async (req, res) => {
  try {
    if (!respondValidation(res, req)) {
      return;
    }

    const raw = await getUserRecordById(req.user.userId);

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const passwordHash = raw.password_hash;

    if (!passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'Password reset is required before account deletion'
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    const timestamp = Date.now();

    await updateUserRecord(req.user.userId, {
      is_active: false,
      email: `deleted_${timestamp}_${raw.email}`,
      updated_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

module.exports = router;


