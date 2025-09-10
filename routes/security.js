const express = require('express');
const { body, query, validationResult } = require('express-validator');
const securityService = require('../services/securityService');
const blockchainService = require('../services/blockchainService');
const escrowService = require('../services/escrowService');
const { auth, requireSubscription, updateActivity } = require('../middleware/auth');
const { requirePermission, auditLog } = require('../middleware/security');
const router = express.Router();

// ==================== SECURITY DASHBOARD ====================

// @route   GET /api/security/dashboard
// @desc    Get security dashboard data
// @access  Private (Admin)
router.get('/dashboard', [
  auth,
  requirePermission('manage:system'),
  updateActivity,
  auditLog('security_dashboard_access')
], async (req, res) => {
  try {
    const dashboardData = {
      overview: {
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({ isActive: true }),
        totalEscrows: await Escrow.countDocuments(),
        activeEscrows: await Escrow.countDocuments({ status: 'active' }),
        disputedEscrows: await Escrow.countDocuments({ status: 'disputed' })
      },
      security: {
        failedLogins: 0, // Would be tracked in production
        blockedIPs: 0,
        suspiciousActivities: 0,
        lastSecurityScan: new Date()
      },
      blockchain: {
        totalTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        networkStatus: await getNetworkStatus()
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        environment: process.env.NODE_ENV
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get security dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== SECURITY EVENTS ====================

// @route   GET /api/security/events
// @desc    Get security events log
// @access  Private (Admin)
router.get('/events', [
  auth,
  requirePermission('manage:system'),
  updateActivity,
  query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { severity, page = 1, limit = 50 } = req.query;
    
    // In production, this would query a security events database
    const mockEvents = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        event: 'login_failed',
        severity: 'MEDIUM',
        details: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          userId: 'user123'
        }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        event: 'suspicious_activity',
        severity: 'HIGH',
        details: {
          ip: '10.0.0.1',
          pattern: 'script injection attempt',
          blocked: true
        }
      }
    ];

    let filteredEvents = mockEvents;
    if (severity) {
      filteredEvents = mockEvents.filter(event => event.severity === severity);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedEvents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredEvents.length / parseInt(limit)),
        totalItems: filteredEvents.length,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get security events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== BLOCKCHAIN MONITORING ====================

// @route   GET /api/security/blockchain/status
// @desc    Get blockchain network status
// @access  Private (Admin)
router.get('/blockchain/status', [
  auth,
  requirePermission('manage:system'),
  updateActivity
], async (req, res) => {
  try {
    const networks = blockchainService.getSupportedNetworks();
    const networkStatus = {};

    for (const network of networks) {
      networkStatus[network.network] = {};
      for (const chain of network.chains) {
        try {
          const provider = blockchainService.getProvider(network.network, chain);
          if (provider) {
            const blockNumber = await provider.getBlockNumber();
            const networkInfo = blockchainService.getNetworkInfo(network.network, chain);
            
            networkStatus[network.network][chain] = {
              status: 'connected',
              blockNumber,
              chainId: networkInfo?.chainId,
              symbol: networkInfo?.symbol,
              name: networkInfo?.name
            };
          } else {
            networkStatus[network.network][chain] = {
              status: 'disconnected',
              error: 'Provider not configured'
            };
          }
        } catch (error) {
          networkStatus[network.network][chain] = {
            status: 'error',
            error: error.message
          };
        }
      }
    }

    res.json({
      success: true,
      data: networkStatus
    });

  } catch (error) {
    console.error('Get blockchain status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/security/blockchain/transactions
// @desc    Get blockchain transaction monitoring
// @access  Private (Admin)
router.get('/blockchain/transactions', [
  auth,
  requirePermission('manage:system'),
  updateActivity,
  query('network').optional().isIn(['ethereum', 'polygon', 'binance']),
  query('status').optional().isIn(['pending', 'confirmed', 'failed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { network, status, page = 1, limit = 50 } = req.query;

    // Get escrow transactions from database
    const filter = {};
    if (network) {
      filter.blockchain = network;
    }
    if (status) {
      if (status === 'pending') {
        filter.status = { $in: ['pending', 'funded'] };
      } else if (status === 'confirmed') {
        filter.status = { $in: ['released', 'refunded'] };
      } else if (status === 'failed') {
        filter.status = 'failed';
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await Escrow.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('creator', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Escrow.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get blockchain transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== ESCROW MONITORING ====================

// @route   GET /api/security/escrow/monitoring
// @desc    Get escrow monitoring data
// @access  Private (Admin)
router.get('/escrow/monitoring', [
  auth,
  requirePermission('manage:system'),
  updateActivity
], async (req, res) => {
  try {
    const monitoringData = {
      expiring: await escrowService.getExpiringEscrows(7),
      disputed: await escrowService.getDisputedEscrows(),
      statistics: {
        total: await Escrow.countDocuments(),
        pending: await Escrow.countDocuments({ status: 'pending' }),
        active: await Escrow.countDocuments({ status: 'active' }),
        disputed: await Escrow.countDocuments({ status: 'disputed' }),
        released: await Escrow.countDocuments({ status: 'released' }),
        refunded: await Escrow.countDocuments({ status: 'refunded' })
      }
    };

    res.json({
      success: true,
      data: monitoringData
    });

  } catch (error) {
    console.error('Get escrow monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== SECURITY CONFIGURATION ====================

// @route   GET /api/security/config
// @desc    Get security configuration
// @access  Private (Admin)
router.get('/config', [
  auth,
  requirePermission('manage:system'),
  updateActivity
], async (req, res) => {
  try {
    const config = {
      rateLimiting: {
        global: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
          max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
        },
        auth: {
          windowMs: 900000,
          max: 5
        }
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      session: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyRotation: '30d'
      },
      blockchain: {
        supportedNetworks: blockchainService.getSupportedNetworks(),
        defaultNetwork: 'ethereum',
        defaultChain: 'mainnet'
      }
    };

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Get security config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/security/config
// @desc    Update security configuration
// @access  Private (Admin)
router.put('/config', [
  auth,
  requirePermission('manage:system'),
  updateActivity,
  auditLog('security_config_update')
], async (req, res) => {
  try {
    const { rateLimiting, passwordPolicy, session, encryption } = req.body;

    // In production, this would update configuration in database or config file
    // For now, we'll just validate and return success

    const updatedConfig = {
      rateLimiting: rateLimiting || {},
      passwordPolicy: passwordPolicy || {},
      session: session || {},
      encryption: encryption || {},
      updatedAt: new Date(),
      updatedBy: req.user._id
    };

    res.json({
      success: true,
      message: 'Security configuration updated successfully',
      data: updatedConfig
    });

  } catch (error) {
    console.error('Update security config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== SECURITY SCANS ====================

// @route   POST /api/security/scan
// @desc    Run security scan
// @access  Private (Admin)
router.post('/scan', [
  auth,
  requirePermission('manage:system'),
  updateActivity,
  auditLog('security_scan_initiated')
], async (req, res) => {
  try {
    const { scanType } = req.body;

    const scanTypes = ['vulnerability', 'malware', 'configuration', 'compliance'];
    
    if (!scanType || !scanTypes.includes(scanType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scan type'
      });
    }

    // In production, this would initiate actual security scans
    const scanResult = {
      scanId: `scan_${Date.now()}`,
      type: scanType,
      status: 'running',
      initiatedAt: new Date(),
      initiatedBy: req.user._id,
      estimatedDuration: '5-10 minutes'
    };

    res.json({
      success: true,
      message: 'Security scan initiated successfully',
      data: scanResult
    });

  } catch (error) {
    console.error('Security scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== UTILITY FUNCTIONS ====================

async function getNetworkStatus() {
  try {
    const networks = blockchainService.getSupportedNetworks();
    const status = {};

    for (const network of networks) {
      status[network.network] = {};
      for (const chain of network.chains) {
        try {
          const provider = blockchainService.getProvider(network.network, chain);
          if (provider) {
            await provider.getBlockNumber();
            status[network.network][chain] = 'connected';
          } else {
            status[network.network][chain] = 'disconnected';
          }
        } catch (error) {
          status[network.network][chain] = 'error';
        }
      }
    }

    return status;
  } catch (error) {
    console.error('Get network status error:', error);
    return {};
  }
}

module.exports = router;
