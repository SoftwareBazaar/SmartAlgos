const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { auth, updateActivity } = require('../middleware/auth');
const mt5Service = require('../services/mt5Service');
const mt5APIService = require('../services/mt5APIService');

const router = express.Router();

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return false;
  }
  return true;
}

router.get('/connections', [auth, updateActivity], async (req, res) => {
  try {
    // Use userId if available, otherwise use id
    const userId = req.user.userId || req.user.id || req.user._id;
    console.log('[MT5 Route] Fetching connections for user:', userId);
    console.log('[MT5 Route] req.user object:', {
      userId: req.user.userId,
      id: req.user.id,
      _id: req.user._id,
      email: req.user.email
    });
    
    if (!userId) {
      console.error('[MT5 Route] No user ID found in req.user:', req.user);
      return res.status(400).json({
        success: false,
        message: 'User ID not found',
        debug: process.env.NODE_ENV === 'development' ? { user: req.user } : undefined
      });
    }
    
    const connections = await mt5Service.listConnections(userId);
    console.log('[MT5 Route] Found connections:', connections.length);
    if (connections.length > 0) {
      console.log('[MT5 Route] Connection details:', connections.map(c => ({ id: c.id, login: c.login, server: c.server })));
    }
    
    res.json({
      success: true,
      data: connections
    });
  } catch (error) {
    console.error('List MT5 connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load MT5 connections',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/connections/:id', [
  auth,
  updateActivity,
  param('id').notEmpty().withMessage('Connection id is required')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const userId = req.user.userId || req.user.id;
    const connection = await mt5Service.getConnection(userId, req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    res.json({
      success: true,
      data: mt5Service.sanitizeConnection(connection)
    });
  } catch (error) {
    console.error('Get MT5 connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load MT5 connection'
    });
  }
});

router.post('/connections', [
  auth,
  updateActivity,
  body('server').trim().notEmpty().withMessage('Server is required'),
  body('login').trim().notEmpty().withMessage('Login is required'),
  body('password').optional().isString().isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  body('label').optional().isLength({ min: 2, max: 100 }).withMessage('Label must be 2-100 characters'),
  body('accountType').optional().isIn(['demo', 'live', 'prop']).withMessage('Invalid account type'),
  body('leverage').optional().isString(),
  body('timezone').optional().isString(),
  body('isDemo').optional().isBoolean(),
  body('meta').optional().isObject()
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    // Use userId if available, otherwise use id
    const userId = req.user.userId || req.user.id;
    console.log('[MT5 Route] Saving connection for user:', userId);
    
    if (!userId) {
      console.error('[MT5 Route] No user ID found in req.user:', req.user);
      return res.status(400).json({
        success: false,
        message: 'User ID not found'
      });
    }
    
    const connection = await mt5Service.upsertConnection(userId, req.body);

    res.status(201).json({
      success: true,
      data: connection,
      message: req.body.id ? 'Connection updated successfully' : 'Connection created successfully',
      storage: connection ? (connection.id ? 'database' : 'local') : 'local'
    });
  } catch (error) {
    console.error('Upsert MT5 connection error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    // If it's a table not found error, try to save to local storage as fallback
    if (error.code === 'PGRST205' || error.message?.includes('table') || error.message?.includes('not found')) {
      try {
        console.log('[MT5 Route] Attempting fallback to local storage...');
        // The mt5Service will automatically fall back to local storage
        // But we need to catch and return success even if Supabase fails
        const fallbackConnection = await mt5Service.upsertConnection(req.user.userId, req.body);
        
        if (fallbackConnection) {
          return res.status(201).json({
            success: true,
            data: fallbackConnection,
            message: 'Connection saved to local storage (Supabase table not found)',
            storage: 'local',
            note: 'Create mt5_connections table in Supabase for database storage. SQL: database/mt5_connections_table.sql'
          });
        }
      } catch (fallbackError) {
        console.error('[MT5 Route] Fallback storage also failed:', fallbackError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save MT5 connection',
      error: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        details: error.details,
        hint: error.hint
      } : undefined
    });
  }
});

router.delete('/connections/:id', [
  auth,
  updateActivity,
  param('id').notEmpty().withMessage('Connection id is required')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const userId = req.user.userId || req.user.id;
    const deleted = await mt5Service.deleteConnection(userId, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    res.json({
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (error) {
    console.error('Delete MT5 connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete MT5 connection'
    });
  }
});

router.post('/deploy', [
  auth,
  updateActivity,
  body('eaId').trim().notEmpty().withMessage('EA id is required'),
  body('connectionId').trim().notEmpty().withMessage('Connection id is required')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const userId = req.user.userId || req.user.id;
    const manifest = await mt5Service.generateDeploymentManifest(userId, {
      eaId: req.body.eaId,
      connectionId: req.body.connectionId
    });

    res.json({
      success: true,
      data: manifest
    });
  } catch (error) {
    console.error('Generate MT5 deployment manifest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to prepare deployment manifest'
    });
  }
});

// ==================== REAL MT5 API ENDPOINTS ====================

// @route   POST /api/mt5/connect
// @desc    Connect to MT5 server (real connection)
// @access  Private
router.post('/connect', [
  auth,
  updateActivity,
  body('login').trim().notEmpty().withMessage('Login is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  body('server').trim().notEmpty().withMessage('Server is required')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const { login, password, server, timeout } = req.body;
    
    const result = await mt5APIService.connect({
      login,
      password,
      server,
      timeout: timeout || 60000
    });

    // Also save to database for future use
    const userId = req.user.userId || req.user.id;
    await mt5Service.upsertConnection(userId, {
      login,
      password,
      server,
      label: `${server}-${login}`
    });

    res.json({
      success: true,
      data: result,
      message: 'Successfully connected to MT5 server'
    });
  } catch (error) {
    console.error('MT5 connect error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to connect to MT5 server'
    });
  }
});

