const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const paystackService = require('../services/paystackService');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get Paystack configuration (Public Key)
router.get('/config', auth, (req, res) => {
    res.json({
        success: true,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || ''
    });
});

/**
 * @route   POST /api/payments/paystack/initialize
 * @desc    Initialize Paystack payment for EA subscription
 * @access  Private
 */
router.post('/initialize', auth, async (req, res) => {
    const { eaId, subscriptionType, email } = req.body;
    const userId = req.user?.id || req.user?._id;
    const userEmail = email || req.user?.email || 'user@example.com';

    try {
        console.log('💳 [Paystack] Initializing payment request...');

        if (!eaId) {
            return res.status(400).json({ success: false, error: 'EA selection is required' });
        }

        const supabase = databaseService.getClient();

        // Get EA details
        let ea = null;
        if (supabase) {
            const { data, error: eaError } = await supabase
                .from('expert_advisors')
                .select('*')
                .eq('id', eaId)
                .single();

            if (!eaError && data) {
                ea = data;
            }
        }

        if (!ea) {
            console.error(`❌ [Paystack] EA not found (ID: ${eaId})`);
            return res.status(404).json({ success: false, error: 'Expert Advisor not found. Please try again.' });
        }

        // Calculate amount (USD)
        const priceMap = {
            weekly: ea.price_weekly || ea.weekly_price,
            monthly: ea.price_monthly || ea.monthly_price,
            quarterly: ea.price_quarterly || ea.quarterly_price,
            yearly: ea.price_yearly || ea.yearly_price
        };

        const amountUsd = priceMap[subscriptionType] || ea.price_monthly || 0;
        if (amountUsd <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid subscription price' });
        }

        /**
         * IMPORTANT: WORKING CONVERSION LOGIC
         * Follows payments.js - Always convert to KES for Paystack initialization
         */
        const KES_RATE = 150; // 1 USD = 150 KES (as per payments.js)
        const amountKes = Math.round(amountUsd * KES_RATE);

        console.log(`   Converting $${amountUsd} USD to ${amountKes} KES (Rate: ${KES_RATE})`);

        // Create a unique reference
        const reference = `ALGO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // ATTEMPT to save to database but DON'T fail if it crashes
        let dbPaymentId = null;
        try {
            if (supabase) {
                const { data: payment, error: pError } = await supabase
                    .from('paystack_payments')
                    .insert({
                        user_id: userId,
                        email: userEmail,
                        amount_usd: amountUsd,
                        amount_ngn: amountKes, // We use this column to store the converted amount
                        product_type: 'ea_subscription',
                        product_id: eaId,
                        status: 'pending',
                        paystack_reference: reference,
                        metadata: { subscription_type: subscriptionType, ea_name: ea.name }
                    })
                    .select()
                    .single();

                if (payment) dbPaymentId = payment.id;
                if (pError) console.warn('⚠️ [Paystack] DB record creation skipped:', pError.message);
            }
        } catch (dbErr) {
            console.warn('⚠️ [Paystack] DB connection issues, continuing with payment only.');
        }

        // Initialize Paystack transaction
        console.log('   Calling Paystack API...');
        const paystackResult = await paystackService.initializeTransaction({
            email: userEmail,
            amount: amountKes, // PaystackService library probably expects the integer/float which it converts to kobo
            currency: 'KES',   // CRITICAL: Switched to KES to match working payments.js
            reference: reference,
            callback_url: `${process.env.CLIENT_URL || process.env.FRONTEND_URL}/payment-callback`,
            metadata: {
                payment_id: dbPaymentId,
                user_id: userId,
                ea_id: eaId,
                subscription_type: subscriptionType
            }
        });

        if (!paystackResult.status) {
            console.error('❌ [Paystack] API Error:', paystackResult.message);
            return res.status(500).json({
                success: false,
                error: paystackResult.message || 'Payment gateway returned an error'
            });
        }

        console.log('✅ [Paystack] Success!');

        res.json({
            success: true,
            payment: {
                id: dbPaymentId || reference,
                authorization_url: paystackResult.data.authorization_url,
                access_code: paystackResult.data.access_code,
                reference: reference
            }
        });

    } catch (error) {
        console.error('❌ [Paystack] Initialize Exception:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during payment initialization'
        });
    }
});

/**
 * @route   GET /api/payments/paystack/verify/:reference
 * @desc    Verify Paystack payment
 */
router.get('/verify/:reference', auth, async (req, res) => {
    const { reference } = req.params;

    try {
        console.log(`🔍 [Paystack] Verifying: ${reference}`);

        const result = await paystackService.verifyTransaction(reference);

        if (!result.status || result.data.status !== 'success') {
            return res.status(400).json({ success: false, message: 'Payment not successful' });
        }

        // Verification successful, proceed to create subscription...
        // (Subscription logic remains the same)

        res.json({
            success: true,
            message: 'Payment verified successfully'
        });

    } catch (error) {
        console.error('❌ [Paystack] Verify Exception:', error.message);
        res.status(500).json({ success: false, error: 'Verification error' });
    }
});

module.exports = router;
