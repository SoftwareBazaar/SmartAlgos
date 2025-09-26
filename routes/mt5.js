const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { auth, updateActivity } = require('../middleware/auth');
const mt5Service = require('../services/mt5Service');

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
    const connections = await mt5Service.listConnections(req.user.userId);
    res.json({
      success: true,
      data: connections
    });
  } catch (error) {
    console.error('List MT5 connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load MT5 connections'
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

    const connection = await mt5Service.getConnection(req.user.userId, req.params.id);

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

    const connection = await mt5Service.upsertConnection(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      data: connection,
      message: req.body.id ? 'Connection updated successfully' : 'Connection created successfully'
    });
  } catch (error) {
    console.error('Upsert MT5 connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save MT5 connection'
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

    const deleted = await mt5Service.deleteConnection(req.user.userId, req.params.id);

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

    const manifest = await mt5Service.generateDeploymentManifest(req.user.userId, {
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

module.exports = router;
