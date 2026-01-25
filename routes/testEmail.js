/**
 * Test Email Route - For testing email delivery
 * Access: /api/test-email
 */

const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// @route   GET /api/test-email
// @desc    Test email sending (admin only in production)
// @access  Public (for testing)
router.get('/', async (req, res) => {
  try {
    console.log('\n🧪 ========== EMAIL TEST STARTED ==========');
    
    // Test email data
    const testData = {
      userEmail: 'softwarebazaar.ke@gmail.com', // Send to yourself
      userName: 'Test User',
      eaName: 'London Breakout Bot (TEST)',
      downloadLinks: {
        zip_package: 'https://example.com/download/test.zip',
        ea_file: 'https://example.com/download/test.ex4',
        set_file: 'https://example.com/download/test.set',
        manual: 'https://example.com/download/manual.pdf'
      },
      subscriptionType: 'monthly',
      subscriptionId: 'test-sub-' + Date.now()
    };

    console.log('📧 Sending test email to:', testData.userEmail);
    
    const result = await emailService.sendDownloadEmail(testData);

    console.log('🧪 ========== EMAIL TEST COMPLETE ==========\n');

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.',
        messageId: result.messageId,
        sentTo: testData.userEmail
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error,
        code: result.code
      });
    }

  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

module.exports = router;
