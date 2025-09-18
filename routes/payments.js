const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { auth, updateActivity } = require('../middleware/auth');
const paystackService = require('../services/paystackService');
const billingService = require('../services/billingService');
const securityService = require('../services/securityService');
const { auditLog } = require('../middleware/security');
const router = express.Router();

// @route   POST /api/payments/initialize
// @desc    Initialize Paystack payment
// @access  Private
router.post('/initialize', [
  auth,
  updateActivity,
  auditLog('payment_initialized'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['NGN', 'USD', 'GHS', 'ZAR', 'KES'])
    .withMessage('Invalid currency'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('callback_url')
    .optional()
    .isURL()
    .withMessage('Invalid callback URL'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
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

    const { amount, currency, email, callback_url, metadata = {} } = req.body;

    // Generate unique reference
    const reference = paystackService.generateReference('PAY');

    const transactionData = {
      email,
      amount,
      currency,
      reference,
      callback_url: callback_url || `${process.env.CLIENT_URL || 'http://localhost:3000'}/payments?reference=${reference}`,
      metadata: {
        ...metadata,
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        platform: 'smart-algos'
      }
    };

    const result = await paystackService.initializeTransaction(transactionData);

    // Log payment initialization
    securityService.logSecurityEvent('payment_initialized', {
      userId: req.user._id,
      amount,
      currency,
      reference,
      ip: securityService.getClientIP(req)
    });

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment'
    });
  }
});

// @route   POST /api/payments/charge-authorization
// @desc    Charge authorization code
// @access  Private
router.post('/charge-authorization', [
  auth,
  updateActivity,
  auditLog('payment_charged'),
  body('authorization_code')
    .notEmpty()
    .withMessage('Authorization code is required'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['NGN', 'USD', 'GHS', 'ZAR', 'KES'])
    .withMessage('Invalid currency'),
  body('reference')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Reference must be between 1 and 100 characters'),
  body('callback_url')
    .optional()
    .isURL()
    .withMessage('Invalid callback URL'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
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

    const { authorization_code, email, amount, currency, reference, callback_url, metadata = {} } = req.body;

    const chargeData = {
      authorization_code,
      email,
      amount,
      currency,
      reference,
      callback_url,
      metadata: {
        ...metadata,
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        platform: 'smart-algos'
      }
    };

    const result = await paystackService.chargeAuthorization(chargeData);

    // Log charge authorization
    securityService.logSecurityEvent('payment_charged', {
      userId: req.user._id,
      authorization_code,
      amount,
      currency,
      reference: result.data.reference,
      ip: securityService.getClientIP(req)
    });

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Charge authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to charge authorization'
    });
  }
});

