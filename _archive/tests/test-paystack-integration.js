#!/usr/bin/env node

/**
 * Paystack Integration Test Script
 * 
 * This script tests the Paystack integration to ensure it's working properly.
 * It includes sample transactions and verifies the payment flow.
 */

const axios = require('axios');
const paystackService = require('./services/paystackService');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:5000/api',
  testUser: {
    email: 'test@example.com',
    amount: 299, // $299 for EA subscription
    currency: 'USD'
  },
  sampleTransactions: [
    {
      id: 'TXN_001',
      type: 'subscription',
      description: 'Gold Scalper Pro EA - Monthly Subscription',
      amount: 299,
      currency: 'USD',
      status: 'success',
      method: 'card',
      reference: 'PAY_001_1234567890_abc123',
      timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: 'TXN_002',
      type: 'subscription',
      description: 'Multi Indicator EA - Quarterly Subscription',
      amount: 237, // $79 * 3 months with discount
      currency: 'USD',
      status: 'success',
      method: 'bank_transfer',
      reference: 'PAY_002_1234567890_def456',
      timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: 'TXN_003',
      type: 'subscription',
      description: 'Trend Master EA - Yearly Subscription',
      amount: 490, // $49 * 12 months with discount
      currency: 'USD',
      status: 'pending',
      method: 'mobile_money',
      reference: 'PAY_003_1234567890_ghi789',
      timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
      id: 'TXN_004',
      type: 'subscription',
      description: 'News Trader Bot - Weekly Subscription',
      amount: 25,
      currency: 'USD',
      status: 'failed',
      method: 'crypto',
      reference: 'PAY_004_1234567890_jkl012',
      timestamp: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    },
    {
      id: 'TXN_005',
      type: 'subscription',
      description: 'HFT Bot Rental - Monthly',
      amount: 199,
      currency: 'USD',
      status: 'success',
      method: 'card',
      reference: 'PAY_005_1234567890_mno345',
      timestamp: new Date(Date.now() - 432000000).toISOString() // 5 days ago
    }
  ]
};

class PaystackTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`\n🧪 Running test: ${testName}`);
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  async testPaystackServiceInitialization() {
    if (!paystackService) {
      throw new Error('Paystack service not initialized');
    }
    
    // Test if service is in mock mode (expected for development)
    const isMockMode = !process.env.PAYSTACK_SECRET_KEY;
    console.log(`   📝 Paystack service initialized in ${isMockMode ? 'MOCK' : 'LIVE'} mode`);
  }

  async testInitializeTransaction() {
    const transactionData = {
      email: TEST_CONFIG.testUser.email,
      amount: TEST_CONFIG.testUser.amount,
      currency: TEST_CONFIG.testUser.currency,
      reference: paystackService.generateReference('TEST'),
      metadata: {
        test: true,
        userId: 'test_user_123'
      }
    };

    const result = await paystackService.initializeTransaction(transactionData);
    
    if (!result.success) {
      throw new Error('Failed to initialize transaction');
    }
    
    if (!result.data.authorization_url) {
      throw new Error('Authorization URL not provided');
    }
    
    console.log(`   📝 Transaction initialized with reference: ${result.data.reference}`);
    console.log(`   🔗 Authorization URL: ${result.data.authorization_url}`);
  }

  async testChargeAuthorization() {
    const chargeData = {
      authorization_code: 'AUTH_test123456789',
      email: TEST_CONFIG.testUser.email,
      amount: TEST_CONFIG.testUser.amount,
      currency: TEST_CONFIG.testUser.currency,
      metadata: {
        test: true,
        userId: 'test_user_123'
      }
    };

    const result = await paystackService.chargeAuthorization(chargeData);
    
    if (!result.success) {
      throw new Error('Failed to charge authorization');
    }
    
    console.log(`   📝 Authorization charged successfully`);
    console.log(`   💳 Amount: ${result.data.amount / 100} ${result.data.currency}`);
  }

  async testVerifyTransaction() {
    const testReference = 'PAY_TEST_1234567890_abc123';
    const result = await paystackService.verifyTransaction(testReference);
    
    if (!result.success) {
      throw new Error('Failed to verify transaction');
    }
    
    console.log(`   📝 Transaction verified: ${result.data.status}`);
    console.log(`   💰 Amount: ${result.data.amount / 100} ${result.data.currency}`);
  }

  async testAPIEndpoints() {
    const endpoints = [
      { method: 'POST', path: '/payments/initialize', data: TEST_CONFIG.testUser },
      { method: 'POST', path: '/payments/charge-authorization', data: { 
        authorization_code: 'AUTH_test123', 
        email: TEST_CONFIG.testUser.email, 
        amount: TEST_CONFIG.testUser.amount 
      }},
      { method: 'POST', path: '/payments/verify', data: { 
        reference: 'PAY_TEST_1234567890_abc123' 
      }}
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${TEST_CONFIG.baseURL}${endpoint.path}`,
          data: endpoint.data,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test_token' // Mock auth for testing
          }
        });
        
        console.log(`   📝 ${endpoint.method} ${endpoint.path} - Status: ${response.status}`);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log(`   📝 ${endpoint.method} ${endpoint.path} - Auth required (expected)`);
        } else {
          throw new Error(`API endpoint failed: ${error.message}`);
        }
      }
    }
  }

  async testSampleTransactions() {
    console.log('   📝 Testing sample transactions...');
    
    for (const transaction of TEST_CONFIG.sampleTransactions) {
      // Test transaction initialization
      const transactionData = {
        email: TEST_CONFIG.testUser.email,
        amount: transaction.amount,
        currency: transaction.currency,
        reference: transaction.reference,
        metadata: {
          transactionId: transaction.id,
          type: transaction.type,
          description: transaction.description
        }
      };

      const result = await paystackService.initializeTransaction(transactionData);
      
      if (!result.success) {
        throw new Error(`Failed to initialize transaction ${transaction.id}`);
      }
      
      console.log(`   ✅ Transaction ${transaction.id} initialized successfully`);
    }
  }

  async testWebhookVerification() {
    const testPayload = JSON.stringify({
      event: 'charge.success',
      data: {
        id: 1234567,
        status: 'success',
        reference: 'PAY_TEST_1234567890_abc123',
        amount: 29900,
        currency: 'USD'
      }
    });

    const testSignature = 'test_signature';
    const isValid = paystackService.verifyWebhook(testPayload, testSignature);
    
    // In mock mode, this will return false, which is expected
    console.log(`   📝 Webhook verification test: ${isValid ? 'Valid' : 'Invalid (expected in mock mode)'}`);
  }

  async runAllTests() {
    console.log('🚀 Starting Paystack Integration Tests...\n');
    console.log('=' .repeat(60));
    
    await this.runTest('Paystack Service Initialization', () => this.testPaystackServiceInitialization());
    await this.runTest('Initialize Transaction', () => this.testInitializeTransaction());
    await this.runTest('Charge Authorization', () => this.testChargeAuthorization());
    await this.runTest('Verify Transaction', () => this.testVerifyTransaction());
    await this.runTest('API Endpoints', () => this.testAPIEndpoints());
    await this.runTest('Sample Transactions', () => this.testSampleTransactions());
    await this.runTest('Webhook Verification', () => this.testWebhookVerification());
    
    this.printResults();
  }

  printResults() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('=' .repeat(60));
    
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n📝 Sample Transactions Available:');
    TEST_CONFIG.sampleTransactions.forEach(txn => {
      console.log(`   • ${txn.id}: ${txn.description} - $${txn.amount} (${txn.status})`);
    });
    
    console.log('\n🔧 Configuration:');
    console.log(`   • Base URL: ${TEST_CONFIG.baseURL}`);
    console.log(`   • Test Email: ${TEST_CONFIG.testUser.email}`);
    console.log(`   • Test Amount: $${TEST_CONFIG.testUser.amount}`);
    console.log(`   • Currency: ${TEST_CONFIG.testUser.currency}`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in your .env file');
    console.log('   2. Test with real Paystack credentials in test mode');
    console.log('   3. Verify webhook endpoints are accessible');
    console.log('   4. Test payment flow in the frontend application');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new PaystackTester();
  tester.runAllTests().catch(console.error);
}

module.exports = { PaystackTester, TEST_CONFIG };
