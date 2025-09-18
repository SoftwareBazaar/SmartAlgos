const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { auth, updateActivity } = require('../middleware/auth');
const escrowService = require('../services/escrowService');
const securityService = require('../services/securityService');
const { auditLog } = require('../middleware/security');
const router = express.Router();

// ==================== TRANSACTION MANAGEMENT ====================

// @route   POST /api/escrow/transactions
// @desc    Create escrow transaction
// @access  Private
router.post('/transactions', [
  auth,
  updateActivity,
  auditLog('escrow_transaction_created'),
  body('buyerEmail')
    .isEmail()
    .withMessage('Valid buyer email is required'),
  body('sellerEmail')
    .isEmail()
    .withMessage('Valid seller email is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['USD', 'EUR', 'GBP', 'NGN'])
    .withMessage('Invalid currency'),
  body('description')
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('productType')
    .optional()
    .isIn(['ea_subscription', 'hft_rental', 'trading_signal', 'consultation', 'training', 'software'])
    .withMessage('Invalid product type'),
  body('inspectionPeriod')
    .optional()
    .isInt({ min: 86400, max: 1209600 }) // 1 day to 14 days
    .withMessage('Inspection period must be between 1 and 14 days')
], async (req, res) => {
  try {
    // Debug logging for escrow transaction creation
    console.log('Escrow transaction creation request:', {
      method: req.method,
      url: req.url,
      body: req.body,
      user: req.user ? req.user._id : 'No user',
      contentType: req.headers['content-type']
    });

    // Check if request body is null or empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required',
        error: 'No data provided in request body'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      buyerEmail,
      sellerEmail,
      amount,
      currency,
      description,
      productType,
      inspectionPeriod,
      metadata = {}
    } = req.body;

    const transactionData = {
      buyerEmail,
      sellerEmail,
      amount,
      currency,
      description,
      productType,
      inspectionPeriod,
      metadata: {
        ...metadata,
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        platform: 'smart-algos'
      }
    };

    const result = await escrowService.createTransaction(transactionData);

    // Log escrow transaction creation
    securityService.logSecurityEvent('escrow_transaction_created', {
      userId: req.user._id,
      transactionId: result.data.id,
      amount,
      currency,
      buyerEmail,
      sellerEmail,
      ip: securityService.getClientIP(req)
    });

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Create escrow transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create escrow transaction'
    });
  }
});

// @route   GET /api/escrow/transactions/:id
// @desc    Get escrow transaction details
// @access  Private
router.get('/transactions/:id', [
  auth,
  updateActivity,
  auditLog('escrow_transaction_viewed')
], async (req, res) => {
  try {
    const { id } = req.params;

    const result = await escrowService.getTransaction(id);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Get escrow transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get escrow transaction'
    });
  }
});

// @route   PATCH /api/escrow/transactions/:id
// @desc    Update escrow transaction
// @access  Private
router.patch('/transactions/:id', [
  auth,
  updateActivity,
  auditLog('escrow_transaction_updated'),
  body('description')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('inspectionPeriod')
    .optional()
    .isInt({ min: 86400, max: 1209600 })
    .withMessage('Inspection period must be between 1 and 14 days')
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
    const updateData = req.body;

    const result = await escrowService.updateTransaction(id, updateData);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Update escrow transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update escrow transaction'
    });
  }
});

// @route   DELETE /api/escrow/transactions/:id
// @desc    Cancel escrow transaction
// @access  Private
router.delete('/transactions/:id', [
  auth,
  updateActivity,
  auditLog('escrow_transaction_cancelled'),
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

    const result = await escrowService.cancelTransaction(id, reason);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Cancel escrow transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel escrow transaction'
    });
  }
});

// ==================== PAYMENT MANAGEMENT ====================

