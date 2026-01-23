// routes/paystackPayments.js - PAYSTACK SUBSCRIPTION INTEGRATION

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const databaseService = require('../services/databaseService');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get Paystack configuration (Public Key)
router.get('/config', auth, (req, res) => {
    res.json({
        success: true,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || ''
    });
});

// Initialize Paystack payment for EA subscription
router.post('/initialize', auth, async (req, res) => {
    const { eaId, subscriptionType, email } = req.body;
    const userId = req.user?.id;

    try {
        console.log('💳 Initializing Paystack payment...');

        const supabase = databaseService.getClient();

        // Get EA details
        const { data: ea, error: eaError } = await supabase
            .from('expert_advisors')
            .select('*')
            .eq('id', eaId)
            .single();

        if (eaError || !ea) {
            return res.status(404).json({ success: false, error: 'EA not found' });
        }

        // Calculate amount based on subscription type
        const priceMap = {
            weekly: ea.price_weekly,
            monthly: ea.price_monthly,
            quarterly: ea.price_quarterly,
            yearly: ea.price_yearly
        };

        const amount = priceMap[subscriptionType];
        if (!amount) {
            return res.status(400).json({ success: false, error: 'Invalid subscription type' });
        }

        // Convert to kobo (Paystack uses smallest currency unit)
        const amountInKobo = Math.round(amount * 100);

        // Create payment record in database
        const { data: payment, error: paymentError } = await supabase
            .from('paystack_payments')
            .insert({
                user_id: userId,
                email: email,
                amount_usd: amount,
                amount_ngn: amount * 1500, // Example conversion rate - update with real rate
                product_type: 'ea_subscription',
                product_id: eaId,
                status: 'pending',
                metadata: {
                    subscription_type: subscriptionType,
                    ea_name: ea.name
                }
            })
            .select()
            .single();

        if (paymentError) {
            console.error('❌ Error creating payment record:', paymentError);
            return res.status(500).json({ success: false, error: 'Failed to create payment' });
        }

        // Initialize Paystack transaction
        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: email,
                amount: amountInKobo,
                currency: 'NGN', // or USD, KES depending on your setup
                reference: payment.id, // Use our payment ID as reference
                callback_url: `${process.env.FRONTEND_URL || process.env.CLIENT_URL}/payment-callback`,
                metadata: {
                    payment_id: payment.id,
                    user_id: userId,
                    ea_id: eaId,
                    subscription_type: subscriptionType,
                    cancel_action: `${process.env.FRONTEND_URL || process.env.CLIENT_URL}/marketplace`
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!paystackResponse.data.status) {
            return res.status(500).json({
                success: false,
                error: 'Failed to initialize Paystack payment'
            });
        }

        // Update payment with Paystack reference
        await supabase
            .from('paystack_payments')
            .update({
                paystack_reference: paystackResponse.data.data.reference,
                access_code: paystackResponse.data.data.access_code
            })
            .eq('id', payment.id);

        console.log('✅ Paystack payment initialized');

        res.json({
            success: true,
            payment: {
                id: payment.id,
                authorization_url: paystackResponse.data.data.authorization_url,
                access_code: paystackResponse.data.data.access_code,
                reference: paystackResponse.data.data.reference
            }
        });

    } catch (error) {
        console.error('❌ Paystack initialization error:', error);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
});

// Verify Paystack payment
router.get('/verify/:reference', async (req, res) => {
    const { reference } = req.params;

    try {
        console.log(`🔍 Verifying Paystack payment: ${reference}`);

        // Verify with Paystack
        const paystackResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const verification = paystackResponse.data;

        if (!verification.status) {
            return res.status(400).json({
                success: false,
                error: 'Payment verification failed'
            });
        }

        const transactionData = verification.data;

        // Check if payment was successful
        if (transactionData.status !== 'success') {
            return res.json({
                success: false,
                status: transactionData.status,
                message: 'Payment was not successful'
            });
        }

        const supabase = databaseService.getClient();

        // Get our payment record
        const { data: payment, error: paymentError } = await supabase
            .from('paystack_payments')
            .select('*')
            .eq('id', transactionData.reference)
            .single();

        if (paymentError || !payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment record not found'
            });
        }

        // Check if already processed (idempotency)
        if (payment.status === 'confirmed') {
            console.log('✅ Payment already confirmed, fetching subscription...');

            const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('payment_reference', payment.id)
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

        // Update payment status
        await supabase
            .from('paystack_payments')
            .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
                paystack_data: transactionData
            })
            .eq('id', payment.id);

        // Process the payment (create subscription and generate downloads)
        const result = await processConfirmedPayment(payment);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error || 'Failed to process payment'
            });
        }

        console.log('✅ Paystack payment verified and processed');

        res.json({
            success: true,
            message: 'Payment verified successfully',
            subscription: result.subscription,
            downloadLinks: result.downloadLinks
        });

    } catch (error) {
        console.error('❌ Paystack verification error:', error);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
});

// Paystack webhook endpoint (for automatic payment confirmation)
router.post('/webhook', async (req, res) => {
    try {
        // Verify webhook signature
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            console.error('❌ Invalid webhook signature');
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;
        console.log('📬 Paystack webhook received:', event.event);

        const supabase = databaseService.getClient();

        // Handle successful payment
        if (event.event === 'charge.success') {
            const transactionData = event.data;

            // Get payment record
            const { data: payment } = await supabase
                .from('paystack_payments')
                .select('*')
                .eq('id', transactionData.reference)
                .single();

            if (payment && payment.status === 'pending') {
                // Update payment status
                await supabase
                    .from('paystack_payments')
                    .update({
                        status: 'confirmed',
                        confirmed_at: new Date().toISOString(),
                        paystack_data: transactionData
                    })
                    .eq('id', payment.id);

                // Process payment (create subscription)
                await processConfirmedPayment(payment);

                console.log('✅ Webhook processed successfully');
            }
        }

        res.status(200).send('Webhook received');

    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).send('Webhook processing failed');
    }
});

// Process confirmed payment - creates subscription and generates download links
async function processConfirmedPayment(payment) {
    try {
        console.log('🔄 Processing confirmed Paystack payment...');

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

// Generate JWT-protected download links (SAME AS CRYPTO)
async function generateDownloadLinksForSubscription(subscription, userId, eaId) {
    try {
        console.log('🔗 Generating download links...');

        const supabase = databaseService.getClient();

        // Get EA file paths
        const { data: ea, error } = await supabase
            .from('expert_advisors')
            .select('ea_file_path, set_file_path, manual_file_path, name')
            .eq('id', eaId)
            .single();

        if (error || !ea) {
            throw new Error('EA not found');
        }

        // Generate JWT token (valid for 24 hours)
        const token = jwt.sign(
            {
                subscriptionId: subscription.id,
                userId: userId,
                eaId: eaId,
                type: 'download'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

        // Generate download URLs
        const downloadLinks = {
            ea_file: ea.ea_file_path ? `${baseUrl}/api/downloads/ea/${eaId}?token=${token}&type=ea_file` : null,
            set_file: ea.set_file_path ? `${baseUrl}/api/downloads/ea/${eaId}?token=${token}&type=set_file` : null,
            manual: ea.manual_file_path ? `${baseUrl}/api/downloads/ea/${eaId}?token=${token}&type=manual` : null
        };

        console.log('✅ Download links generated');

        return downloadLinks;

    } catch (error) {
        console.error('❌ Generate links error:', error);
        return { ea_file: null, set_file: null, manual: null };
    }
}

module.exports = router;
