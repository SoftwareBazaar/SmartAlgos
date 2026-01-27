const axios = require('axios');

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Connection...\n');
  
  // Configure axios like the frontend does
  axios.defaults.baseURL = 'http://localhost:5000';
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get('/api/health');
    console.log('✅ Health check passed:', health.data.status);
    
    // Test 2: Registration with exact same data as frontend would send
    console.log('\n2. Testing registration with frontend-like data...');
    const registrationData = {
      firstName: 'Software',
      lastName: 'Bazaar',
      email: 'softwarebazaar.ke@gmail.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      phone: '+254746054224',
      country: 'Kenya',
      tradingExperience: 'advanced'
    };
    
    console.log('Sending data:', JSON.stringify(registrationData, null, 2));
    
    const regResponse = await axios.post('/api/auth/register', registrationData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', regResponse.data);
    
  } catch (error) {
    console.log('❌ API test failed');
    console.log('Error:', error.message);
    console.log('Status:', error.response?.status);
    console.log('Response data:', error.response?.data);
    
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️  User already exists - this is expected');
      
      // Test login instead
      try {
        console.log('\n3. Testing login with existing user...');
        const loginResponse = await axios.post('/api/auth/login', {
          email: 'softwarebazaar.ke@gmail.com',
          password: 'SecurePass123!'
        });
        console.log('✅ Login successful!');
        console.log('User:', loginResponse.data.user.email);
      } catch (loginError) {
        console.log('❌ Login also failed:', loginError.response?.data?.message);
      }
    }
  }
}

testFrontendAPI();

