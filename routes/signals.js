const express = require('express');
const { body, query, validationResult } = require('express-validator');
const databaseService = require('../services/databaseService');
const aiSignalService = require('../services/aiSignalService');
const { auth, requireSubscription, updateActivity } = require('../middleware/auth');
const { broadcastTradingSignal } = require('../websocket/handlers');
const router = express.Router();

// @route   GET /api/signals
// @desc    Get trading signals with filtering and pagination
// @access  Private
router.get('/', [
  auth,
  updateActivity,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('assetType').optional().isIn(['stock', 'forex', 'crypto', 'commodity', 'index', 'bond']),
  query('market').optional().isIn(['US', 'NSE', 'LSE', 'TSE', 'ASX', 'crypto']),
  query('signalType').optional().isIn(['buy', 'sell', 'hold', 'strong-buy', 'strong-sell']),
  query('category').optional().isIn(['scalping', 'swing', 'position', 'day-trading', 'long-term']),
  query('sortBy').optional().isIn(['createdAt', 'aiAnalysis.confidence', 'performance.profitLoss']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
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
      assetType,
      market,
      signalType,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minConfidence,
      maxConfidence,
      symbol
    } = req.query;

    // Build filter object
    const filter = {
      status: 'active',
      isActive: true,
      validUntil: { $gt: new Date() }
    };

    // Filter by user's subscription tier
    const userTier = req.user.subscription.type;
    const tierLevels = { 'free': 0, 'basic': 1, 'professional': 2, 'institutional': 3 };
    
    if (tierLevels[userTier] < 1) {
      filter.subscriptionTier = 'free';
    } else {
      filter.subscriptionTier = { $in: ['free', 'basic'] };
    }

    if (assetType) {
      filter['asset.type'] = assetType;
    }

    if (market) {
      filter['asset.market'] = market;
    }

    if (signalType) {
      filter.signalType = signalType;
    }

    if (category) {
      filter.category = category;
    }

    if (symbol) {
      filter['asset.symbol'] = new RegExp(symbol, 'i');
    }

    if (minConfidence) {
      filter['aiAnalysis.confidence'] = { $gte: parseFloat(minConfidence) };
    }

    if (maxConfidence) {
      filter['aiAnalysis.confidence'] = { 
        ...filter['aiAnalysis.confidence'], 
        $lte: parseFloat(maxConfidence) 
      };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const signals = await TradingSignal.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TradingSignal.countDocuments(filter);

    res.json({
      success: true,
      data: signals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get signals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/signals/active
// @desc    Get active signals for dashboard
// @access  Private
router.get('/active', [auth, updateActivity], async (req, res) => {
  try {
    const userTier = req.user.subscription.type;
    const tierLevels = { 'free': 0, 'basic': 1, 'professional': 2, 'institutional': 3 };
    
    let subscriptionFilter;
    if (tierLevels[userTier] < 1) {
      subscriptionFilter = 'free';
    } else if (tierLevels[userTier] < 2) {
      subscriptionFilter = { $in: ['free', 'basic'] };
    } else {
      subscriptionFilter = { $in: ['free', 'basic', 'professional'] };
    }

    const signals = await TradingSignal.find({
      status: 'active',
      isActive: true,
      validUntil: { $gt: new Date() },
      subscriptionTier: subscriptionFilter
    })
    .sort({ 'aiAnalysis.confidence': -1, createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: signals
    });

  } catch (error) {
    console.error('Get active signals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/signals/trending
// @desc    Get trending signals based on performance
// @access  Private
router.get('/trending', [auth, updateActivity], async (req, res) => {
  try {
    const userTier = req.user.subscription.type;
    const tierLevels = { 'free': 0, 'basic': 1, 'professional': 2, 'institutional': 3 };
    
    let subscriptionFilter;
    if (tierLevels[userTier] < 1) {
      subscriptionFilter = 'free';
    } else if (tierLevels[userTier] < 2) {
      subscriptionFilter = { $in: ['free', 'basic'] };
    } else {
      subscriptionFilter = { $in: ['free', 'basic', 'professional'] };
    }

    const signals = await TradingSignal.find({
      status: 'active',
      isActive: true,
      validUntil: { $gt: new Date() },
      subscriptionTier: subscriptionFilter,
      'aiAnalysis.confidence': { $gte: 70 }
    })
    .sort({ 'aiAnalysis.confidence': -1, views: -1 })
    .limit(20);

    res.json({
      success: true,
      data: signals
    });

  } catch (error) {
    console.error('Get trending signals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/signals/:id
// @desc    Get single signal by ID
// @access  Private
router.get('/:id', [auth, updateActivity], async (req, res) => {
  try {
    const signal = await TradingSignal.findById(req.params.id);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }

    // Check if signal is expired
    if (signal.validUntil < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Signal has expired',
        code: 'SIGNAL_EXPIRED'
      });
    }

    // Check subscription access
    const userTier = req.user.subscription.type;
    const tierLevels = { 'free': 0, 'basic': 1, 'professional': 2, 'institutional': 3 };
    
    if (tierLevels[userTier] < tierLevels[signal.subscriptionTier]) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient subscription level to view this signal',
        requiredTier: signal.subscriptionTier,
        currentTier: userTier
      });
    }

    // Increment views
    await signal.incrementViews();

    res.json({
      success: true,
      data: signal
    });

  } catch (error) {
    console.error('Get signal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/signals
// @desc    Create new trading signal (AI/Manual)
// @access  Private (Professional/Institutional)
router.post('/', [
  auth,
  requireSubscription('professional'),
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('asset.symbol')
    .trim()
    .notEmpty()
    .withMessage('Asset symbol is required'),
  body('asset.name')
    .trim()
    .notEmpty()
    .withMessage('Asset name is required'),
  body('asset.type')
    .isIn(['stock', 'forex', 'crypto', 'commodity', 'index', 'bond'])
    .withMessage('Invalid asset type'),
  body('asset.market')
    .isIn(['US', 'NSE', 'LSE', 'TSE', 'ASX', 'crypto'])
    .withMessage('Invalid market'),
  body('signalType')
    .isIn(['buy', 'sell', 'hold', 'strong-buy', 'strong-sell'])
    .withMessage('Invalid signal type'),
  body('action')
    .isIn(['enter-long', 'enter-short', 'exit-long', 'exit-short', 'hold-position', 'close-all'])
    .withMessage('Invalid action'),
  body('currentPrice')
    .isFloat({ min: 0 })
    .withMessage('Current price must be a positive number'),
  body('aiAnalysis.confidence')
    .isInt({ min: 0, max: 100 })
    .withMessage('Confidence must be between 0 and 100'),
  body('validUntil')
    .isISO8601()
    .withMessage('Valid until must be a valid date')
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

    const signalData = {
      ...req.body,
      analyst: req.user._id,
      source: req.body.source || 'manual'
    };

    const signal = new TradingSignal(signalData);
    await signal.save();

    // Broadcast signal to WebSocket subscribers
    broadcastTradingSignal(req.io, signal);

    res.status(201).json({
      success: true,
      message: 'Trading signal created successfully',
      data: signal
    });

  } catch (error) {
    console.error('Create signal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/signals/:id/execute
// @desc    Execute trading signal
// @access  Private
router.post('/:id/execute', [
  auth,
  requireSubscription('basic'),
  body('executionPrice')
    .isFloat({ min: 0 })
    .withMessage('Execution price must be a positive number'),
  body('executionTime')
    .optional()
    .isISO8601()
    .withMessage('Execution time must be a valid date')
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

    const signal = await TradingSignal.findById(req.params.id);
    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }

    if (signal.validUntil < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Signal has expired',
        code: 'SIGNAL_EXPIRED'
      });
    }

    if (signal.performance.isExecuted) {
      return res.status(400).json({
        success: false,
        message: 'Signal has already been executed'
      });
    }

    const { executionPrice, executionTime = new Date() } = req.body;
    await signal.execute(executionPrice, executionTime);

    res.json({
      success: true,
      message: 'Signal executed successfully',
      data: signal
    });

  } catch (error) {
    console.error('Execute signal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/signals/:id/close
// @desc    Close executed trading signal
// @access  Private
router.post('/:id/close', [
  auth,
  requireSubscription('basic'),
  body('exitPrice')
    .isFloat({ min: 0 })
    .withMessage('Exit price must be a positive number'),
  body('exitTime')
    .optional()
    .isISO8601()
    .withMessage('Exit time must be a valid date')
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

    const signal = await TradingSignal.findById(req.params.id);
    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }

    const { exitPrice, exitTime = new Date() } = req.body;
    await signal.close(exitPrice, exitTime);

    res.json({
      success: true,
      message: 'Signal closed successfully',
      data: signal
    });

  } catch (error) {
    console.error('Close signal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/signals/my/executed
// @desc    Get signals executed by current user
// @access  Private
router.get('/my/executed', [auth, updateActivity], async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const signals = await TradingSignal.find({
      'performance.isExecuted': true,
      // Add user filter when user tracking is implemented
    })
    .sort({ 'performance.executionTime': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await TradingSignal.countDocuments({
      'performance.isExecuted': true
    });

    res.json({
      success: true,
      data: signals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get executed signals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/signals/performance/stats
// @desc    Get signal performance statistics
// @access  Private
router.get('/performance/stats', [auth, updateActivity], async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    let startDate;
    switch (timeframe) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const stats = await TradingSignal.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'performance.isExecuted': true
        }
      },
      {
        $group: {
          _id: null,
          totalSignals: { $sum: 1 },
          totalExecuted: { $sum: { $cond: ['$performance.isExecuted', 1, 0] } },
          totalClosed: { $sum: { $cond: ['$performance.exitTime', 1, 0] } },
          averageReturn: { $avg: '$performance.profitLossPercentage' },
          totalReturn: { $sum: '$performance.profitLoss' },
          winRate: {
            $avg: {
              $cond: [
                { $gt: ['$performance.profitLoss', 0] },
                100,
                0
              ]
            }
          },
          averageConfidence: { $avg: '$aiAnalysis.confidence' }
        }
      }
    ]);

    const assetTypeStats = await TradingSignal.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'performance.isExecuted': true
        }
      },
      {
        $group: {
          _id: '$asset.type',
          count: { $sum: 1 },
          averageReturn: { $avg: '$performance.profitLossPercentage' },
          winRate: {
            $avg: {
              $cond: [
                { $gt: ['$performance.profitLoss', 0] },
                100,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalSignals: 0,
          totalExecuted: 0,
          totalClosed: 0,
          averageReturn: 0,
          totalReturn: 0,
          winRate: 0,
          averageConfidence: 0
        },
        byAssetType: assetTypeStats,
        timeframe
      }
    });

  } catch (error) {
    console.error('Get signal performance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/signals/watchlist
// @desc    Get signals for user's watchlist
// @access  Private
router.get('/watchlist', [auth, updateActivity], async (req, res) => {
  try {
    // This would integrate with a user watchlist system
    // For now, return signals for user's preferred assets
    const preferredAssets = req.user.preferredAssets || [];
    
    if (preferredAssets.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No preferred assets set'
      });
    }

    const userTier = req.user.subscription.type;
    const tierLevels = { 'free': 0, 'basic': 1, 'professional': 2, 'institutional': 3 };
    
    let subscriptionFilter;
    if (tierLevels[userTier] < 1) {
      subscriptionFilter = 'free';
    } else if (tierLevels[userTier] < 2) {
      subscriptionFilter = { $in: ['free', 'basic'] };
    } else {
      subscriptionFilter = { $in: ['free', 'basic', 'professional'] };
    }

    const signals = await TradingSignal.find({
      'asset.type': { $in: preferredAssets },
      status: 'active',
      isActive: true,
      validUntil: { $gt: new Date() },
      subscriptionTier: subscriptionFilter
    })
    .sort({ 'aiAnalysis.confidence': -1, createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: signals
    });

  } catch (error) {
    console.error('Get watchlist signals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== AI SIGNAL GENERATION ENDPOINTS ====================

// @route   GET /api/signals/ai/models
// @desc    Get available AI models for signal generation
// @access  Private (Professional+)
router.get('/ai/models', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    const { assetType, market } = req.query;
    
    const filter = {
      status: 'deployed',
      isActive: true
    };
    
    if (assetType) {
      filter[`supportedAssets.${assetType}`] = true;
    }
    
    if (market) {
      filter.supportedMarkets = market;
    }
    
    const models = await AIModel.find(filter)
      .sort({ 'performance.accuracy': -1 })
      .select('-files -configuration.hyperparameters');
    
    res.json({
      success: true,
      data: models
    });
    
  } catch (error) {
    console.error('Get AI models error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/signals/ai/jobs
// @desc    Get AI signal generation jobs
// @access  Private (Professional+)
router.get('/ai/jobs', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = { creator: req.user._id };
    if (status) {
      filter.status = status;
    }
    
    const jobs = await AISignalJob.find(filter)
      .populate('aiModel', 'name version modelType performance')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await AISignalJob.countDocuments(filter);
    
    res.json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get AI signal jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/signals/ai/jobs
// @desc    Create new AI signal generation job
// @access  Private (Professional+)
router.post('/ai/jobs', [
  auth,
  requireSubscription('professional'),
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Job name must be between 3 and 100 characters'),
  body('aiModel')
    .isMongoId()
    .withMessage('Valid AI model ID is required'),
  body('configuration.assetTypes')
    .isArray({ min: 1 })
    .withMessage('At least one asset type is required'),
  body('configuration.markets')
    .isArray({ min: 1 })
    .withMessage('At least one market is required'),
  body('configuration.timeframes')
    .isArray({ min: 1 })
    .withMessage('At least one timeframe is required'),
  body('schedule.type')
    .isIn(['realtime', 'scheduled', 'on-demand', 'continuous'])
    .withMessage('Invalid schedule type')
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
    
    const { name, description, aiModel, configuration, schedule } = req.body;
    
    // Verify AI model exists and is active
    const model = await AIModel.findById(aiModel);
    if (!model || model.status !== 'deployed') {
      return res.status(400).json({
        success: false,
        message: 'AI model not found or not deployed'
      });
    }
    
    const jobData = {
      name,
      description,
      aiModel,
      modelVersion: model.version,
      configuration,
      schedule,
      creator: req.user._id,
      creatorName: req.user.fullName
    };
    
    const job = new AISignalJob(jobData);
    await job.save();
    
    // Start the job if it's configured to run immediately
    if (schedule.type === 'realtime' || schedule.type === 'continuous') {
      await aiSignalService.startJob(job);
    }
    
    res.status(201).json({
      success: true,
      message: 'AI signal generation job created successfully',
      data: job
    });
    
  } catch (error) {
    console.error('Create AI signal job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/signals/ai/jobs/:id/start
// @desc    Start AI signal generation job
// @access  Private (Professional+)
router.post('/ai/jobs/:id/start', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    const job = await AISignalJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'AI signal job not found'
      });
    }
    
    // Check if user owns this job
    if (job.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (job.status === 'running') {
      return res.status(400).json({
        success: false,
        message: 'Job is already running'
      });
    }
    
    await aiSignalService.startJob(job);
    
    res.json({
      success: true,
      message: 'AI signal generation job started successfully'
    });
    
  } catch (error) {
    console.error('Start AI signal job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/signals/ai/jobs/:id/stop
// @desc    Stop AI signal generation job
// @access  Private (Professional+)
router.post('/ai/jobs/:id/stop', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    const job = await AISignalJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'AI signal job not found'
      });
    }
    
    // Check if user owns this job
    if (job.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await aiSignalService.stopJob(job.jobId);
    
    res.json({
      success: true,
      message: 'AI signal generation job stopped successfully'
    });
    
  } catch (error) {
    console.error('Stop AI signal job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/signals/ai/jobs/:id/pause
// @desc    Pause AI signal generation job
// @access  Private (Professional+)
router.post('/ai/jobs/:id/pause', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    const job = await AISignalJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'AI signal job not found'
      });
    }
    
    // Check if user owns this job
    if (job.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await job.pause();
    
    res.json({
      success: true,
      message: 'AI signal generation job paused successfully'
    });
    
  } catch (error) {
    console.error('Pause AI signal job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/signals/ai/jobs/:id/resume
// @desc    Resume AI signal generation job
// @access  Private (Professional+)
router.post('/ai/jobs/:id/resume', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    const job = await AISignalJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'AI signal job not found'
      });
    }
    
    // Check if user owns this job
    if (job.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await job.resume();
    
    res.json({
      success: true,
      message: 'AI signal generation job resumed successfully'
    });
    
  } catch (error) {
    console.error('Resume AI signal job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/signals/ai/jobs/:id/performance
// @desc    Get AI signal job performance metrics
// @access  Private (Professional+)
router.get('/ai/jobs/:id/performance', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    const job = await AISignalJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'AI signal job not found'
      });
    }
    
    // Check if user owns this job
    if (job.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        execution: job.execution,
        results: job.results,
        performance: job.performance,
        successRate: job.successRate,
        errorRate: job.errorRate,
        uptime: job.uptime
      }
    });
    
  } catch (error) {
    console.error('Get AI signal job performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/signals/ai/generate
// @desc    Generate AI signals on-demand
// @access  Private (Professional+)
router.post('/ai/generate', [
  auth,
  requireSubscription('professional'),
  body('aiModel')
    .isMongoId()
    .withMessage('Valid AI model ID is required'),
  body('symbols')
    .isArray({ min: 1 })
    .withMessage('At least one symbol is required'),
  body('timeframe')
    .isIn(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'])
    .withMessage('Invalid timeframe')
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
    
    const { aiModel, symbols, timeframe, minConfidence = 70 } = req.body;
    
    // Verify AI model exists and is active
    const model = await AIModel.findById(aiModel);
    if (!model || model.status !== 'deployed') {
      return res.status(400).json({
        success: false,
        message: 'AI model not found or not deployed'
      });
    }
    
    // Create temporary job for on-demand generation
    const tempJob = {
      _id: new Date().getTime().toString(),
      name: `On-demand generation - ${new Date().toISOString()}`,
      aiModel: model._id,
      modelVersion: model.version,
      configuration: {
        symbols,
        timeframes: [timeframe],
        minConfidence,
        assetTypes: ['stock', 'crypto', 'forex'],
        markets: ['US', 'crypto']
      },
      schedule: {
        type: 'on-demand',
        isActive: true
      },
      creator: req.user._id,
      creatorName: req.user.fullName
    };
    
    // Generate signals
    const signals = [];
    for (const symbol of symbols) {
      try {
        const assetData = {
          symbol,
          name: symbol,
          type: 'stock',
          exchange: 'NASDAQ',
          market: 'US',
          price: Math.random() * 1000 + 50,
          volume: Math.random() * 1000000 + 100000
        };
        
        const assetSignals = await aiSignalService.generateSignalsForAsset(
          assetData, 
          model, 
          tempJob
        );
        signals.push(...assetSignals);
      } catch (error) {
        console.error(`Error generating signal for ${symbol}:`, error);
      }
    }
    
    res.json({
      success: true,
      message: `Generated ${signals.length} AI signals`,
      data: {
        signals,
        model: {
          name: model.name,
          version: model.version,
          accuracy: model.performance.accuracy
        },
        generationTime: new Date()
      }
    });
    
  } catch (error) {
    console.error('Generate AI signals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/signals/ai/statistics
// @desc    Get AI signal generation statistics
// @access  Private (Professional+)
router.get('/ai/statistics', [auth, requireSubscription('professional'), updateActivity], async (req, res) => {
  try {
    const stats = await aiSignalService.getStatistics();
    
    // Get additional statistics
    const totalJobs = await AISignalJob.countDocuments({ creator: req.user._id });
    const activeJobs = await AISignalJob.countDocuments({ 
      creator: req.user._id, 
      status: 'running' 
    });
    
    const userSignals = await TradingSignal.countDocuments({ 
      source: 'ai-generated',
      analyst: req.user._id
    });
    
    res.json({
      success: true,
      data: {
        ...stats,
        userJobs: {
          total: totalJobs,
          active: activeJobs
        },
        userSignals,
        timestamp: new Date()
      }
    });
    
  } catch (error) {
    console.error('Get AI signal statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
