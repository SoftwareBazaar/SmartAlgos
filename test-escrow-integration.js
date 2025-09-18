#!/usr/bin/env node

/**
 * Escrow.com Integration Test Script
 * 
 * This script tests the Escrow.com integration to ensure it's working properly.
 * It includes sample transactions and verifies the escrow flow.
 */

const axios = require('axios');
const escrowService = require('./services/escrowService');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:5000/api',
  testUser: {
    email: 'test@example.com',
    amount: 299,
    currency: 'USD'
  },
  sampleTransactions: [
    {
      id: 'ESC_001',
      type: 'ea_subscription',
      description: 'Gold Scalper Pro EA - Monthly Subscription',
      amount: 299,
      currency: 'USD',
      buyerEmail: 'buyer@example.com',
      sellerEmail: 'seller@example.com',
      status: 'pending_agreement',
      inspectionPeriod: 259200 // 3 days
    },
    {
      id: 'ESC_002',
      type: 'hft_rental',
      description: 'HFT Bot Rental - Monthly',
      amount: 199,
      currency: 'USD',
      buyerEmail: 'buyer@example.com',
      sellerEmail: 'seller@example.com',
      status: 'pending_payment',
      inspectionPeriod: 172800 // 2 days
    },
    {
      id: 'ESC_003',
      type: 'trading_signal',
      description: 'Premium Trading Signals Package',
      amount: 99,
      currency: 'USD',
      buyerEmail: 'buyer@example.com',
      sellerEmail: 'seller@example.com',
      status: 'completed',
      inspectionPeriod: 86400 // 1 day
    }
  ]
};

class EscrowTester {
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

  async testEscrowServiceInitialization() {
    if (!escrowService) {
      throw new Error('Escrow service not initialized');
    }
    
    // Test if service is in mock mode (expected for development)
    const isMockMode = !process.env.ESCROW_EMAIL;
    console.log(`   📝 Escrow service initialized in ${isMockMode ? 'MOCK' : 'LIVE'} mode`);
  }

  async testCreateTransaction() {
    const transactionData = {
      buyerEmail: TEST_CONFIG.testUser.email,
      sellerEmail: 'seller@example.com',
      amount: TEST_CONFIG.testUser.amount,
      currency: TEST_CONFIG.testUser.currency,
      description: 'Test EA Subscription',
      productType: 'ea_subscription',
      inspectionPeriod: 259200,
      metadata: {
        test: true,
        userId: 'test_user_123'
      }
    };

    const result = await escrowService.createTransaction(transactionData);
    
    if (!result.success) {
      throw new Error('Failed to create escrow transaction');
    }
    
    if (!result.data.id) {
      throw new Error('Transaction ID not provided');
    }
    
    console.log(`   📝 Transaction created with ID: ${result.data.id}`);
    console.log(`   💰 Amount: $${result.data.items[0].schedule[0].amount}`);
    console.log(`   🔒 Escrow Fee: $${result.data.items[0].fees[0].amount}`);
  }

  async testGetTransaction() {
    const testTransactionId = '3300003';
    const result = await escrowService.getTransaction(testTransactionId);
    
    if (!result.success) {
      throw new Error('Failed to get escrow transaction');
    }
    
    console.log(`   📝 Transaction retrieved: ${result.data.id}`);
    console.log(`   📊 Status: ${result.data.status || 'pending_agreement'}`);
  }

  async testInitiatePayment() {
    const testTransactionId = '3300003';
    const paymentData = {
      amount: 299,
      currency: 'USD',
      paymentMethod: 'card',
      metadata: {
        test: true
      }
    };

    const result = await escrowService.initiatePayment(testTransactionId, paymentData);
    
    if (!result.success) {
      throw new Error('Failed to initiate escrow payment');
    }
    
    console.log(`   📝 Payment initiated: ${result.data.id}`);
    console.log(`   💳 Payment URL: ${result.data.payment_url}`);
  }

