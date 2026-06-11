const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;
const supabaseStorage = require('../services/supabaseStorage');
const databaseService = require('../services/databaseService');

function getSupabase() {
  const client = databaseService.getClient();
  if (!client) throw new Error('Database unavailable');
  return client;
}

// Middleware to verify download token
const verifyDownloadToken = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    console.log('[Download Token] Received token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('[Download Token] No token provided');
      return res.status(401).json({
        success: false,
        message: 'Download token is required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('[Download Token] Token decoded successfully:', { subscriptionId: decoded.subscriptionId, userId: decoded.userId, eaId: decoded.eaId });
    
    // Check token expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.log('[Download Token] Token expired');
      return res.status(401).json({
        success: false,
        message: 'Download token has expired'
      });
    }

    // Attach decoded token data to request
    req.downloadToken = decoded;
    next();
  } catch (error) {
    console.error('[Download Token] Verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid download token'
    });
  }
};

// @route   GET /api/downloads/ea/:eaId/zip
// @desc    Download EA ZIP package (all files in one)
// @access  Private (with download token)
router.get('/ea/:eaId/zip', [verifyDownloadToken], async (req, res) => {
  try {
    const { eaId } = req.params;
    const { subscriptionId, userId } = req.downloadToken;

    console.log('[Download ZIP] Request:', { eaId, subscriptionId, userId });

    // Verify the subscription is active and belongs to the user
    let subscription;
    
    // Check if we're in mock mode
    const isPlaceholderKey = (value = '') => {
      if (!value) return true;
      const normalized = value.toLowerCase();
      return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
    };
    const explicitMockFlag = (process.env.MOCK_AUTH || '').toLowerCase();
    const useMockAuth = explicitMockFlag === 'true' || (explicitMockFlag !== 'false' && isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY));
    
    if (useMockAuth) {
      const mockDataStore = require('../services/mockAuthStore').mockDataStore;
      subscription = await mockDataStore.getSubscriptionById(subscriptionId);
    } else {
      const { data, error: subError } = await getSupabase()
        .from('subscriptions')
        .select('id, user_id, status, end_date')
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .single();

      if (subError) {
        console.error('[Download ZIP] Subscription not found:', subError);
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }
      subscription = data;
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
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

    // Get EA details with ZIP file path
    let ea;
    
    if (useMockAuth) {
      const mockDataStore = require('../services/mockAuthStore').mockDataStore;
      ea = await mockDataStore.getEAById(eaId);
    } else {
      const { data, error: eaError } = await getSupabase()
        .from('expert_advisors')
        .select('id, name, zip_file_path')
        .eq('id', eaId)
        .single();

      if (eaError) {
        console.error('[Download ZIP] EA not found:', eaError);
        return res.status(404).json({
          success: false,
          message: 'EA not found'
        });
      }
      ea = data;
    }

    if (!ea) {
      return res.status(404).json({
        success: false,
        message: 'EA not found'
      });
    }

    if (!ea.zip_file_path) {
      return res.status(404).json({
        success: false,
        message: 'ZIP package not available for this EA. Please contact support.'
      });
    }

    // Record the download
    try {
      await getSupabase()
        .from('download_logs')
        .insert({
          subscription_id: subscriptionId,
          user_id: userId,
          ea_id: eaId,
          file_type: 'zip_package',
          downloaded_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('[Download ZIP] Failed to log download:', logError.message);
    }

    console.log('[Download ZIP] Serving file from:', ea.zip_file_path);

    // Generate safe filename
    const fileName = `${ea.name.replace(/[^a-z0-9]/gi, '_')}_Package.zip`;

    // Set headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Check if file is from Supabase Storage or external URL
    if (ea.zip_file_path.includes('supabase.co/storage') || ea.zip_file_path.startsWith('http://') || ea.zip_file_path.startsWith('https://')) {
      // Redirect to Supabase Storage or external URL
      console.log('[Download ZIP] Redirecting to:', ea.zip_file_path);
      return res.redirect(ea.zip_file_path);
    } else if (ea.zip_file_path.startsWith('/uploads/')) {
      // Serve from local filesystem
      try {
        const filePath = path.join(__dirname, '..', ea.zip_file_path);
        console.log('[Download ZIP] Serving local file:', filePath);
        
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        
        if (!fileExists) {
          console.error('[Download ZIP] File not found:', filePath);
          return res.status(404).json({
            success: false,
            message: 'ZIP file not found on server. Please contact support.'
          });
        }
        
        return res.sendFile(filePath);
      } catch (readError) {
        console.error('[Download ZIP] Error reading file:', readError);
        return res.status(500).json({
          success: false,
          message: 'Error reading ZIP file from server'
        });
      }
    } else {
      // Redirect to external URL
      return res.redirect(ea.zip_file_path);
    }

  } catch (error) {
    console.error('[Download ZIP] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during ZIP download'
    });
  }
});

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
    let subscription;
    
    // Check if we're in mock mode
    const isPlaceholderKey = (value = '') => {
      if (!value) return true;
      const normalized = value.toLowerCase();
      return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
    };
    const explicitMockFlag = (process.env.MOCK_AUTH || '').toLowerCase();
    const useMockAuth = explicitMockFlag === 'true' || (explicitMockFlag !== 'false' && isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY));
    
    if (useMockAuth) {
      // Use mock data store
      const mockDataStore = require('../services/mockAuthStore').mockDataStore;
      subscription = await mockDataStore.getSubscriptionById(subscriptionId);
    } else {
      // Use Supabase
      const { data, error: subError } = await getSupabase()
        .from('subscriptions')
        .select('id, user_id, status, end_date')
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .single();

      if (subError) {
        console.error('[Download] Subscription not found:', subError);
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }
      subscription = data;
    }

    if (!subscription) {
      console.error('[Download] Subscription not found');
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
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
    let ea;
    
    if (useMockAuth) {
      // Use mock data store
      const mockDataStore = require('../services/mockAuthStore').mockDataStore;
      ea = await mockDataStore.getEAById(eaId);
    } else {
      // Use Supabase - table is 'expert_advisors' not 'eas'
      const { data, error: eaError } = await getSupabase()
        .from('expert_advisors')
        .select('id, name, ea_file_path, set_file_path, manual_file_path, screenshots')
        .eq('id', eaId)
        .single();

      if (eaError) {
        console.error('[Download] EA not found:', eaError);
        return res.status(404).json({
          success: false,
          message: 'EA not found',
          debug: {
            eaId,
            error: eaError.message
          }
        });
      }
      ea = data;
    }

    if (!ea) {
      console.error('[Download] EA not found');
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
        fileUrl = ea.ea_file_path;
        fileName = `${ea.name.replace(/[^a-z0-9]/gi, '_')}.ex4`;
        break;
      case 'set_file':
        fileUrl = ea.set_file_path;
        fileName = `${ea.name.replace(/[^a-z0-9]/gi, '_')}.set`;
        break;
      case 'manual':
        fileUrl = ea.manual_file_path;
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
    await getSupabase()
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
    if (fileUrl.includes('supabase.co/storage') || fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      // Redirect to Supabase Storage or external URL
      console.log('[Download] Redirecting to external URL:', fileUrl);
      return res.redirect(fileUrl);
    } else if (fileUrl.startsWith('/uploads/')) {
      // Download from local filesystem
      try {
        const filePath = path.join(__dirname, '..', fileUrl);
        console.log('[Download] Reading local file:', filePath);
        
        // Check if file exists
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        
        if (!fileExists) {
          console.error('[Download] File not found:', filePath);
          
          // For production, use placeholder/sample file
          console.log('[Download] File not found, using placeholder response');
          
          // Create a simple text file as placeholder
          const placeholderContent = `This is a placeholder file for: ${fileName}\n\nIn production, when you upload EA files through the admin panel, they will be stored and served from here.\n\nFor now, this demonstrates the download functionality is working correctly.`;
          
          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
          res.setHeader('Content-Length', Buffer.byteLength(placeholderContent));
          
          return res.send(placeholderContent);
        }
        
        const fileBuffer = await fs.readFile(filePath);
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        
        return res.send(fileBuffer);
      } catch (readError) {
        console.error('[Download] Local file read error:', readError);
        return res.status(500).json({
          success: false,
          message: 'Error reading file from server'
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
    const { data: subscription, error: subError } = await getSupabase()
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

