const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@smartalgos.com',
    password: 'Admin123!@#'
  },
  user: {
    email: 'test@smartalgos.com',
    password: 'Test123!@#'
  }
};

// Test user registration
async function testUserRegistration() {
  console.log('🧪 Testing user registration...');
  
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'newuser@test.com',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#',
    phone: '+254700000002',
    country: 'Kenya',
    tradingExperience: 'beginner',
    terms: true
  };

  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    if (response.data.success) {
      console.log('✅ User registration successful');
      console.log('📧 Email:', response.data.user.email);
      console.log('🔑 Token received:', response.data.token ? 'Yes' : 'No');
      return response.data.token;
    } else {
      console.log('❌ User registration failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ User registration error:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test user login
async function testUserLogin() {
  console.log('🧪 Testing user login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS.user);
    
    if (response.data.success) {
      console.log('✅ User login successful');
      console.log('👤 User role:', response.data.user.role);
      console.log('🔑 Token received:', response.data.token ? 'Yes' : 'No');
      return response.data.token;
    } else {
      console.log('❌ User login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ User login error:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test admin login
async function testAdminLogin() {
  console.log('🧪 Testing admin login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/admin/login`, TEST_CREDENTIALS.admin);
    
    if (response.data.success) {
      console.log('✅ Admin login successful');
      console.log('👤 User role:', response.data.user.role);
      console.log('🔑 Token received:', response.data.token ? 'Yes' : 'No');
      return response.data.token;
    } else {
      console.log('❌ Admin login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test protected route access
async function testProtectedRoute(token, route, description) {
  console.log(`🧪 Testing ${description}...`);
  
  try {
    const response = await axios.get(`${BASE_URL}${route}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log(`✅ ${description} access successful`);
      return true;
    } else {
      console.log(`❌ ${description} access failed:`, response.data.message);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} access error:`, error.response?.data?.message || error.message);
    return false;
  }
}

// Test admin route access with user token
async function testAdminAccessWithUserToken(userToken) {
  console.log('🧪 Testing admin route access with user token...');
  
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    console.log('✅ User can access user routes');
    return true;
  } catch (error) {
    console.log('❌ User cannot access user routes:', error.response?.data?.message || error.message);
    return false;
  }
}

// Main test function
async function runAuthTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  // Test 1: User Registration
  const registrationToken = await testUserRegistration();
  console.log('');
  
  // Test 2: User Login
  const userToken = await testUserLogin();
  console.log('');
  
  // Test 3: Admin Login
  const adminToken = await testAdminLogin();
  console.log('');
  
  // Test 4: Protected Route Access
  if (userToken) {
    await testProtectedRoute(userToken, '/auth/me', 'user profile access');
    console.log('');
  }
  
  if (adminToken) {
    await testProtectedRoute(adminToken, '/auth/me', 'admin profile access');
    console.log('');
  }
  
  // Test 5: User route access
  if (userToken) {
    await testAdminAccessWithUserToken(userToken);
    console.log('');
  }
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('┌─────────────────────────────────────────┐');
  console.log(`│ User Registration: ${registrationToken ? '✅ PASS' : '❌ FAIL'}                    │`);
  console.log(`│ User Login:        ${userToken ? '✅ PASS' : '❌ FAIL'}                    │`);
  console.log(`│ Admin Login:       ${adminToken ? '✅ PASS' : '❌ FAIL'}                    │`);
  console.log('└─────────────────────────────────────────┘');
  
  if (registrationToken && userToken && adminToken) {
    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your React app: cd client && npm start');
    console.log('2. Navigate to http://localhost:3000');
    console.log('3. Test the login forms with the credentials above');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server logs for details.');
  }
}

// Run tests if called directly
if (require.main === module) {
  runAuthTests().catch(console.error);
}

module.exports = { runAuthTests };