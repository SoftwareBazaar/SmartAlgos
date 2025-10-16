const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;
const supabaseStorage = require('../services/supabaseStorage');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to verify download token
const verifyDownloadToken = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Download token is required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check token expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: 'Download token has expired'
      });
    }

    // Attach decoded token data to request
    req.downloadToken = decoded;
    next();
  } catch (error) {
    console.error('Download token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid download token'
    });
  }
};

// @route   GET /api/downloads/ea/:eaId
// @desc    Download EA files (ea_file, set_file, manual, screenshots)
// @access  Private (with download token)
router.get('/ea/:eaId', [verifyDownloadToken], async (req, res) => {
  try {
    const { eaId } = req.params;
    const { type } = req.query;
    const { subscriptionId, userId } = req.downloadToken;

    console.log('[Download] EA file download request:', { eaId, type, subscriptionId, userId });

    // Verify the subscription is active and belongs to the user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status, has_access, end_date')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      console.error('[Download] Subscription not found:', subError);
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if subscription is active
    if (subscription.status !== 'active' || !subscription.has_access) {
      return res.status(403).json({
        success: false,
        message: 'Subscription is not active'
      });
    }

    // Check if subscription has expired
    if (new Date(subscription.end_date) < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has expired'
      });
    }

    // Get EA details
    const { data: ea, error: eaError } = await supabase
      .from('eas')
      .select('id, name, ea_file, set_file, manual_file, screenshots')
      .eq('id', eaId)
      .single();

    if (eaError || !ea) {
      console.error('[Download] EA not found:', eaError);
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    // Determine which file to download based on type
    let fileUrl = null;
    let fileName = null;

    switch (type) {
      case 'ea_file':
        fileUrl = ea.ea_file;
        fileName = `${ea.name.replace(/[^a-z0-9]/gi, '_')}.ex4`;
        break;
      case 'set_file':
        fileUrl = ea.set_file;
        fileName = `${ea.name.replace(/[^a-z0-9]/gi, '_')}.set`;
        break;
      case 'manual':
        fileUrl = ea.manual_file;
        fileName = `${ea.name.replace(/[^a-z0-9]/gi, '_')}_Manual.pdf`;
        break;
      case 'screenshots':
        // For screenshots, we'll return a JSON array of URLs
        if (ea.screenshots && Array.isArray(ea.screenshots)) {
          return res.json({
            success: true,
            data: {
              screenshots: ea.screenshots
            }
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'No screenshots available'
          });
        }
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Must be: ea_file, set_file, manual, or screenshots'
        });
    }

    if (!fileUrl) {
      return res.status(404).json({
        success: false,
        message: `${type} not available for this EA`
      });
    }

    // Record the download
    await supabase
      .from('download_logs')
      .insert({
        subscription_id: subscriptionId,
        user_id: userId,
        ea_id: eaId,
        file_type: type,
        downloaded_at: new Date().toISOString()
      });

    console.log('[Download] Fetching file from:', fileUrl);

    // Check if file is from Supabase Storage or external URL
    if (fileUrl.includes('supabase.co/storage')) {
      // Download from Supabase Storage
      try {
        const fileBuffer = await supabaseStorage.downloadFile(fileUrl);
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        
        return res.send(fileBuffer);
      } catch (downloadError) {
        console.error('[Download] Supabase storage download error:', downloadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to download file from storage'
        });
      }
    } else if (fileUrl.startsWith('/uploads/')) {
      // Download from local filesystem
      try {
        const filePath = path.join(__dirname, '..', fileUrl);
        console.log('[Download] Reading local file:', filePath);
        
        const fileBuffer = await fs.readFile(filePath);
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        
        return res.send(fileBuffer);
      } catch (readError) {
        console.error('[Download] Local file read error:', readError);
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }
    } else {
      // Redirect to external URL
      return res.redirect(fileUrl);
    }

  } catch (error) {
    console.error('[Download] EA file download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file download'
    });
  }
});

// @route   POST /api/downloads/generate-token
// @desc    Generate a download token for a subscription
// @access  Private
router.post('/generate-token', [auth], async (req, res) => {
  try {
    const { subscriptionId, eaId } = req.body;

    if (!subscriptionId || !eaId) {
      return res.status(400).json({
        success: false,
        message: 'subscriptionId and eaId are required'
      });
    }

    // Verify the subscription belongs to the user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status, has_access')
      .eq('id', subscriptionId)
      .eq('user_id', req.user.id)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status !== 'active' || !subscription.has_access) {
      return res.status(403).json({
        success: false,
        message: 'Subscription is not active'
      });
    }

    // Generate download token (valid for 24 hours)
    const downloadToken = jwt.sign(
      {
        subscriptionId: subscription.id,
        userId: req.user.id,
        eaId: eaId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token: downloadToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    console.error('[Download] Generate token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

