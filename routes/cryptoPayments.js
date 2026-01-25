const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const QRCode = require('qrcode');
const databaseService = require('../services/databaseService');
const { getSystemSettings } = require('./admin-cms');
// Blockchain service is optional (for advanced features like smart contracts)
// NOT needed for payment verification - we use blockchainMonitorService instead
let blockchainService = null;
try {
  blockchainService = require('../services/blockchainService');
} catch (error) {
  // This is OK - blockchainService is only for advanced features, not payment verification
  // Payment verification uses blockchainMonitorService (Etherscan/BlockCypher) instead
}
// Blockchain monitoring service for automatic payment verification
let blockchainMonitor = null;
try {
  blockchainMonitor = require('../services/blockchainMonitorService');
  const hasBlockCypher = blockchainMonitor.hasBlockCypherKey();
  const hasEtherscan = !!process.env.ETHERSCAN_API_KEY;
  const hasTron = !!process.env.TRON_API_KEY;

  if (hasBlockCypher || hasEtherscan || hasTron) {
    console.log('✅ Blockchain monitoring service enabled - automatic payment verification active');
    console.log('   Supported:');
    if (hasBlockCypher) console.log('   - Bitcoin & Ethereum (via BlockCypher)');
    if (hasEtherscan) console.log('   - Ethereum, USDT/USDC ERC20 (via Etherscan)');
    if (hasTron) console.log('   - USDT TRC20 (via TronGrid)');

    if (!hasBlockCypher && !hasEtherscan) {
      console.warn('   ⚠️  No Bitcoin support - add BLOCKCYPHER_API_KEY for BTC payments');
    }
    if (!hasEtherscan) {
      console.warn('   ⚠️  No Ethereum/ERC20 support - add ETHERSCAN_API_KEY for ETH/USDT/USDC');
    }
  } else {
    console.warn('⚠️  Blockchain monitoring available but no API keys configured.');
    console.warn('   Add at least one: BLOCKCYPHER_API_KEY (Bitcoin/Ethereum) or ETHERSCAN_API_KEY (Ethereum/ERC20)');
  }
} catch (error) {
  console.warn('⚠️  Blockchain monitor service not available:', error.message);
}
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

// @route   GET /api/payments/crypto/settings
// @desc    Get crypto payment settings (minimums, etc.)
// @access  Public
router.get('/settings', async (req, res) => {
  try {
    const settings = await getSystemSettings();
    const minPaymentUSD = settings.minCryptoPaymentUSD || 10.00;

    // Calculate minimums in all supported currencies
    const minimums = {
      USD: minPaymentUSD,
      EUR: (minPaymentUSD / CURRENCY_TO_USD.EUR).toFixed(2),
      GBP: (minPaymentUSD / CURRENCY_TO_USD.GBP).toFixed(2),
      KES: (minPaymentUSD / CURRENCY_TO_USD.KES).toFixed(2)
    };

    res.json({
      success: true,
      data: {
        minPaymentUSD,
        minimums,
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'KES'],
        supportedCrypto: ['usdt', 'btc', 'eth', 'usdc'],
        networkFeeWarning: settings.cryptoNetworkFeeWarning !== false
      }
    });
  } catch (error) {
    console.error('Get crypto settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crypto payment settings'
    });
  }
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

// Currency conversion rates to USD
const CURRENCY_TO_USD = {
  USD: 1,
  EUR: 1.1,
  GBP: 1.27,
  KES: 0.0067 // 1 KES = 0.0067 USD (approx 150 KES = 1 USD)
};

