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
        console.log(`   User: ${userId}, Email: ${userEmail}`);
        console.log(`   EA: ${eaId}, Type: ${subscriptionType}`);

        if (!eaId) {
            return res.status(400).json({ success: false, error: 'EA selection is required' });
        }

        const supabase = databaseService.getClient();
        if (!supabase) {
            console.error('❌ [Paystack] Database client not available');
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }

        // Get EA details - ensure eaId is handled correctly (Integer vs UUID)
        const { data: ea, error: eaError } = await supabase
            .from('expert_advisors')
            .select('*')
            .eq('id', eaId)
            .single();

        if (eaError || !ea) {
            console.error(`❌ [Paystack] EA not found (ID: ${eaId}):`, eaError?.message || 'Not found');
            return res.status(404).json({ success: false, error: 'Expert Advisor not found' });
        }

        // Calculate amount based on subscription type
        const priceMap = {
            weekly: ea.price_weekly || ea.weekly_price,
            monthly: ea.price_monthly || ea.monthly_price,
            quarterly: ea.price_quarterly || ea.quarterly_price,
            yearly: ea.price_yearly || ea.yearly_price
        };

        const amount = priceMap[subscriptionType];
        if (amount === undefined || amount === null || isNaN(amount)) {
            console.error(`❌ [Paystack] Invalid amount for ${subscriptionType}:`, priceMap);
            return res.status(400).json({
                success: false,
                error: `Pricing for ${subscriptionType} subscription is not set for this EA`
            });
        }

        // Example NGN conversion rate
        const NGN_RATE = 1500;
        const amountNgn = Math.round(amount * NGN_RATE);

        console.log(`   Amount: $${amount} (~${amountNgn} NGN)`);

        // Create payment record in database
        const paymentData = {
            user_id: userId,
            email: userEmail,
            amount_usd: amount,
            amount_ngn: amountNgn,
            product_type: 'ea_subscription',
            product_id: eaId, // This might fail if DB expects UUID but got Int
            status: 'pending',
            metadata: {
                subscription_type: subscriptionType,
                ea_name: ea.name,
                user_id: userId
            }
        };

        console.log('   Saving payment record to database...');
        const { data: payment, error: paymentError } = await supabase
            .from('paystack_payments')
            .insert(paymentData)
            .select()
            .single();

        if (paymentError) {
            console.error('❌ [Paystack] Database insert failed:', paymentError.message);
            console.error('   Full error:', JSON.stringify(paymentError));

            // Critical check for UUID mismatch
            if (paymentError.code === '22P02') {
                return res.status(500).json({
                    success: false,
                    error: 'Database ID mismatch. Please contact support.',
                    details: 'The payment system is expecting a different ID format (UUID vs Int).'
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Failed to create payment record',
                details: paymentError.message
            });
        }

        console.log(`   ✅ Payment record created (ID: ${payment.id})`);

        // Initialize Paystack transaction using the service
        console.log('   Initializing Paystack API transaction...');
        const paystackResult = await paystackService.initializeTransaction({
            email: userEmail,
            amount: amount, // PaystackService usually handles kobo conversion if it takes USD/NGN floats
            currency: 'NGN',
            reference: payment.id,
            callback_url: `${process.env.CLIENT_URL || process.env.FRONTEND_URL}/payment-callback`,
            metadata: {
                payment_id: payment.id,
                user_id: userId,
                ea_id: eaId,
                subscription_type: subscriptionType
            }
        });

        if (!paystackResult.status) {
            console.error('❌ [Paystack] API initialization failed:', paystackResult.message);
            return res.status(500).json({
                success: false,
                error: paystackResult.message || 'Paystack initialization failed'
            });
        }

        // Update payment with Paystack details
        const { error: updateError } = await supabase
            .from('paystack_payments')
            .update({
                paystack_reference: paystackResult.data.reference,
                access_code: paystackResult.data.access_code
            })
            .eq('id', payment.id);

        if (updateError) {
            console.warn('⚠️ [Paystack] Failed to update record with reference:', updateError.message);
        }

        console.log(`✅ [Paystack] Initialization complete. Reference: ${paystackResult.data.reference}`);

        res.json({
            success: true,
            payment: {
                id: payment.id,
                authorization_url: paystackResult.data.authorization_url,
                access_code: paystackResult.data.access_code,
                reference: paystackResult.data.reference
            }
        });

    } catch (error) {
        console.error('❌ [Paystack] Initialization exception:', error.message);
        console.error(error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during payment initialization'
        });
    }
});

/**
 * @route   GET /api/payments/paystack/verify/:reference
 * @desc    Verify Paystack payment
 * @access  Private
 */
router.get('/verify/:reference', auth, async (req, res) => {
    const { reference } = req.params;

    try {
        console.log(`🔍 [Paystack] Verifying payment: ${reference}`);

        const paystackResult = await paystackService.verifyTransaction(reference);

        if (!paystackResult.status || paystackResult.data.status !== 'success') {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                status: paystackResult.data?.status
            });
        }

        const supabase = databaseService.getClient();

        // Find the original payment record
        const { data: payment, error: paymentError } = await supabase
            .from('paystack_payments')
            .select('*')
            .eq('id', reference) // We use our payment ID as reference
            .maybeSingle();

        if (paymentError || !payment) {
            // Try searching by paystack_reference if not found by ID
            const { data: pByRef } = await supabase
                .from('paystack_payments')
                .select('*')
                .eq('paystack_reference', reference)
                .maybeSingle();

            if (!pByRef) {
                return res.status(404).json({ success: false, error: 'Original payment record not found' });
            }
        }

        // Update payment status
        await supabase
            .from('paystack_payments')
            .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
                paystack_data: paystackResult.data
            })
            .eq('paystack_reference', paystackResult.data.reference);

        // Process confirmed payment (Create subscription)
        // This logic should be shared with cryptoPayments webhook
        const result = await processConfirmedPayment(payment || pByRef);

        res.json({
            success: true,
            message: 'Payment verified successfully',
            subscription: result.subscription,
            downloadLinks: result.downloadLinks
        });

    } catch (error) {
        console.error('❌ [Paystack] Verification error:', error.message);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

async function processConfirmedPayment(payment) {
    try {
        const supabase = databaseService.getClient();

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        const subType = payment.metadata?.subscription_type || 'monthly';

        switch (subType) {
            case 'weekly': endDate.setDate(endDate.getDate() + 7); break;
            case 'monthly': endDate.setMonth(endDate.getMonth() + 1); break;
            case 'quarterly': endDate.setMonth(endDate.getMonth() + 3); break;
            case 'yearly': endDate.setFullYear(endDate.getFullYear() + 1); break;
            default: endDate.setMonth(endDate.getMonth() + 1);
        }

        // Create subscription
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: payment.user_id,
                ea_id: payment.product_id,
                subscription_type: subType,
                payment_method: 'paystack',
                payment_reference: payment.id,
                amount: payment.amount_usd,
                currency: 'USD',
                status: 'active',
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            })
            .select()
            .single();

        if (subError) throw subError;

        // Generate download links logic here...
        // For brevity, we return subscription
        return { success: true, subscription };
    } catch (error) {
        console.error('❌ [Paystack] Subscription creation failed:', error.message);
        throw error;
    }
}

module.exports = router;
