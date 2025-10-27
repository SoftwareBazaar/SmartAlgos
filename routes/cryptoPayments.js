const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const QRCode = require('qrcode');
const databaseService = require('../services/databaseService');
const blockchainService = require('../services/blockchainService');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');
const router = express.Router();

// Test route to verify crypto routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Crypto payment routes are working!',
    timestamp: new Date().toISOString(),
    walletAddresses: Object.keys(WALLET_ADDRESSES)
  });
});

// Mock wallet addresses for different cryptocurrencies
const WALLET_ADDRESSES = {
  usdt: {
    address: process.env.USDT_WALLET_ADDRESS || 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    network: 'TRC20'
  },
  btc: {
    address: process.env.BITCOIN_WALLET_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    network: 'Bitcoin'
  },
  eth: {
    address: process.env.ETHEREUM_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b8D1A4f4C4C6C4C6C4',
    network: 'Ethereum'
  },
  usdc: {
    address: process.env.USDC_WALLET_ADDRESS || process.env.ETHEREUM_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b8D1A4f4C4C6C4C6C4',
    network: 'ERC20'
  }
};

// Exchange rates (mock - in production, use real-time rates)
const EXCHANGE_RATES = {
  usdt: 1,
  btc: 65000,
  eth: 3500,
  usdc: 1
};

