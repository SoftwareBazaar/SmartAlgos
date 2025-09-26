const express = require('express');
const { body, query, validationResult } = require('express-validator');
const databaseService = require('../services/databaseService');
const paystackService = require('../services/paystackService');
const billingService = require('../services/billingService');
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
    const filter = { user_id: req.user.id };
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query using Supabase
    const subscriptions = await databaseService.getSubscriptions({
      ...filter,
      limit: parseInt(limit),
      offset: skip
    });

    const total = subscriptions.length; // For now, return array length

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

// @route   POST /api/subscriptions/create
// @desc    Create a new subscription
// @access  Private
router.post('/create', [
  auth,
  updateActivity,
  body('product_id').notEmpty().withMessage('Product ID is required'),
  body('product_type').isIn(['expert_advisor', 'hft_bot', 'trading_signal', 'platform']).withMessage('Invalid product type'),
  body('subscription_type').isIn(['weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid subscription type'),
  body('payment_method').notEmpty().withMessage('Payment method is required')
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

    const { product_id, product_type, subscription_type, payment_method, auto_renew = true } = req.body;
    const userId = req.user.id;

    // Check if user already has active subscription for this product
    const existingSubscription = await databaseService.getSubscriptions({
      user_id: userId,
      product_id,
      status: 'active'
    });

    if (existingSubscription.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Active subscription already exists for this product'
      });
    }

    // Get product details and pricing
    let product, pricing;
    
    if (product_type === 'expert_advisor') {
      product = await databaseService.getEAById(product_id);
      pricing = product.price_monthly; // Simplified pricing
    } else if (product_type === 'hft_bot') {
      product = await databaseService.getHFTBotById(product_id);
      pricing = product.price_monthly;
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    switch (subscription_type) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Create payment intent with Paystack
    const paymentData = {
      email: req.user.email,
      amount: pricing * 100, // Convert to kobo
      currency: 'NGN',
      metadata: {
        user_id: userId,
        product_id,
        product_type,
        subscription_type
      }
    };

    const paymentIntent = await paystackService.initializeTransaction(paymentData);

    // Create subscription record
    const subscriptionData = {
      user_id: userId,
      product_id,
      product_type,
      subscription_type,
      status: 'pending',
      amount: pricing,
      currency: 'NGN',
      payment_method,
      payment_reference: paymentIntent.data.reference,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      auto_renew,
      created_at: new Date().toISOString()
    };

    const subscription = await databaseService.createSubscription(subscriptionData);

    res.json({
      success: true,
      data: {
        subscription,
        payment_url: paymentIntent.data.authorization_url,
        reference: paymentIntent.data.reference
      },
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
});

// @route   POST /api/subscriptions/:id/cancel
// @desc    Cancel a subscription
// @access  Private
router.post('/:id/cancel', [
  auth,
  updateActivity,
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Get subscription
    const subscription = await databaseService.getSubscriptionById(id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check ownership
    if (subscription.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this subscription'
      });
    }

    // Check if already cancelled
    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled'
      });
    }

    // Update subscription status
    const updates = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      updated_at: new Date().toISOString()
    };

    await databaseService.updateSubscription(id, updates);

    // Process refund if applicable
    if (subscription.status === 'active') {
      await billingService.processRefund(subscription);
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// @route   POST /api/subscriptions/:id/renew
// @desc    Renew a subscription
// @access  Private
router.post('/:id/renew', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get subscription
    const subscription = await databaseService.getSubscriptionById(id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check ownership
    if (subscription.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to renew this subscription'
      });
    }

    // Check if renewable
    if (!['expired', 'cancelled'].includes(subscription.status)) {
      return res.status(400).json({
        success: false,
        message: 'Subscription is not eligible for renewal'
      });
    }

    // Calculate new end date
    const newStartDate = new Date();
    const newEndDate = new Date(newStartDate);
    
    switch (subscription.subscription_type) {
      case 'weekly':
        newEndDate.setDate(newEndDate.getDate() + 7);
        break;
      case 'monthly':
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        break;
      case 'quarterly':
        newEndDate.setMonth(newEndDate.getMonth() + 3);
        break;
      case 'yearly':
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        break;
    }

    // Create payment intent
    const paymentData = {
      email: req.user.email,
      amount: subscription.amount * 100,
      currency: subscription.currency,
      metadata: {
        user_id: userId,
        subscription_id: id,
        renewal: true
      }
    };

    const paymentIntent = await paystackService.initializeTransaction(paymentData);

    // Update subscription
    const updates = {
      status: 'pending',
      start_date: newStartDate.toISOString(),
      end_date: newEndDate.toISOString(),
      payment_reference: paymentIntent.data.reference,
      renewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await databaseService.updateSubscription(id, updates);

    res.json({
      success: true,
      data: {
        payment_url: paymentIntent.data.authorization_url,
        reference: paymentIntent.data.reference
      },
      message: 'Subscription renewal initiated'
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew subscription'
    });
  }
});

