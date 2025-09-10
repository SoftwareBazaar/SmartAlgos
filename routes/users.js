const express = require('express');
const { body, query, validationResult } = require('express-validator');
const databaseService = require('../services/databaseService');
const { auth, updateActivity } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', [auth, updateActivity], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('timezone')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Timezone must be between 3 and 50 characters'),
  body('tradingExperience')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid trading experience level'),
  body('riskTolerance')
    .optional()
    .isIn(['conservative', 'moderate', 'aggressive'])
    .withMessage('Invalid risk tolerance level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.email;
    delete updates.password;
    delete updates.subscription;
    delete updates.portfolio;

    Object.assign(user, updates);
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be boolean'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be boolean'),
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Invalid theme'),
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be 2-5 characters'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('preferredAssets')
    .optional()
    .isArray()
    .withMessage('Preferred assets must be an array'),
  body('preferredAssets.*')
    .optional()
    .isIn(['forex', 'stocks', 'crypto', 'commodities', 'indices'])
    .withMessage('Invalid preferred asset type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);
    const updates = req.body;

    // Update preferences
    if (updates.notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...updates.notifications
      };
    }

    if (updates.theme) {
      user.preferences.theme = updates.theme;
    }

    if (updates.language) {
      user.preferences.language = updates.language;
    }

    if (updates.currency) {
      user.preferences.currency = updates.currency;
    }

    if (updates.preferredAssets) {
      user.preferredAssets = updates.preferredAssets;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/portfolio
// @desc    Get user portfolio
// @access  Private
router.get('/portfolio', [auth, updateActivity], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Mock portfolio data - in production, this would come from actual trades
    const portfolio = {
      overview: {
        totalValue: user.portfolio.totalValue || 0,
        totalCost: user.portfolio.totalValue * 0.8, // Mock cost basis
        totalReturn: user.portfolio.totalProfit || 0,
        totalReturnPercent: user.portfolio.totalValue > 0 ? 
          ((user.portfolio.totalProfit || 0) / (user.portfolio.totalValue * 0.8)) * 100 : 0,
        dayChange: 1250,
        dayChangePercent: 1.01
      },
      positions: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 100,
          averagePrice: 150.00,
          currentPrice: 175.50,
          marketValue: 17550,
          costBasis: 15000,
          unrealizedPL: 2550,
          unrealizedPLPercent: 17.0,
          assetType: 'stock'
        },
        {
          symbol: 'EURUSD',
          name: 'Euro/US Dollar',
          quantity: 10000,
          averagePrice: 1.0850,
          currentPrice: 1.0920,
          marketValue: 10920,
          costBasis: 10850,
          unrealizedPL: 70,
          unrealizedPLPercent: 0.65,
          assetType: 'forex'
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          quantity: 0.5,
          averagePrice: 45000,
          currentPrice: 52000,
          marketValue: 26000,
          costBasis: 22500,
          unrealizedPL: 3500,
          unrealizedPLPercent: 15.56,
          assetType: 'crypto'
        }
      ],
      allocation: {
        stocks: 60.0,
        forex: 25.0,
        crypto: 15.0,
        commodities: 0.0
      }
    };

    res.json({
      success: true,
      data: portfolio
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', [
  auth,
  updateActivity,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['login', 'trade', 'subscription', 'payment', 'signal']),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, type, startDate, endDate } = req.query;

    // Mock activity data - in production, this would come from an Activity model
    const activities = [
      {
        id: 'act_001',
        type: 'login',
        description: 'User logged in',
        timestamp: new Date('2023-11-15T10:30:00Z'),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'act_002',
        type: 'signal',
        description: 'Executed trading signal for AAPL',
        timestamp: new Date('2023-11-15T09:15:00Z'),
        details: {
          symbol: 'AAPL',
          action: 'buy',
          quantity: 100,
          price: 175.50
        }
      },
      {
        id: 'act_003',
        type: 'subscription',
        description: 'Upgraded to Professional plan',
        timestamp: new Date('2023-11-14T16:45:00Z'),
        details: {
          plan: 'professional',
          amount: 79,
          currency: 'USD'
        }
      },
      {
        id: 'act_004',
        type: 'payment',
        description: 'Payment processed successfully',
        timestamp: new Date('2023-11-14T16:44:00Z'),
        details: {
          amount: 79,
          currency: 'USD',
          method: 'card_****4242'
        }
      }
    ];

    // Apply filters
    let filteredActivities = activities;
    if (type) {
      filteredActivities = filteredActivities.filter(activity => activity.type === type);
    }
    if (startDate) {
      filteredActivities = filteredActivities.filter(activity => 
        new Date(activity.timestamp) >= new Date(startDate)
      );
    }
    if (endDate) {
      filteredActivities = filteredActivities.filter(activity => 
        new Date(activity.timestamp) <= new Date(endDate)
      );
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedActivities = filteredActivities.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedActivities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredActivities.length / parseInt(limit)),
        totalItems: filteredActivities.length,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', [auth], async (req, res) => {
  try {
    // In a real application, you would handle file upload here
    // For now, we'll simulate a successful upload
    const avatarUrl = `https://avatars.smartalgos.com/${req.user._id}_${Date.now()}.jpg`;

    const user = await User.findById(req.user._id);
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: avatarUrl
      }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', [
  auth,
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion'),
  body('confirmation')
    .equals('DELETE')
    .withMessage('Confirmation must be "DELETE"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { password, confirmation } = req.body;

    // Verify password
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Soft delete by deactivating account
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