  async testAPIEndpoints() {
    const endpoints = [
      { method: 'POST', path: '/escrow/transactions', data: {
        buyerEmail: 'buyer@example.com',
        sellerEmail: 'seller@example.com',
        amount: 299,
        currency: 'USD',
        description: 'Test EA Subscription'
      }},
      { method: 'GET', path: '/escrow/transactions/3300003', data: null },
      { method: 'GET', path: '/escrow/status', data: null },
      { method: 'GET', path: '/escrow/fee-calculator?amount=299&currency=USD', data: null }
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
    console.log('   📝 Testing sample escrow transactions...');
    
    for (const transaction of TEST_CONFIG.sampleTransactions) {
      // Test transaction creation
      const transactionData = {
        buyerEmail: transaction.buyerEmail,
        sellerEmail: transaction.sellerEmail,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        productType: transaction.type,
        inspectionPeriod: transaction.inspectionPeriod,
        metadata: {
          transactionId: transaction.id,
          test: true
        }
      };

      const result = await escrowService.createTransaction(transactionData);
      
      if (!result.success) {
        throw new Error(`Failed to create transaction ${transaction.id}`);
      }
      
      console.log(`   ✅ Transaction ${transaction.id} created successfully`);
    }
  }

  async testFeeCalculation() {
    const testAmounts = [99, 199, 299, 499, 999];
    
    for (const amount of testAmounts) {
      const fee = escrowService.calculateEscrowFee(amount, 'USD');
      const total = amount + fee;
      const percentage = ((fee / amount) * 100).toFixed(2);
      
      console.log(`   💰 $${amount} → Fee: $${fee} (${percentage}%) → Total: $${total}`);
    }
  }

  async testDisputeCreation() {
    const testTransactionId = '3300003';
    const disputeData = {
      reason: 'product_not_as_described',
      description: 'The EA does not perform as described in the documentation',
      evidence: ['screenshot1.png', 'performance_report.pdf'],
      metadata: {
        test: true
      }
    };

    const result = await escrowService.createDispute(testTransactionId, disputeData);
    
    if (!result.success) {
      throw new Error('Failed to create escrow dispute');
    }
    
    console.log(`   📝 Dispute created: ${result.data.id}`);
    console.log(`   📊 Reason: ${result.data.reason}`);
  }

  async runAllTests() {
    console.log('🚀 Starting Escrow.com Integration Tests...\n');
    console.log('=' .repeat(60));
    
    await this.runTest('Escrow Service Initialization', () => this.testEscrowServiceInitialization());
    await this.runTest('Create Transaction', () => this.testCreateTransaction());
    await this.runTest('Get Transaction', () => this.testGetTransaction());
    await this.runTest('Initiate Payment', () => this.testInitiatePayment());
    await this.runTest('API Endpoints', () => this.testAPIEndpoints());
    await this.runTest('Sample Transactions', () => this.testSampleTransactions());
    await this.runTest('Fee Calculation', () => this.testFeeCalculation());
    await this.runTest('Dispute Creation', () => this.testDisputeCreation());
    
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
    
    console.log('\n📝 Sample Escrow Transactions Available:');
    TEST_CONFIG.sampleTransactions.forEach(txn => {
      console.log(`   • ${txn.id}: ${txn.description} - $${txn.amount} (${txn.status})`);
    });
    
    console.log('\n🔧 Configuration:');
    console.log(`   • Base URL: ${TEST_CONFIG.baseURL}`);
    console.log(`   • Test Email: ${TEST_CONFIG.testUser.email}`);
    console.log(`   • Test Amount: $${TEST_CONFIG.testUser.amount}`);
    console.log(`   • Currency: ${TEST_CONFIG.testUser.currency}`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Set ESCROW_EMAIL and ESCROW_PASSWORD in your .env file');
    console.log('   2. Test with real Escrow.com credentials');
    console.log('   3. Verify webhook endpoints are accessible');
    console.log('   4. Test escrow flow in the frontend application');
    
    console.log('\n🔒 Escrow Features:');
    console.log('   • Transaction Management');
    console.log('   • Payment Processing');
    console.log('   • Dispute Resolution');
    console.log('   • Inspection Periods');
    console.log('   • Fee Calculation');
    console.log('   • Multi-currency Support');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new EscrowTester();
  tester.runAllTests().catch(console.error);
}

module.exports = { EscrowTester, TEST_CONFIG };
