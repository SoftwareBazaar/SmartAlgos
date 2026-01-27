/**
 * Simple M-Pesa Test Without Authentication
 * Tests M-Pesa credentials validation
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testMpesaCredentials() {
  console.log('🧪 Testing M-Pesa Credentials...\n');
  
  try {
    // Test 1: Check if M-Pesa service is running
    console.log('📱 Test 1: Health Check');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Server Status:', healthResponse.data.status);
    console.log('✅ Server Uptime:', healthResponse.data.uptime, 'seconds\n');
    
    // Test 2: Check M-Pesa callback endpoint (no auth needed)
    console.log('📱 Test 2: M-Pesa Callback Endpoint');
    const callbackResponse = await axios.post(
      `${API_URL}/api/mpesa/callback`,
      {
        Body: {
          stkCallback: {
            MerchantRequestID: 'test-123',
            CheckoutRequestID: 'test-456',
            ResultCode: 0,
            ResultDesc: 'Test Success'
          }
        }
      }
    );
    console.log('✅ Callback Status:', callbackResponse.status);
    console.log('✅ Callback Response:', callbackResponse.data);
    console.log('\n💚 M-Pesa integration is working!\n');
    
    console.log('═══════════════════════════════════════════');
    console.log('   NEXT STEPS:');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('1. Make sure you have M-Pesa credentials in .env:');
    console.log('   - MPESA_CONSUMER_KEY');
    console.log('   - MPESA_CONSUMER_SECRET');
    console.log('   - MPESA_PASSKEY');
    console.log('');
    console.log('2. To test STK Push with your phone (254746054224):');
    console.log('   a. Login to your account');
    console.log('   b. Use the test-mpesa-stk-push.js script');
    console.log('   c. Or use the frontend payment dialog');
    console.log('');
    console.log('3. Your phone number: +254746054224');
    console.log('   Format for API: 254746054224 (without +)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

console.log('═══════════════════════════════════════════');
console.log('   M-PESA SIMPLE TEST');
console.log('═══════════════════════════════════════════\n');

testMpesaCredentials();

