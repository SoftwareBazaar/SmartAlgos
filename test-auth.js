const axios = require('axios');

async function testAuth() {
  const baseURL = 'http://localhost:5000/api/auth';
  
  console.log('🧪 Testing Authentication Endpoints...\n');
  
  // Test 1: Login with existing admin user
  console.log('1️⃣ Testing Admin Login...');
  try {
    const loginResponse = await axios.post(`${baseURL}/login`, {
      email: 'admin@smartalgos.com',
      password: 'password123'
    });
    console.log('✅ Admin login successful!');
    console.log('   Status:', loginResponse.status);
    console.log('   User:', loginResponse.data.user.email);
    console.log('   Role:', loginResponse.data.user.role);
  } catch (error) {
    console.log('❌ Admin login failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
  }
  
  console.log('\n2️⃣ Testing User Login...');
  try {
    const loginResponse = await axios.post(`${baseURL}/login`, {
      email: 'user@smartalgos.com',
      password: 'password123'
    });
    console.log('✅ User login successful!');
    console.log('   Status:', loginResponse.status);
    console.log('   User:', loginResponse.data.user.email);
    console.log('   Role:', loginResponse.data.user.role);
  } catch (error) {
    console.log('❌ User login failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
  }
  
  console.log('\n3️⃣ Testing Registration...');
  try {
    const registerResponse = await axios.post(`${baseURL}/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      phone: '+1234567890',
      country: 'United States',
      tradingExperience: 'beginner'
    });
    console.log('✅ Registration successful!');
    console.log('   Status:', registerResponse.status);
    console.log('   User:', registerResponse.data.user.email);
    console.log('   Role:', registerResponse.data.user.role);
  } catch (error) {
    console.log('❌ Registration failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('   Validation Errors:', error.response.data.errors);
    }
  }
  
  console.log('\n🎯 Authentication test completed!');
}

// Run the test
testAuth().catch(console.error);
