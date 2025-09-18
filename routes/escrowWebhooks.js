const express = require('express');
const crypto = require('crypto');
const escrowService = require('../services/escrowService');
const securityService = require('../services/securityService');
const { auditLog } = require('../middleware/security');
const router = express.Router();

// ==================== WEBHOOK HANDLING ====================

// @route   POST /api/escrow/webhooks/status
// @desc    Handle escrow status update webhooks
// @access  Public (but verified with signature)
router.post('/webhooks/status', [
  auditLog('escrow_webhook_received')
], async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-escrow-signature'];
    const payload = JSON.stringify(req.body);
    
    if (!verifyWebhookSignature(signature, payload)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const { 
      transaction_id, 
      status, 
      event_type, 
      timestamp,
      metadata = {} 
    } = req.body;

    console.log('Escrow webhook received:', {
      transaction_id,
      status,
      event_type,
      timestamp,
      metadata
    });

    // Log webhook event
    securityService.logSecurityEvent('escrow_webhook_received', {
      transactionId: transaction_id,
      status,
      eventType: event_type,
      timestamp,
      ip: securityService.getClientIP(req)
    });

    // Handle different event types
    switch (event_type) {
      case 'transaction.created':
        await handleTransactionCreated(transaction_id, req.body);
        break;
      case 'transaction.updated':
        await handleTransactionUpdated(transaction_id, req.body);
        break;
      case 'payment.initiated':
        await handlePaymentInitiated(transaction_id, req.body);
        break;
      case 'payment.completed':
        await handlePaymentCompleted(transaction_id, req.body);
        break;
      case 'payment.failed':
        await handlePaymentFailed(transaction_id, req.body);
        break;
      case 'dispute.created':
        await handleDisputeCreated(transaction_id, req.body);
        break;
      case 'dispute.resolved':
        await handleDisputeResolved(transaction_id, req.body);
        break;
      case 'transaction.completed':
        await handleTransactionCompleted(transaction_id, req.body);
        break;
      case 'transaction.cancelled':
        await handleTransactionCancelled(transaction_id, req.body);
        break;
      default:
        console.log(`Unhandled webhook event type: ${event_type}`);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook'
    });
  }
});

// ==================== WEBHOOK EVENT HANDLERS ====================

async function handleTransactionCreated(transactionId, data) {
  try {
    console.log(`Transaction created: ${transactionId}`);
    
    // Update local database with transaction details
    // await updateLocalTransaction(transactionId, {
    //   status: 'created',
    //   escrowId: transactionId,
    //   createdAt: new Date(data.timestamp)
    // });

    // Send notification to user
    // await sendNotification(data.metadata.userId, {
    //   type: 'escrow_transaction_created',
    //   message: 'Your escrow transaction has been created successfully',
    //   transactionId
    // });

  } catch (error) {
    console.error('Error handling transaction created:', error);
  }
}

async function handleTransactionUpdated(transactionId, data) {
  try {
    console.log(`Transaction updated: ${transactionId}`);
    
    // Update local database
    // await updateLocalTransaction(transactionId, {
    //   status: data.status,
    //   updatedAt: new Date(data.timestamp)
    // });

    // Send notification to user
    // await sendNotification(data.metadata.userId, {
    //   type: 'escrow_transaction_updated',
    //   message: `Your escrow transaction status has been updated to: ${data.status}`,
    //   transactionId
    // });

  } catch (error) {
    console.error('Error handling transaction updated:', error);
  }
}

async function handlePaymentInitiated(transactionId, data) {
  try {
    console.log(`Payment initiated: ${transactionId}`);
    
    // Update local database
    // await updateLocalTransaction(transactionId, {
    //   status: 'payment_initiated',
    //   paymentId: data.payment_id,
    //   paymentUrl: data.payment_url,
    //   updatedAt: new Date(data.timestamp)
    // });

    // Send notification to user
    // await sendNotification(data.metadata.userId, {
    //   type: 'escrow_payment_initiated',
    //   message: 'Payment has been initiated for your escrow transaction',
    //   transactionId,
    //   paymentUrl: data.payment_url
    // });

  } catch (error) {
    console.error('Error handling payment initiated:', error);
  }
}

async function handlePaymentCompleted(transactionId, data) {
  try {
    console.log(`Payment completed: ${transactionId}`);
    
    // Update local database
    // await updateLocalTransaction(transactionId, {
    //   status: 'payment_completed',
    //   paymentCompletedAt: new Date(data.timestamp),
    //   inspectionEndDate: new Date(Date.now() + (data.inspection_period * 1000)),
    //   updatedAt: new Date(data.timestamp)
    // });

    // Send notification to user
    // await sendNotification(data.metadata.userId, {
    //   type: 'escrow_payment_completed',
    //   message: 'Payment completed! Your inspection period has started.',
    //   transactionId,
    //   inspectionPeriod: data.inspection_period
    // });

  } catch (error) {
    console.error('Error handling payment completed:', error);
  }
}