// @route   POST /api/payments/initialize-paused
// @desc    Initialize Paystack payment with paused state
// @access  Private
router.post('/initialize-paused', [
  auth,
  updateActivity,
  auditLog('payment_initialized_paused'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['NGN', 'USD', 'GHS', 'ZAR', 'KES'])
    .withMessage('Invalid currency'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('callback_url')
    .optional()
    .isURL()
    .withMessage('Invalid callback URL'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
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

    const { amount, currency, email, callback_url, metadata = {} } = req.body;

    // Generate unique reference
    const reference = paystackService.generateReference('PAY_PAUSED');

    const transactionData = {
      email,
      amount,
      currency,
      reference,
      callback_url: callback_url || `${process.env.CLIENT_URL || 'http://localhost:3000'}/payments?reference=${reference}`,
      metadata: {
        ...metadata,
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        platform: 'smart-algos'
      }
    };

    const result = await paystackService.initializeTransactionWithPause(transactionData);

    // Log payment initialization with pause
    securityService.logSecurityEvent('payment_initialized_paused', {
      userId: req.user._id,
      amount,
      currency,
      reference,
      ip: securityService.getClientIP(req)
    });

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Initialize paused payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize paused payment'
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Paystack payment
// @access  Private
router.post('/verify', [
  auth,
  updateActivity,
  auditLog('payment_verified'),
  body('reference')
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

    const { reference } = req.body;

    const result = await paystackService.verifyTransaction(reference);

    if (result.success && result.data.status === 'success') {
      // Log successful payment verification
      securityService.logSecurityEvent('payment_verified', {
        userId: req.user._id,
        reference,
        amount: result.data.amount,
        currency: result.data.currency,
        ip: securityService.getClientIP(req)
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: result.data
      });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// ==================== SUBSCRIPTION BILLING ROUTES ====================

// @route   POST /api/payments/subscriptions/create
// @desc    Create subscription
// @access  Private
router.post('/subscriptions/create', [
  auth,
  updateActivity,
  auditLog('subscription_created'),
  body('subscriptionType')
    .isIn(['BASIC', 'PROFESSIONAL', 'ENTERPRISE'])
    .withMessage('Invalid subscription type'),
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('productType')
    .isIn(['ea', 'hft'])
    .withMessage('Invalid product type'),
  body('interval')
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid billing interval'),
  body('paymentMethod')
    .isIn(['paystack'])
    .withMessage('Invalid payment method')
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

    const { subscriptionType, productId, productType, interval, paymentMethod } = req.body;

    const subscriptionData = {
      subscriptionType,
      productId,
      productType,
      interval,
      paymentMethod,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: securityService.getClientIP(req)
      }
    };

    const subscription = await billingService.createSubscription(req.user._id, subscriptionData);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create subscription'
    });
  }
});

// @route   POST /api/payments/subscriptions/:id/process-payment
// @desc    Process subscription payment
// @access  Private
router.post('/subscriptions/:id/process-payment', [
  auth,
  updateActivity,
  auditLog('subscription_payment_processed'),
  body('paymentMethod')
    .isIn(['paystack'])
    .withMessage('Invalid payment method'),
  body('paymentDetails')
    .isObject()
    .withMessage('Payment details are required')
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

    const { id } = req.params;
    const { paymentMethod, paymentDetails } = req.body;

    const result = await billingService.processPayment(id, {
      paymentMethod,
      paymentDetails
    });

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Process subscription payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment'
    });
  }
});

// @route   GET /api/payments/subscriptions
// @desc    Get user subscriptions
// @access  Private
router.get('/subscriptions', [
  auth,
  updateActivity,
  query('status').optional().isIn(['pending', 'active', 'cancelled', 'expired', 'refunded']),
  query('type').optional().isIn(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { status, type, page = 1, limit = 20 } = req.query;

    const result = await billingService.getUserSubscriptions(req.user._id, {
      status,
      type,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: result.subscriptions,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions'
    });
  }
});

// @route   GET /api/payments/subscriptions/:id
// @desc    Get subscription details
// @access  Private
router.get('/subscriptions/:id', [auth, updateActivity], async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await billingService.getSubscriptionDetails(id);

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
    console.error('Get subscription details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subscription details'
    });
  }
});

// @route   POST /api/payments/subscriptions/:id/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/subscriptions/:id/cancel', [
  auth,
  updateActivity,
  auditLog('subscription_cancelled'),
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters')
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

    const { id } = req.params;
    const { reason = 'User request' } = req.body;

    const subscription = await billingService.cancelSubscription(id, reason);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel subscription'
    });
  }
});

// @route   POST /api/payments/subscriptions/:id/renew
// @desc    Renew subscription
// @access  Private
router.post('/subscriptions/:id/renew', [
  auth,
  updateActivity,
  auditLog('subscription_renewed')
], async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await billingService.renewSubscription(id);

    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      data: subscription
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to renew subscription'
    });
  }
});

// @route   GET /api/payments/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = billingService.getAvailablePlans();

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plans'
    });
  }
});

