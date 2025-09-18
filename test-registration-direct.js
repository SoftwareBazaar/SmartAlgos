const axios = require('axios');

async function testRegistrationDirect() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing registration endpoint directly...\n');
  
  // Test health first
  try {
    const health = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Server is healthy:', health.data.status);
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
    return;
  }
  
  // Test user registration
  const testUserData = {
    firstName: 'Test',
    lastName: 'Registration',
    email: 'test.registration@example.com',
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
    phone: '+254700000000',
    country: 'Kenya',
    tradingExperience: 'advanced'
  };
  
  try {
    console.log('\n📤 Sending registration request...');
    console.log('Data:', JSON.stringify(testUserData, null, 2));
    
    const response = await axios.post(`${baseURL}/api/auth/register`, testUserData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Registration failed');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Message:', error.response?.data?.message);
    console.log('Error Details:', error.response?.data?.errors);
    console.log('Full Response Data:', error.response?.data);
    
    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      console.log('❌ Connection issue - server may not be running');
    }
    
    if (error.message.includes('timeout')) {
      console.log('❌ Request timed out - server may be hanging');
    }
    
    if (error.response?.status === 500) {
      console.log('❌ Internal server error - check server logs');
    }
  }
}

testRegistrationDirect();
