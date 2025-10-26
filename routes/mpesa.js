/**
 * M-Pesa Payment Routes
 * Handles M-Pesa Daraja API endpoints for STK Push payments
 */

const express = require('express');
const router = express.Router();
const mpesaService = require('../services/mpesaService');
const { auth } = require('../middleware/auth');
const databaseService = require('../services/databaseService');

/**
 * @route   POST /api/mpesa/stk-push
 * @desc    Initiate STK Push payment
 * @access  Private
 */
router.post('/stk-push', auth, async (req, res) => {
  try {
    const { amount, phoneNumber, accountReference, transactionDesc, metadata } = req.body;
    const userId = req.user?.id || req.user?.userId;

    // Validate required fields
    if (!amount || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Amount and phone number are required'
      });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    console.log('📱 STK Push request:', {
      userId,
      amount,
      phoneNumber: phoneNumber.substring(0, 6) + '***', // Mask phone number in logs
      accountReference
    });

    // Initiate STK Push
    const result = await mpesaService.initiateSTKPush({
      amount,
      phoneNumber,
      accountReference: accountReference || `USER_${userId}`,
      transactionDesc: transactionDesc || 'AlgoSmart Payment',
      metadata: {
        ...metadata,
        userId,
        initiatedAt: new Date().toISOString()
      }
    });

    if (result.success) {
      // Store transaction in database
      try {
        const { data: existingTransaction } = await databaseService.query(
          `SELECT * FROM mpesa_transactions WHERE checkout_request_id = $1`,
          [result.data.checkoutRequestID]
        );

        if (!existingTransaction || existingTransaction.length === 0) {
          await databaseService.query(
            `INSERT INTO mpesa_transactions (
              user_id, merchant_request_id, checkout_request_id, 
              amount, phone_number, account_reference, transaction_desc,
              status, metadata, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [
              userId,
              result.data.merchantRequestID,
              result.data.checkoutRequestID,
              result.data.amount,
              result.data.phoneNumber,
              result.data.accountReference,
              transactionDesc || 'AlgoSmart Payment',
              'pending',
              JSON.stringify(result.data.metadata || {})
            ]
          );
          console.log('✅ M-Pesa transaction stored in database');
        }
      } catch (dbError) {
        console.error('⚠️  Failed to store transaction in database:', dbError.message);
        // Don't fail the request if database storage fails
      }

      return res.json({
        success: true,
        message: result.message,
        data: {
          checkoutRequestID: result.data.checkoutRequestID,
          merchantRequestID: result.data.merchantRequestID,
          customerMessage: result.data.customerMessage,
          amount: result.data.amount
        }
      });
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ STK Push error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate M-Pesa payment',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mpesa/callback
 * @desc    Handle M-Pesa payment callback/webhook
 * @access  Public (Called by M-Pesa)
 */
router.post('/callback', async (req, res) => {
  try {
    console.log('📞 M-Pesa callback received');
    console.log('Callback data:', JSON.stringify(req.body, null, 2));

    // Process the callback
    const result = mpesaService.processCallback(req.body);

    // Update transaction in database
    try {
      const updateQuery = `
        UPDATE mpesa_transactions 
        SET 
          status = $1,
          result_code = $2,
          result_desc = $3,
          mpesa_receipt_number = $4,
          transaction_date = $5,
          updated_at = NOW(),
          callback_data = $6
        WHERE checkout_request_id = $7
        RETURNING *
      `;

      const { data: updatedTransaction } = await databaseService.query(updateQuery, [
        result.success ? 'completed' : 'failed',
        result.resultCode,
        result.resultDesc,
        result.mpesaReceiptNumber || null,
        result.transactionDate || null,
        JSON.stringify(req.body),
        result.checkoutRequestID
      ]);

      if (updatedTransaction && updatedTransaction.length > 0) {
        console.log('✅ Transaction updated in database:', result.checkoutRequestID);

        // If payment was successful, trigger any post-payment actions
        if (result.success) {
          const transaction = updatedTransaction[0];
          
          // TODO: Add post-payment processing here
          // - Update subscription status
          // - Release escrow funds
          // - Send confirmation email
          // - Grant access to purchased items
          
          console.log('💚 Payment successful - Ready for post-processing:', {
            receiptNumber: result.mpesaReceiptNumber,
            amount: result.amount,
            userId: transaction.user_id
          });
        }
      } else {
        console.warn('⚠️  Transaction not found in database:', result.checkoutRequestID);
      }

    } catch (dbError) {
      console.error('❌ Database update failed:', dbError);
      // Log but don't fail the callback response
    }

    // Always return success to M-Pesa to acknowledge receipt
    return res.json({
      ResultCode: 0,
      ResultDesc: 'Confirmation Received Successfully'
    });

  } catch (error) {
    console.error('❌ Callback processing error:', error);
    
    // Still return success to M-Pesa
    return res.json({
      ResultCode: 0,
      ResultDesc: 'Confirmation Received Successfully'
    });
  }
});

/**
 * @route   GET /api/mpesa/query/:checkoutRequestID
 * @desc    Query M-Pesa transaction status
 * @access  Private
 */
router.get('/query/:checkoutRequestID', auth, async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;

    if (!checkoutRequestID) {
      return res.status(400).json({
        success: false,
        message: 'Checkout Request ID is required'
      });
    }

    console.log('🔍 Querying M-Pesa transaction:', checkoutRequestID);

    // Query M-Pesa API
    const result = await mpesaService.querySTKPushStatus(checkoutRequestID);

    if (result.success) {
      // Also fetch from database
      try {
        const { data: transaction } = await databaseService.query(
          `SELECT * FROM mpesa_transactions WHERE checkout_request_id = $1`,
          [checkoutRequestID]
        );

        if (transaction && transaction.length > 0) {
          result.databaseRecord = {
            status: transaction[0].status,
            amount: transaction[0].amount,
            phoneNumber: transaction[0].phone_number,
            createdAt: transaction[0].created_at,
            updatedAt: transaction[0].updated_at
          };
        }
      } catch (dbError) {
        console.error('⚠️  Database query failed:', dbError.message);
      }

      return res.json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Query error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to query transaction status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mpesa/transactions
 * @desc    Get user's M-Pesa transactions
 * @access  Private
 */
router.get('/transactions', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { limit = 10, offset = 0, status } = req.query;

    let query = `
      SELECT 
        id, checkout_request_id, merchant_request_id, 
        amount, phone_number, account_reference, 
        status, result_desc, mpesa_receipt_number,
        created_at, updated_at
      FROM mpesa_transactions 
      WHERE user_id = $1
    `;
    
    const params = [userId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { data: transactions } = await databaseService.query(query, params);

    return res.json({
      success: true,
      data: transactions || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('❌ Failed to fetch transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mpesa/validate-credentials
 * @desc    Validate M-Pesa API credentials
 * @access  Private (Admin only)
 */
router.post('/validate-credentials', auth, async (req, res) => {
  try {
    // Check if user is admin (you can add admin check middleware)
    const isValid = await mpesaService.validateCredentials();

    return res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'M-Pesa credentials are valid' : 'M-Pesa credentials are invalid',
      environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
    });

  } catch (error) {
    console.error('❌ Credential validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate credentials',
      error: error.message
    });
  }
});

module.exports = router;