// @route   GET /api/mt5/account/:connectionKey
// @desc    Get account information (automatically connects if needed)
// @access  Private
router.get('/account/:connectionKey', [
  auth,
  updateActivity,
  param('connectionKey').notEmpty().withMessage('Connection key is required')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const connectionKey = req.params.connectionKey;
    const [login, server] = connectionKey.split('@');
    
    if (!login || !server) {
      return res.status(400).json({
        success: false,
        message: 'Invalid connection key format. Expected: login@server'
      });
    }
    
    // Get connection from database to get encrypted password
    const userId = req.user.userId || req.user.id;
    const connections = await mt5Service.listConnections(userId);
    const connection = connections.find(c => 
      c.login === login && c.server === server
    );
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'MT5 connection not found. Please create the connection first.'
      });
    }
    
    // Get full connection with password (for decryption) - use includePassword flag
    const fullConnection = await mt5Service.getConnection(userId, connection.id, true);
    
    if (!fullConnection) {
      return res.status(404).json({
        success: false,
        message: 'Connection details not found'
      });
    }
    
    // Decrypt password if encrypted
    let password = null;
    if (fullConnection.password_encrypted) {
      try {
        password = mt5Service.decryptPassword(fullConnection);
      } catch (decryptError) {
        console.error('[MT5 Route] Password decryption failed:', decryptError);
        return res.status(500).json({
          success: false,
          message: 'Failed to decrypt connection password'
        });
      }
    } else if (fullConnection.password) {
      password = fullConnection.password;
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password not available for this connection. Please update the connection with a password.'
      });
    }
    
    // Connect to MT5 if not already connected
    try {
      // Check if already connected
      await mt5APIService.getAccountInfo(connectionKey);
    } catch (notConnectedError) {
      // Not connected, connect now
      console.log('[MT5 Route] Connecting to MT5 for account info...');
      await mt5APIService.connect({
        login: fullConnection.login,
        password: password,
        server: fullConnection.server
      });
    }
    
    // Get account info
    const accountInfo = await mt5APIService.getAccountInfo(connectionKey);

    res.json({
      success: true,
      data: accountInfo
    });
  } catch (error) {
    console.error('MT5 get account info error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get account information'
    });
  }
});

