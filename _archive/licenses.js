/**
 * License Management Routes
 * API endpoints for license generation, validation, and management
 */

const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const licenseService = require('../services/licenseService');
const licenseEmailService = require('../services/licenseEmailService');
const databaseService = require('../services/databaseService');

/**
 * POST /api/licenses/generate
 * Generate a new license (admin or automated after payment)
 */
router.post('/generate', auth, async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      mt5Account,
      licenseType,
      paymentId,
      paymentAmount,
      eaId,
      userId
    } = req.body;

    // Validate required fields
    if (!customerEmail || !customerName || !mt5Account || !licenseType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerEmail, customerName, mt5Account, licenseType'
      });
    }

    // Validate license type
    if (!licenseService.LICENSE_TYPES[licenseType]) {
      return res.status(400).json({
        success: false,
        message: `Invalid license type. Valid types: ${Object.keys(licenseService.LICENSE_TYPES).join(', ')}`
      });
    }

    // Validate MT5 account format
    if (!/^\d{6,10}$/.test(mt5Account)) {
      return res.status(400).json({
        success: false,
        message: 'MT5 account must be 6-10 digits'
      });
    }

    // Get EA details if eaId provided
    let eaName = 'Expert Advisor';
    let downloadLink = null;
    
    if (eaId) {
      const ea = await databaseService.getEAById(eaId);
      if (ea) {
        eaName = ea.name;
        // Build download link (you can customize this)
        downloadLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/downloads/ea/${eaId}`;
      }
    }

    // Create license
    const license = await licenseService.createLicense({
      customerEmail,
      customerName,
      mt5Account,
      licenseType,
      purchaseDate: new Date(),
      paymentId,
      paymentAmount,
      eaId,
      userId: userId || req.user.id
    });

    // Send license email
    const emailResult = await licenseEmailService.sendLicenseEmail({
      customerEmail,
      customerName,
      licenseKey: license.license_key,
      licenseType,
      mt5Account,
      purchaseDate: license.purchase_date,
      expiryDate: license.expiry_date,
      eaName,
      downloadLink
    });

    res.json({
      success: true,
      message: 'License generated successfully',
      license: {
        id: license.id,
        licenseKey: license.license_key,
        licenseType: license.license_type,
        mt5Account: license.mt5_account,
        expiryDate: license.expiry_date,
        isLifetime: license.is_lifetime
      },
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('License generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate license',
      error: error.message
    });
  }
});

/**
 * POST /api/licenses/validate
 * Validate a license key (public endpoint for MT5 EA)
 */
router.post('/validate', async (req, res) => {
  try {
    const { licenseKey, mt5Account } = req.body;

    if (!licenseKey || !mt5Account) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'License key and MT5 account are required'
      });
    }

    const validation = await licenseService.validateLicense(licenseKey, mt5Account);

    res.json({
      success: true,
      ...validation
    });

  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({
      success: false,
      valid: false,
      message: 'Failed to validate license',
      error: error.message
    });
  }
});

/**
 * GET /api/licenses/my-licenses
 * Get current user's licenses
 */
router.get('/my-licenses', auth, async (req, res) => {
  try {
    const licenses = await licenseService.getLicensesByUserId(req.user.id);

    res.json({
      success: true,
      licenses: licenses.map(license => ({
        id: license.id,
        licenseKey: license.license_key,
        licenseType: license.license_type,
        mt5Account: license.mt5_account,
        purchaseDate: license.purchase_date,
        expiryDate: license.expiry_date,
        isLifetime: license.is_lifetime,
        isActive: license.is_active,
        eaId: license.ea_id
      }))
    });

  } catch (error) {
    console.error('Get user licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve licenses',
      error: error.message
    });
  }
});

/**
 * GET /api/licenses/:licenseKey
 * Get license details by key
 */
router.get('/:licenseKey', auth, async (req, res) => {
  try {
    const { licenseKey } = req.params;
    const license = await licenseService.getLicenseByKey(licenseKey);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    // Check if user owns this license or is admin
    if (license.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      license: {
        id: license.id,
        licenseKey: license.license_key,
        customerEmail: license.customer_email,
        customerName: license.customer_name,
        mt5Account: license.mt5_account,
        licenseType: license.license_type,
        purchaseDate: license.purchase_date,
        expiryDate: license.expiry_date,
        isLifetime: license.is_lifetime,
        isActive: license.is_active,
        paymentId: license.payment_id,
        paymentAmount: license.payment_amount,
        eaId: license.ea_id,
        createdAt: license.created_at
      }
    });

  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve license',
      error: error.message
    });
  }
});

/**
 * POST /api/licenses/:licenseKey/regenerate
 * Regenerate license for new MT5 account (admin only)
 */
router.post('/:licenseKey/regenerate', auth, isAdmin, async (req, res) => {
  try {
    const { licenseKey } = req.params;
    const { newMt5Account, reason } = req.body;

    if (!newMt5Account) {
      return res.status(400).json({
        success: false,
        message: 'New MT5 account number is required'
      });
    }

    const oldLicense = await licenseService.getLicenseByKey(licenseKey);
    
    if (!oldLicense) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    // Regenerate license
    const newLicense = await licenseService.regenerateLicense(
      licenseKey,
      newMt5Account,
      {
        reason: reason || 'Customer requested account change',
        regeneratedBy: req.user.id
      }
    );

    // Get EA name
    let eaName = 'Expert Advisor';
    if (oldLicense.ea_id) {
      const ea = await databaseService.getEAById(oldLicense.ea_id);
      if (ea) eaName = ea.name;
    }

    // Send notification email
    await licenseEmailService.sendRegeneratedNotification({
      customerEmail: oldLicense.customer_email,
      customerName: oldLicense.customer_name,
      newLicenseKey: newLicense.license_key,
      newMt5Account,
      eaName
    });

    res.json({
      success: true,
      message: 'License regenerated successfully',
      oldLicenseKey: licenseKey,
      newLicense: {
        id: newLicense.id,
        licenseKey: newLicense.license_key,
        mt5Account: newLicense.mt5_account,
        expiryDate: newLicense.expiry_date
      }
    });

  } catch (error) {
    console.error('License regeneration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate license',
      error: error.message
    });
  }
});

/**
 * POST /api/licenses/:licenseKey/extend
 * Extend license expiry date (admin only)
 */
router.post('/:licenseKey/extend', auth, isAdmin, async (req, res) => {
  try {
    const { licenseKey } = req.params;
    const { additionalDays } = req.body;

    if (!additionalDays || additionalDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid additionalDays value is required'
      });
    }

    const updatedLicense = await licenseService.extendLicense(licenseKey, additionalDays);

    res.json({
      success: true,
      message: `License extended by ${additionalDays} days`,
      license: {
        licenseKey: updatedLicense.license_key,
        newExpiryDate: updatedLicense.expiry_date
      }
    });

  } catch (error) {
    console.error('License extension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extend license',
      error: error.message
    });
  }
});

/**
 * POST /api/licenses/:licenseKey/revoke
 * Revoke a license (admin only)
 */
router.post('/:licenseKey/revoke', auth, isAdmin, async (req, res) => {
  try {
    const { licenseKey } = req.params;
    const { reason } = req.body;

    const updatedLicense = await licenseService.revokeLicense(
      licenseKey,
      reason || 'Revoked by admin'
    );

    res.json({
      success: true,
      message: 'License revoked successfully',
      license: {
        licenseKey: updatedLicense.license_key,
        isActive: updatedLicense.is_active
      }
    });

  } catch (error) {
    console.error('License revocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke license',
      error: error.message
    });
  }
});

/**
 * GET /api/licenses/admin/all
 * Get all licenses (admin only)
 */
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const {
      search,
      licenseType,
      isActive,
      limit = 50,
      offset = 0
    } = req.query;

    const filters = {};
    
    if (licenseType) filters.license_type = licenseType;
    if (isActive !== undefined) filters.is_active = isActive === 'true';

    let licenses = await databaseService.query('ea_licenses', {
      filter: filters,
      sort: { created_at: 'desc' },
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      licenses = licenses.filter(license =>
        license.license_key.toLowerCase().includes(searchLower) ||
        license.customer_email.toLowerCase().includes(searchLower) ||
        license.customer_name.toLowerCase().includes(searchLower) ||
        license.mt5_account.includes(search)
      );
    }

    const total = await databaseService.count('ea_licenses', { filter: filters });

    res.json({
      success: true,
      licenses,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + licenses.length < total
      }
    });

  } catch (error) {
    console.error('Get all licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve licenses',
      error: error.message
    });
  }
});

/**
 * GET /api/licenses/admin/statistics
 * Get license statistics (admin only)
 */
router.get('/admin/statistics', auth, isAdmin, async (req, res) => {
  try {
    const stats = await licenseService.getLicenseStatistics();
    const expiringLicenses = await licenseService.getExpiringLicenses(7);

    res.json({
      success: true,
      statistics: {
        ...stats,
        expiringLicenses: expiringLicenses.map(license => ({
          licenseKey: license.license_key,
          customerEmail: license.customer_email,
          expiryDate: license.expiry_date,
          daysRemaining: Math.ceil(
            (new Date(license.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
          )
        }))
      }
    });

  } catch (error) {
    console.error('Get license statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
});

/**
 * POST /api/licenses/:licenseKey/resend-email
 * Resend license email (admin or owner)
 */
router.post('/:licenseKey/resend-email', auth, async (req, res) => {
  try {
    const { licenseKey } = req.params;
    const license = await licenseService.getLicenseByKey(licenseKey);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    // Check permissions
    if (license.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get EA details
    let eaName = 'Expert Advisor';
    let downloadLink = null;
    
    if (license.ea_id) {
      const ea = await databaseService.getEAById(license.ea_id);
      if (ea) {
        eaName = ea.name;
        downloadLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/downloads/ea/${license.ea_id}`;
      }
    }

    // Resend email
    const emailResult = await licenseEmailService.sendLicenseEmail({
      customerEmail: license.customer_email,
      customerName: license.customer_name,
      licenseKey: license.license_key,
      licenseType: license.license_type,
      mt5Account: license.mt5_account,
      purchaseDate: license.purchase_date,
      expiryDate: license.expiry_date,
      eaName,
      downloadLink
    });

    res.json({
      success: true,
      message: 'License email resent successfully',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Resend license email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend email',
      error: error.message
    });
  }
});

module.exports = router;
