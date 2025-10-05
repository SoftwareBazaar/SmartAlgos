const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const databaseService = require('../services/databaseService');
const { auth, requireSubscription, requireOwnership, updateActivity } = require('../middleware/auth');
const router = express.Router();

// File upload configuration for EAs
const EA_UPLOADS_PATH = path.join(__dirname, '../uploads/ea-files');
const EA_IMAGES_PATH = path.join(__dirname, '../uploads/ea-images');

// Ensure upload directories exist
const ensureUploadDirectories = async () => {
  try {
    await fs.mkdir(EA_UPLOADS_PATH, { recursive: true });
    await fs.mkdir(EA_IMAGES_PATH, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
};

// Multer configuration for EA files and images
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDirectories();
    if (file.fieldname === 'image') {
      cb(null, EA_IMAGES_PATH);
    } else if (file.fieldname === 'eaFile') {
      cb(null, EA_UPLOADS_PATH);
    } else {
      cb(null, EA_UPLOADS_PATH);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for EA images'), false);
    }
  } else if (file.fieldname === 'eaFile') {
    // Allow EA files (.ex4, .mq4, .mq5, .ex5)
    const allowedExtensions = ['.ex4', '.mq4', '.mq5', '.ex5'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .ex4, .mq4, .mq5, .ex5 files are allowed for EA files'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter
});

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
  query('sortBy').optional().isIn(['name', 'created_at', 'win_rate', 'average_rating', 'price_monthly']),
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
      sortBy = 'created_at',
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
    const eas = await databaseService.getFeaturedEAs({
      limit: 10,
      includeCreator: true
    });

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
    const categories = await databaseService.getEACategories();

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
// @desc    Create new EA with file uploads
// @access  Private (Creator)
router.post('/', [
  auth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'eaFile', maxCount: 1 }
  ]),
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
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        const cleanupPromises = [];
        Object.values(req.files).forEach(fileArray => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach(file => {
              cleanupPromises.push(fs.unlink(file.path).catch(console.error));
            });
          } else {
            cleanupPromises.push(fs.unlink(fileArray.path).catch(console.error));
          }
        });
        await Promise.all(cleanupPromises);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Handle file uploads
    let imageFile = null;
    let eaFile = null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        imageFile = {
          filename: req.files.image[0].filename,
          originalname: req.files.image[0].originalname,
          path: req.files.image[0].path,
          size: req.files.image[0].size,
          mimetype: req.files.image[0].mimetype
        };
      }
      
      if (req.files.eaFile && req.files.eaFile[0]) {
        eaFile = {
          filename: req.files.eaFile[0].filename,
          originalname: req.files.eaFile[0].originalname,
          path: req.files.eaFile[0].path,
          size: req.files.eaFile[0].size,
          mimetype: req.files.eaFile[0].mimetype
        };
      }
    }

    const eaData = {
      id: `ea_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      strategy_type: req.body.category,
      risk_level: req.body.riskLevel || 'medium',
      price: req.body.price || 0,
      price_monthly: req.body.price || 0,
      price_yearly: (req.body.price || 0) * 10,
      version: req.body.version || '1.0.0',
      creator_id: req.user.id || 'admin',
      creator_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Admin User',
      status: req.body.status || 'pending',
      is_active: true,
      is_featured: false,
      subscribers: 0,
      revenue: '$0',
      tags: req.body.tags || '',
      rentalPeriods: ['monthly', 'quarterly', 'yearly'],
      currentPeriod: 'monthly',
      files: {
        image: imageFile,
        eaFile: eaFile
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // For now, store in memory/localStorage equivalent
    // In production, this would save to database
    const ea = eaData;

    res.status(201).json({
      success: true,
      message: 'EA created successfully',
      data: ea
    });

  } catch (error) {
    console.error('Create EA error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      const cleanupPromises = [];
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach(file => {
            cleanupPromises.push(fs.unlink(file.path).catch(console.error));
          });
        } else {
          cleanupPromises.push(fs.unlink(fileArray.path).catch(console.error));
        }
      });
      await Promise.all(cleanupPromises);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/eas/:id
// @desc    Update EA with file uploads
// @access  Private (Owner)
router.put('/:id', [
  auth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'eaFile', maxCount: 1 }
  ]),
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
      // Clean up uploaded files if validation fails
      if (req.files) {
        const cleanupPromises = [];
        Object.values(req.files).forEach(fileArray => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach(file => {
              cleanupPromises.push(fs.unlink(file.path).catch(console.error));
            });
          } else {
            cleanupPromises.push(fs.unlink(fileArray.path).catch(console.error));
          }
        });
        await Promise.all(cleanupPromises);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Handle file uploads
    let imageFile = null;
    let eaFile = null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        imageFile = {
          filename: req.files.image[0].filename,
          originalname: req.files.image[0].originalname,
          path: req.files.image[0].path,
          size: req.files.image[0].size,
          mimetype: req.files.image[0].mimetype
        };
      }
      
      if (req.files.eaFile && req.files.eaFile[0]) {
        eaFile = {
          filename: req.files.eaFile[0].filename,
          originalname: req.files.eaFile[0].originalname,
          path: req.files.eaFile[0].path,
          size: req.files.eaFile[0].size,
          mimetype: req.files.eaFile[0].mimetype
        };
      }
    }

    const updates = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Update files if new ones were uploaded
    if (imageFile || eaFile) {
      updates.files = {
        image: imageFile || req.body.currentImage,
        eaFile: eaFile || req.body.currentEaFile
      };
    }

    // Don't allow updating certain fields
    delete updates.creator;
    delete updates.creatorName;
    delete updates.subscriptionStats;
    delete updates.performance;

    // For now, return success (in production, this would update the database)
    const updatedEA = {
      id: req.params.id,
      ...updates
    };

    res.json({
      success: true,
      message: 'EA updated successfully',
      data: updatedEA
    });

  } catch (error) {
    console.error('Update EA error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      const cleanupPromises = [];
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach(file => {
            cleanupPromises.push(fs.unlink(file.path).catch(console.error));
          });
        } else {
          cleanupPromises.push(fs.unlink(fileArray.path).catch(console.error));
        }
      });
      await Promise.all(cleanupPromises);
    }
    
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

// @route   GET /api/eas/uploads/:type/:filename
// @desc    Serve uploaded EA files and images
// @access  Private
router.get('/uploads/:type/:filename', auth, (req, res) => {
  try {
    const { type, filename } = req.params;
    let filePath;

    if (type === 'ea-images') {
      filePath = path.join(EA_IMAGES_PATH, filename);
    } else if (type === 'ea-files') {
      filePath = path.join(EA_UPLOADS_PATH, filename);
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'File type not found' 
      });
    }

    // Check if file exists
    fs.access(filePath)
      .then(() => {
        res.sendFile(filePath, (err) => {
          if (err) {
            console.error('Error serving file:', err);
            res.status(404).json({ 
              success: false, 
              message: 'File not found' 
            });
          }
        });
      })
      .catch(() => {
        res.status(404).json({ 
          success: false, 
          message: 'File not found' 
        });
      });

  } catch (error) {
    console.error('Error serving EA file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
