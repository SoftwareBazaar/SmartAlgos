const express = require('express');
const router = express.Router();
const axios = require('axios');
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

        // Get EA details using databaseService (handles mock mode and type casting)
        let ea = null;
        try {
            ea = await databaseService.getEAById(eaId);
        } catch (eaError) {
            console.warn(`⚠️ [Paystack] EA fetch warning (ID: ${eaId}):`, eaError.message);
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
        const KES_RATE = 150; // 1 USD = 150 KES
        // Paystack expects amount in kobo (lowest currency unit). 
        // So we multiply by 100.
        const amountKes = Math.round(amountUsd * KES_RATE * 100);

        console.log(`   Converting $${amountUsd} USD to ${amountKes} kobo (Rate: ${KES_RATE})`);

        // Create a unique reference with more entropy to prevent duplicates
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 15);
        const reference = `ALGO-${timestamp}-${randomPart}`;

        // ATTEMPT to save to database but DON'T fail if it crashes
        let dbPaymentId = null;
        try {
            const supabase = databaseService.getClient();
            if (supabase) {
                // DB DEBUGGING
                console.log('📝 [Paystack] Attempting DB Insert:', {
                    user_id: userId,
                    email: userEmail,
                    amount_usd: amountUsd,
                    reference: reference
                });

                const { data: payment, error: pError } = await supabase
                    .from('paystack_payments')
                    .insert({
                        user_id: userId,
                        email: userEmail,
                        amount_usd: amountUsd,
                        amount_ngn: amountKes,
                        product_type: 'ea_subscription',
                        product_id: eaId,
                        status: 'pending',
                        paystack_reference: reference,
                        metadata: { subscription_type: subscriptionType, ea_name: ea.name }
                    })
                    .select()
                    .single();

                if (payment) {
                    console.log('✅ [Paystack] DB Record Created:', payment.id);
                    dbPaymentId = payment.id;
                }

                if (pError) {
                    // ENHANCED ERROR LOGGING
                    console.error('❌ [Paystack] DB Insert Error Details:', {
                        message: pError.message,
                        code: pError.code,
                        details: pError.details,
                        hint: pError.hint
                    });

                    if (pError.message.includes('schema cache')) {
                        console.warn('💡 [Hint] The table might exist but PostgREST schema cache is stale. Try restarting the database/server.');
                    }
                }
            } else {
                console.warn('⚠️ [Paystack] Supabase client is null');
            }
        } catch (dbErr) {
            console.error('❌ [Paystack] Unexpected DB Exception:', dbErr.message);
        }

        // CONSTRUCT ABSOLUTE CALLBACK URL (Paystack requires absolute URLs)
        const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
        const callbackUrl = `${baseUrl.replace(/\/$/, '')}/payment-callback`;

        console.log('   Calling Paystack API with payload:', JSON.stringify({
            email: userEmail,
            amount: amountKes,
            currency: 'KES',
            reference: reference,
            callback_url: callbackUrl
        }));

        const paystackResult = await paystackService.initializeTransaction({
            email: userEmail,
            amount: amountKes,
            currency: 'KES',
            reference: reference,
            callback_url: callbackUrl,
            metadata: {
                payment_id: dbPaymentId,
                user_id: userId,
                ea_id: eaId,
                subscription_type: subscriptionType
            }
        });

        console.log('   Paystack API result received status:', paystackResult?.status);

        if (!paystackResult || !paystackResult.status || !paystackResult.data) {
            console.error('❌ [Paystack] API Error Result:', paystackResult?.message || 'Invalid response');
            return res.status(500).json({
                success: false,
                error: paystackResult?.message || 'Payment gateway returned an invalid response'
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
        console.error('   Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during payment initialization',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        console.log(`\n🔍 [Paystack] ========== PAYMENT VERIFICATION START ==========`);
        console.log(`🔍 [Paystack] Reference: ${reference}`);
        console.log(`🔍 [Paystack] User ID: ${req.user?.id}`);
        console.log(`🔍 [Paystack] User Email: ${req.user?.email}`);

        const result = await paystackService.verifyTransaction(reference);

        console.log(`📊 [Paystack] Verification result:`, result.status);

        if (!result.status || result.data.status !== 'success') {
            console.log(`❌ [Paystack] Payment not successful:`, result.data.status);
            return res.status(400).json({ success: false, message: 'Payment not successful' });
        }

        const txData = result.data;
        const metadata = txData.metadata || {};

        console.log(`✅ [Paystack] Payment successful!`);
        console.log(`💰 [Paystack] Amount: ${txData.amount / 100} ${txData.currency}`);
        console.log(`📧 [Paystack] Customer Email: ${txData.customer.email}`);

        // Extract data from metadata or falling back to transaction details
        const eaId = metadata.ea_id || metadata.product_id;
        const userId = metadata.user_id || req.user.id;
        const subscriptionType = metadata.subscription_type || 'monthly';
        const amountUsd = metadata.amount_usd || (txData.amount / 100 / 150); // Fallback estimate
        const userEmail = txData.customer.email; // Get email from Paystack transaction

        console.log(`📦 [Paystack] EA ID: ${eaId}`);
        console.log(`👤 [Paystack] User ID: ${userId}`);
        console.log(`📅 [Paystack] Subscription Type: ${subscriptionType}`);
        console.log(`💵 [Paystack] Amount USD: $${amountUsd}`);

        // 1. Check if subscription already created for this reference (idempotency)
        const supabase = databaseService.getClient();
        if (supabase) {
            const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('payment_reference', reference)
                .single();

            if (existingSub) {
                console.log('ℹ️ [Paystack] Subscription already exists for this reference');
                return res.json({
                    success: true,
                    message: 'Payment already processed',
                    subscription: existingSub
                });
            }
        }

        console.log(`🔄 [Paystack] Creating subscription...`);

        // 2. Create the subscription
        const startDate = new Date();
        const endDate = new Date();
        switch (subscriptionType) {
            case 'weekly': endDate.setDate(startDate.getDate() + 7); break;
            case 'monthly': endDate.setMonth(startDate.getMonth() + 1); break;
            case 'quarterly': endDate.setMonth(startDate.getMonth() + 3); break;
            case 'yearly': endDate.setFullYear(startDate.getFullYear() + 1); break;
            default: endDate.setMonth(startDate.getMonth() + 1);
        }

        const subscriptionData = {
            user_id: userId,
            ea_id: eaId,
            subscription_type: subscriptionType,
            price: amountUsd,
            currency: 'USD',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            payment_method: 'paystack',
            payment_reference: reference,
            payment_status: 'completed',
            status: 'active',
            created_at: new Date().toISOString()
        };

        const subscription = await databaseService.createSubscription(subscriptionData);
        console.log(`✅ [Paystack] Subscription created: ${subscription.id}`);

        // 3. Update the payment record status if it exists
        if (supabase) {
            await supabase
                .from('paystack_payments')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .eq('paystack_reference', reference);
        }

        console.log(`🔄 [Paystack] Generating download links...`);

        // 4. Generate download links (Copied from subscriptions.js)
        const ea = await databaseService.getEAById(eaId);
        
        console.log(`📦 [Paystack] EA Name: ${ea.name}`);
        console.log(`📦 [Paystack] EA has ZIP: ${!!ea.zip_file_path}`);
        
        const jwt = require('jsonwebtoken');
        const downloadToken = jwt.sign(
            { subscriptionId: subscription.id, userId, eaId, timestamp: Date.now() },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
        
        // Priority: ZIP package first, then individual files as fallback
        const downloadLinks = {
            zip_package: ea.zip_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}/zip?token=${downloadToken}` : null,
            ea_file: ea.ea_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=ea_file` : null,
            set_file: ea.set_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=set_file` : null,
            manual: ea.manual_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=manual` : null
        };

        console.log(`✅ [Paystack] Download links generated`);
        console.log(`🔗 [Paystack] ZIP package: ${downloadLinks.zip_package ? 'YES' : 'NO'}`);

        // 🎯 NEW: Send email with download links
        try {
            const emailService = require('../services/emailService');
            
            // Get user details
            const { data: user } = await supabase
                .from('users')
                .select('email, first_name, last_name')
                .eq('id', userId)
                .single();

            const finalUserEmail = user?.email || userEmail; // Use DB email or Paystack email
            const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Valued Customer';
            
            console.log(`\n📧 [Paystack] ========== SENDING EMAIL ==========`);
            console.log(`📧 [Paystack] To: ${finalUserEmail}`);
            console.log(`📧 [Paystack] User Name: ${userName}`);
            console.log(`📧 [Paystack] EA Name: ${ea.name}`);
            console.log(`📧 [Paystack] Subscription Type: ${subscriptionType}`);
            
            const emailResult = await emailService.sendDownloadEmail({
                userEmail: finalUserEmail,
                userName: userName,
                eaName: ea.name,
                downloadLinks: downloadLinks,
                subscriptionType: subscriptionType,
                subscriptionId: subscription.id
            });

            if (emailResult.success) {
                console.log(`✅ [Paystack] Email sent successfully!`);
                console.log(`📬 [Paystack] Message ID: ${emailResult.messageId}`);
            } else {
                console.error(`❌ [Paystack] Email failed: ${emailResult.error}`);
            }
            console.log(`📧 [Paystack] ========== EMAIL PROCESS COMPLETE ==========\n`);
        } catch (emailError) {
            console.error(`❌ [Paystack] Email error:`, emailError.message);
            console.error(emailError);
            // Don't fail the whole process if email fails
        }

        console.log(`🔍 [Paystack] ========== PAYMENT VERIFICATION COMPLETE ==========\n`);

        res.json({
            success: true,
            message: 'Payment verified and subscription activated successfully!',
            subscription,
            downloadLinks
        });

    } catch (error) {
        console.error('❌ [Paystack] Verify Exception:', error.message);
        console.error(error.stack);
        res.status(500).json({ success: false, error: 'Verification error: ' + error.message });
    }
});

module.exports = router;
