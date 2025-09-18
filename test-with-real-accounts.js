const axios = require('axios');

async function testWithRealAccounts() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing authentication with real accounts...\n');
  
  // Test 1: User Login
  console.log('1. Testing user login...');
  try {
    const userLogin = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'testuser@smartalgos.com',
      password: 'TestUser123!'
    });
    console.log('✅ User login successful!');
    console.log(`   User: ${userLogin.data.user.first_name} ${userLogin.data.user.last_name}`);
    console.log(`   Role: ${userLogin.data.user.role}`);
    console.log(`   Token: ${userLogin.data.token ? 'Generated' : 'Not generated'}\n`);
  } catch (error) {
    console.log('❌ User login failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('   Errors:', error.response.data.errors);
    }
    console.log('');
  }
  
  // Test 2: Admin Login
  console.log('2. Testing admin login...');
  try {
    const adminLogin = await axios.post(`${baseURL}/api/auth/admin/login`, {
      email: 'admintest@smartalgos.com',
      password: 'AdminTest123!'
    });
    console.log('✅ Admin login successful!');
    console.log(`   Admin: ${adminLogin.data.user.first_name} ${adminLogin.data.user.last_name}`);
    console.log(`   Role: ${adminLogin.data.user.role}`);
    console.log(`   Token: ${adminLogin.data.token ? 'Generated' : 'Not generated'}\n`);
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('   Errors:', error.response.data.errors);
    }
    console.log('');
  }
  
  // Test 3: User Registration
  console.log('3. Testing new user registration...');
  try {
    const newUserReg = await axios.post(`${baseURL}/api/auth/register`, {
      firstName: 'New',
      lastName: 'User',
      email: 'newuser@smartalgos.com',
      password: 'NewUser123!',
      confirmPassword: 'NewUser123!',
      tradingExperience: 'beginner'
    });
    console.log('✅ New user registration successful!');
    console.log(`   User: ${newUserReg.data.user.first_name} ${newUserReg.data.user.last_name}`);
    console.log(`   Email: ${newUserReg.data.user.email}`);
    console.log(`   Role: ${newUserReg.data.user.role}\n`);
  } catch (error) {
    console.log('❌ New user registration failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('   Errors:', error.response.data.errors);
    }
    console.log('');
  }
  
  // Test 4: Admin Registration
  console.log('4. Testing new admin registration...');
  try {
    const newAdminReg = await axios.post(`${baseURL}/api/auth/admin/register`, {
      firstName: 'New',
      lastName: 'Admin',
      email: 'newadmin@smartalgos.com',
      password: 'NewAdmin123!',
      confirmPassword: 'NewAdmin123!',
      adminCode: 'ADMIN_SMART_ALGOS_2024'
    });
    console.log('✅ New admin registration successful!');
    console.log(`   Admin: ${newAdminReg.data.user.first_name} ${newAdminReg.data.user.last_name}`);
    console.log(`   Email: ${newAdminReg.data.user.email}`);
    console.log(`   Role: ${newAdminReg.data.user.role}\n`);
  } catch (error) {
    console.log('❌ New admin registration failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('   Errors:', error.response.data.errors);
    }
    console.log('');
  }
  
  console.log('🎉 Authentication test completed!\n');
  console.log('📋 Test Accounts:');
  console.log('   User: testuser@smartalgos.com / TestUser123!');
  console.log('   Admin: admintest@smartalgos.com / AdminTest123!');
  console.log('   Admin Code: ADMIN_SMART_ALGOS_2024');
}

testWithRealAccounts();
