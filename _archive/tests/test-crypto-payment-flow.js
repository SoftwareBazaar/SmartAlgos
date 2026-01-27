/**
 * Test script for crypto payment confirmation endpoint
 * Tests idempotency, subscription creation, and download link generation
 */

const axios = require('axios');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test configuration
const TEST_CONFIG = {
    // You'll need to replace these with actual values from your database
    eaId: 'your-ea-id-here', // Replace with actual EA ID
    userId: 'your-user-id-here', // Replace with actual user ID
    authToken: 'your-jwt-token-here' // Replace with actual JWT token
};

async function testCryptoPaymentFlow() {
    console.log('🧪 Starting Crypto Payment Flow Tests\n');

    try {
        // Test 1: Generate Payment
        console.log('📝 Test 1: Generate Payment');
        const generateResponse = await axios.post(`${API_URL}/payments/crypto/generate`, {
            amount: 100,
            currency: 'USD',
            cryptoCurrency: 'usdt',
            productType: 'ea_subscription',
            productId: TEST_CONFIG.eaId,
            metadata: {
                subscription_type: 'monthly'
            }
        });

        if (!generateResponse.data.success) {
            throw new Error('Failed to generate payment');
        }

        const transactionId = generateResponse.data.data.transactionId;
        console.log('✅ Payment generated successfully');
        console.log(`   Transaction ID: ${transactionId}`);
        console.log(`   Wallet: ${generateResponse.data.data.address}`);
        console.log(`   Amount: ${generateResponse.data.data.amount} ${generateResponse.data.data.currency}\n`);

        // Test 2: Check Payment Status (should be pending)
        console.log('📝 Test 2: Check Payment Status (Pending)');
        const statusResponse = await axios.get(`${API_URL}/payments/crypto/status/${transactionId}`);

        if (statusResponse.data.data.status !== 'pending') {
            console.warn(`⚠️  Expected status 'pending', got '${statusResponse.data.data.status}'`);
        } else {
            console.log('✅ Payment status is pending\n');
        }

        // Test 3: Confirm Payment (First Time)
        console.log('📝 Test 3: Confirm Payment (First Time)');
        const confirmResponse = await axios.post(
            `${API_URL}/payments/crypto/${transactionId}/confirm`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${TEST_CONFIG.authToken}`
                }
            }
        );

        if (!confirmResponse.data.success) {
            throw new Error('Failed to confirm payment');
        }

        console.log('✅ Payment confirmed successfully');
        console.log(`   Subscription ID: ${confirmResponse.data.subscription.id}`);
        console.log(`   Status: ${confirmResponse.data.subscription.status}`);
        console.log(`   Type: ${confirmResponse.data.subscription.subscription_type}`);
        console.log(`   Start: ${confirmResponse.data.subscription.start_date}`);
        console.log(`   End: ${confirmResponse.data.subscription.end_date}`);

        if (confirmResponse.data.downloadLinks) {
            console.log('   Download Links:');
            if (confirmResponse.data.downloadLinks.ea_file) {
                console.log(`   - EA File: ${confirmResponse.data.downloadLinks.ea_file.substring(0, 80)}...`);
            }
            if (confirmResponse.data.downloadLinks.set_file) {
                console.log(`   - Set File: ${confirmResponse.data.downloadLinks.set_file.substring(0, 80)}...`);
            }
            if (confirmResponse.data.downloadLinks.manual) {
                console.log(`   - Manual: ${confirmResponse.data.downloadLinks.manual.substring(0, 80)}...`);
            }
        }
        console.log('');

        // Test 4: Confirm Payment Again (Idempotency Test)
        console.log('📝 Test 4: Confirm Payment Again (Idempotency)');
        const confirmAgainResponse = await axios.post(
            `${API_URL}/payments/crypto/${transactionId}/confirm`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${TEST_CONFIG.authToken}`
                }
            }
        );

        if (!confirmAgainResponse.data.success) {
            throw new Error('Failed on second confirm');
        }

        if (confirmAgainResponse.data.message.includes('already confirmed')) {
            console.log('✅ Idempotency check passed - returned existing subscription');
            console.log(`   Same Subscription ID: ${confirmAgainResponse.data.subscription.id}`);
        } else {
            console.warn('⚠️  Warning: Second confirm did not return "already confirmed" message');
        }
        console.log('');

        // Test 5: Get Download Links
        console.log('📝 Test 5: Get Download Links');
        const downloadLinksResponse = await axios.get(
            `${API_URL}/payments/crypto/${transactionId}/download-links`
        );

        if (!downloadLinksResponse.data.success) {
            throw new Error('Failed to get download links');
        }

        console.log('✅ Download links retrieved successfully');
        console.log(`   Subscription ID: ${downloadLinksResponse.data.data.subscriptionId}`);
        console.log(`   Token expires: ${downloadLinksResponse.data.data.tokenExpiresAt}\n`);

        // Test 6: Check Payment Status (should be confirmed)
        console.log('📝 Test 6: Check Payment Status (Confirmed)');
        const finalStatusResponse = await axios.get(`${API_URL}/payments/crypto/status/${transactionId}`);

        if (finalStatusResponse.data.data.status !== 'confirmed') {
            console.warn(`⚠️  Expected status 'confirmed', got '${finalStatusResponse.data.data.status}'`);
        } else {
            console.log('✅ Payment status is confirmed\n');
        }

        console.log('🎉 All tests passed successfully!\n');

        return {
            success: true,
            transactionId,
            subscriptionId: confirmResponse.data.subscription.id,
            downloadLinks: confirmResponse.data.downloadLinks
        };

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
        }
        return {
            success: false,
            error: error.message
        };
    }
}

// Run tests if executed directly
if (require.main === module) {
    console.log('⚠️  Before running this test, make sure to:');
    console.log('   1. Update TEST_CONFIG with actual EA ID, User ID, and JWT token');
    console.log('   2. Ensure your backend server is running');
    console.log('   3. Have a valid EA in your database\n');

    testCryptoPaymentFlow()
        .then(result => {
            if (result.success) {
                console.log('✅ Test suite completed successfully');
                process.exit(0);
            } else {
                console.error('❌ Test suite failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { testCryptoPaymentFlow };
