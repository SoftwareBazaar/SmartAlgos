const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, updateActivity } = require('../middleware/auth');
const aiAssistant = require('../services/aiEAAssistantService');
const { auditLog } = require('../middleware/security');
const router = express.Router();

// @route   POST /api/ai-assistant/chat
// @desc    Chat with AI EA Assistant
// @access  Private
router.post('/chat', [
  auth,
  updateActivity,
  auditLog('ai_assistant_chat'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message too long'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object')
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

    const { message, context = {} } = req.body;
    const userId = req.user.id;

    // Add user context
    const enhancedContext = {
      ...context,
      userId,
      timestamp: new Date().toISOString()
    };

    // Process message with AI assistant
    const response = await aiAssistant.processMessage(message, enhancedContext);

    // Handle escalation
    if (response.escalate) {
      // TODO: Implement admin notification system
      console.log(`[AI Assistant] Escalating message from user ${userId}: ${message}`);
      
      // For now, we'll just log the escalation
      // In production, you'd send this to an admin queue/notification system
    }

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Assistant chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// @route   GET /api/ai-assistant/suggestions
// @desc    Get conversation suggestions
// @access  Private
router.get('/suggestions', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const suggestions = aiAssistant.getSuggestions(req.query);

    res.json({
      success: true,
      data: {
        suggestions
      }
    });

  } catch (error) {
    console.error('Get AI suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
});

// @route   GET /api/ai-assistant/status
// @desc    Get AI Assistant service status
// @access  Private
router.get('/status', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const status = aiAssistant.getStatus();

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Get AI Assistant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI Assistant status'
    });
  }
});

// @route   POST /api/ai-assistant/escalate
// @desc    Escalate conversation to admin
// @access  Private
router.post('/escalate', [
  auth,
  updateActivity,
  auditLog('ai_assistant_escalation'),
  body('message')
    .notEmpty()
    .withMessage('Message is required'),
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
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

    const { message, reason = 'User requested admin assistance', priority = 'medium' } = req.body;
    const userId = req.user.id;

    // Create escalation record
    const escalation = {
      id: `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      message,
      reason,
      priority,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // TODO: Save escalation to database and notify admins
    console.log(`[AI Assistant] Admin escalation created:`, escalation);

    // For now, we'll just return success
    // In production, you'd implement:
    // - Database storage
    // - Admin notification system
    // - Ticket tracking

    res.json({
      success: true,
      data: {
        escalationId: escalation.id,
        message: 'Your request has been escalated to our admin team. You will receive a response within 24 hours.',
        estimatedResponseTime: '24 hours'
      }
    });

  } catch (error) {
    console.error('AI Assistant escalation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate request'
    });
  }
});

module.exports = router;