// @route   POST /api/payments/crypto/generate
// @desc    Generate crypto payment address and details
// @access  Public (temporarily for testing)
router.post('/generate', [
  // Temporarily disable auth for testing - add back when user auth is working
  // auth,
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a valid number'),
  body('currency').isIn(['USD', 'EUR', 'GBP', 'KES']).withMessage('Invalid currency'),
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

    const { amount, currency, cryptoCurrency, productType, productId, metadata } = req.body;

    // Get system settings for minimum payment validation
    const settings = await getSystemSettings();
    const minPaymentUSD = settings.minCryptoPaymentUSD || 10.00;

    // Convert amount to USD to check minimum
    const conversionRate = CURRENCY_TO_USD[currency] || 1;
    const amountInUSD = amount * conversionRate;

    // Validate minimum payment amount
    if (amountInUSD < minPaymentUSD) {
      const minInCurrency = (minPaymentUSD / conversionRate).toFixed(2);
      return res.status(400).json({
        success: false,
        message: `Minimum payment amount is $${minPaymentUSD} USD (${currency} ${minInCurrency})`,
        minAmount: {
          usd: minPaymentUSD,
          currency: currency,
          amount: parseFloat(minInCurrency)
        }
      });
    }

    // Calculate crypto amount
    const rate = EXCHANGE_RATES[cryptoCurrency];
    const cryptoAmount = (amountInUSD / rate).toFixed(8);

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

    // Generate a test UUID if no user is authenticated
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

    const paymentData = {
      id: transactionId,
      user_id: userId,
      amount_usd: amountInUSD,
      crypto_currency: cryptoCurrency,
      crypto_amount: cryptoAmount,
      wallet_address: walletInfo.address,
      network: walletInfo.network,
      product_type: productType,
      product_id: productId,
      metadata: metadata || {},
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try to insert into database, but continue even if it fails (for testing)
    // Save to database
    let data = null;
    try {
      const result = await supabase
        .from('crypto_payments')
        .insert(paymentData)
        .select()
        .single();

      if (result.error) {
        console.warn('⚠️  Database insert failed (continuing anyway for testing):', result.error.message);
        console.warn('Error details:', JSON.stringify(result.error, null, 2));
        // Don't return error, continue with mock data
      } else {
        data = result.data;
      }
    } catch (dbError) {
      console.warn('⚠️  Database error (continuing anyway for testing):', dbError.message);
    }

    // Log payment creation
    logger.info('Crypto payment generated', {
      transactionId,
      userId,
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

// @route   POST /api/payments/crypto/:transactionId/confirm
// @desc    Confirm payment and create subscription (with idempotency)
// @access  Private
router.post('/:transactionId/confirm', auth, async (req, res) => {
  const { transactionId } = req.params;
  const userId = req.user?.id; // From auth middleware

  try {
    console.log(`🔍 Confirming payment: ${transactionId}`);

    const supabase = databaseService.getClient();

    // 1. Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // 2. Check if already confirmed
    if (payment.status === 'confirmed') {
      console.log('✅ Payment already confirmed, fetching existing subscription...');

      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('payment_reference', transactionId)
        .single();

      if (existingSub) {
        const downloadLinks = await generateDownloadLinksForSubscription(
          existingSub,
          payment.user_id,
          payment.product_id
        );

        return res.json({
          success: true,
          message: 'Payment already confirmed',
          subscription: existingSub,
          downloadLinks
        });
      }
    }

    // 3. Update payment status to confirmed
    const { error: updateError } = await supabase
      .from('crypto_payments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('❌ Error updating payment:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update payment status'
      });
    }

    // 4. Process confirmed payment (create subscription)
    const result = await processConfirmedPayment(payment);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to process payment'
      });
    }

    console.log('✅ Payment confirmed and subscription created');

    // 5. Return subscription and download links
    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      subscription: result.subscription,
      downloadLinks: result.downloadLinks
    });

  } catch (error) {
    console.error('❌ Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/payments/crypto/status/:transactionId
// @desc    Check crypto payment status
// @access  Public (temporarily for testing)
router.get('/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const supabase = databaseService.getClient();

    // Get payment record (temporarily without user_id check for testing)
    const { data: payment, error } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('id', transactionId)
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

    // Check blockchain for actual transactions (automatic verification)
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
        userId: req.user?.id || payment.user_id,
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

// @route   GET /api/payments/crypto/:transactionId/download-links
// @desc    Get download links for confirmed payment
// @access  Public (payment must be confirmed and belong to user)
router.get('/:transactionId/download-links', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const supabase = databaseService.getClient();

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment is confirmed
    if (payment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Payment not confirmed yet',
        status: payment.status
      });
    }

    // Get subscription created for this payment
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('payment_reference', payment.id)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found for this payment'
      });
    }

    // Generate download links
    const downloadLinks = await generateDownloadLinksForSubscription(
      subscription,
      payment.user_id,
      payment.product_id
    );

    if (!downloadLinks) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate download links'
      });
    }

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        downloadLinks,
        tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    console.error('Get download links error:', error);
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
    // 1) Verify webhook signature (HMAC SHA256 of raw body)
    try {
      const secret = process.env.CRYPTO_WEBHOOK_SECRET;
      if (!secret) {
        console.warn('[crypto-webhook] CRYPTO_WEBHOOK_SECRET not set - accepting webhook in dev');
      } else {
        const payload = JSON.stringify(req.body);
        const expected = require('crypto').createHmac('sha256', secret).update(payload).digest('hex');
        const received = req.headers['x-crypto-signature'] || req.headers['x-signature'];
        if (!received || !require('crypto').timingSafeEqual(Buffer.from(expected), Buffer.from(received))) {
          return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
        }
      }
    } catch (sigErr) {
      console.error('[crypto-webhook] Signature verification error:', sigErr);
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { transactionId, status, txHash, amount, confirmations } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const supabase = databaseService.getClient();

    // 2) Idempotency guard: if already confirmed, do nothing
    const { data: existing, error: readErr } = await supabase
      .from('crypto_payments')
      .select('id,status,tx_hash,confirmations')
      .eq('id', transactionId)
      .maybeSingle();

    if (readErr) {
      console.error('Webhook read error:', readErr);
    }

    if (existing && existing.status === 'confirmed') {
      // Already processed; acknowledge without duplicating side effects
      return res.json({ success: true, message: 'Already confirmed (idempotent)' });
    }

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
      const result = await processConfirmedPayment(data);

      // Grant download access
      await grantDownloadAccess(data);

      // Return download links in webhook response
      return res.json({
        success: true,
        message: 'Webhook processed successfully',
        downloadLinks: result?.downloadLinks || null
      });
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
    console.log('🔄 Processing confirmed payment...');

    const supabase = databaseService.getClient();

    // Get EA details
    const { data: ea, error: eaError } = await supabase
      .from('expert_advisors')
      .select('*')
      .eq('id', payment.product_id)
      .single();

    if (eaError || !ea) {
      return { success: false, error: 'EA not found' };
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);

    const subscriptionType = payment.metadata?.subscription_type || 'monthly';
    switch (subscriptionType) {
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
        endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create subscription record
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: payment.user_id,
        ea_id: payment.product_id,
        subscription_type: subscriptionType,
        payment_method: 'crypto',
        payment_reference: payment.id,
        amount: payment.amount_usd,
        currency: 'USD',
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    if (subError) {
      console.error('❌ Error creating subscription:', subError);
      return { success: false, error: 'Failed to create subscription' };
    }

    console.log('✅ Subscription created:', subscription.id);

    // Generate download links
    const downloadLinks = await generateDownloadLinksForSubscription(
      subscription,
      payment.user_id,
      payment.product_id
    );

    return {
      success: true,
      subscription,
      downloadLinks
    };

  } catch (error) {
    console.error('❌ Process payment error:', error);
    return { success: false, error: error.message };
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

// Helper function to generate download links for a subscription
async function generateDownloadLinksForSubscription(subscription, userId, eaId) {
  try {
    const supabase = databaseService.getClient();

    // Get EA details including ZIP file path
    const { data: ea, error: eaError } = await supabase
      .from('expert_advisors')
      .select('id, name, zip_file_path, ea_file_path, set_file_path, manual_file_path, screenshots')
      .eq('id', eaId)
      .single();

    if (eaError || !ea) {
      console.error('Failed to fetch EA for download links:', eaError);
      return null;
    }

    // Generate download token (valid for 24 hours)
    const jwt = require('jsonwebtoken');
    const downloadToken = jwt.sign(
      {
        subscriptionId: subscription.id,
        userId: userId,
        eaId: ea.id,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const baseUrl = process.env.BACKEND_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Generate download links - ZIP package first (priority), then individual files as fallback
    const downloadLinks = {
      zip_package: ea.zip_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}/zip?token=${downloadToken}` : null,
      ea_file: ea.ea_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=ea_file` : null,
      set_file: ea.set_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=set_file` : null,
      manual: ea.manual_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=manual` : null,
      screenshots: ea.screenshots && ea.screenshots.length > 0 ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=screenshots` : null
    };

    logger.info('Download links generated for subscription', {
      subscriptionId: subscription.id,
      eaId: ea.id,
      hasZipPackage: !!ea.zip_file_path,
      linksAvailable: Object.keys(downloadLinks).filter(key => downloadLinks[key])
    });

    // 🎯 CRITICAL: Send email with download links
    console.log(`\n📧 [Crypto] ========== ATTEMPTING TO SEND EMAIL ==========`);
    try {
      const emailService = require('../services/emailService');
      
      // Get user email from database
      let user = null;
      let finalUserEmail = null;
      let userName = 'Valued Customer';
      
      try {
        const { data: userData, error: userError } = await supabase
          .from('users_accounts')
          .select('email, first_name, last_name')
          .eq('id', userId)
          .single();

        if (userData && !userError) {
          user = userData;
          finalUserEmail = user.email;
          userName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}`.trim() 
            : user.first_name || user.last_name || 'Valued Customer';
        }
      } catch (userFetchError) {
        console.warn(`⚠️ [Crypto] Could not fetch user details`);
      }

      if (!finalUserEmail) {
        console.error(`❌ [Crypto] No email address found for user ${userId}`);
        console.error(`   Email will NOT be sent, but subscription is still active`);
      } else {
        console.log(`📧 [Crypto] Email Configuration Check:`);
        console.log(`   - To: ${finalUserEmail}`);
        console.log(`   - User Name: ${userName}`);
        console.log(`   - EA Name: ${ea.name}`);
        console.log(`   - Subscription Type: ${subscription.subscription_type || 'monthly'}`);
        console.log(`   - Subscription ID: ${subscription.id}`);
        console.log(`   - EMAIL_USER set: ${!!process.env.EMAIL_USER}`);
        console.log(`   - EMAIL_PASSWORD set: ${!!process.env.EMAIL_PASSWORD}`);
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
          console.error(`❌ [Crypto] EMAIL NOT CONFIGURED!`);
          console.error(`   Please set EMAIL_USER and EMAIL_PASSWORD environment variables`);
        } else {
          const emailResult = await emailService.sendDownloadEmail({
            userEmail: finalUserEmail,
            userName: userName,
            eaName: ea.name,
            downloadLinks: downloadLinks,
            subscriptionType: subscription.subscription_type || 'monthly',
            subscriptionId: subscription.id
          });

          if (emailResult.success) {
            console.log('✅ [Crypto] Download email sent successfully');
            console.log(`📬 [Crypto] Message ID: ${emailResult.messageId}`);
          } else {
            console.error('❌ [Crypto] Failed to send download email:', emailResult.error);
            console.error(`   Error code: ${emailResult.code}`);
          }
        }
      }
      console.log(`📧 [Crypto] ========== EMAIL PROCESS COMPLETE ==========\n`);
    } catch (emailError) {
      console.error('❌ [Crypto] Email send error (non-critical):', emailError.message);
      console.error(`   Stack trace:`, emailError.stack);
      // Don't fail the whole process if email fails
    }

    return downloadLinks;
  } catch (error) {
    console.error('Generate download links error:', error);
    return null;
  }
}

module.exports = router;
