/**
 * Smart Algos Capital — Paystack payments
 * Research subscriptions, donations, and consultation (public, no auth required)
 */
const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const paystackService = require('../services/paystackService');
const capitalSubscriptionService = require('../services/capitalSubscriptionService');

const KES_RATE = 150;

const TIER_AMOUNTS_USD = {
  'research-pro': 19,
  'quant-pro': 79,
  consultation: 50,
};

const PRODUCT_IDS = {
  'research-pro': '11111111-1111-1111-1111-111111111111',
  'quant-pro': '22222222-2222-2222-2222-222222222222',
  consultation: '33333333-3333-3333-3333-333333333333',
  research_donation: '44444444-4444-4444-4444-444444444444',
};

const VALID_PRODUCT_TYPES = [
  'research_subscription',
  'research_donation',
  'consultation',
];

function genReference(prefix = 'CAP') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function resolveAmountUsd({ productType, productId, amountUsd }) {
  if (productType === 'research_donation') {
    const n = Number(amountUsd);
    if (!n || n < 1) return null;
    return Math.round(n * 100) / 100;
  }
  if (productType === 'consultation' && amountUsd) {
    const n = Number(amountUsd);
    if (n >= 10) return Math.round(n * 100) / 100;
  }
  if (productType === 'research_subscription') {
    return TIER_AMOUNTS_USD[productId] ?? null;
  }
  if (productType === 'consultation') {
    return TIER_AMOUNTS_USD.consultation;
  }
  return null;
}

function getCallbackBase() {
  return (
    process.env.CAPITAL_CLIENT_URL ||
    process.env.LOVERBLE_URL ||
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:8080'
  ).replace(/\/$/, '');
}

function strategyVerificationUrl(slug) {
  const map = {
    'gold-momentum': process.env.QC_GOLD_MOMENTUM_URL || process.env.VITE_QC_GOLD_MOMENTUM_URL || '',
    'fx-mean-reversion': process.env.QC_FX_MEAN_REVERSION_URL || process.env.VITE_QC_FX_MEAN_REVERSION_URL || '',
  };
  return (map[slug] || '').trim() || 'https://www.quantconnect.com';
}

function getPerformancePayload() {
  const live = process.env.QC_LIVE_DATA_ENABLED === 'true';
  return {
    source: live ? 'live' : 'configured',
    illustrative: !live,
    updatedAt: new Date().toISOString(),
    metrics: {
      avgMonthlyReturn: Number(process.env.CAPITAL_AVG_MONTHLY_RETURN || 0.024),
      maxDrawdown: Number(process.env.CAPITAL_MAX_DRAWDOWN || -0.068),
      winRate: Number(process.env.CAPITAL_WIN_RATE || 0.58),
      profitFactor: Number(process.env.CAPITAL_PROFIT_FACTOR || 1.62),
      sharpe: Number(process.env.CAPITAL_SHARPE || 1.42),
      sortino: Number(process.env.CAPITAL_SORTINO || 1.89),
      recoveryDays: Number(process.env.CAPITAL_RECOVERY_DAYS || 42),
    },
    monthlyReturns: [
      { month: 'Jan', return: 2.1 },
      { month: 'Feb', return: -0.8 },
      { month: 'Mar', return: 3.4 },
      { month: 'Apr', return: 1.2 },
      { month: 'May', return: 2.8 },
      { month: 'Jun', return: 1.5 },
    ],
    strategies: [
      {
        slug: 'gold-momentum',
        name: 'Gold Momentum',
        status: 'Live',
        platform: 'QuantConnect',
        verificationUrl: strategyVerificationUrl('gold-momentum'),
        hasDirectLink: Boolean((process.env.QC_GOLD_MOMENTUM_URL || process.env.VITE_QC_GOLD_MOMENTUM_URL || '').trim()),
        metrics: { sharpe: 1.48, maxDrawdown: -0.061, winRate: 0.59 },
      },
      {
        slug: 'fx-mean-reversion',
        name: 'FX Mean Reversion',
        status: 'Live',
        platform: 'QuantConnect',
        verificationUrl: strategyVerificationUrl('fx-mean-reversion'),
        hasDirectLink: Boolean((process.env.QC_FX_MEAN_REVERSION_URL || process.env.VITE_QC_FX_MEAN_REVERSION_URL || '').trim()),
        metrics: { sharpe: 1.31, maxDrawdown: -0.072, winRate: 0.56 },
      },
    ],
    verificationSources: [
      { name: 'QuantConnect', url: 'https://www.quantconnect.com', status: 'Connected' },
      { name: 'Collective2', url: 'https://www.collective2.com', status: 'Planned' },
      { name: 'Darwinex', url: 'https://www.darwinex.com', status: 'Future' },
    ],
  };
}

