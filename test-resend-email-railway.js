/**
 * Test script to manually resend email for subscription ID 15
 * Run this after Railway deployment completes
 */

const axios = require('axios');

// Configuration
const RAILWAY_URL = 'https://smartalgos-production.up.railway.app'; // Update if different
const SUBSCRIPTION_ID = 15;

// You need to get a valid auth token first
// Option 1: Login via the API
// Option 2: Copy token from browser localStorage after logging in

async function loginAndGetToken() {
  console.log('🔐 Logging in to get auth token...');
  
  // Replace with actual admin credentials
  const loginData = {
    email: 'wanyagajohn73@gmail.com', // User email
    password: 'YOUR_PASSWORD_HERE' // Replace with actual password
  };

  try {
    const response = await axios.post(`${RAILWAY_URL}/api/auth/login`, loginData);
    
    if (response.data.success && response.data.token) {
      console.log('✅ Login successful!');
      return response.data.token;
    } else {
      console.error('❌ Login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    return null;
  }
}

async function resendEmail(token) {
  console.log(`\n📧 Resending email for subscription ${SUBSCRIPTION_ID}...`);
  
  try {
    const response = await axios.post(
      `${RAILWAY_URL}/api/subscriptions/${SUBSCRIPTION_ID}/resend-email`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Sent to:', response.data.data.email);
      console.log('📨 Message ID:', response.data.data.messageId);
      console.log('\n✨ Check your inbox at wanyagajohn73@gmail.com');
    } else {
      console.error('❌ Failed to send email:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Resend email error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Token expired or invalid. Please login again.');
    }
  }
}

async function main() {
  console.log('🚀 Smart Algos - Resend Email Test\n');
  console.log('Target URL:', RAILWAY_URL);
  console.log('Subscription ID:', SUBSCRIPTION_ID);
  console.log('Expected recipient: wanyagajohn73@gmail.com\n');

  // Option 1: Login to get token
  const token = await loginAndGetToken();
  
  if (!token) {
    console.log('\n❌ Could not get auth token.');
    console.log('\n💡 Alternative: Copy token from browser:');
    console.log('   1. Login to https://smartalgos-production.up.railway.app');
    console.log('   2. Open browser console (F12)');
    console.log('   3. Run: localStorage.getItem("token")');
    console.log('   4. Copy the token and paste it below\n');
    console.log('   Then run: node test-resend-email-railway.js <YOUR_TOKEN>');
    return;
  }

  // Option 2: Use token from command line argument
  // const token = process.argv[2];
  // if (!token) {
  //   console.error('❌ Please provide auth token as argument');
  //   console.log('Usage: node test-resend-email-railway.js <YOUR_TOKEN>');
  //   return;
  // }

  await resendEmail(token);
}

main();