// @route   GET /api/mt5/balance/:connectionKey
// @desc    Get account balance
// @access  Private
router.get('/balance/:connectionKey', [
  auth,
  updateActivity,
  param('connectionKey').notEmpty()
], async (req, res) => {
  try {
    const balance = await mt5APIService.getBalance(req.params.connectionKey);
    
    res.json({
      success: true,
      data: { balance }
    });
  } catch (error) {
    console.error('MT5 get balance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get balance'
    });
  }
});

// @route   GET /api/mt5/positions/:connectionKey
// @desc    Get open positions
// @access  Private
router.get('/positions/:connectionKey', [
  auth,
  updateActivity,
  param('connectionKey').notEmpty()
], async (req, res) => {
  try {
    const symbol = req.query.symbol || null;
    const positions = await mt5APIService.getPositions(req.params.connectionKey, symbol);
    
    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('MT5 get positions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get positions'
    });
  }
});

// @route   POST /api/mt5/order
// @desc    Place a market order
// @access  Private
router.post('/order', [
  auth,
  updateActivity,
  body('connectionKey').trim().notEmpty().withMessage('Connection key is required'),
  body('symbol').trim().notEmpty().withMessage('Symbol is required'),
  body('action').isIn(['BUY', 'SELL']).withMessage('Action must be BUY or SELL'),
  body('volume').isFloat({ min: 0.01 }).withMessage('Volume must be at least 0.01')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const { connectionKey, symbol, action, volume, price, sl, tp, comment } = req.body;
    
    const order = await mt5APIService.placeOrder(connectionKey, {
      symbol,
      action,
      volume,
      price,
      sl,
      tp,
      comment
    });
    
    res.json({
      success: true,
      data: order,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('MT5 place order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to place order'
    });
  }
});

// @route   DELETE /api/mt5/position/:connectionKey/:ticket
// @desc    Close a position
// @access  Private
router.delete('/position/:connectionKey/:ticket', [
  auth,
  updateActivity,
  param('connectionKey').notEmpty(),
  param('ticket').isInt().withMessage('Ticket must be an integer')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const result = await mt5APIService.closePosition(
      req.params.connectionKey,
      req.params.ticket
    );
    
    res.json({
      success: true,
      data: result,
      message: 'Position closed successfully'
    });
  } catch (error) {
    console.error('MT5 close position error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to close position'
    });
  }
});

// @route   GET /api/mt5/market-price/:connectionKey/:symbol
// @desc    Get current market price
// @access  Private
router.get('/market-price/:connectionKey/:symbol', [
  auth,
  updateActivity,
  param('connectionKey').notEmpty(),
  param('symbol').notEmpty()
], async (req, res) => {
  try {
    const price = await mt5APIService.getMarketPrice(
      req.params.connectionKey,
      req.params.symbol
    );
    
    res.json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error('MT5 get market price error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get market price'
    });
  }
});

// @route   GET /api/mt5/history/:connectionKey
// @desc    Get order history
// @access  Private
router.get('/history/:connectionKey', [
  auth,
  updateActivity,
  param('connectionKey').notEmpty()
], async (req, res) => {
  try {
    const filters = {
      symbol: req.query.symbol || null,
      from: req.query.from || null,
      to: req.query.to || null,
      group: req.query.group || null
    };

    const history = await mt5APIService.getOrderHistory(req.params.connectionKey, filters);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('MT5 get history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get order history'
    });
  }
});

// @route   POST /api/mt5/disconnect/:connectionKey
// @desc    Disconnect from MT5 server
// @access  Private
router.post('/disconnect/:connectionKey', [
  auth,
  updateActivity,
  param('connectionKey').notEmpty()
], async (req, res) => {
  try {
    await mt5APIService.disconnect(req.params.connectionKey);
    
    res.json({
      success: true,
      message: 'Disconnected from MT5 server'
    });
  } catch (error) {
    console.error('MT5 disconnect error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to disconnect'
    });
  }
});

module.exports = router;
