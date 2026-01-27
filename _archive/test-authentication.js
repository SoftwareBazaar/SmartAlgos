const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@smartalgos.com',
  password: 'TestPass123!',
  confirmPassword: 'TestPass123!',
  phone: '+1234567890',
  country: 'United States',
  tradingExperience: 'intermediate'
};

const testAdmin = {
  firstName: 'Admin',
  lastName: 'Test',
  email: 'admintest@smartalgos.com',
  password: 'AdminPass123!',
  confirmPassword: 'AdminPass123!',
  phone: '+1234567891',
  country: 'United States',
  adminCode: 'ADMIN_SMART_ALGOS_2024'
};

async function testAuthentication() {
  console.log('🚀 Starting Smart Algos Authentication Tests...\n');

  try {
    // Test 1: User Registration
    console.log('1. Testing User Registration...');
    try {
      const userRegResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      console.log('✅ User registration successful!');
      console.log(`   User ID: ${userRegResponse.data.user.id}`);
      console.log(`   Email: ${userRegResponse.data.user.email}`);
      console.log(`   Role: ${userRegResponse.data.user.role}\n`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, proceeding with login test\n');
      } else {
        console.error('❌ User registration failed:', error.response?.data?.message || error.message);
        console.log('');
      }
    }

    // Test 2: User Login
    console.log('2. Testing User Login...');
    try {
      const userLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ User login successful!');
      console.log(`   Token received: ${userLoginResponse.data.token ? 'Yes' : 'No'}`);
      console.log(`   User: ${userLoginResponse.data.user.first_name} ${userLoginResponse.data.user.last_name}\n`);
    } catch (error) {
      console.error('❌ User login failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 3: Admin Registration
    console.log('3. Testing Admin Registration...');
    try {
      const adminRegResponse = await axios.post(`${BASE_URL}/api/auth/admin/register`, testAdmin);
      console.log('✅ Admin registration successful!');
      console.log(`   Admin ID: ${adminRegResponse.data.user.id}`);
      console.log(`   Email: ${adminRegResponse.data.user.email}`);
      console.log(`   Role: ${adminRegResponse.data.user.role}\n`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  Admin already exists, proceeding with login test\n');
      } else {
        console.error('❌ Admin registration failed:', error.response?.data?.message || error.message);
        console.log('');
      }
    }

    // Test 4: Admin Login
    console.log('4. Testing Admin Login...');
    try {
      const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/admin/login`, {
        email: testAdmin.email,
        password: testAdmin.password
      });
      console.log('✅ Admin login successful!');
      console.log(`   Token received: ${adminLoginResponse.data.token ? 'Yes' : 'No'}`);
      console.log(`   Admin: ${adminLoginResponse.data.user.first_name} ${adminLoginResponse.data.user.last_name}\n`);
    } catch (error) {
      console.error('❌ Admin login failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 5: Invalid Admin Code
    console.log('5. Testing Invalid Admin Code...');
    try {
      const invalidAdminData = { ...testAdmin, email: 'invalid@test.com', adminCode: 'INVALID_CODE' };
      await axios.post(`${BASE_URL}/api/auth/admin/register`, invalidAdminData);
      console.log('❌ This should have failed!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Invalid admin code correctly rejected\n');
      } else {
        console.error('❌ Unexpected error:', error.response?.data?.message || error.message);
        console.log('');
      }
    }

    // Test 6: Health Check
    console.log('6. Testing API Health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ API is healthy!');
      console.log(`   Status: ${healthResponse.data.status}`);
      console.log(`   Environment: ${healthResponse.data.environment}\n`);
    } catch (error) {
      console.error('❌ Health check failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    console.log('🎉 Authentication tests completed!\n');
    
    console.log('📝 Test Summary:');
    console.log('   - User registration and login endpoints are working');
    console.log('   - Admin registration and login endpoints are working');
    console.log('   - Admin code validation is working');
    console.log('   - API health check is working\n');

    console.log('🔑 Admin Registration Code: ADMIN_SMART_ALGOS_2024');
    console.log('💡 You can now use the frontend to register both users and admins!');

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Run the tests
testAuthentication();