// @route   POST /api/escrow/transactions/:id/payments
// @desc    Initiate escrow payment
// @access  Private
router.post('/transactions/:id/payments', [
  auth,
  updateActivity,
  auditLog('escrow_payment_initiated'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['USD', 'EUR', 'GBP', 'NGN'])
    .withMessage('Invalid currency'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'paypal', 'crypto'])
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

    const { id } = req.params;
    const { amount, currency, paymentMethod, metadata = {} } = req.body;

    const paymentData = {
      amount,
      currency,
      paymentMethod,
      metadata: {
        ...metadata,
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        platform: 'smart-algos'
      }
    };

    const result = await escrowService.initiatePayment(id, paymentData);

    // Log payment initiation
    securityService.logSecurityEvent('escrow_payment_initiated', {
      userId: req.user._id,
      transactionId: id,
      amount,
      currency,
      paymentMethod,
      ip: securityService.getClientIP(req)
    });

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Initiate escrow payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate escrow payment'
    });
  }
});

// @route   GET /api/escrow/transactions/:id/payments/:paymentId
// @desc    Get escrow payment status
// @access  Private
router.get('/transactions/:id/payments/:paymentId', [
  auth,
  updateActivity,
  auditLog('escrow_payment_status_viewed')
], async (req, res) => {
  try {
    const { id, paymentId } = req.params;

    const result = await escrowService.getPaymentStatus(id, paymentId);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Get escrow payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get escrow payment status'
    });
  }
});

// ==================== DISPUTE MANAGEMENT ====================

// @route   POST /api/escrow/transactions/:id/disputes
// @desc    Create escrow dispute
// @access  Private
router.post('/transactions/:id/disputes', [
  auth,
  updateActivity,
  auditLog('escrow_dispute_created'),
  body('reason')
    .isIn(['product_not_as_described', 'product_not_delivered', 'product_defective', 'seller_unresponsive', 'other'])
    .withMessage('Invalid dispute reason'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array')
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
    const { reason, description, evidence = [], metadata = {} } = req.body;

    const disputeData = {
      reason,
      description,
      evidence,
      metadata: {
        ...metadata,
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        platform: 'smart-algos'
      }
    };

    const result = await escrowService.createDispute(id, disputeData);

    // Log dispute creation
    securityService.logSecurityEvent('escrow_dispute_created', {
      userId: req.user._id,
      transactionId: id,
      reason,
      ip: securityService.getClientIP(req)
    });

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Create escrow dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create escrow dispute'
    });
  }
});

// ==================== UTILITY ENDPOINTS ====================

// @route   GET /api/escrow/fee-calculator
// @desc    Calculate escrow fees
// @access  Private
router.get('/fee-calculator', [
  auth,
  query('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  query('currency')
    .isIn(['USD', 'EUR', 'GBP', 'NGN'])
    .withMessage('Invalid currency')
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

    const { amount, currency } = req.query;
    const fee = escrowService.calculateEscrowFee(parseFloat(amount), currency);

    res.json({
      success: true,
      data: {
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        escrowFee: fee,
        totalAmount: parseFloat(amount) + fee,
        feePercentage: ((fee / parseFloat(amount)) * 100).toFixed(2)
      },
      message: 'Escrow fee calculated successfully'
    });

  } catch (error) {
    console.error('Calculate escrow fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate escrow fee'
    });
  }
});

// @route   GET /api/escrow/status
// @desc    Get escrow service status
// @access  Private
router.get('/status', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const isConfigured = !!(process.env.ESCROW_EMAIL && process.env.ESCROW_PASSWORD);
    
    res.json({
      success: true,
      data: {
        service: 'escrow.com',
        configured: isConfigured,
        mode: isConfigured ? 'live' : 'mock',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'NGN'],
        supportedProductTypes: [
          'ea_subscription',
          'hft_rental', 
          'trading_signal',
          'consultation',
          'training',
          'software'
        ],
        features: [
          'transaction_management',
          'payment_processing',
          'dispute_resolution',
          'inspection_periods',
          'fee_calculation'
        ]
      },
      message: 'Escrow service status retrieved successfully'
    });

  } catch (error) {
    console.error('Get escrow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get escrow service status'
    });
  }
});

module.exports = router;