// Public performance config — no auth
router.get('/performance', (_req, res) => {
  res.json({ success: true, performance: getPerformancePayload() });
});

// Public config — no auth
router.get('/config', (_req, res) => {
  res.json({
    success: true,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    currency: 'KES',
    kesRate: KES_RATE,
  });
});

// Initialize payment
router.post('/initialize', async (req, res) => {
  let { email, product_type: productType, product_id: productId, amount_usd: amountUsd, metadata = {} } = req.body;

  try {
    email = (email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!VALID_PRODUCT_TYPES.includes(productType)) {
      return res.status(400).json({ success: false, error: 'Invalid product type' });
    }
    if (!productId && productType !== 'research_donation') {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    const resolvedUsd = resolveAmountUsd({ productType, productId, amountUsd });
    if (!resolvedUsd) {
      return res.status(400).json({ success: false, error: 'Invalid or missing payment amount' });
    }

    const reference = genReference();
    const amountKes = resolvedUsd * KES_RATE;
    const amountKobo = Math.round(amountKes * 100);
    const dbProductId = PRODUCT_IDS[productId] || PRODUCT_IDS.research_donation;
    const callbackUrl = `${getCallbackBase()}/payment-callback`;

    let dbPaymentId = null;
    try {
      const supabase = databaseService.getClient();
      if (supabase) {
        const { data: payment } = await supabase
          .from('paystack_payments')
          .insert({
            user_id: null,
            email,
            amount_usd: resolvedUsd,
            amount_ngn: amountKobo,
            product_type: productType,
            product_id: dbProductId,
            status: 'pending',
            paystack_reference: reference,
            metadata: { product_id: productId, ...metadata, platform: 'smart-algos-capital' },
          })
          .select()
          .single();
        if (payment) dbPaymentId = payment.id;
      }
    } catch (dbErr) {
      console.warn('[Capital] DB insert skipped:', dbErr.message);
    }

    const paystackResult = await paystackService.initializeTransaction({
      email,
      amount: amountKes,
      currency: 'KES',
      reference,
      callback_url: callbackUrl,
      metadata: {
        payment_id: dbPaymentId,
        product_type: productType,
        product_id: productId,
        amount_usd: resolvedUsd,
        platform: 'smart-algos-capital',
        ...metadata,
      },
    });

    if (!paystackResult?.status || !paystackResult.data) {
      return res.status(500).json({
        success: false,
        error: paystackResult?.message || 'Payment gateway error',
      });
    }

    res.json({
      success: true,
      payment: {
        id: dbPaymentId || reference,
        reference,
        authorization_url: paystackResult.data.authorization_url,
        access_code: paystackResult.data.access_code,
        amount_usd: resolvedUsd,
        amount_kobo: amountKobo,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
        currency: 'KES',
      },
    });
  } catch (error) {
    console.error('[Capital] Initialize error:', error.message);
    res.status(500).json({ success: false, error: error.message || 'Payment initialization failed' });
  }
});

// Verify payment — public
router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params;

  try {
    const result = await paystackService.verifyTransaction(reference);
    if (!result?.status || result.data?.status !== 'success') {
      return res.status(400).json({ success: false, error: 'Payment not successful' });
    }

    const txData = result.data;
    const metadata = txData.metadata || {};
    const productType = metadata.product_type || 'research_subscription';
    const productId = metadata.product_id || '';
    const amountUsd = metadata.amount_usd || txData.amount / 100 / KES_RATE;
    const email = txData.customer?.email;

    const supabase = databaseService.getClient();
    if (supabase) {
      const { data: existing } = await supabase
        .from('paystack_payments')
        .select('*')
        .eq('paystack_reference', reference)
        .eq('status', 'completed')
        .maybeSingle();

      if (existing) {
        const existingProductId = existing.metadata?.product_id || productId;
        if (productType === 'research_subscription' && email) {
          await capitalSubscriptionService.activateFromPayment(supabase, {
            email,
            productId: existingProductId,
            productType,
            reference,
          });
        }
        return res.json({
          success: true,
          message: 'Payment already processed',
          product_type: existing.product_type,
          product_id: existingProductId,
          amount_usd: existing.amount_usd,
          email,
          tier: capitalSubscriptionService.productIdToTier(existingProductId) || 'free',
        });
      }

      await supabase
        .from('paystack_payments')
        .update({
          status: 'completed',
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          paystack_data: txData,
        })
        .eq('paystack_reference', reference);

      if (productType === 'research_subscription' && email) {
        await capitalSubscriptionService.activateFromPayment(supabase, {
          email,
          productId,
          productType,
          reference,
        });
      }
    }

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && email) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          secure: false,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        });
        const subject =
          productType === 'research_donation'
            ? 'Thank you for supporting Smart Algos research'
            : productType === 'consultation'
              ? 'Consultation payment confirmed — Smart Algos Capital'
              : `Research subscription confirmed — ${productId}`;
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject,
          html: `<p>Thank you! Your payment of <strong>$${Number(amountUsd).toFixed(2)} USD</strong> was received.</p>
                 <p>Reference: <code>${reference}</code></p><p>— Smart Algos Capital</p>`,
        });
      }
    } catch (mailErr) {
      console.warn('[Capital] Confirmation email skipped:', mailErr.message);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      product_type: productType,
      product_id: productId,
      amount_usd: amountUsd,
      reference,
      email,
      tier: capitalSubscriptionService.productIdToTier(productId) || 'free',
    });
  } catch (error) {
    console.error('[Capital] Verify error:', error.message);
    res.status(500).json({ success: false, error: error.message || 'Verification failed' });
  }
});

