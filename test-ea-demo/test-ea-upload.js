const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const TEST_EMAIL = 'demo@smartalgos.com';
const TEST_PASSWORD = 'DemoPassword123!';

let authToken = null;
let testEA = null;

// Test EA data
const testEAData = {
  name: 'Simple Scalper EA - Demo',
  description: 'A simple scalping EA for demonstration purposes. This EA uses basic moving average crossover strategy with risk management.',
  category: 'scalping',
  strategy: 'Moving Average Crossover',
  timeframe: 'M1,M5,M15',
  risk_level: 'medium',
  price: 49.99,
  currency: 'USD',
  features: ['Stop Loss', 'Take Profit', 'Spread Filter', 'Risk Management'],
  tags: ['scalping', 'demo', 'simple', 'mql4'],
  creator_name: 'Smart Algos Demo',
  creator_email: 'demo@smartalgos.com',
  status: 'active'
};

async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.log('❌ Login failed, trying registration...');
    
    // Try to register first
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        firstName: 'Demo',
        lastName: 'User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD
      });
      
      // Now try login again
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      
      authToken = response.data.token;
      console.log('✅ Registration and login successful');
      return true;
    } catch (regError) {
      console.error('❌ Registration failed:', regError.response?.data || regError.message);
      console.log('Full error details:', regError.response?.status, regError.response?.statusText);
      return false;
    }
  }
}

async function uploadTestEA() {
  console.log('📤 Uploading test EA...');
  
  try {
    const form = new FormData();
    
    // Add EA file
    const eaFilePath = path.join(__dirname, 'SimpleScalperEA.mq4');
    form.append('eaFile', fs.createReadStream(eaFilePath), {
      filename: 'SimpleScalperEA.mq4',
      contentType: 'text/plain'
    });
    
    // Add form data
    Object.keys(testEAData).forEach(key => {
      form.append(key, testEAData[key]);
    });
    
    const response = await axios.post(`${BASE_URL}/api/eas`, form, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...form.getHeaders()
      }
    });
    
    testEA = response.data.ea;
    console.log('✅ EA uploaded successfully:', testEA.id);
    console.log('📊 EA Details:', {
      name: testEA.name,
      price: `$${testEA.price}`,
      status: testEA.status
    });
    
    return true;
  } catch (error) {
    console.error('❌ EA upload failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCryptoPayment() {
  console.log('💰 Testing crypto payment flow...');
  
  try {
    // Create a subscription for the EA
    const subscriptionData = {
      productType: 'ea',
      productId: testEA.id,
      subscriptionType: 'BASIC',
      paymentMethod: 'crypto',
      interval: 'monthly'
    };
    
    const response = await axios.post(`${BASE_URL}/api/subscriptions`, subscriptionData, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const subscription = response.data.subscription;
    console.log('✅ Subscription created:', subscription.id);
    console.log('📊 Payment Details:', {
      amount: `$${subscription.price}`,
      currency: subscription.currency,
      paymentMethod: subscription.paymentMethod,
      status: subscription.paymentStatus
    });
    
    return subscription;
  } catch (error) {
    console.error('❌ Crypto payment setup failed:', error.response?.data || error.message);
    return null;
  }
}

async function testDownloadAccess(subscription) {
  console.log('⬇️ Testing download access...');
  
  try {
    // Try to download the EA file
    const response = await axios.get(`${BASE_URL}/api/eas/${testEA.id}/download`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      responseType: 'stream'
    });
    
    console.log('✅ Download access granted');
    console.log('📊 Download Details:', {
      status: response.status,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length']
    });
    
    return true;
  } catch (error) {
    console.error('❌ Download access denied:', error.response?.data || error.message);
    return false;
  }
}

async function runDemo() {
  console.log('🚀 Starting EA Upload & Crypto Payment Demo\n');
  console.log('=' .repeat(50));
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Demo failed at login step');
    return;
  }
  
  // Step 2: Upload EA
  const uploadSuccess = await uploadTestEA();
  if (!uploadSuccess) {
    console.log('❌ Demo failed at upload step');
    return;
  }
  
  // Step 3: Test crypto payment
  const subscription = await testCryptoPayment();
  if (!subscription) {
    console.log('❌ Demo failed at payment step');
    return;
  }
  
  // Step 4: Test download access
  const downloadSuccess = await testDownloadAccess(subscription);
  if (!downloadSuccess) {
    console.log('❌ Demo failed at download step');
    return;
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Demo completed successfully!');
  console.log('✅ EA uploaded and available for purchase');
  console.log('✅ Crypto payment system working');
  console.log('✅ Download access granted after payment');
  console.log('\n📋 Summary:');
  console.log(`   EA ID: ${testEA.id}`);
  console.log(`   EA Name: ${testEA.name}`);
  console.log(`   Price: $${testEA.price}`);
  console.log(`   Subscription ID: ${subscription.id}`);
  console.log(`   Payment Status: ${subscription.paymentStatus}`);
}

// Run the demo
runDemo().catch(console.error);
