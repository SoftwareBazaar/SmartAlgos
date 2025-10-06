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

    // Check if we're in mock mode
    const isPlaceholderKey = (value = '') => {
      if (!value) return true;
      const normalized = value.toLowerCase();
      return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
    };
    const useMockAuth = process.env.MOCK_AUTH === 'true' || isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

    let eas, total;
    
    if (useMockAuth) {
      // In mock mode, return empty array or mock data
      eas = [];
      total = 0;
      console.log('✅ Using mock mode for EA retrieval');
    } else {
      // Execute query using Supabase
      eas = await databaseService.getEAs({
        ...filter,
        limit: parseInt(limit),
        offset: skip,
        orderBy: sortBy,
        ascending: sortOrder === 'asc'
      });

      total = await databaseService.countEAs(filter);
    }

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
    const ea = await databaseService.getEAById(req.params.id);

    if (!ea) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    // Increment views
    await databaseService.updateEA(req.params.id, { 
      views: (ea.views || 0) + 1 
    });

    // Check if user has access to files based on subscription
    const userTier = req.user.subscription_type || 'free';
    const tierLevels = { 'free': 0, 'basic': 1, 'professional': 2, 'institutional': 3 };
    
    if (tierLevels[userTier] < 1) {
      // Remove file paths for free users
      ea.ea_file_path = undefined;
      ea.manual_file_path = undefined;
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
    console.log('[EA Create] Starting EA creation');
    console.log('[EA Create] Request body keys:', Object.keys(req.body));
    console.log('[EA Create] Files received:', req.files ? Object.keys(req.files) : 'none');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[EA Create] Validation failed:', errors.array());
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
    let imageUrl = null;
    let eaFileUrl = null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        imageFile = {
          filename: req.files.image[0].filename,
          originalname: req.files.image[0].originalname,
          path: req.files.image[0].path,
          size: req.files.image[0].size,
          mimetype: req.files.image[0].mimetype
        };
        imageUrl = `/uploads/ea-images/${imageFile.filename}`;
        console.log(`[EA Create] Image uploaded: ${imageUrl}`);
      }
      
      if (req.files.eaFile && req.files.eaFile[0]) {
        eaFile = {
          filename: req.files.eaFile[0].filename,
          originalname: req.files.eaFile[0].originalname,
          path: req.files.eaFile[0].path,
          size: req.files.eaFile[0].size,
          mimetype: req.files.eaFile[0].mimetype
        };
        eaFileUrl = `/uploads/ea-files/${eaFile.filename}`;
        console.log(`[EA Create] EA file uploaded: ${eaFileUrl}`);
      }
    }

    // Handle creator_id for test users
    let creatorId = req.user.id;
    let creatorName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Admin User';
    
    // For test users, create them in the appropriate store if they don't exist
    if (req.user.id === 'test_user_123' || req.user.id?.startsWith('dev_token_')) {
      try {
        // Determine which service to use based on authentication mode
        const mockAuthStore = require('../services/mockAuthStore');
        const isPlaceholderKey = (value = '') => {
          if (!value) return true;
          const normalized = value.toLowerCase();
          return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
        };
        const useMockAuth = process.env.MOCK_AUTH === 'true' || isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        let existingUser = null;
        
        if (useMockAuth) {
          // Use mock auth store
          existingUser = await mockAuthStore.getUserById(req.user.id);
        } else {
          // Use database service
          existingUser = await databaseService.getUserById(req.user.id);
        }
        
        if (!existingUser) {
          // Create test user
          const testUserData = {
            id: req.user.id,
            email: req.user.email || 'test@example.com',
            first_name: req.user.first_name || 'Test',
            last_name: req.user.last_name || 'User',
            role: 'admin',
            is_active: true,
            is_email_verified: true,
            subscription_type: 'institutional',
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            preferences: {}
          };
          
          if (useMockAuth) {
            await mockAuthStore.createUser(testUserData);
            console.log(`✅ Created test user in mock store: ${req.user.id}`);
          } else {
            await databaseService.createUser(testUserData);
            console.log(`✅ Created test user in database: ${req.user.id}`);
          }
        }
        creatorId = req.user.id;
        creatorName = `${req.user.first_name || 'Test'} ${req.user.last_name || 'User'}`.trim();
      } catch (userError) {
        // If user creation fails, use a default creator or null
        console.warn('Failed to create test user:', userError.message);
        creatorId = null; // This will work if the foreign key constraint allows null
        creatorName = 'Test User';
      }
    }

    const eaData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      strategy_type: req.body.category,
      risk_level: req.body.riskLevel || 'medium',
      price_monthly: parseFloat(req.body.price) || 0,
      price_yearly: (parseFloat(req.body.price) || 0) * 10,
      version: req.body.version || '1.0.0',
      creator_id: creatorId,
      creator_name: creatorName,
      status: req.body.status || 'pending',
      is_active: true,
      is_featured: false,
      keywords: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      files: {
        image: imageFile,
        eaFile: eaFile
      }
    };

    // Check if we're in mock mode
    const mockAuthStore = require('../services/mockAuthStore');
    const isPlaceholderKey = (value = '') => {
      if (!value) return true;
      const normalized = value.toLowerCase();
      return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
    };
    const useMockAuth = process.env.MOCK_AUTH === 'true' || isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

    let ea;
    
    if (useMockAuth) {
      // In mock mode, create a mock EA response
      ea = {
        id: `mock_ea_${Date.now()}`,
        ...eaData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        downloads: 0,
        rating: 0,
        reviews_count: 0
      };
      
      // Set URLs instead of file paths
      if (imageUrl) {
        ea.image = imageUrl;
      }
      if (eaFileUrl) {
        ea.ea_file_path = eaFileUrl;
      }
      
      // Remove files object
      delete ea.files;
      
      console.log(`✅ Created mock EA: ${ea.id}`);
      if (imageUrl) console.log(`   Image: ${ea.image}`);
      if (eaFileUrl) console.log(`   EA File: ${ea.ea_file_path}`);
    } else {
      // Save to database
      ea = await databaseService.createEA(eaData);
      console.log(`✅ Created EA in database: ${ea.id}`);
    }

    res.status(201).json({
      success: true,
      message: 'EA created successfully',
      data: ea
    });

  } catch (error) {
    console.error('[EA Create] Error:', error);
    
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
    console.log(`[EA Update] ===== STARTING UPDATE FOR EA ${req.params.id} =====`);
    console.log(`[EA Update] User:`, req.user?.id, req.user?.role);
    console.log(`[EA Update] Request body keys:`, Object.keys(req.body));
    console.log(`[EA Update] Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[EA Update] Files received:`, req.files ? Object.keys(req.files) : 'none');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[EA Update] Validation failed:', errors.array());
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

    // Check if we're in mock mode
    const isPlaceholderKey = (value = '') => {
      if (!value) return true;
      const normalized = value.toLowerCase();
      return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
    };
    const useMockAuth = process.env.MOCK_AUTH === 'true' || isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log(`[EA Update] Mode detected: ${useMockAuth ? 'MOCK' : 'DATABASE'}`);
    console.log(`[EA Update] MOCK_AUTH:`, process.env.MOCK_AUTH);
    console.log(`[EA Update] Has SUPABASE_SERVICE_ROLE_KEY:`, !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Handle file uploads
    let imageFile = null;
    let eaFile = null;
    let imageUrl = null;
    let eaFileUrl = null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        imageFile = {
          filename: req.files.image[0].filename,
          originalname: req.files.image[0].originalname,
          path: req.files.image[0].path,
          size: req.files.image[0].size,
          mimetype: req.files.image[0].mimetype
        };
        // Create URL path for frontend access
        imageUrl = `/uploads/ea-images/${imageFile.filename}`;
        console.log(`[EA Update] Image uploaded: ${imageUrl}`);
      }
      
      if (req.files.eaFile && req.files.eaFile[0]) {
        eaFile = {
          filename: req.files.eaFile[0].filename,
          originalname: req.files.eaFile[0].originalname,
          path: req.files.eaFile[0].path,
          size: req.files.eaFile[0].size,
          mimetype: req.files.eaFile[0].mimetype
        };
        // Create URL path for frontend access
        eaFileUrl = `/uploads/ea-files/${eaFile.filename}`;
        console.log(`[EA Update] EA file uploaded: ${eaFileUrl}`);
      }
    }

    // Build update object
    const updates = {};
    
    // Copy basic fields (excluding 'price' which needs special handling)
    const allowedFields = ['name', 'description', 'version', 'status', 'category', 'tags'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    // Handle price field - map to price_monthly and price_yearly
    if (req.body.price !== undefined) {
      const priceValue = parseFloat(req.body.price) || 0;
      updates.price_monthly = priceValue;
      updates.price_yearly = priceValue * 10; // Yearly price is 10x monthly (discount)
    }
    
    // Handle specifications if present
    if (req.body.specifications || Object.keys(req.body).some(key => key.startsWith('specifications.'))) {
      updates.specifications = {};
      
      // Handle specifications object
      if (req.body.specifications) {
        try {
          updates.specifications = typeof req.body.specifications === 'string' 
            ? JSON.parse(req.body.specifications) 
            : req.body.specifications;
        } catch (e) {
          console.error('Error parsing specifications:', e);
        }
      }
      
      // Handle specifications.field format from FormData
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('specifications.')) {
          const specKey = key.replace('specifications.', '');
          updates.specifications[specKey] = req.body[key];
        }
      });
    }
    
    // Handle features array
    if (req.body.features) {
      try {
        updates.features = typeof req.body.features === 'string' 
          ? JSON.parse(req.body.features) 
          : req.body.features;
      } catch (e) {
        console.error('Error parsing features:', e);
        updates.features = [];
      }
    } else {
      // Check for features[0], features[1] format from FormData
      const featureKeys = Object.keys(req.body).filter(key => key.startsWith('features['));
      if (featureKeys.length > 0) {
        updates.features = [];
        featureKeys.forEach(key => {
          updates.features.push(req.body[key]);
        });
      }
    }
    
    // Handle screenshots array
    if (req.body.screenshots) {
      try {
        updates.screenshots = typeof req.body.screenshots === 'string' 
          ? JSON.parse(req.body.screenshots) 
          : req.body.screenshots;
      } catch (e) {
        console.error('Error parsing screenshots:', e);
        updates.screenshots = [];
      }
    } else {
      // Check for screenshots[0], screenshots[1] format from FormData
      const screenshotKeys = Object.keys(req.body).filter(key => key.startsWith('screenshots['));
      if (screenshotKeys.length > 0) {
        updates.screenshots = [];
        screenshotKeys.forEach(key => {
          updates.screenshots.push(req.body[key]);
        });
      }
    }

    // Update files if new ones were uploaded
    if (imageFile || eaFile) {
      updates.files = {};
      if (imageFile) {
        updates.files.image = imageFile;
      }
      if (eaFile) {
        updates.files.eaFile = eaFile;
      }
    }

    console.log(`[EA Update] Update object prepared with keys:`, Object.keys(updates));
    console.log(`[EA Update] Full update object:`, JSON.stringify(updates, null, 2));

    let updatedEA;
    
    if (useMockAuth) {
      console.log('🔄 [EA Update] Using mock mode');
      
      // FIXED: Get EA from mock store instead of localStorage (which doesn't exist in Node.js)
      const mockAuthStore = require('../services/mockAuthStore');
      let existingEA = {};
      
      // Try to get EA from mock store if available
      if (mockAuthStore.mockEAs) {
        existingEA = mockAuthStore.mockEAs.find(ea => ea.id == req.params.id) || {};
      }
      
      // In mock mode, simulate the update
      updatedEA = {
        ...existingEA,
        id: parseInt(req.params.id) || req.params.id,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Set image URL if uploaded
      if (imageUrl) {
        updatedEA.image = imageUrl;
        console.log(`📸 [EA Update] Image set: ${imageUrl}`);
      }
      if (eaFileUrl) {
        updatedEA.ea_file_path = eaFileUrl;
        console.log(`📦 [EA Update] EA file set: ${eaFileUrl}`);
      }
      
      // Remove files object from response
      delete updatedEA.files;
      
      // Store in mock storage (in-memory for this request)
      if (!mockAuthStore.mockEAs) {
        mockAuthStore.mockEAs = [];
      }
      
      const eaIndex = mockAuthStore.mockEAs.findIndex(ea => ea.id == req.params.id);
      if (eaIndex >= 0) {
        mockAuthStore.mockEAs[eaIndex] = updatedEA;
      } else {
        mockAuthStore.mockEAs.push(updatedEA);
      }
      
      console.log(`✅ [EA Update] Mock EA updated: ${updatedEA.id}`);
    } else {
      // Update in database
      console.log(`[EA Update] 🔄 Calling database update for EA ${req.params.id}...`);
      console.log(`[EA Update] Update data being sent to DB:`, JSON.stringify(updates, null, 2));
      try {
        updatedEA = await databaseService.updateEA(req.params.id, updates);
        console.log(`✅ [EA Update] Database update successful for EA ${req.params.id}`);
        console.log(`✅ [EA Update] Updated EA data:`, JSON.stringify(updatedEA, null, 2));
      } catch (dbError) {
        console.error('❌ [EA Update] Database update failed:', dbError);
        console.error('❌ [EA Update] DB Error details:', {
          name: dbError.name,
          message: dbError.message,
          code: dbError.code,
          details: dbError.details,
          hint: dbError.hint,
          stack: dbError.stack
        });
        throw dbError;
      }
    }

    res.json({
      success: true,
      message: 'EA updated successfully',
      data: updatedEA
    });

  } catch (error) {
    console.error('❌ [EA Update] Error:', error);
    console.error('❌ [EA Update] Error stack:', error.stack);
    console.error('❌ [EA Update] Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
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
    
    // Return detailed error for debugging
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      errorCode: error.code,
      errorDetails: error.details,
      errorHint: error.hint,
      // Include more details in production for debugging Railway issues
      debug: {
        errorName: error.name,
        timestamp: new Date().toISOString()
      }
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
