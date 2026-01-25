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
    
    console.log('[Get Subscriptions] Raw subscriptions from database:', subscriptions);

    // Enrich subscriptions with EA data
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        let ea = null;
        if (sub.ea_id) {
          try {
            ea = await databaseService.getEAById(sub.ea_id);
          } catch (error) {
            console.error(`[Get Subscriptions] Failed to fetch EA ${sub.ea_id}:`, error);
          }
        }
        
        return {
          ...sub,
          ea: ea ? {
            name: ea.name,
            description: ea.description,
            creatorName: ea.creator_name || 'Unknown Creator',
            image: ea.image
          } : null
        };
      })
    );
    
    console.log('[Get Subscriptions] Enriched subscriptions:', enrichedSubscriptions);

    // Get total count for proper pagination
    const total = await databaseService.getSubscriptionsCount({ user_id: req.user.id });

    res.json({
      success: true,
      data: enrichedSubscriptions,
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
  // Note: Don't require subscription here - this endpoint CREATES subscriptions
  body('eaId')
    .notEmpty()
    .withMessage('EA ID is required'),
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

    // Get EA details using database service (handles mock mode)
    const ea = await databaseService.getEAById(eaId);

    if (!ea) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    // Check if EA is available
    if (!ea.is_active) {
      return res.status(400).json({
        success: false,
        message: 'EA is not available for subscription'
      });
    }

    // Check if user already has an active subscription to this EA
    console.log('[Create Subscription] Checking for existing subscriptions:', {
      user_id: req.user.id,
      ea_id: eaId,
      ea_id_type: typeof eaId
    });
    
    const existingSubscriptions = await databaseService.getSubscriptions({
      user_id: req.user.id,
      ea_id: eaId
    });
    
    console.log('[Create Subscription] Found existing subscriptions:', existingSubscriptions);
    
    const hasActiveSubscription = existingSubscriptions.some(
      (sub) => ['active', 'pending'].includes(sub.status)
    );

    if (hasActiveSubscription) {
      console.log('[Create Subscription] User already has active subscription to EA:', eaId);
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription to this EA',
        debug: {
          requested_ea_id: eaId,
          existing_subscriptions: existingSubscriptions.map(s => ({
            id: s.id,
            ea_id: s.ea_id,
            status: s.status
          }))
        }
      });
    }

    // Calculate pricing and dates
    const priceField = `price_${subscriptionType}`;
    const price = ea[priceField];
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

    // Create subscription using database service (handles mock mode)
    const subscriptionData = {
      user_id: req.user.id,
      ea_id: eaId,
      subscription_type: subscriptionType,
      price,
      currency: 'USD',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      payment_status: 'completed',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      console.log('[Subscription] Creating subscription with data:', subscriptionData);
      const subscription = await databaseService.createSubscription(subscriptionData);
      console.log('[Subscription] Subscription created successfully:', subscription.id);
      
      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: subscription
      });
    } catch (error) {
      console.error('[Subscription] Creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create subscription',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Cancel/Delete subscription (Supabase version)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const userId = req.user.id;

    console.log(`[Cancel Subscription] User ${userId} canceling subscription ${subscriptionId}`);

    // Get subscription to verify ownership
    const subscription = await databaseService.getSubscriptionById(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Verify user owns this subscription
    if (subscription.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own subscriptions'
      });
    }

    // Check if already cancelled
    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled or expired'
      });
    }

    // Update subscription status to cancelled
    const updatedSubscription = await databaseService.updateSubscription(subscriptionId, {
      status: 'cancelled',
      updated_at: new Date().toISOString()
    });

    console.log(`[Cancel Subscription] Successfully cancelled subscription ${subscriptionId}`);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: updatedSubscription
    });

  } catch (error) {
    console.error('[Cancel Subscription] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
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
// @desc    Get subscription files with download links
// @access  Private
router.get('/:id/files', [auth, updateActivity], async (req, res) => {
  try {
    console.log('[Subscription Files] Request for subscription ID:', req.params.id);
    console.log('[Subscription Files] User ID:', req.user.id);
    
    // Validate subscription ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      console.error('[Subscription Files] Invalid subscription ID:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription ID'
      });
    }

    // Get subscription using database service (handles mock mode)
    const subscription = await databaseService.getSubscriptionById(req.params.id);

    if (!subscription) {
      console.error('[Subscription Files] Subscription not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    console.log('[Subscription Files] Found subscription:', {
      id: subscription.id,
      user_id: subscription.user_id,
      status: subscription.status,
      ea_id: subscription.ea_id
    });

    // Check if user owns this subscription
    if (subscription.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
      console.log('[Subscription Files] Subscription not active:', subscription.status);
      return res.status(403).json({
        success: false,
        message: 'Subscription is not active'
      });
    }

    // Check if subscription has expired
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    console.log('[Subscription Files] Date check:', {
      now: now.toISOString(),
      endDate: endDate.toISOString(),
      hasExpired: endDate < now
    });
    
    if (endDate < now) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has expired',
        debug: {
          endDate: subscription.end_date,
          currentDate: now.toISOString()
        }
      });
    }

    // Get EA details using database service (handles mock mode)
    const ea = await databaseService.getEAById(subscription.ea_id);

    if (!ea) {
      console.error('Get EA error: EA not found');
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    // Generate download token (valid for 24 hours)
    const jwt = require('jsonwebtoken');
    const downloadToken = jwt.sign(
      {
        subscriptionId: subscription.id,
        userId: req.user.id,
        eaId: ea.id,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('[Subscription Files] Generated download token for subscription:', subscription.id);

    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    
    // Generate download links using correct database column names
    // Priority: ZIP package first, then individual files as fallback
    const downloadLinks = {
      zip_package: ea.zip_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}/zip?token=${downloadToken}` : null,
      ea_file: ea.ea_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=ea_file` : null,
      set_file: ea.set_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=set_file` : null,
      manual: ea.manual_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=manual` : null,
      screenshots: ea.screenshots && ea.screenshots.length > 0 ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=screenshots` : null
    };
    
    console.log('[Subscription Files] EA files available:', {
      has_zip: !!ea.zip_file_path,
      ea_file: !!ea.ea_file_path,
      set_file: !!ea.set_file_path,
      manual: !!ea.manual_file_path,
      screenshots: !!(ea.screenshots && ea.screenshots.length > 0)
    });
    
    console.log('[Subscription Files] Download links generated:', Object.keys(downloadLinks).filter(key => downloadLinks[key]));

    res.json({
      success: true,
      data: {
        files: downloadLinks,
        downloads: subscription.downloaded_files || {},
        tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
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
    .isIn(['ea_file', 'set_file', 'manual', 'screenshot', 'screenshots'])
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
      const pricingMap = {
        weekly: product.price_weekly,
        monthly: product.price_monthly,
        quarterly: product.price_quarterly,
        yearly: product.price_yearly
      };
      pricing = pricingMap[subscription_type];
    } else if (product_type === 'hft_bot') {
      product = await databaseService.getHFTBotById(product_id);
      const pricingMap = {
        weekly: product.price_weekly,
        monthly: product.price_monthly,
        quarterly: product.price_quarterly,
        yearly: product.price_yearly
      };
      pricing = pricingMap[subscription_type];
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: 'Selected subscription type not available'
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

// @route   POST /api/subscriptions/:id/grant-access
// @desc    Grant download access after successful payment
// @access  Private (Admin or System)
router.post('/:id/grant-access', [
  auth,
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('paymentReference').notEmpty().withMessage('Payment reference is required')
], async (req, res) => {
  try {
    // Enforce Admin/System access
    if (!req.user || !['admin', 'system'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const supabase = databaseService.getClient();
    
    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if subscription is already active
    if (subscription.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already active'
      });
    }

    // Update subscription status and grant access
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        payment_status: 'paid',
        payment_method: req.body.paymentMethod,
        payment_reference: req.body.paymentReference,
        payment_date: new Date().toISOString(),
        access_granted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Subscription update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to grant access'
      });
    }

    // Get EA details for download links
    const { data: ea, error: eaError } = await supabase
      .from('eas')
      .select('*')
      .eq('id', subscription.ea_id)
      .single();

    if (eaError) {
      console.error('EA fetch error:', eaError);
    }

    // Generate download links
    const downloadLinks = generateDownloadLinks(ea, subscription);

    // Send confirmation email with download links
    await sendDownloadConfirmationEmail(subscription, downloadLinks);

    // Log access grant
    console.info('Download access granted', {
      subscriptionId: req.params.id,
      userId: subscription.user_id,
      eaId: subscription.ea_id,
      paymentMethod: req.body.paymentMethod
    });

    res.json({
      success: true,
      message: 'Download access granted successfully',
      data: {
        subscription: updatedSubscription,
        downloadLinks
      }
    });

  } catch (error) {
    console.error('Grant access error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to generate download links
function generateDownloadLinks(ea, subscription) {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const downloadToken = generateSecureToken();
  
  const links = {
    eaFile: ea.ea_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=ea_file` : null,
    setFile: ea.set_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=set_file` : null,
    manual: ea.manual_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=manual` : null,
    screenshots: ea.screenshots && ea.screenshots.length > 0
      ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=screenshots`
      : null
  };

  // Store download token in database for validation
  storeDownloadToken(subscription.id, downloadToken);

  return links;
}

// Helper function to generate secure download token
function generateSecureToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

// Helper function to store download token
async function storeDownloadToken(subscriptionId, token) {
  try {
    const supabase = databaseService.getClient();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours to match JWT TTL

    await supabase
      .from('download_tokens')
      .insert({
        subscription_id: subscriptionId,
        token: token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Store download token error:', error);
  }
}

// Helper function to send download confirmation email
async function sendDownloadConfirmationEmail(subscription, downloadLinks) {
  try {
    // In a real implementation, you would send an email here
    // For now, we'll just log it
    console.info('Download confirmation email sent', {
      subscriptionId: subscription.id,
      userEmail: subscription.user_email,
      downloadLinks
    });
  } catch (error) {
    console.error('Send email error:', error);
  }
}

module.exports = router;


// @route   POST /api/subscriptions/:id/resend-email
// @desc    Manually resend download email for a subscription
// @access  Private (user must own the subscription)
router.post('/:id/resend-email', auth, async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const userId = req.user.id;

    console.log(`\n📧 [Resend Email] Request for subscription ${subscriptionId} by user ${userId}`);

    const supabase = databaseService.getClient();
    
    // 1. Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('❌ [Resend Email] Subscription not found:', subError?.message);
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // 2. Verify user owns this subscription
    if (subscription.user_id !== userId) {
      console.error('❌ [Resend Email] User does not own this subscription');
      return res.status(403).json({
        success: false,
        message: 'You can only resend emails for your own subscriptions'
      });
    }

    console.log('✅ [Resend Email] Subscription found and verified');
    console.log(`   User ID: ${subscription.user_id}`);
    console.log(`   EA ID: ${subscription.ea_id}`);
    console.log(`   Status: ${subscription.status}`);

    // 3. Get user details
    const { data: user, error: userError } = await supabase
      .from('users_accounts')
      .select('email, first_name, last_name')
      .eq('id', subscription.user_id)
      .single();

    if (userError || !user || !user.email) {
      console.error('❌ [Resend Email] User not found or no email:', userError?.message);
      return res.status(404).json({
        success: false,
        message: 'User email not found'
      });
    }

    console.log('✅ [Resend Email] User found');
    console.log(`   Email: ${user.email}`);

    // 4. Get EA details
    const { data: ea, error: eaError } = await supabase
      .from('expert_advisors')
      .select('*')
      .eq('id', subscription.ea_id)
      .single();

    if (eaError || !ea) {
      console.error('❌ [Resend Email] EA not found:', eaError?.message);
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    console.log('✅ [Resend Email] EA found');
    console.log(`   Name: ${ea.name}`);

    // 5. Generate download links
    const jwt = require('jsonwebtoken');
    const downloadToken = jwt.sign(
      {
        subscriptionId: subscription.id,
        userId: subscription.user_id,
        eaId: ea.id,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    
    const downloadLinks = {
      zip_package: ea.zip_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}/zip?token=${downloadToken}` : null,
      ea_file: ea.ea_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=ea_file` : null,
      set_file: ea.set_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=set_file` : null,
      manual: ea.manual_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=manual` : null
    };

    console.log('✅ [Resend Email] Download links generated');

    // 6. Send email
    const emailService = require('../services/emailService');
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Valued Customer';
    
    console.log('📧 [Resend Email] Sending email...');
    
    const emailResult = await emailService.sendDownloadEmail({
      userEmail: user.email,
      userName: userName,
      eaName: ea.name,
      downloadLinks: downloadLinks,
      subscriptionType: subscription.subscription_type || 'monthly',
      subscriptionId: subscription.id
    });

    if (emailResult.success) {
      console.log('✅ [Resend Email] Email sent successfully!');
      console.log(`   Message ID: ${emailResult.messageId}`);
      
      return res.json({
        success: true,
        message: 'Email sent successfully! Check your inbox.',
        data: {
          email: user.email,
          messageId: emailResult.messageId
        }
      });
    } else {
      console.error('❌ [Resend Email] Email failed:', emailResult.error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send email: ' + emailResult.error,
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('❌ [Resend Email] Error:', error.message);
    console.error(error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Server error while resending email',
      error: error.message
    });
  }
});

module.exports = router;
