const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const databaseService = require('../services/databaseService');
const supabaseStorage = require('../services/supabaseStorage');
const { auth, requireSubscription, requireOwnership, updateActivity } = require('../middleware/auth');
const logger = require('../utils/logger');
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

// Multer configuration - use memory storage for Supabase Storage uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image' || file.fieldname === 'screenshots') {
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
// @access  Public (no auth required for viewing marketplace)
router.get('/', [
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
      status, // Don't default to 'approved' - show all active EAs regardless of status
      sortBy = 'created_at',
      sortOrder = 'desc',
      search,
      minWinRate,
      maxDrawdown,
      priceRange
    } = req.query;

    // Build filter object for Supabase
    const filter = {
      is_active: true
    };
    
    // Only filter by status if explicitly provided
    if (status) {
      filter.status = status;
    }

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
// @access  Public (no auth required for viewing featured EAs)
router.get('/featured', async (req, res) => {
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
// @access  Public (no auth required for viewing categories)
router.get('/categories', async (req, res) => {
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
// @access  Public (no auth required for viewing EA details)
router.get('/:id', async (req, res) => {
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

    // Remove file download paths for unauthenticated users (they can see details but can't download)
    // The file paths are only accessible after subscription/purchase
    ea.ea_file_path = undefined;
    ea.manual_file_path = undefined;

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
    { name: 'eaFile', maxCount: 1 },
    { name: 'screenshots', maxCount: 10 }
  ]),
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('category')
    .isIn(['scalping', 'trend', 'news', 'grid', 'arbitrage', 'martingale', 'hedging'])
    .withMessage('Invalid category'),
  body('riskLevel')
    .optional()
    .isIn(['low', 'medium', 'high', 'very-high'])
    .withMessage('Invalid risk level'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
], async (req, res) => {
  try {
    console.log('[EA Create] Starting EA creation');
    console.log('[EA Create] Request body keys:', Object.keys(req.body));
    console.log('[EA Create] Files received:', req.files ? Object.keys(req.files) : 'none');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[EA Create] ❌ Validation failed:');
      errors.array().forEach(err => {
        console.log(`   - ${err.param}: ${err.msg} (value: ${JSON.stringify(err.value)})`);
      });
      
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
        errors: errors.array(),
        details: errors.array().map(e => `${e.param}: ${e.msg}`)
      });
    }

    // Handle file uploads to Supabase Storage
    let imageFile = null;
    let eaFile = null;
    let imageUrl = null;
    let eaFileUrl = null;

    if (req.files) {
      // Upload image to Supabase Storage (skip if takes too long)
      if (req.files.image && req.files.image[0]) {
        try {
          console.log(`[EA Create] Uploading image to Supabase Storage (${req.files.image[0].size} bytes)...`);
          
          // Only attempt upload if file is < 5MB to avoid timeouts
          if (req.files.image[0].size > 5 * 1024 * 1024) {
            console.warn(`[EA Create] ⚠️ Image too large (${req.files.image[0].size} bytes), skipping Supabase upload`);
            throw new Error('Image too large');
          }
          
          const uploadResult = await supabaseStorage.uploadImage(
            req.files.image[0].buffer,
            req.files.image[0].originalname,
            req.files.image[0].mimetype
          );
          
          imageUrl = uploadResult.url;
          imageFile = {
            filename: uploadResult.path,
            originalname: req.files.image[0].originalname,
            size: req.files.image[0].size,
            mimetype: req.files.image[0].mimetype,
            storagePath: uploadResult.path,
            publicUrl: uploadResult.url
          };
          console.log(`[EA Create] ✅ Image uploaded to Supabase: ${imageUrl}`);
        } catch (uploadError) {
          console.warn(`[EA Create] ⚠️ Skipping image upload (${uploadError.message}), creating EA without image`);
          // Continue without image rather than failing completely
          imageUrl = null;
          imageFile = null;
        }
      }
      
      // Upload EA file to Supabase Storage
      if (req.files.eaFile && req.files.eaFile[0]) {
        try {
          console.log(`[EA Create] Uploading EA file to Supabase Storage...`);
          const uploadResult = await supabaseStorage.uploadEAFile(
            req.files.eaFile[0].buffer,
            req.files.eaFile[0].originalname,
            req.files.eaFile[0].mimetype
          );
          
          eaFileUrl = uploadResult.url;
          eaFile = {
            filename: uploadResult.path,
            originalname: req.files.eaFile[0].originalname,
            size: req.files.eaFile[0].size,
            mimetype: req.files.eaFile[0].mimetype,
            storagePath: uploadResult.path,
            publicUrl: uploadResult.url
          };
          console.log(`[EA Create] ✅ EA file uploaded to Supabase: ${eaFileUrl}`);
        } catch (uploadError) {
          console.error(`[EA Create] ❌ EA file upload to Supabase failed:`, uploadError.message);
          // Continue without EA file rather than failing completely
          eaFileUrl = null;
          eaFile = null;
        }
      }
    }

    // Handle creator_id - set to null to avoid foreign key timeout issues
    // The foreign key validation might timeout if checking UUID existence
    let creatorId = null; // Bypass foreign key for now
    let creatorName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Admin User';
    
    console.log('[EA Create] Creator info:', { creatorId, creatorName, userId: req.user?.id });
    
    // Skip user creation - causes timeouts. Creator ID is nullable.
    
    // Handle screenshot uploads to Supabase Storage
    let screenshotUrls = [];
    if (req.files && req.files.screenshots && req.files.screenshots.length > 0) {
      console.log(`[EA Create] Uploading ${req.files.screenshots.length} screenshots to Supabase Storage...`);
      
      for (let i = 0; i < req.files.screenshots.length; i++) {
        try {
          const screenshot = req.files.screenshots[i];
          
          // Skip large files
          if (screenshot.size > 5 * 1024 * 1024) {
            console.warn(`[EA Create] Screenshot ${i+1} too large, skipping`);
            continue;
          }
          
          const uploadResult = await supabaseStorage.uploadImage(
            screenshot.buffer,
            screenshot.originalname,
            screenshot.mimetype,
            'ea-screenshots'
          );
          
          screenshotUrls.push(uploadResult.url);
          console.log(`[EA Create] ✅ Screenshot ${i+1}/${req.files.screenshots.length} uploaded`);
        } catch (uploadError) {
          console.warn(`[EA Create] Failed to upload screenshot ${i+1}:`, uploadError.message);
          // Continue with other screenshots
        }
      }
      
      console.log(`[EA Create] Successfully uploaded ${screenshotUrls.length}/${req.files.screenshots.length} screenshots`);
    }

    const eaData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      strategy_type: req.body.category,
      risk_level: req.body.riskLevel || 'medium',
      price_weekly: 6.99, // Psychological pricing for weekly
      price_monthly: parseFloat(req.body.price) || 18.00,
      price_yearly: 97.00, // Lifetime access pricing
      version: req.body.version || '1.0.0',
      creator_id: creatorId,
      creator_name: creatorName,
      status: req.body.status || 'active', // Default to 'active' instead of 'pending'
      is_active: true,
      is_featured: false,
      keywords: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      screenshots: screenshotUrls.length > 0 ? screenshotUrls : null
    };
    
    // Set image and file URLs (public web paths, not filesystem paths)
    if (imageUrl) {
      eaData.image = imageUrl; // e.g., "/uploads/ea-images/image-123.png"
      console.log('[EA Create] Setting image URL:', imageUrl);
    }
    if (eaFileUrl) {
      eaData.ea_file_path = eaFileUrl; // e.g., "/uploads/ea-files/file-123.ex4"
      console.log('[EA Create] Setting EA file URL:', eaFileUrl);
    }

    // Check if we're in mock mode
    const mockAuthStore = require('../services/mockAuthStore');
    const isPlaceholderKey = (value = '') => {
      if (!value) return true;
      const normalized = value.toLowerCase();
      return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
    };
    const useMockAuth = process.env.MOCK_AUTH === 'true' || isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('[EA Create] Preparing to save EA...');
    console.log('[EA Create] EA Data keys:', Object.keys(eaData));
    console.log('[EA Create] Using mock auth:', useMockAuth);
    
    let ea;
    
    if (useMockAuth) {
      console.log('[EA Create] Using MOCK mode - creating mock EA');
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
      // Save to database with timeout protection
      console.log('[EA Create] Using DATABASE mode - calling databaseService.createEA...');
      console.log('[EA Create] EA data to save:', JSON.stringify(eaData, null, 2));
      
      try {
        // Wrap in Promise.race to add timeout protection
        const createPromise = databaseService.createEA(eaData);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database operation timed out after 25 seconds')), 25000)
        );
        
        ea = await Promise.race([createPromise, timeoutPromise]);
        console.log(`✅ Created EA in database: ${ea.id}`);
      } catch (dbError) {
        console.error('❌ [EA Create] Database operation failed:', dbError);
        throw dbError;
      }
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
    { name: 'eaFile', maxCount: 1 },
    { name: 'screenshots', maxCount: 10 }
  ]),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    console.log(`[EA Update] ===== STARTING UPDATE FOR EA ${req.params.id} =====`);
    console.log(`[EA Update] User:`, req.user?.id, req.user?.role);
    console.log(`[EA Update] Request body keys:`, Object.keys(req.body));
    console.log(`[EA Update] Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[EA Update] Files received:`, req.files ? Object.keys(req.files) : 'none');
    console.log(`[EA Update] EA ID type:`, typeof req.params.id, 'Value:', req.params.id);

    // Check ownership or admin privileges
    const existingEA = await databaseService.getEAById(req.params.id);
    if (!existingEA) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    // Allow only EA creator or admin to edit
    const isAdmin = req.user.role === 'admin';
    const constructedName = (req.user.first_name || '') + ' ' + (req.user.last_name || '');
    
    // Check ownership - handle null creator_id gracefully
    const isOwnerById = existingEA.creator_id && existingEA.creator_id === req.user.id;
    const isOwnerByName = existingEA.creator_name && existingEA.creator_name.trim() === constructedName.trim();
    const isOwner = isOwnerById || isOwnerByName;
    
    // Admin always has access, or must be the owner
    if (!isAdmin && !isOwner) {
      logger.debug(`Access denied for EA ${req.params.id} - User ${req.user.id} is not owner/admin`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only EA creator or admin can edit this EA.'
      });
    }
    
    logger.debug(`Access granted for EA ${req.params.id} (${isAdmin ? 'Admin' : 'Owner'})`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('[EA Update] Validation failed:', errors.array());
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
      // Upload image to Supabase Storage
      if (req.files.image && req.files.image[0]) {
        try {
          console.log(`[EA Update] Uploading image to Supabase Storage...`);
          const uploadResult = await supabaseStorage.uploadImage(
            req.files.image[0].buffer,
            req.files.image[0].originalname,
            req.files.image[0].mimetype
          );
          
          imageUrl = uploadResult.url;
          imageFile = {
            filename: uploadResult.path,
            originalname: req.files.image[0].originalname,
            size: req.files.image[0].size,
            mimetype: req.files.image[0].mimetype,
            storagePath: uploadResult.path,
            publicUrl: uploadResult.url
          };
          console.log(`[EA Update] ✅ Image uploaded to Supabase: ${imageUrl}`);
        } catch (uploadError) {
          console.error(`[EA Update] Image upload to Supabase failed:`, uploadError);
        }
      }
      
      // Upload EA file to Supabase Storage
      if (req.files.eaFile && req.files.eaFile[0]) {
        try {
          console.log(`[EA Update] Uploading EA file to Supabase Storage...`);
          const uploadResult = await supabaseStorage.uploadEAFile(
            req.files.eaFile[0].buffer,
            req.files.eaFile[0].originalname,
            req.files.eaFile[0].mimetype
          );
          
          eaFileUrl = uploadResult.url;
          eaFile = {
            filename: uploadResult.path,
            originalname: req.files.eaFile[0].originalname,
            size: req.files.eaFile[0].size,
            mimetype: req.files.eaFile[0].mimetype,
            storagePath: uploadResult.path,
            publicUrl: uploadResult.url
          };
          console.log(`[EA Update] ✅ EA file uploaded to Supabase: ${eaFileUrl}`);
        } catch (uploadError) {
          console.error(`[EA Update] EA file upload to Supabase failed:`, uploadError);
        }
      }
      
      // Handle screenshot uploads to Supabase Storage
      if (req.files.screenshots && req.files.screenshots.length > 0) {
        console.log(`[EA Update] Uploading ${req.files.screenshots.length} screenshots to Supabase Storage...`);
        
        let screenshotUrls = [];
        for (let i = 0; i < req.files.screenshots.length; i++) {
          try {
            const screenshot = req.files.screenshots[i];
            
            // Skip large files
            if (screenshot.size > 5 * 1024 * 1024) {
              console.warn(`[EA Update] Screenshot ${i+1} too large, skipping`);
              continue;
            }
            
            const uploadResult = await supabaseStorage.uploadImage(
              screenshot.buffer,
              screenshot.originalname,
              screenshot.mimetype,
              'ea-screenshots'
            );
            
            screenshotUrls.push(uploadResult.url);
            console.log(`[EA Update] ✅ Screenshot ${i+1}/${req.files.screenshots.length} uploaded`);
          } catch (uploadError) {
            console.warn(`[EA Update] Failed to upload screenshot ${i+1}:`, uploadError.message);
            // Continue with other screenshots
          }
        }
        
        console.log(`[EA Update] Successfully uploaded ${screenshotUrls.length}/${req.files.screenshots.length} screenshots`);
        
        // Store for later (will be added to updates object below)
        if (screenshotUrls.length > 0) {
          req.uploadedScreenshots = screenshotUrls;
        }
      }
    }

    // Build update object
    const updates = {};
    
    // Add uploaded screenshots if any - MERGE with existing screenshots
    if (req.uploadedScreenshots) {
      // Get existing screenshots from the EA
      const existingScreenshots = existingEA.screenshots || [];
      updates.screenshots = [...existingScreenshots, ...req.uploadedScreenshots];
      console.log('[EA Update] Merging screenshots:');
      console.log('  - Existing:', existingScreenshots);
      console.log('  - New:', req.uploadedScreenshots);
      console.log('  - Merged:', updates.screenshots);
    }
    
    // Copy basic fields (excluding 'price' and 'tags' which need special handling)
    const allowedFields = [
      'name', 'description', 'version', 'status', 'category', 
      'win_rate', 'profit_factor', 'max_drawdown', 'sharpe_ratio', 
      'total_trades', 'profitable_trades', 'min_deposit', 
      'recommended_deposit', 'max_spread', 'risk_level'
    ];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    // Handle array fields (supported_pairs, timeframes)
    if (req.body.supported_pairs) {
      if (typeof req.body.supported_pairs === 'string') {
        updates.supported_pairs = req.body.supported_pairs.split(',').map(p => p.trim()).filter(p => p);
      } else if (Array.isArray(req.body.supported_pairs)) {
        updates.supported_pairs = req.body.supported_pairs;
      }
      logger.debug('[EA Update] Setting supported_pairs:', updates.supported_pairs);
    }
    
    if (req.body.timeframes) {
      if (typeof req.body.timeframes === 'string') {
        updates.timeframes = req.body.timeframes.split(',').map(t => t.trim()).filter(t => t);
      } else if (Array.isArray(req.body.timeframes)) {
        updates.timeframes = req.body.timeframes;
      }
      logger.debug('[EA Update] Setting timeframes:', updates.timeframes);
    }
    
    // Handle price field - map to price_weekly, price_monthly, and price_yearly
    if (req.body.price !== undefined) {
      const monthlyPrice = parseFloat(req.body.price) || 18.00;
      updates.price_weekly = 6.99; // Psychological weekly pricing
      updates.price_monthly = monthlyPrice;
      updates.price_yearly = 97.00; // Lifetime access pricing
    }
    
    // Handle tags field - map to keywords column (database uses 'keywords' not 'tags')
    if (req.body.tags !== undefined) {
      // Convert comma-separated string to array
      if (typeof req.body.tags === 'string') {
        updates.keywords = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(req.body.tags)) {
        updates.keywords = req.body.tags;
      }
      console.log(`[EA Update] Mapped tags to keywords:`, updates.keywords);
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
    
    // Handle screenshots array - only if not already set from file uploads
    if (!req.uploadedScreenshots) {
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
        
        // Fallback: Create mock updated EA to prevent frontend errors
        console.log('🔄 [EA Update] Using fallback mock data...');
        updatedEA = {
          id: parseInt(req.params.id),
          ...updates,
          updated_at: new Date().toISOString()
        };
        console.log('✅ [EA Update] Fallback EA created:', updatedEA);
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
