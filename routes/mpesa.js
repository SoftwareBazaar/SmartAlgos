const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mpesaService = require('../services/mpesaService');
const { auth } = require('../middleware/auth');
const databaseService = require('../services/databaseService');
const logger = require('../utils/logger');

// Initiate STK Push payment
router.post('/stk-push', auth, async (req, res) => {
  const { amount, phoneNumber, accountReference, transactionDesc, metadata } = req.body;
  const userId = req.user?.id;

  try {
    if (!amount || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Amount and phone number are required' });
    }

    console.log('📱 STK Push request:', { userId, amount, phoneNumber: phoneNumber.substring(0, 6) + '***' });

    const result = await mpesaService.initiateSTKPush({
      amount,
      phoneNumber,
      accountReference: accountReference || `USER_${userId}`,
      transactionDesc: transactionDesc || 'AlgoSmart Payment',
      metadata: { ...metadata, userId }
    });

    if (result.success) {
      const supabase = databaseService.getClient();

      // Store transaction in Supabase
      const { error: dbError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: userId,
          merchant_request_id: result.data.merchantRequestID,
          checkout_request_id: result.data.checkoutRequestID,
          amount,
          phone_number: result.data.phoneNumber,
          account_reference: accountReference,
          transaction_desc: transactionDesc || 'AlgoSmart Payment',
          status: 'pending',
          metadata: { ...metadata, userId }
        });

      if (dbError) {
        console.warn('⚠️  Failed to store transaction in database:', dbError.message);
      }

      return res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ STK Push error:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate M-Pesa payment', error: error.message });
  }
});

// Handle M-Pesa callback
router.post('/callback', async (req, res) => {
  try {
    console.log('📞 M-Pesa callback received');
    const result = mpesaService.processCallback(req.body);

    const supabase = databaseService.getClient();

    // Update transaction in Supabase
    const { data: updatedTransactions, error: dbError } = await supabase
      .from('mpesa_transactions')
      .update({
        status: result.success ? 'completed' : 'failed',
        result_code: result.resultCode.toString(),
        result_desc: result.resultDesc,
        mpesa_receipt_number: result.mpesaReceiptNumber || null,
        transaction_date: result.transactionDate ? new Date(result.transactionDate).toISOString() : null,
        updated_at: new Date().toISOString(),
        callback_data: req.body
      })
      .eq('checkout_request_id', result.checkoutRequestID)
      .select();

    if (dbError) {
      console.error('❌ Database update failed:', dbError);
    }

    if (updatedTransactions && updatedTransactions.length > 0) {
      console.log('✅ Transaction updated in database:', result.checkoutRequestID);

      if (result.success) {
        const transaction = updatedTransactions[0];
        console.log('💚 Payment successful - Processing subscription...');
        await processSuccessfulPayment(transaction, result);
      }
    } else {
      console.warn('⚠️  Transaction not found in database:', result.checkoutRequestID);
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Confirmation Received Successfully' });

  } catch (error) {
    console.error('❌ Callback processing error:', error);
    return res.json({ ResultCode: 0, ResultDesc: 'Confirmation Received Successfully' });
  }
});

// Query M-Pesa status
router.get('/query/:checkoutRequestID', auth, async (req, res) => {
  const { checkoutRequestID } = req.params;

  try {
    if (!checkoutRequestID) {
      return res.status(400).json({ success: false, message: 'Checkout Request ID is required' });
    }

    const result = await mpesaService.querySTKPushStatus(checkoutRequestID);

    if (result.success) {
      const supabase = databaseService.getClient();
      const { data: transaction } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('checkout_request_id', checkoutRequestID)
        .single();

      if (transaction) {
        result.databaseRecord = {
          status: transaction.status,
          amount: transaction.amount,
          phoneNumber: transaction.phone_number,
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at
        };

        // If transaction is completed, check for subscription and links
        if (transaction.status === 'completed') {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('payment_reference', transaction.mpesa_receipt_number)
            .single();

          if (subscription) {
            const downloadLinks = await generateDownloadLinksForSubscription(
              subscription,
              transaction.user_id,
              subscription.ea_id
            );
            result.subscription = subscription;
            result.downloadLinks = downloadLinks;
          }
        }
      }

      return res.json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Query error:', error);
    return res.status(500).json({ success: false, message: 'Failed to query transaction status', error: error.message });
  }
});

// Process successful M-Pesa payment
async function processSuccessfulPayment(transaction, paymentResult) {
  try {
    const metadata = typeof transaction.metadata === 'string'
      ? JSON.parse(transaction.metadata)
      : transaction.metadata || {};

    const eaId = metadata.eaId || metadata.ea_id;
    const subscriptionType = metadata.subscriptionType || metadata.subscription_type || 'monthly';

    if (!eaId) {
      console.warn('⚠️  No EA ID found in transaction metadata, cannot create subscription');
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);

    switch (subscriptionType.toLowerCase()) {
      case 'weekly': endDate.setDate(endDate.getDate() + 7); break;
      case 'monthly': endDate.setMonth(endDate.getMonth() + 1); break;
      case 'quarterly': endDate.setMonth(endDate.getMonth() + 3); break;
      case 'yearly': endDate.setFullYear(endDate.getFullYear() + 1); break;
      default: endDate.setMonth(endDate.getMonth() + 1);
    }

    const supabase = databaseService.getClient();

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: transaction.user_id,
        ea_id: eaId,
        subscription_type: subscriptionType.toLowerCase(),
        payment_method: 'mobile_money', // M-Pesa is mobile money
        payment_reference: paymentResult.mpesaReceiptNumber,
        amount: transaction.amount,
        currency: 'KES',
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    if (subError) throw subError;

    console.log('✅ Subscription created successfully:', subscription.id);

    // Generate download links
    const downloadLinks = await generateDownloadLinksForSubscription(subscription, transaction.user_id, eaId);

    return { subscription, downloadLinks };

  } catch (error) {
    console.error('❌ Failed to process successful payment:', error);
  }
}

// Generate JWT-protected download links (Consistent with Crypto/Paystack)
async function generateDownloadLinksForSubscription(subscription, userId, eaId) {
  try {
    const supabase = databaseService.getClient();
    const { data: ea, error } = await supabase
      .from('expert_advisors')
      .select('ea_file_path, set_file_path, manual_file_path, name')
      .eq('id', eaId)
      .single();

    if (error || !ea) throw new Error('EA not found');

    const token = jwt.sign(
      { subscriptionId: subscription.id, userId, eaId, type: 'download' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    return {
      ea_file: ea.ea_file_path ? `${baseUrl}/api/downloads/ea/${eaId}?token=${token}&type=ea_file` : null,
      set_file: ea.set_file_path ? `${baseUrl}/api/downloads/ea/${eaId}?token=${token}&type=set_file` : null,
      manual: ea.manual_file_path ? `${baseUrl}/api/downloads/ea/${eaId}?token=${token}&type=manual` : null
    };
  } catch (error) {
    console.error('❌ Generate links error:', error);
    return { ea_file: null, set_file: null, manual: null };
  }
}

module.exports = router;

