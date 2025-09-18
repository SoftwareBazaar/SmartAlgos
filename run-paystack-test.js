#!/usr/bin/env node

/**
 * Quick Paystack Test Runner
 * 
 * This script runs a quick test of the Paystack integration
 * to verify it's working properly.
 */

const { PaystackTester } = require('./test-paystack-integration');

console.log('🚀 Running Quick Paystack Integration Test...\n');

const tester = new PaystackTester();

// Run only essential tests
async function runQuickTest() {
  try {
    await tester.runTest('Paystack Service Initialization', () => tester.testPaystackServiceInitialization());
    await tester.runTest('Initialize Transaction', () => tester.testInitializeTransaction());
    await tester.runTest('Sample Transactions', () => tester.testSampleTransactions());
    
    console.log('\n✅ Quick test completed!');
    console.log('📝 To run full tests, use: node test-paystack-integration.js');
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
  }
}

runQuickTest();
