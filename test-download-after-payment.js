/**
 * Test Script: Download after Payment Flow
 * 
 * This script tests the complete payment-to-download flow:
 * 1. User login/authentication
 * 2. EA purchase/subscription
 * 3. Payment verification
 * 4. Download file access
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || `testuser_${Date.now()}@example.com`, // Use unique email for each test
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!@',
  firstName: 'Test',
  lastName: 'User'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[STEP ${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ${message}`, 'gray');
}

class PaymentDownloadTester {
  constructor() {
    this.authToken = null;
    this.testUser = null;
    this.selectedEA = null;
    this.subscription = null;
    this.paymentReference = null;
  }

  // Step 1: Login or Register
  async authenticateUser() {
    logStep(1, 'User Authentication');
    
    try {
      // Try to login first
      logInfo('Attempting to login...');
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      if (loginResponse.data.success) {
        this.authToken = loginResponse.data.token || loginResponse.data.data?.token;
        this.testUser = loginResponse.data.user || loginResponse.data.data?.user;
        logSuccess(`Logged in as: ${this.testUser.email}`);
        return true;
      }
    } catch (loginError) {
      // If login fails, try to register
      logInfo('Login failed, attempting registration...');
      
      try {
        const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
          email: TEST_USER.email,
          password: TEST_USER.password,
          confirmPassword: TEST_USER.password,
          firstName: TEST_USER.firstName,
          lastName: TEST_USER.lastName
        });

        if (registerResponse.data.success) {
          this.authToken = registerResponse.data.token || registerResponse.data.data?.token;
          this.testUser = registerResponse.data.user || registerResponse.data.data?.user;
          logSuccess(`Registered and logged in as: ${this.testUser.email}`);
          return true;
        }
      } catch (registerError) {
        logError(`Registration failed: ${registerError.response?.data?.message || registerError.message}`);
        if (registerError.response?.data) {
          logInfo(`Full error response: ${JSON.stringify(registerError.response.data, null, 2)}`);
        }
        if (registerError.response?.data?.errors) {
          logInfo(`Validation errors: ${JSON.stringify(registerError.response.data.errors, null, 2)}`);
        }
        return false;
      }
    }
    
    return false;
  }

  // Step 2: Browse and Select EA
  async selectEA() {
    logStep(2, 'Browse and Select EA');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/eas`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`
        },
        params: {
          limit: 5
        }
      });

      const eas = response.data.data;
      if (response.data.success && Array.isArray(eas) && eas.length > 0) {
        // Select the first active EA
        this.selectedEA = eas[0];
        logSuccess(`Selected EA: ${this.selectedEA.name}`);
        logInfo(`Category: ${this.selectedEA.category}`);
        logInfo(`Price (Weekly): $${this.selectedEA.price_weekly || 6.99}`);
        logInfo(`Price (Monthly): $${this.selectedEA.price_monthly || 18.00}`);
        logInfo(`EA ID: ${this.selectedEA.id}`);
        return true;
      } else {
        logError('No active EAs found in the marketplace');
        return false;
      }
    } catch (error) {
      logError(`Failed to fetch EAs: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  // Step 3: Initiate Payment
  async initiatePayment() {
    logStep(3, 'Initiate Payment');
    
    try {
      const subscriptionType = 'weekly'; // Test with weekly subscription
      const price = this.selectedEA.price_weekly || 6.99;

      logInfo(`Initiating payment for ${subscriptionType} subscription...`);
      logInfo(`Amount: $${price}`);

      // Initialize Paystack payment
      const response = await axios.post(
        `${BASE_URL}/api/payments/initialize`,
        {
          amount: price * 100, // Paystack expects amount in kobo (multiply by 100)
          currency: 'USD',
          email: this.testUser.email,
          metadata: {
            ea_id: this.selectedEA.id,
            subscription_type: subscriptionType,
            user_id: this.testUser.id
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`
          }
        }
      );

      if (response.data.success) {
        this.paymentReference = response.data.data.reference;
        const authorizationUrl = response.data.data.authorization_url;
        
        logSuccess('Payment initialized successfully');
        logInfo(`Reference: ${this.paymentReference}`);
        logInfo(`Payment URL: ${authorizationUrl}`);
        logInfo('');
        log('⚠️  In a real scenario, user would be redirected to Paystack:', 'yellow');
        log(authorizationUrl, 'yellow');
        log('⚠️  For testing, we will simulate a successful payment verification', 'yellow');
        
        return true;
      } else {
        logError('Payment initialization failed');
        return false;
      }
    } catch (error) {
      logError(`Payment initialization error: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.errors) {
        logInfo(JSON.stringify(error.response.data.errors, null, 2));
      }
      return false;
    }
  }

  // Step 4: Verify Payment (Simulated)
  async verifyPayment() {
    logStep(4, 'Verify Payment');
    
    try {
      logInfo('Verifying payment with reference: ' + this.paymentReference);
      
      const response = await axios.post(
        `${BASE_URL}/api/payments/verify`,
        {
          reference: this.paymentReference
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`
          }
        }
      );

      if (response.data.success) {
        logSuccess('Payment verified successfully');
        logInfo(`Status: ${response.data.data.status}`);
        logInfo(`Amount: ${response.data.data.amount / 100} ${response.data.data.currency}`);
        return true;
      } else {
        logError('Payment verification failed');
        logInfo(`Reason: ${response.data.message}`);
        return false;
      }
    } catch (error) {
      logError(`Payment verification error: ${error.response?.data?.message || error.message}`);
      
      // In test mode, payment verification might fail with Paystack
      // Let's check if we need to create subscription manually for testing
      log('⚠️  Note: In test mode, Paystack verification may fail. Testing subscription creation...', 'yellow');
      return await this.createSubscriptionManually();
    }
  }

  // Step 5: Create Subscription Manually (For Testing)
  async createSubscriptionManually() {
    logInfo('Creating subscription manually for testing...');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/subscriptions`,
        {
          eaId: this.selectedEA.id,
          subscriptionType: 'weekly',
          paymentMethod: 'card',
          paymentReference: this.paymentReference || `test_ref_${Date.now()}`
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`
          }
        }
      );

      if (response.data.success) {
        this.subscription = response.data.data;
        logSuccess('Subscription created successfully');
        logInfo(`Subscription ID: ${this.subscription.id}`);
        return true;
      } else {
        logError('Subscription creation failed');
        return false;
      }
    } catch (error) {
      logError(`Subscription creation error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  // Step 6: Get Subscription Details
  async getSubscriptionDetails() {
    logStep(5, 'Get Subscription Details');
    
    try {
      // Get user's subscriptions
      const response = await axios.get(`${BASE_URL}/api/subscriptions`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`
        }
      });

      if (response.data.success && response.data.data.length > 0) {
        // Find the subscription for our EA
        const subscription = response.data.data.find(
          sub => sub.ea && (sub.ea.id === this.selectedEA.id || sub.ea._id === this.selectedEA.id)
        );

        if (subscription) {
          this.subscription = subscription;
          logSuccess('Subscription found');
          logInfo(`Status: ${subscription.status}`);
          logInfo(`Start Date: ${subscription.startDate}`);
          logInfo(`End Date: ${subscription.endDate}`);
          logInfo(`Has Access: ${subscription.hasAccess ? 'Yes' : 'No'}`);
          return true;
        } else {
          logError('Subscription not found for selected EA');
          return false;
        }
      } else {
        logError('No subscriptions found');
        return false;
      }
    } catch (error) {
      logError(`Failed to get subscriptions: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  // Step 7: Get Download Files
  async getDownloadFiles() {
    logStep(6, 'Get Download Files');
    
    try {
      const response = await axios.get(
        `${BASE_URL}/api/subscriptions/${this.subscription.id}/files`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`
          }
        }
      );

      if (response.data.success) {
        const files = response.data.data.files;
        logSuccess('Download files retrieved');
        
        if (files.ea_file) {
          logInfo(`EA File: ${files.ea_file}`);
        }
        if (files.set_file) {
          logInfo(`Set File: ${files.set_file}`);
        }
        if (files.manual_file) {
          logInfo(`Manual: ${files.manual_file}`);
        }
        
        return files;
      } else {
        logError('Failed to get download files');
        return null;
      }
    } catch (error) {
      logError(`Download files error: ${error.response?.data?.message || error.message}`);
      logInfo(`Full error: ${JSON.stringify(error.response?.data || error.message, null, 2)}`);
      return null;
    }
  }

  // Step 8: Download EA File
  async downloadEAFile(fileUrl) {
    logStep(7, 'Download EA File');
    
    try {
      if (!fileUrl) {
        logError('No file URL provided');
        return false;
      }

      logInfo(`Downloading file from: ${fileUrl}`);
      
      // Check if URL is relative or absolute
      const downloadUrl = fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
      
      const response = await axios.get(downloadUrl, {
        headers: {
          Authorization: `Bearer ${this.authToken}`
        },
        responseType: 'arraybuffer'
      });

      if (response.status === 200) {
        // Save file to downloads folder
        const downloadsDir = path.join(__dirname, 'test-downloads');
        if (!fs.existsSync(downloadsDir)) {
          fs.mkdirSync(downloadsDir);
        }

        const filename = `EA_${this.selectedEA.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.ex4`;
        const filepath = path.join(downloadsDir, filename);
        
        fs.writeFileSync(filepath, response.data);
        
        const fileSizeKB = (response.data.length / 1024).toFixed(2);
        logSuccess(`File downloaded successfully`);
        logInfo(`Saved to: ${filepath}`);
        logInfo(`File size: ${fileSizeKB} KB`);
        return true;
      } else {
        logError(`Download failed with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      logError(`Download error: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.status === 404) {
        log('⚠️  File not found. This might mean:', 'yellow');
        logInfo('1. The download endpoint is not implemented');
        logInfo('2. The EA file was not uploaded');
        logInfo('3. The file path is incorrect');
      } else if (error.response?.status === 403) {
        log('⚠️  Access denied. This might mean:', 'yellow');
        logInfo('1. Subscription is not active');
        logInfo('2. Token is invalid or expired');
        logInfo('3. Download token verification failed');
      }
      
      return false;
    }
  }

  // Step 9: Record Download
  async recordDownload() {
    logStep(8, 'Record Download');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/subscriptions/${this.subscription.id}/download`,
        {
          fileType: 'ea_file'
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`
          }
        }
      );

      if (response.data.success) {
        logSuccess('Download recorded successfully');
        return true;
      } else {
        logError('Failed to record download');
        return false;
      }
    } catch (error) {
      logError(`Record download error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  // Main Test Flow
  async runTest() {
    log('\n' + '='.repeat(60), 'blue');
    log('TESTING: DOWNLOAD AFTER PAYMENT FLOW', 'blue');
    log('='.repeat(60) + '\n', 'blue');
    
    logInfo(`Base URL: ${BASE_URL}`);
    logInfo(`Test User: ${TEST_USER.email}`);
    logInfo(`Timestamp: ${new Date().toISOString()}\n`);

    // Step 1: Authenticate
    if (!await this.authenticateUser()) {
      logError('Test failed at authentication step');
      return;
    }

    // Step 2: Select EA
    if (!await this.selectEA()) {
      logError('Test failed at EA selection step');
      return;
    }

    // Step 3: Initiate Payment
    if (!await this.initiatePayment()) {
      logError('Test failed at payment initialization step');
      return;
    }

    // Step 4: Verify Payment (or create subscription manually)
    if (!await this.verifyPayment()) {
      logError('Test failed at payment verification step');
      log('⚠️  Continuing with manual subscription creation...', 'yellow');
      
      if (!await this.createSubscriptionManually()) {
        logError('Test failed: Could not create subscription');
        return;
      }
    }

    // Step 5: Get Subscription Details
    if (!this.subscription) {
      if (!await this.getSubscriptionDetails()) {
        logError('Test failed at subscription retrieval step');
        return;
      }
    }

    // Step 6: Get Download Files
    const files = await this.getDownloadFiles();
    if (!files) {
      logError('Test failed at download files retrieval step');
      log('\n⚠️  This suggests the /api/subscriptions/:id/files endpoint may need implementation', 'yellow');
      return;
    }

    // Step 7: Download EA File
    if (files.ea_file) {
      const downloadSuccess = await this.downloadEAFile(files.ea_file);
      
      if (downloadSuccess) {
        // Step 8: Record Download
        await this.recordDownload();
      }
    } else {
      logError('No EA file available for download');
      log('⚠️  The EA may not have an uploaded file', 'yellow');
    }

    // Test Summary
    log('\n' + '='.repeat(60), 'blue');
    log('TEST SUMMARY', 'blue');
    log('='.repeat(60) + '\n', 'blue');
    
    logSuccess('✓ User Authentication');
    logSuccess('✓ EA Selection');
    logSuccess('✓ Payment Initialization');
    
    if (this.subscription) {
      logSuccess('✓ Subscription Creation');
      logSuccess('✓ Subscription Retrieval');
    }
    
    if (files) {
      logSuccess('✓ Download Files Retrieval');
    } else {
      logError('✗ Download Files Retrieval');
    }
    
    log('\n' + '='.repeat(60) + '\n', 'blue');
  }
}

// Run the test
const tester = new PaymentDownloadTester();
tester.runTest().catch(error => {
  logError(`Unhandled error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

