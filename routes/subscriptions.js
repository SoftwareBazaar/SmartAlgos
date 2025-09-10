const express = require('express');
const { body, query, validationResult } = require('express-validator');
const databaseService = require('../services/databaseService');
const { auth, requireSubscription, updateActivity } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/subscriptions
// @desc    Get user's subscriptions
// @access  Private
router.get('/', [
  auth,
  updateActivity,
  query('status').optional().isIn(['pending', 'active', 'suspended', 'cancelled', 'expired', 'refunded']),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const { status, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const subscriptions = await Subscription.find(filter)
      .populate('ea', 'name description pricing creatorName')
      .populate('creator', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subscription.countDocuments(filter);

    res.json({
      success: true,
      data: subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/subscriptions/active
// @desc    Get user's active subscriptions
// @access  Private
router.get('/active', [auth, updateActivity], async (req, res) => {
  try {
    const subscriptions = await Subscription.findActiveSubscriptions(req.user._id);

    res.json({
      success: true,
      data: subscriptions
    });

  } catch (error) {
    console.error('Get active subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/subscriptions/:id
// @desc    Get single subscription
// @access  Private
router.get('/:id', [auth, updateActivity], async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('ea', 'name description pricing files')
      .populate('user', 'firstName lastName email')
      .populate('creator', 'firstName lastName avatar');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/subscriptions
// @desc    Create new subscription
// @access  Private
router.post('/', [
  auth,
  requireSubscription('basic'),
  body('eaId')
    .isMongoId()
    .withMessage('Valid EA ID is required'),
  body('subscriptionType')
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid subscription type'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'mobile_money', 'crypto'])
    .withMessage('Invalid payment method'),
  body('paymentReference')
    .notEmpty()
    .withMessage('Payment reference is required')
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

    const { eaId, subscriptionType, paymentMethod, paymentReference } = req.body;

    // Get EA details
    const ea = await EA.findById(eaId);
    if (!ea) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    // Check if EA is available
    if (!ea.isActive || ea.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'EA is not available for subscription'
      });
    }

    // Check if user already has an active subscription to this EA
    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      ea: eaId,
      status: { $in: ['active', 'pending'] }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription to this EA'
      });
    }

    // Calculate pricing and dates
    const price = ea.pricing[subscriptionType];
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Subscription type not available for this EA'
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    
    switch (subscriptionType) {
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }

    // Create subscription
    const subscription = new Subscription({
      user: req.user._id,
      ea: eaId,
      subscriptionType,
      price,
      currency: ea.pricing.currency,
      startDate,
      endDate,
      paymentMethod,
      paymentReference,
      paymentStatus: 'completed', // Assuming payment is already processed
      escrowAmount: price,
      creator: ea.creator
    });

    await subscription.save();

    // Create escrow
    const escrow = new Escrow({
      subscription: subscription._id,
      user: req.user._id,
      ea: eaId,
      creator: ea.creator,
      amount: price,
      currency: ea.pricing.currency,
      multisigAddress: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock address
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock hash
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await escrow.save();

    // Update EA subscription stats
    ea.subscriptionStats.totalSubscribers += 1;
    ea.subscriptionStats.activeSubscribers += 1;
    ea.subscriptionStats.totalRevenue += price;
    ea.subscriptionStats.monthlyRevenue += subscriptionType === 'monthly' ? price : 0;
    await ea.save();

    // Populate subscription for response
    await subscription.populate('ea', 'name description pricing');
    await subscription.populate('creator', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/subscriptions/:id/cancel
// @desc    Cancel subscription
// @access  Private
router.put('/:id/cancel', [
  auth,
  body('reason')
    .optional()
    .isIn(['user_request', 'payment_failed', 'ea_discontinued', 'violation', 'other'])
    .withMessage('Invalid cancellation reason')
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

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if subscription can be cancelled
    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled or expired'
      });
    }

    const { reason = 'user_request' } = req.body;
    await subscription.cancelSubscription(reason);

    // Update EA subscription stats
    const ea = await EA.findById(subscription.ea);
    if (ea) {
      ea.subscriptionStats.activeSubscribers = Math.max(0, ea.subscriptionStats.activeSubscribers - 1);
      await ea.save();
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/subscriptions/:id/renew
// @desc    Renew subscription
// @access  Private
router.put('/:id/renew', [
  auth,
  body('subscriptionType')
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid subscription type'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'mobile_money', 'crypto'])
    .withMessage('Invalid payment method'),
  body('paymentReference')
    .notEmpty()
    .withMessage('Payment reference is required')
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

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if subscription can be renewed
    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active subscriptions can be renewed'
      });
    }

    const { subscriptionType, paymentMethod, paymentReference } = req.body;

    // Get EA details
    const ea = await EA.findById(subscription.ea);
    if (!ea) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    const price = ea.pricing[subscriptionType];
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Subscription type not available for this EA'
      });
    }

    // Extend subscription
    await subscription.extendSubscription(subscriptionType);
    
    // Update payment information
    subscription.paymentMethod = paymentMethod;
    subscription.paymentReference = paymentReference;
    subscription.paymentStatus = 'completed';
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      data: subscription
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/subscriptions/:id/files
// @desc    Get subscription files
// @access  Private
router.get('/:id/files', [auth, updateActivity], async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('ea', 'files name');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if subscription is active
    if (subscription.status !== 'active' || !subscription.hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Subscription is not active'
      });
    }

    res.json({
      success: true,
      data: {
        files: subscription.ea.files,
        downloads: subscription.downloadedFiles
      }
    });

  } catch (error) {
    console.error('Get subscription files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/subscriptions/:id/download
// @desc    Record file download
// @access  Private
router.post('/:id/download', [
  auth,
  body('fileType')
    .isIn(['ea_file', 'set_file', 'manual', 'screenshot'])
    .withMessage('Invalid file type')
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

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if subscription is active
    if (subscription.status !== 'active' || !subscription.hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Subscription is not active'
      });
    }

    const { fileType } = req.body;
    await subscription.recordDownload(fileType);

    res.json({
      success: true,
      message: 'Download recorded successfully'
    });

  } catch (error) {
    console.error('Record download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/subscriptions/:id/support
// @desc    Create support ticket
// @access  Private
router.post('/:id/support', [
  auth,
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('description')
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

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { subject, description } = req.body;
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await subscription.addSupportTicket(ticketId, subject);

    res.json({
      success: true,
      message: 'Support ticket created successfully',
      data: {
        ticketId,
        subject,
        status: 'open'
      }
    });

  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/subscriptions/:id/performance
// @desc    Get subscription performance
// @access  Private
router.get('/:id/performance', [auth, updateActivity], async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        performance: subscription.performanceMetrics,
        duration: subscription.durationDays,
        daysRemaining: subscription.daysRemaining
      }
    });

  } catch (error) {
    console.error('Get subscription performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;