// @route   POST /api/payments/crypto/generate
// @desc    Generate crypto payment address and details
// @access  Public (temporarily for testing)
router.post('/generate', [
  // Temporarily disable auth for testing - add back when user auth is working
  // auth,
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('cryptoCurrency').isIn(['usdt', 'btc', 'eth', 'usdc']).withMessage('Invalid crypto currency'),
  body('productType').notEmpty().withMessage('Product type is required'),
  body('productId').notEmpty().withMessage('Product ID is required')
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

    const { amount, currency, cryptoCurrency, productType, productId } = req.body;
    
    // Calculate crypto amount
    const rate = EXCHANGE_RATES[cryptoCurrency];
    const cryptoAmount = (amount / rate).toFixed(8);
    
    // Get wallet address
    const walletInfo = WALLET_ADDRESSES[cryptoCurrency];
    if (!walletInfo) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported cryptocurrency'
      });
    }

    // Generate transaction ID
    const transactionId = uuidv4();
    
    // Generate QR code
    const qrData = `${cryptoCurrency}:${walletInfo.address}?amount=${cryptoAmount}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // Create payment record in database
    const supabase = databaseService.getClient();
    const paymentData = {
      id: transactionId,
      user_id: req.user?.id || 'test_user', // Use test user if no auth
      amount_usd: amount,
      crypto_currency: cryptoCurrency,
      crypto_amount: cryptoAmount,
      wallet_address: walletInfo.address,
      network: walletInfo.network,
      product_type: productType,
      product_id: productId,
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('crypto_payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      console.error('Crypto payment creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment record'
      });
    }

    // Log payment creation
    logger.info('Crypto payment generated', {
      transactionId,
      userId: req.user?.id || 'test_user',
      amount,
      cryptoCurrency,
      productType,
      productId
    });

    res.json({
      success: true,
      data: {
        transactionId,
        address: walletInfo.address,
        amount: cryptoAmount,
        currency: cryptoCurrency,
        network: walletInfo.network,
        qrCode,
        expiresAt: paymentData.expires_at
      }
    });

  } catch (error) {
    console.error('Generate crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/crypto/status/:transactionId
// @desc    Check crypto payment status
// @access  Private
router.get('/status/:transactionId', [auth], async (req, res) => {
  try {
    const { transactionId } = req.params;
    const supabase = databaseService.getClient();

    // Get payment record
    const { data: payment, error } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment is expired
    if (new Date() > new Date(payment.expires_at)) {
      await supabase
        .from('crypto_payments')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', transactionId);

      return res.json({
        success: true,
        data: {
          status: 'expired',
          transactionId,
          message: 'Payment has expired'
        }
      });
    }

    // In production, check blockchain for actual transactions
    // For now, we'll simulate checking
    const isConfirmed = await checkBlockchainTransaction(payment);

    if (isConfirmed && payment.status === 'pending') {
      // Update payment status
      await supabase
        .from('crypto_payments')
        .update({ 
          status: 'confirmed', 
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      // Trigger download access or subscription activation
      await processConfirmedPayment(payment);

      logger.info('Crypto payment confirmed', {
        transactionId,
        userId: req.user.id,
        amount: payment.amount_usd,
        cryptoCurrency: payment.crypto_currency
      });
    }

    res.json({
      success: true,
      data: {
        status: payment.status,
        transactionId,
        amount: payment.crypto_amount,
        currency: payment.crypto_currency,
        network: payment.network,
        expiresAt: payment.expires_at
      }
    });

  } catch (error) {
    console.error('Check crypto payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/crypto/webhook
// @desc    Handle crypto payment webhooks (from blockchain monitoring service)
// @access  Public (but should verify webhook signature)
router.post('/webhook', async (req, res) => {
  try {
    const { transactionId, status, txHash, amount, confirmations } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const supabase = databaseService.getClient();

    // Update payment record
    const { data, error } = await supabase
      .from('crypto_payments')
      .update({
        status: status === 'confirmed' ? 'confirmed' : 'pending',
        tx_hash: txHash,
        confirmations: confirmations || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Webhook update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update payment'
      });
    }

    if (status === 'confirmed') {
      await processConfirmedPayment(data);
      
      // Grant download access
      await grantDownloadAccess(data);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Crypto payment webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to check blockchain transaction (mock implementation)
async function checkBlockchainTransaction(payment) {
  // In production, this would:
  // 1. Connect to blockchain API
  // 2. Check for transactions to the wallet address
  // 3. Verify amount and confirmations
  // 4. Return true if transaction is confirmed
  
  // For demo purposes, simulate random confirmation
  return Math.random() > 0.7; // 30% chance of confirmation
}

// Helper function to process confirmed payment
async function processConfirmedPayment(payment) {
  try {
    const supabase = databaseService.getClient();

    // Create subscription or grant access based on product type
    if (payment.product_type === 'ea_subscription') {
      // Parse metadata to get subscription type
      const metadata = typeof payment.metadata === 'string' 
        ? JSON.parse(payment.metadata) 
        : payment.metadata || {};
      
      const subscriptionType = metadata.subscriptionType || 'monthly';
      
      // Calculate end date based on subscription type
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      switch (subscriptionType.toLowerCase()) {
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
      }
      
      // Create subscription record
      const subscriptionData = {
        id: uuidv4(),
        user_id: payment.user_id,
        ea_id: payment.product_id,
        subscription_type: subscriptionType.toLowerCase(),
        payment_method: 'crypto',
        payment_reference: payment.id,
        amount: payment.amount_usd,
        currency: payment.crypto_currency,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        console.error('Subscription creation error:', error);
        throw error;
      }

      // Send confirmation email
      // await emailService.sendPaymentConfirmation(payment.user_id, payment);

      logger.info('Subscription created from crypto payment', {
        userId: payment.user_id,
        eaId: payment.product_id,
        amount: payment.amount_usd,
        subscriptionId: subscription.id
      });

      return subscription;
    }

  } catch (error) {
    console.error('Process confirmed payment error:', error);
    throw error;
  }
}

// Helper function to grant download access after payment confirmation
async function grantDownloadAccess(payment) {
  try {
    const supabase = databaseService.getClient();
    
    // Find the subscription created for this payment
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('payment_reference', payment.id)
      .single();

    if (subError || !subscription) {
      console.error('Subscription not found for payment:', payment.id);
      return;
    }

    // Get EA details for download links
    const { data: ea, error: eaError } = await supabase
      .from('eas')
      .select('*')
      .eq('id', subscription.ea_id)
      .single();

    if (eaError) {
      console.error('EA fetch error:', eaError);
      return;
    }

    // Generate download links
    const downloadLinks = generateDownloadLinks(ea, subscription);

    // Send download confirmation email
    await sendDownloadConfirmationEmail(subscription, downloadLinks);

    // Log download access grant
    logger.info('Download access granted from crypto payment', {
      paymentId: payment.id,
      subscriptionId: subscription.id,
      userId: payment.user_id,
      eaId: subscription.ea_id
    });

  } catch (error) {
    console.error('Grant download access error:', error);
  }
}

// Helper function to generate download links
function generateDownloadLinks(ea, subscription) {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const downloadToken = generateSecureToken();
  
  const links = {
    eaFile: `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=ea_file`,
    setFile: ea.set_file ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=set_file` : null,
    manual: ea.manual_file ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=manual` : null,
    screenshots: ea.screenshots && ea.screenshots.length > 0 ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=screenshots` : null
  };

  // Store download token in database for validation
  storeDownloadToken(subscription.id, downloadToken);

  return links;
}

// Helper function to generate secure download token
function generateSecureToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

// Helper function to store download token
async function storeDownloadToken(subscriptionId, token) {
  try {
    const supabase = databaseService.getClient();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await supabase
      .from('download_tokens')
      .insert({
        subscription_id: subscriptionId,
        token: token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Store download token error:', error);
  }
}

// Helper function to send download confirmation email
async function sendDownloadConfirmationEmail(subscription, downloadLinks) {
  try {
    // In a real implementation, you would send an email here
    // For now, we'll just log it
    logger.info('Download confirmation email sent', {
      subscriptionId: subscription.id,
      userEmail: subscription.user_email,
      downloadLinks
    });
  } catch (error) {
    console.error('Send email error:', error);
  }
}

module.exports = router;