async function handlePaymentFailed(transactionId, data) {
  try {
    console.log(`Payment failed: ${transactionId}`);
    
    // Update local database
    // await updateLocalTransaction(transactionId, {
    //   status: 'payment_failed',
    //   paymentFailedAt: new Date(data.timestamp),
    //   failureReason: data.failure_reason,
    //   updatedAt: new Date(data.timestamp)
    // });

    // Send notification to user
    // await sendNotification(data.metadata.userId, {
    //   type: 'escrow_payment_failed',
    //   message: `Payment failed: ${data.failure_reason}`,
    //   transactionId
    // });

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleDisputeCreated(transactionId, data) {
  try {
    console.log(`Dispute created: ${transactionId}`);
    
    // Update local database
    // await updateLocalTransaction(transactionId, {
    //   status: 'disputed',
    //   disputeId: data.dispute_id,
    //   disputeReason: data.dispute_reason,
    //   disputeCreatedAt: new Date(data.timestamp),
    //   updatedAt: new Date(data.timestamp)
    // });

    // Send notification to both parties
    // await sendNotification(data.metadata.userId, {
    //   type: 'escrow_dispute_created',
    //   message: 'A dispute has been created for your escrow transaction',
    //   transactionId,
    //   disputeReason: data.dispute_reason
    // });

  } catch (error) {
    console.error('Error handling dispute created:', error);
  }
}

async function handleDisputeResolved(transactionId, data) {
  try {
    console.log(`Dispute resolved: ${transactionId}`);
    
    // Update local database
    // await updateLocalTransaction(transactionId, {
    //   status: data.resolution === 'buyer_wins' ? 'refunded' : 'completed',
    //   disputeResolvedAt: new Date(data.timestamp),
    //   disputeResolution: data.resolution,
    //   updatedAt: new Date(data.timestamp)
    // });

    // Send notification to both parties
    // await sendNotification(data.metadata.userId, {
    //   type: 'escrow_dispute_resolved',
    //   message: `Dispute resolved: ${data.resolution}`,
    //   transactionId
    // });

  } catch (error) {
    console.error('Error handling dispute resolved:', error);
  }
}

async function handleTransactionCompleted(transactionId, data) {
  try {
    console.log(`Transaction completed: ${transactionId}`);
    
    // Update local database
    // await updateLocalTransaction(transactionId, {
    //   status: 'completed',
    //   completedAt: new Date(data.timestamp),
    //   updatedAt: new Date(data.timestamp)
    // });

    // Send notification to user
    // await sendNotification(data.metadata.userId, {
    //   type: 'escrow_transaction_completed',
    //   message: 'Your escrow transaction has been completed successfully!',
    //   transactionId
    // });

    // Activate product/service for user
    // await activateProduct(data.metadata.userId, data.metadata.productId, data.metadata.productType);

  } catch (error) {
    console.error('Error handling transaction completed:', error);
  }
}

async function handleTransactionCancelled(transactionId, data) {
  try {
    console.log(`Transaction cancelled: ${transactionId}`);
    
    // Update local database
    // await updateLocalTransaction(transactionId, {
    //   status: 'cancelled',
    //   cancelledAt: new Date(data.timestamp),
    //   cancellationReason: data.cancellation_reason,
    //   updatedAt: new Date(data.timestamp)
    // });

    // Send notification to user
    // await sendNotification(data.metadata.userId, {
    //   type: 'escrow_transaction_cancelled',
    //   message: 'Your escrow transaction has been cancelled',
    //   transactionId,
    //   reason: data.cancellation_reason
    // });

  } catch (error) {
    console.error('Error handling transaction cancelled:', error);
  }
}

// ==================== UTILITY FUNCTIONS ====================

function verifyWebhookSignature(signature, payload) {
  if (!signature || !process.env.ESCROW_WEBHOOK_SECRET) {
    console.warn('Webhook signature verification skipped - no secret configured');
    return true; // Allow in development mode
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.ESCROW_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    const receivedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// ==================== WEBHOOK TESTING ENDPOINT ====================

// @route   POST /api/escrow/webhooks/test
// @desc    Test webhook endpoint for development
// @access  Private
router.post('/webhooks/test', [
  auditLog('escrow_webhook_test')
], async (req, res) => {
  try {
    const { eventType, transactionId, testData = {} } = req.body;

    const mockWebhookData = {
      transaction_id: transactionId || 'TEST_123456',
      status: testData.status || 'payment_completed',
      event_type: eventType || 'payment.completed',
      timestamp: new Date().toISOString(),
      metadata: {
        userId: 'test_user_123',
        productId: 'EA_001',
        productType: 'ea_subscription',
        ...testData.metadata
      },
      ...testData
    };

    // Simulate webhook processing
    console.log('Testing webhook with data:', mockWebhookData);

    // Call the appropriate handler
    switch (eventType) {
      case 'transaction.created':
        await handleTransactionCreated(mockWebhookData.transaction_id, mockWebhookData);
        break;
      case 'payment.completed':
        await handlePaymentCompleted(mockWebhookData.transaction_id, mockWebhookData);
        break;
      case 'transaction.completed':
        await handleTransactionCompleted(mockWebhookData.transaction_id, mockWebhookData);
        break;
      default:
        console.log(`Test webhook event type: ${eventType}`);
    }

    res.json({
      success: true,
      message: 'Test webhook processed successfully',
      data: mockWebhookData
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process test webhook'
    });
  }
});

module.exports = router;