// Subscription status — Bearer Supabase JWT (cross-device access)
router.get('/subscription/status', async (req, res) => {
  try {
    const supabase = databaseService.getClient();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }

    const user = await capitalSubscriptionService.getUserFromAuthHeader(supabase, req.headers.authorization);
    if (!user?.email) {
      return res.status(401).json({ success: false, error: 'Sign in required' });
    }

    const subscription = await capitalSubscriptionService.resolveSubscriptionForEmail(supabase, user.email);
    res.json({
      success: true,
      subscription: {
        tier: subscription.tier,
        expiresAt: subscription.expiresAt,
        email: subscription.email,
        source: subscription.source,
        latestReference: subscription.latestPayment?.paystack_reference ?? null,
      },
    });
  } catch (error) {
    console.error('[Capital] Subscription status error:', error.message);
    res.status(500).json({ success: false, error: error.message || 'Failed to load subscription' });
  }
});

// Sync paystack payments → profile after sign-in
router.post('/subscription/sync', async (req, res) => {
  try {
    const supabase = databaseService.getClient();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }

    const user = await capitalSubscriptionService.getUserFromAuthHeader(supabase, req.headers.authorization);
    if (!user?.email) {
      return res.status(401).json({ success: false, error: 'Sign in required' });
    }

    const subscription = await capitalSubscriptionService.syncUserSubscription(supabase, user);
    res.json({
      success: true,
      subscription: {
        tier: subscription.tier,
        expiresAt: subscription.expiresAt,
        email: subscription.email,
        source: subscription.source,
        latestReference: subscription.latestPayment?.paystack_reference ?? null,
      },
    });
  } catch (error) {
    console.error('[Capital] Subscription sync error:', error.message);
    res.status(500).json({ success: false, error: error.message || 'Failed to sync subscription' });
  }
});

module.exports = router;