// @route   POST /api/payments/methods
// @desc    Add new payment method
// @access  Private
router.post('/methods', [
  auth,
  body('type')
    .isIn(['card', 'bank_account'])
    .withMessage('Invalid payment method type'),
  body('card')
    .optional()
    .isObject()
    .withMessage('Card details are required for card payments'),
  body('bankAccount')
    .optional()
    .isObject()
    .withMessage('Bank account details are required for bank payments')
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

    const { type, card, bankAccount, isDefault = false } = req.body;

    // Here you would add the payment method to the payment gateway
    // For now, we'll create a mock payment method
    const paymentMethod = {
      id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      ...(type === 'card' && { card }),
      ...(type === 'bank_account' && { bankAccount }),
      isDefault: isDefault,
      created: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod
    });

  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/payments/methods/:id
// @desc    Delete payment method
// @access  Private
router.delete('/methods/:id', [auth], async (req, res) => {
  try {
    const { id } = req.params;

    // Here you would delete the payment method from the payment gateway
    // For now, we'll simulate successful deletion

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/history
// @desc    Get payment history
// @access  Private
router.get('/history', [
  auth,
  updateActivity,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['succeeded', 'pending', 'failed', 'canceled']),
  query('type').optional().isIn(['subscription', 'one_time', 'refund'])
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

    const { page = 1, limit = 20, status, type } = req.query;

    // Mock payment history
    const payments = [
      {
        id: 'pi_001',
        amount: 2900,
        currency: 'usd',
        status: 'succeeded',
        type: 'subscription',
        description: 'Basic Plan - Monthly',
        paymentMethod: 'card_****4242',
        created: new Date('2023-11-01T10:00:00Z'),
        receiptUrl: 'https://payments.smartalgos.com/receipts/pi_001'
      },
      {
        id: 'pi_002',
        amount: 15000,
        currency: 'usd',
        status: 'succeeded',
        type: 'one_time',
        description: 'Custom EA Development',
        paymentMethod: 'card_****4242',
        created: new Date('2023-10-15T14:30:00Z'),
        receiptUrl: 'https://payments.smartalgos.com/receipts/pi_002'
      },
      {
        id: 'pi_003',
        amount: 7900,
        currency: 'usd',
        status: 'succeeded',
        type: 'subscription',
        description: 'Professional Plan - Monthly',
        paymentMethod: 'card_****5555',
        created: new Date('2023-11-01T10:00:00Z'),
        receiptUrl: 'https://payments.smartalgos.com/receipts/pi_003'
      }
    ];

    // Apply filters
    let filteredPayments = payments;
    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status === status);
    }
    if (type) {
      filteredPayments = filteredPayments.filter(p => p.type === type);
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedPayments = filteredPayments.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedPayments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredPayments.length / parseInt(limit)),
        totalItems: filteredPayments.length,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== REFUND MANAGEMENT ====================

// @route   POST /api/payments/refund
// @desc    Process refund
// @access  Private
router.post('/refund', [
  auth,
  updateActivity,
  auditLog('refund_requested'),
  body('transactionReference')
    .notEmpty()
    .withMessage('Transaction reference is required'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be greater than 0'),
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters')
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

    const { transactionReference, amount, reason } = req.body;

    const refundData = {
      transaction: transactionReference,
      amount: amount,
      currency: 'NGN',
      customer_note: reason || 'Customer request',
      merchant_note: `Refund requested by user ${req.user._id}`
    };

    const result = await paystackService.createRefund(refundData);

    if (result.success) {
      // Log refund request
      securityService.logSecurityEvent('refund_processed', {
        userId: req.user._id,
        transactionReference,
        amount: result.data.amount,
        reason,
        ip: securityService.getClientIP(req)
      });

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Refund processing failed',
        data: result
      });
    }

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

// @route   POST /api/payments/subscriptions/:id/refund
// @desc    Process subscription refund
// @access  Private
router.post('/subscriptions/:id/refund', [
  auth,
  updateActivity,
  auditLog('subscription_refund_requested'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be greater than 0'),
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters'),
  body('type')
    .optional()
    .isIn(['full', 'partial'])
    .withMessage('Invalid refund type')
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

    const { id } = req.params;
    const { amount, reason, type = 'full' } = req.body;

    const refundData = {
      amount,
      reason,
      type
    };

    const result = await billingService.processRefund(id, refundData);

    res.json({
      success: true,
      message: 'Subscription refund processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Process subscription refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process subscription refund'
    });
  }
});

// ==================== WEBHOOK HANDLING ====================

// @route   POST /api/payments/webhook/paystack
// @desc    Handle Paystack webhooks
// @access  Public (but verified with signature)
router.post('/webhook/paystack', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!paystackService.verifyWebhook(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = paystackService.parseWebhookEvent(payload);
    
    // Log webhook event
    securityService.logSecurityEvent('webhook_received', {
      event: event.event,
      reference: event.data?.reference,
      amount: event.data?.amount,
      status: event.data?.status
    });

    // Handle different webhook events
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
      case 'invoice.create':
        await handleInvoiceCreated(event.data);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// ==================== WEBHOOK EVENT HANDLERS ====================

async function handleSuccessfulPayment(data) {
  try {
    console.log('Payment successful:', data.reference);
    // Update subscription status, send notifications, etc.
  } catch (error) {
    console.error('Handle successful payment error:', error);
  }
}

async function handleFailedPayment(data) {
  try {
    console.log('Payment failed:', data.reference);
    // Update subscription status, send notifications, etc.
  } catch (error) {
    console.error('Handle failed payment error:', error);
  }
}

async function handleSubscriptionCreated(data) {
  try {
    console.log('Subscription created:', data.subscription_code);
    // Update subscription status, send notifications, etc.
  } catch (error) {
    console.error('Handle subscription created error:', error);
  }
}

async function handleSubscriptionDisabled(data) {
  try {
    console.log('Subscription disabled:', data.subscription_code);
    // Update subscription status, send notifications, etc.
  } catch (error) {
    console.error('Handle subscription disabled error:', error);
  }
}

async function handleInvoiceCreated(data) {
  try {
    console.log('Invoice created:', data.invoice_number);
    // Send invoice to customer, update records, etc.
  } catch (error) {
    console.error('Handle invoice created error:', error);
  }
}

async function handleInvoicePaymentFailed(data) {
  try {
    console.log('Invoice payment failed:', data.invoice_number);
    // Send payment failure notification, update subscription, etc.
  } catch (error) {
    console.error('Handle invoice payment failed error:', error);
  }
}

// @route   GET /api/payments/invoices
// @desc    Get invoices
// @access  Private
router.get('/invoices', [
  auth,
  updateActivity,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const { page = 1, limit = 20 } = req.query;

    // Mock invoices
    const invoices = [
      {
        id: 'inv_001',
        number: 'INV-2023-001',
        amount: 2900,
        currency: 'usd',
        status: 'paid',
        description: 'Basic Plan - Monthly Subscription',
        periodStart: new Date('2023-11-01'),
        periodEnd: new Date('2023-12-01'),
        dueDate: new Date('2023-11-01'),
        paidDate: new Date('2023-11-01'),
        downloadUrl: 'https://invoices.smartalgos.com/inv_001.pdf'
      },
      {
        id: 'inv_002',
        number: 'INV-2023-002',
        amount: 15000,
        currency: 'usd',
        status: 'paid',
        description: 'Custom EA Development Services',
        periodStart: new Date('2023-10-01'),
        periodEnd: new Date('2023-10-31'),
        dueDate: new Date('2023-10-15'),
        paidDate: new Date('2023-10-15'),
        downloadUrl: 'https://invoices.smartalgos.com/inv_002.pdf'
      }
    ];

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedInvoices = invoices.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedInvoices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(invoices.length / parseInt(limit)),
        totalItems: invoices.length,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/invoices/:id/download
// @desc    Download invoice
// @access  Private
router.get('/invoices/:id/download', [auth], async (req, res) => {
  try {
    const { id } = req.params;

    // Here you would generate and return the actual invoice PDF
    // For now, we'll return a mock download URL
    const downloadUrl = `https://invoices.smartalgos.com/${id}.pdf`;

    res.json({
      success: true,
      data: {
        downloadUrl: downloadUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
