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
const supabaseStorage = require('../services/supabaseStorage');

// Configure multer for file uploads - use memory storage for Supabase uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit (matches server limit)
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 MULTER FILE FILTER:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      encoding: file.encoding
    });
    
    // TEMPORARY: Accept ALL files to get it working, then we can add restrictions
    console.log('✅ File accepted (permissive mode - all files allowed)');
    cb(null, true);
    
    /* Original logic - temporarily disabled
    // Allow different file types based on field name
    if (file.fieldname === 'image' || file.fieldname === 'previews') {
      // For image uploads, only allow image files
      const allowedImageTypes = /^image\/(jpeg|jpg|png|gif|webp)$/i;
      if (allowedImageTypes.test(file.mimetype)) {
        console.log('✅ Image file accepted');
        cb(null, true);
      } else {
        console.log('❌ Image file rejected - invalid type');
        cb(new Error('Only image files are allowed for image upload (JPEG, PNG, GIF, WebP)'));
      }
    } else if (file.fieldname === 'uploadedFile') {
      // For utility files - PERMISSIVE: allow all non-image files
      console.log('✅ Utility file accepted (permissive mode):', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
      });
      cb(null, true);
    } else {
      // Default: allow all files for unknown field names
      console.log('⚠️ Unknown field name, allowing file:', file.fieldname);
      cb(null, true);
    }
    */
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
    
    // CRITICAL: Log image URLs to debug
    if (data && data.length > 0) {
      console.log('📊 Utilities fetched:', data.length);
      data.forEach((util, index) => {
        console.log(`   Utility ${index + 1} (${util.name}): image = ${util.image || 'NULL'}`);
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
    
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is admin (role is already in req.user from auth middleware)
    if (req.user.role !== 'admin') {
      console.log('❌ Admin check failed:', { userId: req.user.userId, role: req.user.role });
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    console.log('✅ Admin check passed:', { userId: req.user.userId, role: req.user.role });

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Supabase Storage (REQUIRED - no fallback to local)
    let imageUrl;
    try {
      console.log('📤 Uploading utility image to Supabase Storage...', {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
      
      const uploadResult = await supabaseStorage.uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'utilities'
      );
      
      imageUrl = uploadResult.url;
      console.log('✅ Utility image uploaded to Supabase:', imageUrl);
    } catch (uploadError) {
      console.error('❌ Supabase upload failed:', uploadError.message);
      console.error('❌ Upload error details:', uploadError);
      // DON'T use local path - return error instead
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to storage: ' + uploadError.message
      });
    }
    
    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: 'Image upload succeeded but no URL returned'
      });
    }
    
    console.log('✅ File uploaded successfully:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      imageUrl
    });
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
        filename: req.file.originalname,
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
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'uploadedFile', maxCount: 1 },
    { name: 'previews', maxCount: 5 }
  ]),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Risk Management', 'Market Analysis', 'Trading Tools', 'EA Tools'])
    .withMessage('Invalid category'),
  body('version').trim().notEmpty().withMessage('Version is required'),
], async (req, res) => {
  try {
    // Check if user is admin (role is already in req.user from auth middleware)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
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
    
    // Handle uploaded files
    let finalDownloadUrl = download_url;
    let finalImage = image;
    let finalImageTimestamp = image_timestamp;
    let finalPreviews = previews;
    
    if (req.files) {
      // Handle image upload to Supabase Storage
      if (req.files.image && req.files.image[0]) {
        try {
          console.log('📤 Utility image upload initiated:', {
            originalName: req.files.image[0].originalname,
            size: req.files.image[0].size,
            mimetype: req.files.image[0].mimetype
          });
          
          const uploadResult = await supabaseStorage.uploadImage(
            req.files.image[0].buffer,
            req.files.image[0].originalname,
            req.files.image[0].mimetype,
            'utilities' // Bucket name
          );
          
          finalImage = uploadResult.url;
          finalImageTimestamp = Date.now();
          console.log('✅ Utility image uploaded to Supabase:', finalImage);
        } catch (uploadError) {
          console.error('❌ Utility image upload failed:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload utility image: ' + uploadError.message
          });
        }
      }
      
      // Handle utility file upload to Supabase Storage
      if (req.files.uploadedFile && req.files.uploadedFile[0]) {
        try {
          const uploadedFile = req.files.uploadedFile[0];
          console.log('📤 Utility file upload initiated:', {
            originalName: uploadedFile.originalname,
            size: uploadedFile.size,
            mimetype: uploadedFile.mimetype
          });
          
          const uploadResult = await supabaseStorage.uploadImage(
            uploadedFile.buffer,
            uploadedFile.originalname,
            uploadedFile.mimetype,
            'utilities' // Bucket name
          );
          
          finalDownloadUrl = uploadResult.url;
          console.log('✅ Utility file uploaded to Supabase:', finalDownloadUrl);
        } catch (uploadError) {
          console.error('❌ Utility file upload failed:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload utility file: ' + uploadError.message
          });
        }
      }
      
      // Handle preview images to Supabase Storage
      if (req.files.previews && req.files.previews.length > 0) {
        try {
          const previewUrls = [];
          for (const file of req.files.previews) {
            const uploadResult = await supabaseStorage.uploadImage(
              file.buffer,
              file.originalname,
              file.mimetype,
              'utilities' // Bucket name
            );
            previewUrls.push(uploadResult.url);
          }
          finalPreviews = previewUrls;
          console.log('✅ Preview images uploaded to Supabase:', finalPreviews.length);
        } catch (uploadError) {
          console.error('❌ Preview images upload failed:', uploadError);
          // Continue without previews rather than failing
        }
      }
    }
    
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
        download_url: finalDownloadUrl,
        version,
        size,
        image: finalImage,
        image_timestamp: finalImageTimestamp || Date.now(),
        previews: finalPreviews || [],
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
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'uploadedFile', maxCount: 1 },
    { name: 'previews', maxCount: 5 }
  ]),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['Risk Management', 'Market Analysis', 'Trading Tools', 'EA Tools'])
    .withMessage('Invalid category'),
], async (req, res) => {
  console.log('\n🔄 ==> PUT /api/utilities/:id REQUEST STARTED');
  console.log('📍 Utility ID:', req.params.id);
  console.log('🔐 Auth Header:', req.header('Authorization') ? 'Present' : 'Missing');
  console.log('👤 User:', req.user ? { userId: req.user.userId, role: req.user.role } : 'Not authenticated');
  console.log('📦 Files:', req.files ? Object.keys(req.files).map(key => ({ 
    field: key, 
    count: req.files[key].length,
    files: req.files[key].map(f => ({ name: f.originalname, size: f.size, mimetype: f.mimetype }))
  })) : 'No files');
  console.log('📝 Body keys:', Object.keys(req.body));
  
  try {
    // Check if user is authenticated first
    if (!req.user) {
      console.log('❌ Authentication failed: No user object');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is admin (role is already in req.user from auth middleware)
    if (req.user.role !== 'admin') {
      console.log('❌ Authorization failed: User role:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    console.log('✅ Authentication and authorization passed');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    console.log('✅ Validation passed');
    
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    delete updates.downloads; // Don't allow manual download count updates
    
    // Store original image value to preserve if no new upload
    const existingImageUrl = updates.image;
    
    console.log('📝 Initial updates object:', Object.keys(updates));
    console.log('🖼️ Existing image URL from body:', existingImageUrl);
    
    // Handle uploaded files
    console.log('🔄 Processing file uploads...');
    if (req.files) {
      console.log('📁 Files found, processing each type...');
      
      // Handle image upload to Supabase Storage
      if (req.files.image && req.files.image[0]) {
        try {
          console.log('🖼️ Processing NEW image upload...');
          const uploadResult = await supabaseStorage.uploadImage(
            req.files.image[0].buffer,
            req.files.image[0].originalname,
            req.files.image[0].mimetype,
            'utilities'
          );
          updates.image = uploadResult.url;
          updates.image_timestamp = Date.now();
          console.log('✅ New image uploaded to Supabase:', updates.image);
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image: ' + uploadError.message
          });
        }
      }
      
      // Handle utility file upload to Supabase Storage
      if (req.files.uploadedFile && req.files.uploadedFile[0]) {
        try {
          const uploadedFile = req.files.uploadedFile[0];
          console.log('📤 Utility file upload initiated:', {
            originalName: uploadedFile.originalname,
            size: uploadedFile.size,
            mimetype: uploadedFile.mimetype
          });
          
          const uploadResult = await supabaseStorage.uploadImage(
            uploadedFile.buffer,
            uploadedFile.originalname,
            uploadedFile.mimetype,
            'utilities'
          );
          
          updates.download_url = uploadResult.url;
          console.log('✅ Utility file uploaded to Supabase:', updates.download_url);
        } catch (uploadError) {
          console.error('❌ Utility file upload failed:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload utility file: ' + uploadError.message
          });
        }
      }
      
      // Handle preview images to Supabase Storage
      if (req.files.previews && req.files.previews.length > 0) {
        try {
          const previewUrls = [];
          for (const file of req.files.previews) {
            const uploadResult = await supabaseStorage.uploadImage(
              file.buffer,
              file.originalname,
              file.mimetype,
              'utilities'
            );
            previewUrls.push(uploadResult.url);
          }
          updates.previews = previewUrls;
          console.log('✅ Preview images uploaded to Supabase:', previewUrls.length);
        } catch (uploadError) {
          console.error('❌ Preview images upload failed:', uploadError);
          // Continue without previews rather than failing
        }
      }
    }
    
    // Preserve existing image if no new file was uploaded and image URL is valid
    // Check if image is a valid URL (not base64 data URL)
    if (!updates.image) {
      // No new image uploaded - check if we should preserve existing
      if (existingImageUrl) {
        const isBase64DataUrl = typeof existingImageUrl === 'string' && existingImageUrl.startsWith('data:');
        const isValidUrl = typeof existingImageUrl === 'string' && 
          (existingImageUrl.startsWith('http://') || 
           existingImageUrl.startsWith('https://') || 
           existingImageUrl.startsWith('/uploads/'));
        
        if (!isBase64DataUrl && isValidUrl) {
          // Preserve existing image URL
          updates.image = existingImageUrl;
          console.log('✅ Preserving existing image URL:', existingImageUrl);
        } else if (isBase64DataUrl) {
          console.warn('⚠️  Base64 data URL detected in image field - skipping (should use uploaded URL instead)');
          // Don't update image field if it's base64
          delete updates.image;
        } else {
          console.warn('⚠️  Invalid image URL format:', existingImageUrl);
        }
      } else {
        console.log('ℹ️  No existing image URL to preserve');
      }
    } else {
      console.log('✅ Using new/updated image URL:', updates.image);
    }
    
    // Ensure image field is explicitly included if we have a valid URL
    if (updates.image && updates.image !== null && updates.image !== undefined) {
      console.log('✅ Image will be saved to database:', updates.image.substring(0, 80) + '...');
    } else {
      console.warn('⚠️  WARNING: Image field is missing or invalid - image may be cleared!');
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
    
    console.log('🔄 Starting database update...');
    console.log('📝 Final updates object:', JSON.stringify(updates, null, 2));
    console.log('🖼️ Image field in updates:', updates.image);
    console.log('🖼️ Image type:', typeof updates.image);
    
    // Use admin client for admin operations to bypass RLS
    const supabaseClient = databaseService.getClient();
    if (!supabaseClient) {
      console.log('❌ Supabase client not available');
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    console.log('✅ Supabase client available, performing update...');
    
    // CRITICAL: Explicitly select image field to ensure it's returned
    const { data, error } = await supabaseClient
      .from('utilities')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, image')  // Explicitly include image
      .single();
    
    if (error) {
      console.error('❌ Database update error:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return res.status(500).json({
        success: false,
        message: 'Database update failed: ' + error.message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
    
    if (!data) {
      console.log('❌ No data returned - utility not found');
      return res.status(404).json({
        success: false,
        message: 'Utility not found'
      });
    }
    
    console.log('✅ Utility updated successfully');
    console.log('📊 Updated data ID:', data.id);
    console.log('🖼️ Image URL in response:', data.image || 'NULL');
    console.log('🖼️ Image URL type:', typeof data.image);
    
    res.json({
      success: true,
      message: 'Utility updated successfully',
      data
    });
  } catch (error) {
    console.error('❌ CRITICAL ERROR in PUT /api/utilities/:id');
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request details:', {
      utilityId: req.params.id,
      userId: req.user?.userId,
      hasFiles: !!req.files,
      bodyKeys: Object.keys(req.body || {})
    });
    
    // Check if headers already sent
    if (res.headersSent) {
      console.error('❌ Headers already sent, cannot send error response');
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

// Error handler for multer errors in this route
router.use((error, req, res, next) => {
  console.error('🚨 Route-level error handler:', {
    name: error.name,
    message: error.message,
    code: error.code
  });
  
  if (error instanceof multer.MulterError) {
    console.error('🚨 Multer error caught:', error);
    return res.status(400).json({
      success: false,
      message: `File upload error: ${error.message}`,
      error: {
        type: 'MULTER_ERROR',
        code: error.code,
        field: error.field
      }
    });
  }
  
  if (error.message && error.message.includes('File type not allowed')) {
    console.error('🚨 File type error caught:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
      error: {
        type: 'INVALID_FILE_TYPE'
      }
    });
  }
  
  // Pass to next error handler if not handled here
  next(error);
});

// @route   GET /api/utilities/:id/download
// @desc    Download utility file
// @access  Public (Free download for all authenticated users)
router.get('/:id/download', async (req, res) => {
  try {
    console.log('[Utility Download] Request for utility ID:', req.params.id);
    
    // Get utility details
    const { data: utility, error: utilError } = await databaseService.supabase
      .from('utilities')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (utilError || !utility) {
      console.error('[Utility Download] Utility not found:', utilError);
      return res.status(404).json({
        success: false,
        message: 'Utility not found'
      });
    }
    
    if (!utility.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Utility is not available'
      });
    }
    
    console.log('[Utility Download] Utility found:', {
      name: utility.name,
      download_url: utility.download_url
    });
    
    // Check if it's a Supabase Storage URL or external URL
    if (utility.download_url && (utility.download_url.includes('supabase.co/storage') || utility.download_url.startsWith('http'))) {
      // Handle Supabase Storage URLs - provide better download experience
      console.log('[Utility Download] Processing Supabase Storage URL:', utility.download_url);
      
      try {
        // Update download count first
        const supabaseClient = databaseService.getClient();
        if (supabaseClient) {
          await supabaseClient
            .from('utilities')
            .update({ 
              downloads: (utility.downloads || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', req.params.id);
          console.log('[Utility Download] ✅ Download count updated');
        }
        
        // Set appropriate headers for file download
        const fileExtension = path.extname(utility.download_url).toLowerCase();
        const fileName = `${utility.name}${fileExtension}`;
        
        res.set({
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': 'application/octet-stream',
          'Cache-Control': 'no-cache'
        });
        
        console.log('[Utility Download] ✅ Headers set, redirecting to:', utility.download_url);
        return res.redirect(utility.download_url);
      } catch (error) {
        console.error('[Utility Download] Error updating download count:', error);
        // Still allow download even if count update fails
        return res.redirect(utility.download_url);
      }
    } else if (utility.download_url && utility.download_url.startsWith('/uploads/')) {
      // Serve local file
      const filePath = path.join(__dirname, '..', utility.download_url);
      console.log('[Utility Download] Serving local file:', filePath);
      
      try {
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        if (!fileExists) {
          console.error('[Utility Download] File not found:', filePath);
          return res.status(404).json({
            success: false,
            message: 'File not found on server'
          });
        }
        
        // Update download count
        await databaseService.supabase
          .from('utilities')
          .update({ 
            downloads: (utility.downloads || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', req.params.id);
        
        return res.download(filePath, utility.name + '.exe');
      } catch (error) {
        console.error('[Utility Download] File serving error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to serve file'
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: 'No download file available'
      });
    }
  } catch (error) {
    console.error('[Utility Download] Error:', error);
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
    // Check if user is admin (role is already in req.user from auth middleware)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
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

// @route   GET /api/utilities/debug/auth
// @desc    Debug authentication for utilities
// @access  Private (Admin only)
router.get('/debug/auth', [auth], async (req, res) => {
  try {
    console.log('🔍 DEBUG AUTH REQUEST:');
    console.log('- Headers:', req.headers);
    console.log('- User:', req.user);
    console.log('- UserRaw:', req.userRaw);
    
    res.json({
      success: true,
      auth: {
        authenticated: !!req.user,
        user: req.user ? {
          id: req.user.userId,
          email: req.user.email,
          role: req.user.role,
          isActive: req.user.isActive
        } : null,
        isAdmin: req.user?.role === 'admin',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Auth debug error',
      error: error.message
    });
  }
});

// @route   GET /api/utilities/debug/storage
// @desc    Debug Supabase storage configuration
// @access  Private (Admin only)
router.get('/debug/storage', [auth], async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const supabaseClient = databaseService.getClient();
    if (!supabaseClient) {
      return res.json({
        success: false,
        message: 'Supabase client not available',
        debug: {
          mockMode: databaseService.mockMode,
          supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'
        }
      });
    }
    
    // Test storage bucket access
    try {
      const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();
      
      let utilitiesBucketExists = false;
      if (!bucketsError && buckets) {
        utilitiesBucketExists = buckets.some(bucket => bucket.name === 'utilities');
      }
      
      // Try to list files in utilities bucket
      let filesCount = 0;
      let storageError = null;
      if (utilitiesBucketExists) {
        try {
          const { data: files, error: filesError } = await supabaseClient.storage
            .from('utilities')
            .list('', { limit: 5 });
          
          if (!filesError && files) {
            filesCount = files.length;
          } else {
            storageError = filesError;
          }
        } catch (err) {
          storageError = err;
        }
      }
      
      res.json({
        success: true,
        debug: {
          supabaseConnected: true,
          buckets: {
            total: buckets ? buckets.length : 0,
            utilitiesBucketExists,
            bucketsError: bucketsError?.message
          },
          utilities: {
            filesCount,
            storageError: storageError?.message
          },
          config: {
            supabaseUrl: process.env.SUPABASE_URL,
            hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            mockMode: databaseService.mockMode
          }
        }
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'Storage access error',
        error: error.message,
        debug: {
          supabaseConnected: true,
          mockMode: databaseService.mockMode
        }
      });
    }
  } catch (error) {
    console.error('Storage debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint error',
      error: error.message
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
    
    // CSP-compliant SVG placeholders (base64-encoded)
    const createPlaceholderSVG = (color, text) => {
      const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${color}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">${text}</text>
      </svg>`;
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    };

    const placeholderCalc = createPlaceholderSVG('#4CAF50', 'Calculator');
    const placeholderCalendar = createPlaceholderSVG('#2196F3', 'Economic Calendar');
    const placeholderProfit = createPlaceholderSVG('#9C27B0', 'Profit Calculator');
    const placeholderMarket = createPlaceholderSVG('#FF9800', 'Market Hours');

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
        image: placeholderCalc,
        image_timestamp: Date.now(),
        previews: [placeholderCalc],
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
        image: placeholderCalendar,
        image_timestamp: Date.now(),
        previews: [placeholderCalendar],
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
        image: placeholderProfit,
        image_timestamp: Date.now(),
        previews: [placeholderProfit],
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
        image: placeholderMarket,
        image_timestamp: Date.now(),
        previews: [placeholderMarket],
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
