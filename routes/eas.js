const express = require('express');
const { body, query, validationResult } = require('express-validator');
const databaseService = require('../services/databaseService');
const { auth, requireSubscription, requireOwnership, updateActivity } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/eas
// @desc    Get all EAs with filtering and pagination
// @access  Private
router.get('/', [
  auth,
  updateActivity,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['scalping', 'trend', 'news', 'grid', 'arbitrage', 'martingale', 'hedging']),
  query('status').optional().isIn(['draft', 'pending', 'approved', 'rejected', 'suspended', 'discontinued']),
  query('sortBy').optional().isIn(['name', 'createdAt', 'performance.winRate', 'performance.totalReturn', 'subscriptionStats.averageRating']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters')
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

    const {
      page = 1,
      limit = 20,
      category,
      status = 'approved',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      minWinRate,
      maxDrawdown,
      priceRange
    } = req.query;

    // Build filter object for Supabase
    const filter = {
      is_active: true,
      status: status
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.search = search;
    }

    if (minWinRate) {
      filter.min_win_rate = parseFloat(minWinRate);
    }

    if (maxDrawdown) {
      filter.max_drawdown = parseFloat(maxDrawdown);
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      if (min !== undefined && max !== undefined) {
        filter.price_min = min;
        filter.price_max = max;
      } else if (min !== undefined) {
        filter.price_min = min;
      } else if (max !== undefined) {
        filter.price_max = max;
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query using Supabase
    const eas = await databaseService.getEAs({
      ...filter,
      limit: parseInt(limit),
      offset: skip,
      orderBy: sortBy,
      ascending: sortOrder === 'asc'
    });

    const total = await databaseService.countEAs(filter);

    res.json({
      success: true,
      data: eas,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get EAs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/eas/featured
// @desc    Get featured EAs
// @access  Private
router.get('/featured', [auth, updateActivity], async (req, res) => {
  try {
    const eas = await EA.find({
      isActive: true,
      status: 'approved',
      isFeatured: true
    })
    .populate('creator', 'firstName lastName avatar')
    .sort({ 'subscriptionStats.averageRating': -1, createdAt: -1 })
    .limit(10)
    .select('-files.eaFile -files.setFile');

    res.json({
      success: true,
      data: eas
    });

  } catch (error) {
    console.error('Get featured EAs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/eas/categories
// @desc    Get EA categories with counts
// @access  Private
router.get('/categories', [auth, updateActivity], async (req, res) => {
  try {
    const categories = await EA.aggregate([
      {
        $match: {
          isActive: true,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$subscriptionStats.averageRating' },
          averageWinRate: { $avg: '$performance.winRate' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get EA categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/eas/:id
// @desc    Get single EA by ID
// @access  Private
router.get('/:id', [auth, updateActivity], async (req, res) => {
  try {
    const ea = await EA.findById(req.params.id)
      .populate('creator', 'firstName lastName avatar')
      .populate('reviews.user', 'firstName lastName avatar');

    if (!ea) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    // Increment views
    await ea.incrementViews();

    // Check if user has access to files based on subscription
    const userTier = req.user.subscription.type;
    const tierLevels = { 'free': 0, 'basic': 1, 'professional': 2, 'institutional': 3 };
    
    if (tierLevels[userTier] < 1) {
      // Remove file paths for free users
      ea.files.eaFile = undefined;
      ea.files.setFile = undefined;
    }

    res.json({
      success: true,
      data: ea
    });

  } catch (error) {
    console.error('Get EA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/eas
// @desc    Create new EA
// @access  Private (Creator)
router.post('/', [
  auth,
  requireSubscription('basic'),
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['scalping', 'trend', 'news', 'grid', 'arbitrage', 'martingale', 'hedging'])
    .withMessage('Invalid category'),
  body('riskLevel')
    .isIn(['low', 'medium', 'high', 'very-high'])
    .withMessage('Invalid risk level'),
  body('pricing.monthly')
    .isFloat({ min: 0 })
    .withMessage('Monthly price must be a positive number'),
  body('pricing.weekly')
    .isFloat({ min: 0 })
    .withMessage('Weekly price must be a positive number')
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

    const eaData = {
      ...req.body,
      creator: req.user._id,
      creatorName: req.user.fullName
    };

    const ea = new EA(eaData);
    await ea.save();

    res.status(201).json({
      success: true,
      message: 'EA created successfully',
      data: ea
    });

  } catch (error) {
    console.error('Create EA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/eas/:id
// @desc    Update EA
// @access  Private (Owner)
router.put('/:id', [
  auth,
  requireOwnership('expert_advisors'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
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

    const ea = req.resource;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.creator;
    delete updates.creatorName;
    delete updates.subscriptionStats;
    delete updates.performance;

    Object.assign(ea, updates);
    await ea.save();

    res.json({
      success: true,
      message: 'EA updated successfully',
      data: ea
    });

  } catch (error) {
    console.error('Update EA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/eas/:id
// @desc    Delete EA
// @access  Private (Owner)
router.delete('/:id', [auth, requireOwnership('expert_advisors')], async (req, res) => {
  try {
    const ea = req.resource;
    
    // Soft delete by setting isActive to false
    ea.isActive = false;
    ea.status = 'discontinued';
    await ea.save();

    res.json({
      success: true,
      message: 'EA deleted successfully'
    });

  } catch (error) {
    console.error('Delete EA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/eas/:id/reviews
// @desc    Add review to EA
// @access  Private
router.post('/:id/reviews', [
  auth,
  requireSubscription('basic'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
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

    const ea = await EA.findById(req.params.id);
    if (!ea) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    // Check if user already reviewed this EA
    const existingReview = ea.reviews.find(review => 
      review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this EA'
      });
    }

    const { rating, comment } = req.body;
    await ea.addReview(req.user._id, rating, comment);

    res.json({
      success: true,
      message: 'Review added successfully'
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/eas/:id/performance
// @desc    Get EA performance data
// @access  Private
router.get('/:id/performance', [auth, updateActivity], async (req, res) => {
  try {
    const ea = await EA.findById(req.params.id);
    if (!ea) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    // Return performance data
    res.json({
      success: true,
      data: {
        performance: ea.performance,
        backtestResults: ea.backtestResults,
        liveResults: ea.liveResults
      }
    });

  } catch (error) {
    console.error('Get EA performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/eas/:id/subscribe
// @desc    Subscribe to EA
// @access  Private
router.post('/:id/subscribe', [
  auth,
  requireSubscription('basic'),
  body('subscriptionType')
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid subscription type'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
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

    const ea = await EA.findById(req.params.id);
    if (!ea) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    const { subscriptionType, paymentMethod } = req.body;

    // Check if user already has an active subscription
    // This would be implemented with a separate Subscription model
    // For now, we'll just return success

    const price = ea.pricing[subscriptionType];
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Subscription type not available for this EA'
      });
    }

    // Here you would integrate with payment gateway (Paystack/Stripe)
    // and create subscription record

    res.json({
      success: true,
      message: 'Subscription initiated',
      data: {
        eaId: ea._id,
        eaName: ea.name,
        subscriptionType,
        price,
        currency: ea.pricing.currency
      }
    });

  } catch (error) {
    console.error('Subscribe to EA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/eas/my/created
// @desc    Get EAs created by current user
// @access  Private
router.get('/my/created', [auth, updateActivity], async (req, res) => {
  try {
    const eas = await EA.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .select('-files.eaFile -files.setFile');

    res.json({
      success: true,
      data: eas
    });

  } catch (error) {
    console.error('Get my EAs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/eas/my/subscriptions
// @desc    Get EAs subscribed by current user
// @access  Private
router.get('/my/subscriptions', [auth, updateActivity], async (req, res) => {
  try {
    // This would query a Subscription model
    // For now, return empty array
    res.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Get my EA subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
