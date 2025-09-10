const express = require('express');
const { body, query, validationResult } = require('express-validator');
const databaseService = require('../services/databaseService');
const { auth, requireSubscription, updateActivity } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/escrow
// @desc    Get user's escrow transactions
// @access  Private
router.get('/', [
  auth,
  updateActivity,
  query('status').optional().isIn(['pending', 'funded', 'active', 'disputed', 'released', 'refunded', 'expired']),
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
    
    // Build filter - user can see escrows where they are either user or creator
    const filter = {
      $or: [
        { user: req.user._id },
        { creator: req.user._id }
      ]
    };
    
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const escrows = await Escrow.find(filter)
      .populate('subscription', 'subscriptionType price currency')
      .populate('ea', 'name description')
      .populate('user', 'firstName lastName avatar')
      .populate('creator', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Escrow.countDocuments(filter);

    res.json({
      success: true,
      data: escrows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get escrows error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/escrow/:id
// @desc    Get single escrow transaction
// @access  Private
router.get('/:id', [auth, updateActivity], async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id)
      .populate('subscription', 'subscriptionType price currency startDate endDate')
      .populate('ea', 'name description pricing')
      .populate('user', 'firstName lastName email avatar')
      .populate('creator', 'firstName lastName email avatar');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user has access to this escrow
    if (escrow.user._id.toString() !== req.user._id.toString() && 
        escrow.creator._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: escrow
    });

  } catch (error) {
    console.error('Get escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/escrow/:id/fund
// @desc    Fund escrow transaction
// @access  Private
router.post('/:id/fund', [
  auth,
  body('transactionHash')
    .notEmpty()
    .withMessage('Transaction hash is required'),
  body('blockNumber')
    .isInt({ min: 0 })
    .withMessage('Block number must be a positive integer'),
  body('gasUsed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Gas used must be a positive integer'),
  body('gasPrice')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Gas price must be a positive integer')
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

    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user owns this escrow
    if (escrow.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if escrow can be funded
    if (escrow.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Escrow cannot be funded in current state'
      });
    }

    const { transactionHash, blockNumber, gasUsed, gasPrice } = req.body;
    await escrow.fundEscrow(transactionHash, blockNumber, gasUsed, gasPrice);

    res.json({
      success: true,
      message: 'Escrow funded successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Fund escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/escrow/:id/lock
// @desc    Lock escrow transaction
// @access  Private (Creator)
router.post('/:id/lock', [auth, updateActivity], async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user is the creator
    if (escrow.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can lock the escrow'
      });
    }

    // Check if escrow can be locked
    if (escrow.status !== 'funded') {
      return res.status(400).json({
        success: false,
        message: 'Escrow must be funded before it can be locked'
      });
    }

    await escrow.lockEscrow();

    res.json({
      success: true,
      message: 'Escrow locked successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Lock escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/escrow/:id/sign
// @desc    Add signature to escrow
// @access  Private
router.post('/:id/sign', [
  auth,
  body('signature')
    .notEmpty()
    .withMessage('Signature is required')
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

    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user has permission to sign
    if (escrow.user.toString() !== req.user._id.toString() && 
        escrow.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if escrow can be signed
    if (escrow.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Escrow must be active to add signatures'
      });
    }

    const { signature } = req.body;
    const signer = req.user._id.toString();
    
    await escrow.addSignature(signer, signature);

    res.json({
      success: true,
      message: 'Signature added successfully',
      data: {
        totalSignatures: escrow.totalSignatures,
        requiredSignatures: escrow.requiredSignatures,
        canRelease: escrow.canRelease
      }
    });

  } catch (error) {
    console.error('Add signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/escrow/:id/release
// @desc    Release escrow funds
// @access  Private
router.post('/:id/release', [
  auth,
  body('releaseTransactionHash')
    .optional()
    .notEmpty()
    .withMessage('Release transaction hash is required')
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

    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user has permission to release
    if (escrow.user.toString() !== req.user._id.toString() && 
        escrow.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if escrow can be released
    if (!escrow.canRelease) {
      return res.status(400).json({
        success: false,
        message: 'Escrow cannot be released yet. Check signature requirements and time conditions.'
      });
    }

    const { releaseTransactionHash } = req.body;
    await escrow.releaseEscrow(releaseTransactionHash);

    // Update subscription status
    const subscription = await Subscription.findById(escrow.subscription);
    if (subscription) {
      subscription.escrowStatus = 'released';
      await subscription.save();
    }

    res.json({
      success: true,
      message: 'Escrow released successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Release escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/escrow/:id/dispute
// @desc    Initiate escrow dispute
// @access  Private
router.post('/:id/dispute', [
  auth,
  body('reason')
    .isIn(['performance_issue', 'technical_problem', 'billing_dispute', 'service_quality', 'other'])
    .withMessage('Invalid dispute reason'),
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

    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user has permission to dispute
    if (escrow.user.toString() !== req.user._id.toString() && 
        escrow.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if escrow can be disputed
    if (!escrow.canDispute) {
      return res.status(400).json({
        success: false,
        message: 'Escrow cannot be disputed in current state'
      });
    }

    const { reason, description } = req.body;
    await escrow.initiateDispute(req.user._id, reason, description);

    // Update subscription status
    const subscription = await Subscription.findById(escrow.subscription);
    if (subscription) {
      subscription.escrowStatus = 'disputed';
      await subscription.save();
    }

    res.json({
      success: true,
      message: 'Dispute initiated successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Initiate dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/escrow/:id/resolve
// @desc    Resolve escrow dispute
// @access  Private (Admin/Creator)
router.post('/:id/resolve', [
  auth,
  body('resolution')
    .isIn(['refund_full', 'refund_partial', 'no_refund', 'service_credit'])
    .withMessage('Invalid resolution type'),
  body('resolutionNotes')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Resolution notes must be between 10 and 500 characters')
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

    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user has permission to resolve (creator or admin)
    if (escrow.creator.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if escrow has an active dispute
    if (escrow.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        message: 'No active dispute to resolve'
      });
    }

    const { resolution, resolutionNotes } = req.body;
    await escrow.resolveDispute(req.user._id, resolution, resolutionNotes);

    // Update subscription status based on resolution
    const subscription = await Subscription.findById(escrow.subscription);
    if (subscription) {
      if (resolution === 'refund_full' || resolution === 'refund_partial') {
        subscription.escrowStatus = 'refunded';
        subscription.status = 'refunded';
      } else {
        subscription.escrowStatus = 'released';
      }
      await subscription.save();
    }

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/escrow/:id/evidence
// @desc    Add evidence to dispute
// @access  Private
router.post('/:id/evidence', [
  auth,
  body('type')
    .isIn(['screenshot', 'document', 'video', 'log_file', 'other'])
    .withMessage('Invalid evidence type'),
  body('url')
    .isURL()
    .withMessage('Valid URL is required'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Description must be between 5 and 200 characters')
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

    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user has permission to add evidence
    if (escrow.user.toString() !== req.user._id.toString() && 
        escrow.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if escrow has an active dispute
    if (escrow.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        message: 'No active dispute to add evidence to'
      });
    }

    const { type, url, description } = req.body;
    await escrow.addDisputeEvidence(type, url, description);

    res.json({
      success: true,
      message: 'Evidence added successfully',
      data: escrow.dispute.evidence
    });

  } catch (error) {
    console.error('Add evidence error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/escrow/:id/performance
// @desc    Get escrow performance data
// @access  Private
router.get('/:id/performance', [auth, updateActivity], async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user has access to this escrow
    if (escrow.user.toString() !== req.user._id.toString() && 
        escrow.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        performance: escrow.performance,
        timeRemaining: escrow.timeRemaining,
        canRelease: escrow.canRelease,
        canDispute: escrow.canDispute
      }
    });

  } catch (error) {
    console.error('Get escrow performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/escrow/:id/performance
// @desc    Update escrow performance
// @access  Private (Creator)
router.put('/:id/performance', [
  auth,
  body('tradeData')
    .isObject()
    .withMessage('Trade data is required'),
  body('tradeData.profit')
    .isNumeric()
    .withMessage('Trade profit is required')
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

    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow transaction not found'
      });
    }

    // Check if user is the creator
    if (escrow.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can update performance'
      });
    }

    const { tradeData } = req.body;
    await escrow.updatePerformance(tradeData);

    res.json({
      success: true,
      message: 'Performance updated successfully',
      data: escrow.performance
    });

  } catch (error) {
    console.error('Update escrow performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
