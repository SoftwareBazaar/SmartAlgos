/**
 * Utilities Management API Routes
 * Handles CRUD operations for trading utility tools
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { auth, updateActivity } = require('../middleware/auth');
const databaseService = require('../services/databaseService');

// Configure multer for file uploads
const UPLOAD_DIR = path.join(__dirname, '../uploads/utilities');
const ensureUploadDir = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadDir();
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname) || '.jpg';
    cb(null, `utility-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = /^image\/(jpeg|jpg|png|gif|webp)$/i;
    if (allowedMimeTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// @route   GET /api/utilities
// @desc    Get all utilities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, is_active } = req.query;
    
    let query = databaseService.supabase
      .from('utilities')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    // Filter by active status (default: only active)
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    } else {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching utilities:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch utilities'
      });
    }
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get utilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/utilities/:id
// @desc    Get single utility by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await databaseService.supabase
      .from('utilities')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Utility not found'
      });
    }
    
    // Increment view/download count
    await databaseService.supabase
      .from('utilities')
      .update({ downloads: data.downloads + 1 })
      .eq('id', req.params.id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get utility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/utilities/upload-image
// @desc    Upload utility image
// @access  Private (Admin only)
router.post('/upload-image', [
  auth,
  updateActivity,
  upload.single('image')
], async (req, res) => {
  try {
    console.log('📤 Upload request received:', {
      hasFile: !!req.file,
      userId: req.user?.userId,
      userRole: req.user?.role,
      authHeader: req.header('Authorization')?.substring(0, 20) + '...'
    });
    
    // In development, skip admin check if using test token
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isTestToken = req.header('Authorization')?.includes('test_token');
    
    console.log('🔐 Auth check:', { 
      isDevelopment, 
      isTestToken, 
      userId: req.user?.userId, 
      userRole: req.user?.role 
    });
    
    // Skip admin check ONLY if both development AND test token
    if (!(isDevelopment && isTestToken)) {
      // Check if user is admin
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const { data: userData, error: userError } = await databaseService.supabase
        .from('users_accounts')
        .select('role')
        .eq('id', req.user.userId)
        .single();
      
      if (userError || !userData || userData.role !== 'admin') {
        console.log('❌ Admin check failed:', { userError, userData, userId: req.user.userId });
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
    }

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/utilities/${req.file.filename}`;
    
    console.log('✅ File uploaded successfully:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      imageUrl
    });
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('❌ Upload utility image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image: ' + error.message
    });
  }
});

// @route   POST /api/utilities
// @desc    Create new utility
// @access  Private (Admin only)
router.post('/', [
  auth,
  updateActivity,
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Risk Management', 'Market Analysis', 'Trading Tools', 'EA Tools'])
    .withMessage('Invalid category'),
  body('version').trim().notEmpty().withMessage('Version is required'),
], async (req, res) => {
  try {
    // In development, skip admin check if using test token
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isTestToken = req.header('Authorization')?.includes('test_token');
    
    // Skip admin check ONLY if both development AND test token
    if (!(isDevelopment && isTestToken)) {
      // Check if user is admin
      const { data: userData, error: userError } = await databaseService.supabase
        .from('users_accounts')
        .select('role')
        .eq('id', req.user.userId)
        .single();
      
      if (userError || !userData || userData.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
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
      name,
      description,
      category,
      features,
      download_url,
      version,
      size,
      image,
      image_timestamp,
      previews,
      guide
    } = req.body;
    
    // Process features array if it's a string
    let processedFeatures = features;
    if (typeof features === 'string') {
      try {
        processedFeatures = JSON.parse(features);
      } catch (e) {
        processedFeatures = features.split('\n').filter(f => f.trim());
      }
    }
    
    // Process guide object if it's a string
    let processedGuide = guide;
    if (typeof guide === 'string') {
      try {
        processedGuide = JSON.parse(guide);
      } catch (e) {
        processedGuide = { title: 'Guide', steps: guide.split('\n').filter(s => s.trim()) };
      }
    }
    
    // Use admin client for admin operations to bypass RLS
    const supabaseAdmin = databaseService.supabaseAdmin || databaseService.supabase;
    
    const { data, error } = await supabaseAdmin
      .from('utilities')
      .insert([{
        name,
        description,
        category,
        features: processedFeatures || [],
        download_url,
        version,
        size,
        image,
        image_timestamp: image_timestamp || Date.now(),
        previews: previews || [],
        guide: processedGuide || {},
        downloads: 0,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating utility:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to create utility: ' + error.message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Utility created successfully',
      data
    });
  } catch (error) {
    console.error('Create utility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/utilities/:id
// @desc    Update utility
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  updateActivity,
  upload.single('image'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['Risk Management', 'Market Analysis', 'Trading Tools', 'EA Tools'])
    .withMessage('Invalid category'),
], async (req, res) => {
  try {
    // In development, skip admin check if using test token
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isTestToken = req.header('Authorization')?.includes('test_token');
    
    // Skip admin check ONLY if both development AND test token
    if (!(isDevelopment && isTestToken)) {
      // Check if user is admin
      const { data: userData, error: userError } = await databaseService.supabase
        .from('users_accounts')
        .select('role')
        .eq('id', req.user.userId)
        .single();
      
      if (userError || !userData || userData.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    delete updates.downloads; // Don't allow manual download count updates
    
    // Handle uploaded image file
    if (req.file) {
      updates.image = `/uploads/utilities/${req.file.filename}`;
      updates.image_timestamp = Date.now();
    }
    
    // Process features array if it's a string
    if (updates.features && typeof updates.features === 'string') {
      try {
        updates.features = JSON.parse(updates.features);
      } catch (e) {
        updates.features = updates.features.split('\n').filter(f => f.trim());
      }
    }
    
    // Process guide object if it's a string
    if (updates.guide && typeof updates.guide === 'string') {
      try {
        updates.guide = JSON.parse(updates.guide);
      } catch (e) {
        updates.guide = { title: 'Guide', steps: updates.guide.split('\n').filter(s => s.trim()) };
      }
    }
    
    // Use admin client for admin operations to bypass RLS
    const supabaseAdmin = databaseService.supabaseAdmin || databaseService.supabase;
    
    const { data, error } = await supabaseAdmin
      .from('utilities')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating utility:', error);
      return res.status(404).json({
        success: false,
        message: 'Utility not found or update failed'
      });
    }
    
    res.json({
      success: true,
      message: 'Utility updated successfully',
      data
    });
  } catch (error) {
    console.error('Update utility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/utilities/:id
// @desc    Delete utility (soft delete)
// @access  Private (Admin only)
router.delete('/:id', [auth, updateActivity], async (req, res) => {
  try {
    // In development, skip admin check if using test token
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isTestToken = req.header('Authorization')?.includes('test_token');
    
    // Skip admin check ONLY if both development AND test token
    if (!(isDevelopment && isTestToken)) {
      // Check if user is admin
      const { data: userData, error: userError } = await databaseService.supabase
        .from('users_accounts')
        .select('role')
        .eq('id', req.user.userId)
        .single();
      
      if (userError || !userData || userData.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
    }
    
    // Use admin client for admin operations to bypass RLS
    const supabaseAdmin = databaseService.supabaseAdmin || databaseService.supabase;
    
    // Soft delete by setting is_active to false
    const { data, error } = await supabaseAdmin
      .from('utilities')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Utility not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Utility deleted successfully'
    });
  } catch (error) {
    console.error('Delete utility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/utilities/:id/download
// @desc    Increment download counter
// @access  Public
router.post('/:id/download', async (req, res) => {
  try {
    const { data, error } = await databaseService.supabase
      .rpc('increment_utility_downloads', { utility_id: req.params.id });
    
    if (error) {
      // If RPC doesn't exist, fall back to manual increment
      const { data: utility } = await databaseService.supabase
        .from('utilities')
        .select('downloads')
        .eq('id', req.params.id)
        .single();
      
      if (utility) {
        await databaseService.supabase
          .from('utilities')
          .update({ downloads: utility.downloads + 1 })
          .eq('id', req.params.id);
      }
    }
    
    res.json({
      success: true,
      message: 'Download counted successfully'
    });
  } catch (error) {
    console.error('Download count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/utilities/seed
// @desc    Seed database with default utilities (Dev only)
// @access  Public (for quick setup)
router.post('/seed', async (req, res) => {
  try {
    // Check if utilities already exist
    const { data: existingUtilities } = await databaseService.supabase
      .from('utilities')
      .select('id')
      .limit(1);
    
    if (existingUtilities && existingUtilities.length > 0) {
      return res.json({
        success: true,
        message: 'Utilities already seeded',
        count: 0
      });
    }
    
    // Default utilities with actual images
    const defaultUtilities = [
      {
        name: 'Professional Lot Size Calculator',
        description: 'Advanced position sizing calculator with risk management features. Calculate optimal lot sizes based on your account balance, risk percentage, and stop loss distance. Supports multiple currency pairs and includes real-time pip value calculations.',
        category: 'Risk Management',
        features: [
          'Multi-currency support (30+ pairs)',
          'Real-time pip value calculator',
          'Risk percentage customization (0.5% - 5%)',
          'Stop loss distance calculator',
          'Account balance tracker',
          'Position size recommendations',
          'Risk-reward ratio analysis',
          'Margin requirement calculator'
        ],
        download_url: '/downloads/professional-lotsize-calculator.exe',
        version: '3.2.1',
        size: '4.5 MB',
        downloads: 0,
        image: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Upload+Your+Image',
        image_timestamp: null,
        previews: ['https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Preview'],
        guide: {
          title: 'Professional Lot Size Calculator - Quick Start Guide',
          steps: [
            'Download and extract the calculator to your preferred location',
            'Run the executable file (no installation required)',
            'Enter your account balance in your base currency',
            'Select your currency pair from the dropdown menu',
            'Set your desired risk percentage (recommended: 1-2%)',
            'Enter your stop loss distance in pips',
            'Click "Calculate" to see optimal lot size',
            'Review the risk amount and margin requirements',
            'Use the suggested lot size for your trade',
            'Save your settings for future quick calculations'
          ]
        }
      },
      {
        name: 'Economic Calendar Tool',
        description: 'Track important economic events and news releases that impact forex markets',
        category: 'Market Analysis',
        features: ['Real-time economic events', 'Impact level indicators', 'Currency pair filtering', 'Custom event alerts'],
        download_url: '/downloads/economic-calendar.exe',
        version: '1.8.5',
        size: '1.8 MB',
        downloads: 12350,
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
        image_timestamp: Date.now(),
        previews: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop'],
        guide: { title: 'Economic Calendar Guide', steps: ['Install the calendar tool', 'Configure your timezone', 'Select countries to monitor', 'Set up custom alerts', 'Review daily economic events', 'Plan your trading strategy'] }
      },
      {
        name: 'Profit Calculator',
        description: 'Calculate potential profits and losses for different trading scenarios',
        category: 'Trading Tools',
        features: ['Pip value calculations', 'Profit/loss scenarios', 'Multiple timeframe analysis', 'Risk-reward ratios'],
        download_url: '/downloads/profit-calculator.exe',
        version: '1.5.2',
        size: '1.2 MB',
        downloads: 8750,
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop',
        image_timestamp: Date.now(),
        previews: ['https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop'],
        guide: { title: 'Profit Calculator Guide', steps: ['Download the calculator', 'Enter trade parameters', 'Set entry and exit prices', 'Calculate potential profit/loss', 'Analyze risk-reward ratio'] }
      },
      {
        name: 'Market Hours Tracker',
        description: 'Monitor trading session times and market overlaps for optimal trading opportunities',
        category: 'Market Analysis',
        features: ['All major trading sessions', 'Market overlap indicators', 'Timezone conversions', 'Session strength analysis'],
        download_url: '/downloads/market-hours.exe',
        version: '2.0.1',
        size: '1.5 MB',
        downloads: 6890,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        image_timestamp: Date.now(),
        previews: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'],
        guide: { title: 'Market Hours Guide', steps: ['Install the tracker', 'Set your timezone', 'Monitor session overlaps', 'Plan trading times', 'Track session strength'] }
      }
    ];
    
    const { data, error } = await databaseService.supabase
      .from('utilities')
      .insert(defaultUtilities)
      .select();
    
    if (error) {
      console.error('Error seeding utilities:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to seed utilities',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Utilities seeded successfully',
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Seed utilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
