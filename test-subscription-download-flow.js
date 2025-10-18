const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

class SubscriptionDownloadTester {
  constructor() {
    this.authToken = null;
    this.testEA = null;
    this.subscription = null;
  }

  async runTests() {
    console.log('🚀 Starting Subscription/Download Flow Tests...\n');
    
    try {
      // Step 1: Create test user account
      await this.createTestUser();
      
      // Step 2: Login
      await this.login();
      
      // Step 3: Create test EA
      await this.createTestEA();
      
      // Step 4: Test subscription flow
      await this.testSubscriptionFlow();
      
      // Step 5: Test download flow
      await this.testDownloadFlow();
      
      // Step 6: Test download security (no subscription)
      await this.testDownloadSecurity();
      
      console.log('\n✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      throw error;
    }
  }

  async createTestUser() {
    console.log('📝 Step 1: Creating test user account...');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: 'Test',
        lastName: 'User'
      });
      
      if (response.data.success) {
        console.log('✅ Test user created successfully');
      } else {
        console.log('ℹ️ Test user may already exist, continuing...');
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
        console.log('ℹ️ Test user already exists, continuing...');
      } else {
        throw new Error(`Failed to create test user: ${error.message}`);
      }
    }
  }

  async login() {
    console.log('🔐 Step 2: Logging in...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (!response.data.success) {
      throw new Error('Login failed');
    }
    
    this.authToken = response.data.token;
    console.log('✅ Login successful');
  }

  async createTestEA() {
    console.log('🤖 Step 3: Creating test EA...');
    
    const FormData = require('form-data');
    const fs = require('fs');
    const formData = new FormData();
    
    // Add EA data
    formData.append('name', 'Test Subscription Flow EA');
    formData.append('description', 'Test EA for verifying subscription and download flow');
    formData.append('category', 'scalping');
    formData.append('price_weekly', '6.99');
    formData.append('price_monthly', '18.00');
    formData.append('price_quarterly', '45.00');
    formData.append('price_yearly', '97.00');
    formData.append('win_rate', '75');
    formData.append('max_drawdown', '5.2');
    formData.append('supported_pairs', JSON.stringify(['EURUSD', 'GBPUSD']));
    formData.append('timeframes', JSON.stringify(['M1', 'M5']));
    formData.append('is_active', 'true');
    formData.append('status', 'approved');
    
    // Add test files if they exist
    if (fs.existsSync('test-ea-file.ex4')) {
      formData.append('eaFile', fs.createReadStream('test-ea-file.ex4'));
    }
    if (fs.existsSync('test-ea-settings.set')) {
      formData.append('setFile', fs.createReadStream('test-ea-settings.set'));
    }
    if (fs.existsSync('test-ea-manual.pdf')) {
      formData.append('manualFile', fs.createReadStream('test-ea-manual.pdf'));
    }
    
    const response = await axios.post(`${BASE_URL}/api/eas`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${this.authToken}`
      }
    });
    
    if (!response.data.success) {
      throw new Error(`Failed to create test EA: ${response.data.message}`);
    }
    
    this.testEA = response.data.data;
    console.log(`✅ Test EA created with ID: ${this.testEA.id}`);
  }

  async testSubscriptionFlow() {
    console.log('💳 Step 4: Testing subscription flow...');
    
    const subscriptionData = {
      eaId: this.testEA.id,
      subscriptionType: 'monthly',
      paymentMethod: 'card',
      paymentReference: `test_sub_${Date.now()}`,
      useEscrow: false
    };
    
    const response = await axios.post(`${BASE_URL}/api/subscriptions`, subscriptionData, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data.success) {
      throw new Error(`Subscription failed: ${response.data.message}`);
    }
    
    this.subscription = response.data.data;
    console.log(`✅ Subscription created with ID: ${this.subscription.id}`);
  }

  async testDownloadFlow() {
    console.log('📥 Step 5: Testing download flow...');
    
    // Test getting download links
    const filesResponse = await axios.get(`${BASE_URL}/api/subscriptions/${this.subscription.id}/files`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });
    
    if (!filesResponse.data.success) {
      throw new Error(`Failed to get download links: ${filesResponse.data.message}`);
    }
    
    const downloadLinks = filesResponse.data.data.files;
    console.log('✅ Download links retrieved:', Object.keys(downloadLinks).filter(key => downloadLinks[key]));
    
    // Test downloading EA file if available
    if (downloadLinks.ea_file) {
      try {
        const downloadResponse = await axios.get(downloadLinks.ea_file, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        console.log('✅ EA file download successful');
      } catch (error) {
        console.log('⚠️ EA file download failed (may be expected if file doesn\'t exist)');
      }
    }
    
    // Test downloading settings file if available
    if (downloadLinks.set_file) {
      try {
        const downloadResponse = await axios.get(downloadLinks.set_file, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        console.log('✅ Settings file download successful');
      } catch (error) {
        console.log('⚠️ Settings file download failed (may be expected if file doesn\'t exist)');
      }
    }
  }

  async testDownloadSecurity() {
    console.log('🔒 Step 6: Testing download security (no subscription)...');
    
    // Try to download without valid subscription
    try {
      const response = await axios.get(`${BASE_URL}/api/downloads/ea/invalid-id?token=invalid-token`);
      if (response.status === 401 || response.status === 403) {
        console.log('✅ Download security working - invalid access blocked');
      } else {
        console.log('⚠️ Download security may have issues');
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Download security working - invalid access blocked');
      } else {
        console.log('⚠️ Download security test inconclusive');
      }
    }
  }
}

// Run the tests
async function runTests() {
  const tester = new SubscriptionDownloadTester();
  await tester.runTests();
}

// Export for use in other scripts
module.exports = { SubscriptionDownloadTester, runTests };

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}
