const express = require('express');
const { body, query, validationResult } = require('express-validator');
const databaseService = require('../services/databaseService');
const { auth, requireSubscription, requireOwnership, updateActivity } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/hft
// @desc    Get all HFT bots with filtering and pagination
// @access  Private
router.get('/', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('strategy').optional().isIn(['arbitrage', 'market-making', 'momentum', 'statistical-arbitrage', 'liquidation-hunter', 'grid-trading', 'scalping']),
  query('exchange').optional().isIn(['binance', 'coinbase', 'kraken', 'bitfinex', 'huobi', 'okx', 'bybit']),
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
      strategy,
      exchange,
      status = 'approved',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      minWinRate,
      maxDrawdown,
      priceRange
    } = req.query;

    // Build filter object
    const filter = {
      isActive: true,
      status: status
    };

    if (strategy) {
      filter.strategy = strategy;
    }

    if (exchange) {
      filter.exchange = exchange;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minWinRate) {
      filter['performance.winRate'] = { $gte: parseFloat(minWinRate) };
    }

    if (maxDrawdown) {
      filter['performance.maxDrawdownAchieved'] = { $lte: parseFloat(maxDrawdown) };
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      if (min !== undefined && max !== undefined) {
        filter['pricing.professional'] = { $gte: min, $lte: max };
      } else if (min !== undefined) {
        filter['pricing.professional'] = { $gte: min };
      } else if (max !== undefined) {
        filter['pricing.professional'] = { $lte: max };
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const bots = await HFTBot.find(filter)
      .populate('creator', 'firstName lastName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-files.botFile -files.configFile'); // Exclude file paths for security

    const total = await HFTBot.countDocuments(filter);

    res.json({
      success: true,
      data: bots,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get HFT bots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/hft/featured
// @desc    Get featured HFT bots
// @access  Private
router.get('/featured', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const bots = await HFTBot.find({
      isActive: true,
      status: 'approved',
      isFeatured: true
    })
    .populate('creator', 'firstName lastName avatar')
    .sort({ 'subscriptionStats.averageRating': -1, createdAt: -1 })
    .limit(10)
    .select('-files.botFile -files.configFile');

    res.json({
      success: true,
      data: bots
    });

  } catch (error) {
    console.error('Get featured HFT bots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/hft/strategies
// @desc    Get HFT strategies with counts
// @access  Private
router.get('/strategies', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const strategies = await HFTBot.aggregate([
      {
        $match: {
          isActive: true,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$strategy',
          count: { $sum: 1 },
          averageRating: { $avg: '$subscriptionStats.averageRating' },
          averageWinRate: { $avg: '$performance.winRate' },
          averageReturn: { $avg: '$performance.totalReturn' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: strategies
    });

  } catch (error) {
    console.error('Get HFT strategies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/hft/exchanges
// @desc    Get supported exchanges with counts
// @access  Private
router.get('/exchanges', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const exchanges = await HFTBot.aggregate([
      {
        $match: {
          isActive: true,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$exchange',
          count: { $sum: 1 },
          strategies: { $addToSet: '$strategy' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: exchanges
    });

  } catch (error) {
    console.error('Get HFT exchanges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/hft/:id
// @desc    Get single HFT bot by ID
// @access  Private
router.get('/:id', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const bot = await HFTBot.findById(req.params.id)
      .populate('creator', 'firstName lastName avatar')
      .populate('reviews.user', 'firstName lastName avatar');

    if (!bot) {
      return res.status(404).json({
        success: false,
        message: 'HFT bot not found'
      });
    }

    // Increment views
    await bot.incrementViews();

    // Check if user has access to files based on subscription
    const userTier = req.user.subscription.type;
    const tierLevels = { 'free': 0, 'basic': 1, 'professional': 2, 'institutional': 3 };
    
    if (tierLevels[userTier] < 2) {
      // Remove file paths for basic users
      bot.files.botFile = undefined;
      bot.files.configFile = undefined;
    }

    res.json({
      success: true,
      data: bot
    });

  } catch (error) {
    console.error('Get HFT bot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/hft
// @desc    Create new HFT bot
// @access  Private (Creator)
router.post('/', [
  auth,
  requireSubscription('professional'),
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('strategy')
    .isIn(['arbitrage', 'market-making', 'momentum', 'statistical-arbitrage', 'liquidation-hunter', 'grid-trading', 'scalping'])
    .withMessage('Invalid strategy'),
  body('exchange')
    .isIn(['binance', 'coinbase', 'kraken', 'bitfinex', 'huobi', 'okx', 'bybit'])
    .withMessage('Invalid exchange'),
  body('pricing.basic')
    .isFloat({ min: 0 })
    .withMessage('Basic price must be a positive number')
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

    const botData = {
      ...req.body,
      creator: req.user._id,
      creatorName: req.user.fullName
    };

    const bot = new HFTBot(botData);
    await bot.save();

    res.status(201).json({
      success: true,
      message: 'HFT bot created successfully',
      data: bot
    });

  } catch (error) {
    console.error('Create HFT bot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/hft/:id
// @desc    Update HFT bot
// @access  Private (Owner)
router.put('/:id', [
  auth,
  requireOwnership('hft_bots'),
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

    const bot = req.resource;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.creator;
    delete updates.creatorName;
    delete updates.subscriptionStats;
    delete updates.performance;

    Object.assign(bot, updates);
    await bot.save();

    res.json({
      success: true,
      message: 'HFT bot updated successfully',
      data: bot
    });

  } catch (error) {
    console.error('Update HFT bot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/hft/:id
// @desc    Delete HFT bot
// @access  Private (Owner)
router.delete('/:id', [auth, requireOwnership('hft_bots')], async (req, res) => {
  try {
    const bot = req.resource;
    
    // Soft delete by setting isActive to false
    bot.isActive = false;
    bot.status = 'discontinued';
    await bot.save();

    res.json({
      success: true,
      message: 'HFT bot deleted successfully'
    });

  } catch (error) {
    console.error('Delete HFT bot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/hft/:id/reviews
// @desc    Add review to HFT bot
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

    const bot = await HFTBot.findById(req.params.id);
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: 'HFT bot not found'
      });
    }

    // Check if user already reviewed this bot
    const existingReview = bot.reviews.find(review => 
      review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this HFT bot'
      });
    }

    const { rating, comment } = req.body;
    await bot.addReview(req.user._id, rating, comment);

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

// @route   GET /api/hft/:id/performance
// @desc    Get HFT bot performance data
// @access  Private
router.get('/:id/performance', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const bot = await HFTBot.findById(req.params.id);
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: 'HFT bot not found'
      });
    }

    // Return performance data
    res.json({
      success: true,
      data: {
        performance: bot.performance,
        backtestResults: bot.backtestResults,
        liveResults: bot.liveResults
      }
    });

  } catch (error) {
    console.error('Get HFT bot performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/hft/:id/subscribe
// @desc    Subscribe to HFT bot
// @access  Private
router.post('/:id/subscribe', [
  auth,
  requireSubscription('professional'),
  body('subscriptionType')
    .isIn(['basic', 'professional', 'enterprise'])
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

    const bot = await HFTBot.findById(req.params.id);
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: 'HFT bot not found'
      });
    }

    const { subscriptionType, paymentMethod } = req.body;

    const price = bot.pricing[subscriptionType];
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Subscription type not available for this HFT bot'
      });
    }

    // Here you would integrate with payment gateway and create subscription record

    res.json({
      success: true,
      message: 'Subscription initiated',
      data: {
        botId: bot._id,
        botName: bot.name,
        subscriptionType,
        price,
        currency: bot.pricing.currency
      }
    });

  } catch (error) {
    console.error('Subscribe to HFT bot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/hft/my/created
// @desc    Get HFT bots created by current user
// @access  Private
router.get('/my/created', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    const bots = await HFTBot.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .select('-files.botFile -files.configFile');

    res.json({
      success: true,
      data: bots
    });

  } catch (error) {
    console.error('Get my HFT bots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/hft/my/subscriptions
// @desc    Get HFT bots subscribed by current user
// @access  Private
router.get('/my/subscriptions', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    // This would query a Subscription model
    // For now, return empty array
    res.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Get my HFT bot subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/hft/:id/backtest
// @desc    Run backtest for HFT bot
// @access  Private (Owner)
router.post('/:id/backtest', [
  auth,
  requireOwnership('hft_bots'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('initialBalance')
    .isFloat({ min: 0 })
    .withMessage('Initial balance must be a positive number')
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

    const bot = req.resource;
    const { startDate, endDate, initialBalance } = req.body;

    // Here you would integrate with backtesting engine
    // For now, return a mock response
    const backtestResults = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      initialBalance: parseFloat(initialBalance),
      finalBalance: parseFloat(initialBalance) * 1.15, // Mock 15% return
      totalReturn: 15.0,
      maxDrawdown: 5.2,
      sharpeRatio: 1.8,
      totalTrades: 1250,
      winRate: 68.5,
      profitFactor: 1.45
    };

    // Update bot with backtest results
    bot.backtestResults = backtestResults;
    await bot.save();

    res.json({
      success: true,
      message: 'Backtest completed successfully',
      data: backtestResults
    });

  } catch (error) {
    console.error('Run backtest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
