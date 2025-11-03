const express = require('express');
const { body, query } = require('express-validator');
const { auth, updateActivity } = require('../middleware/auth');
const securityService = require('../services/securityService');
const emailService = require('../services/emailService');
const { auditLog } = require('../middleware/security');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/custom-ea');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `ea-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.ex4', '.ex5', '.mq4', '.mq5'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only EA files (.ex4, .ex5, .mq4, .mq5) are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Mock data for development
let customEARequests = [
  {
    id: 'req_001',
    userId: 'user_123',
    userEmail: 'user@example.com',
    serviceType: 'new_ea',
    eaName: 'My Scalping EA Pro',
    eaDescription: 'A professional scalping EA for forex trading',
    tradingStyle: 'scalping',
    platform: 'mt5',
    timeframe: 'M1',
    indicators: ['RSI', 'Moving Averages', 'MACD'],
    riskManagement: ['Stop Loss', 'Take Profit', 'Trailing Stop'],
    customFeatures: ['Multi-Currency', 'News Trading'],
    timeline: '1 week',
    budget: '$500 - $1,000',
    urgency: 'medium',
    experience: 'intermediate',
    requirements: 'Need fast execution and low latency',
    status: 'pending',
    estimatedPrice: 750,
    finalPrice: null,
    adminNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ==================== CUSTOM EA REQUEST MANAGEMENT ====================

// @route   POST /api/custom-ea/request
// @desc    Submit a custom EA development request
// @access  Private
router.post('/request', [
  auth,
  updateActivity,
  auditLog('custom_ea_request_submitted')
], async (req, res) => {
  try {
    const requestData = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      ...req.body,
      status: 'pending',
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data (in production, save to database)
    customEARequests.push(requestData);

    // Log the request submission
    securityService.logSecurityEvent('custom_ea_request_submitted', {
      userId: req.user._id,
      requestId: requestData.id,
      serviceType: requestData.serviceType,
      estimatedPrice: requestData.estimatedPrice,
      ip: securityService.getClientIP(req)
    });

    // Send email notification to admin
    try {
      await emailService.sendCustomEARequestNotification(requestData);
      console.log('✅ Email notification sent for custom EA request:', requestData.id);
    } catch (error) {
      console.error('⚠️  Failed to send email notification:', error);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        requestId: requestData.id,
        status: requestData.status,
        estimatedPrice: requestData.estimatedPrice
      },
      message: 'Custom EA request submitted successfully'
    });

  } catch (error) {
    console.error('Submit custom EA request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit custom EA request'
    });
  }
});

// @route   GET /api/custom-ea/requests
// @desc    Get user's custom EA requests
// @access  Private
router.get('/requests', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const userRequests = customEARequests.filter(req => req.userId === req.user._id.toString());
    
    res.json({
      success: true,
      data: userRequests,
      message: 'Custom EA requests retrieved successfully'
    });

  } catch (error) {
    console.error('Get custom EA requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get custom EA requests'
    });
  }
});

// @route   GET /api/custom-ea/requests/:id
// @desc    Get specific custom EA request
// @access  Private
router.get('/requests/:id', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const request = customEARequests.find(req => req.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom EA request not found'
      });
    }

    // Check if user owns this request or is admin
    if (request.userId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: request,
      message: 'Custom EA request retrieved successfully'
    });

  } catch (error) {
    console.error('Get custom EA request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get custom EA request'
    });
  }
});

// @route   POST /api/custom-ea/requests/:id/upload
// @desc    Upload EA file for modification request
// @access  Private
router.post('/requests/:id/upload', [
  auth,
  updateActivity,
  upload.single('eaFile')
], async (req, res) => {
  try {
    const request = customEARequests.find(req => req.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom EA request not found'
      });
    }

    if (request.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Update request with file information
    request.eaFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };
    request.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      },
      message: 'EA file uploaded successfully'
    });

  } catch (error) {
    console.error('Upload EA file error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload EA file'
    });
  }
});

// @route   POST /api/custom-ea/requests/:id/message
// @desc    Send message to admin about the request
// @access  Private
router.post('/requests/:id/message', [
  auth,
  updateActivity,
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
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

    const request = customEARequests.find(req => req.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom EA request not found'
      });
    }

    if (request.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add message to request
    if (!request.messages) {
      request.messages = [];
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      message: req.body.message,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    request.messages.push(message);
    request.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/custom-ea/admin/requests
// @desc    Get all custom EA requests (Admin only)
// @access  Private (Admin)
router.get('/admin/requests', [
  auth,
  updateActivity,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  }
], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filteredRequests = customEARequests;
    
    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }

    // Sort by creation date (newest first)
    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        requests: paginatedRequests,
        total: filteredRequests.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredRequests.length / limit)
      },
      message: 'Custom EA requests retrieved successfully'
    });

  } catch (error) {
    console.error('Get all custom EA requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get custom EA requests'
    });
  }
});