// @route   POST /api/subscriptions/webhook
// @desc    Handle subscription webhooks (payment confirmation)
// @access  Public
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;

    // Verify webhook signature
    const isValid = paystackService.verifyWebhook(req.headers['x-paystack-signature'], JSON.stringify(event));
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
      case 'subscription.create':
        await handleSubscriptionCreated(event.data);
        break;
      case 'subscription.disable':
        await handleSubscriptionDisabled(event.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// @route   GET /api/subscriptions/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        description: 'Basic access to platform features',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
          'Access to basic market data',
          'Limited trading signals',
          'Basic portfolio tracking',
          'Community access'
        ],
        limits: {
          signals_per_day: 5,
          portfolios: 1,
          watchlist_items: 10
        }
      },
      {
        id: 'basic',
        name: 'Basic',
        description: 'Enhanced features for serious traders',
        price: 29,
        currency: 'USD',
        interval: 'month',
        features: [
          'Real-time market data',
          'Advanced trading signals',
          'Multiple portfolios',
          'Technical analysis tools',
          'Email support'
        ],
        limits: {
          signals_per_day: 50,
          portfolios: 5,
          watchlist_items: 50
        }
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Advanced tools for professional traders',
        price: 99,
        currency: 'USD',
        interval: 'month',
        features: [
          'All Basic features',
          'AI-powered signals',
          'Advanced analytics',
          'Custom indicators',
          'Priority support',
          'API access'
        ],
        limits: {
          signals_per_day: 200,
          portfolios: 20,
          watchlist_items: 200
        }
      },
      {
        id: 'institutional',
        name: 'Institutional',
        description: 'Enterprise-grade solutions',
        price: 299,
        currency: 'USD',
        interval: 'month',
        features: [
          'All Professional features',
          'Unlimited signals',
          'White-label solutions',
          'Dedicated support',
          'Custom integrations',
          'Risk management tools'
        ],
        limits: {
          signals_per_day: -1, // Unlimited
          portfolios: -1,
          watchlist_items: -1
        }
      }
    ];

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription plans'
    });
  }
});

// Helper functions for webhook handling
async function handleSuccessfulPayment(paymentData) {
  try {
    const reference = paymentData.reference;
    
    // Find subscription by payment reference
    const subscriptions = await databaseService.getSubscriptions({
      payment_reference: reference
    });

    if (subscriptions.length === 0) {
      console.error('No subscription found for payment reference:', reference);
      return;
    }

    const subscription = subscriptions[0];

    // Update subscription status
    await databaseService.updateSubscription(subscription.id, {
      status: 'active',
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Update user subscription tier if it's a platform subscription
    if (subscription.product_type === 'platform') {
      await databaseService.updateUser(subscription.user_id, {
        subscription_type: subscription.subscription_type,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      });
    }

    console.log(`Subscription ${subscription.id} activated successfully`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentData) {
  try {
    const reference = paymentData.reference;
    
    // Find subscription by payment reference
    const subscriptions = await databaseService.getSubscriptions({
      payment_reference: reference
    });

    if (subscriptions.length === 0) {
      console.error('No subscription found for payment reference:', reference);
      return;
    }

    const subscription = subscriptions[0];

    // Update subscription status
    await databaseService.updateSubscription(subscription.id, {
      status: 'failed',
      failure_reason: paymentData.gateway_response,
      updated_at: new Date().toISOString()
    });

    console.log(`Subscription ${subscription.id} payment failed`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handleSubscriptionCreated(subscriptionData) {
  // Handle recurring subscription creation
  console.log('Subscription created:', subscriptionData);
}

async function handleSubscriptionDisabled(subscriptionData) {
  // Handle subscription cancellation/expiration
  console.log('Subscription disabled:', subscriptionData);
}

module.exports = router;