// @route   PUT /api/custom-ea/admin/requests/:id
// @desc    Update custom EA request status (Admin only)
// @access  Private (Admin)
router.put('/admin/requests/:id', [
  auth,
  updateActivity,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  },
  body('status')
    .isIn(['pending', 'reviewing', 'in_progress', 'completed', 'cancelled', 'rejected'])
    .withMessage('Invalid status'),
  body('finalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Final price must be a positive number'),
  body('adminNotes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Admin notes must be less than 2000 characters')
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

    const request = customEARequests.find(req => req.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom EA request not found'
      });
    }

    // Update request
    Object.assign(request, req.body);
    request.updatedAt = new Date().toISOString();

    // Log admin action
    securityService.logSecurityEvent('custom_ea_request_updated', {
      adminId: req.user._id,
      requestId: request.id,
      userId: request.userId,
      status: request.status,
      ip: securityService.getClientIP(req)
    });

    res.json({
      success: true,
      data: request,
      message: 'Custom EA request updated successfully'
    });

  } catch (error) {
    console.error('Update custom EA request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update custom EA request'
    });
  }
});

// @route   POST /api/custom-ea/admin/requests/:id/message
// @desc    Send admin message to user
// @access  Private (Admin)
router.post('/admin/requests/:id/message', [
  auth,
  updateActivity,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  },
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
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

    const request = customEARequests.find(req => req.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom EA request not found'
      });
    }

    // Add admin message to request
    if (!request.messages) {
      request.messages = [];
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      adminId: req.user._id.toString(),
      adminName: req.user.name || 'Admin',
      message: req.body.message,
      isAdmin: true,
      createdAt: new Date().toISOString()
    };

    request.messages.push(message);
    request.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: message,
      message: 'Admin message sent successfully'
    });

  } catch (error) {
    console.error('Send admin message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send admin message'
    });
  }
});

// @route   GET /api/custom-ea/admin/stats
// @desc    Get custom EA service statistics (Admin only)
// @access  Private (Admin)
router.get('/admin/stats', [
  auth,
  updateActivity,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  }
], async (req, res) => {
  try {
    const stats = {
      totalRequests: customEARequests.length,
      pendingRequests: customEARequests.filter(req => req.status === 'pending').length,
      inProgressRequests: customEARequests.filter(req => req.status === 'in_progress').length,
      completedRequests: customEARequests.filter(req => req.status === 'completed').length,
      
      serviceTypes: {
        new_ea: customEARequests.filter(req => req.serviceType === 'new_ea').length,
        modify_ea: customEARequests.filter(req => req.serviceType === 'modify_ea').length,
        custom_indicator: customEARequests.filter(req => req.serviceType === 'custom_indicator').length
      },
      
      tradingStyles: {
        scalping: customEARequests.filter(req => req.tradingStyle === 'scalping').length,
        swing: customEARequests.filter(req => req.tradingStyle === 'swing').length,
        hedging: customEARequests.filter(req => req.tradingStyle === 'hedging').length,
        arbitrage: customEARequests.filter(req => req.tradingStyle === 'arbitrage').length,
        grid: customEARequests.filter(req => req.tradingStyle === 'grid').length,
        martingale: customEARequests.filter(req => req.tradingStyle === 'martingale').length
      },
      
      platforms: {
        mt4: customEARequests.filter(req => req.platform === 'mt4').length,
        mt5: customEARequests.filter(req => req.platform === 'mt5').length,
        tradingview: customEARequests.filter(req => req.platform === 'tradingview').length
      },
      
      totalRevenue: customEARequests
        .filter(req => req.finalPrice)
        .reduce((sum, req) => sum + (req.finalPrice || 0), 0),
      
      averagePrice: customEARequests
        .filter(req => req.finalPrice)
        .reduce((sum, req) => sum + (req.finalPrice || 0), 0) / 
        customEARequests.filter(req => req.finalPrice).length || 0
    };

    res.json({
      success: true,
      data: stats,
      message: 'Custom EA service statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Get custom EA stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get custom EA statistics'
    });
  }
});

module.exports = router;
