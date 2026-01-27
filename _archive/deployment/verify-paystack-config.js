#!/usr/bin/env node

/**
 * Paystack Configuration Verification Script
 * 
 * This script verifies the Paystack API connection and configuration
 * to ensure everything is set up correctly.
 */

const fs = require('fs');
const path = require('path');
const paystackService = require('./services/paystackService');

class PaystackConfigVerifier {
  constructor() {
    this.results = {
      config: {},
      tests: [],
      recommendations: []
    };
  }

  async verifyConfiguration() {
    console.log('🔍 Verifying Paystack Configuration...\n');
    console.log('=' .repeat(60));

    // Check environment variables
    this.checkEnvironmentVariables();
    
    // Check service initialization
    this.checkServiceInitialization();
    
    // Test API connectivity
    await this.testAPIConnectivity();
    
    // Check webhook configuration
    this.checkWebhookConfiguration();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Print results
    this.printResults();
  }

  checkEnvironmentVariables() {
    console.log('📋 Checking Environment Variables:');
    
    const requiredVars = [
      'PAYSTACK_SECRET_KEY',
      'PAYSTACK_PUBLIC_KEY',
      'PAYSTACK_WEBHOOK_SECRET'
    ];

    const optionalVars = [
      'CLIENT_URL',
      'NODE_ENV'
    ];

    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`   ✅ ${varName}: ${this.maskSensitiveData(value)}`);
        this.results.config[varName] = 'configured';
      } else {
        console.log(`   ❌ ${varName}: Not configured`);
        this.results.config[varName] = 'missing';
        this.results.recommendations.push(`Set ${varName} in your .env file`);
      }
    });

    optionalVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`   ✅ ${varName}: ${value}`);
        this.results.config[varName] = 'configured';
      } else {
        console.log(`   ⚠️  ${varName}: Not configured (optional)`);
        this.results.config[varName] = 'optional';
      }
    });

    console.log('');
  }

  checkServiceInitialization() {
    console.log('🔧 Checking Service Initialization:');
    
    try {
      if (paystackService) {
        console.log('   ✅ Paystack service initialized successfully');
        this.results.tests.push({ name: 'Service Initialization', status: 'PASSED' });
        
        // Check if in mock mode
        const isMockMode = !process.env.PAYSTACK_SECRET_KEY;
        console.log(`   📝 Running in ${isMockMode ? 'MOCK' : 'LIVE'} mode`);
        this.results.config.mode = isMockMode ? 'mock' : 'live';
        
        if (isMockMode) {
          this.results.recommendations.push('Configure Paystack keys to enable live mode');
        }
      } else {
        throw new Error('Paystack service not initialized');
      }
    } catch (error) {
      console.log(`   ❌ Service initialization failed: ${error.message}`);
      this.results.tests.push({ name: 'Service Initialization', status: 'FAILED', error: error.message });
    }

    console.log('');
  }

  async testAPIConnectivity() {
    console.log('🌐 Testing API Connectivity:');
    
    const tests = [
      {
        name: 'Initialize Transaction',
        test: async () => {
          const result = await paystackService.initializeTransaction({
            email: 'test@example.com',
            amount: 100,
            currency: 'USD',
            reference: paystackService.generateReference('TEST')
          });
          return result.success;
        }
      },
      {
        name: 'Charge Authorization',
        test: async () => {
          const result = await paystackService.chargeAuthorization({
            authorization_code: 'AUTH_test123',
            email: 'test@example.com',
            amount: 100,
            currency: 'USD'
          });
          return result.success;
        }
      },
      {
        name: 'Verify Transaction',
        test: async () => {
          const result = await paystackService.verifyTransaction('PAY_test123');
          return result.success;
        }
      }
    ];

    for (const test of tests) {
      try {
        const success = await test.test();
        if (success) {
          console.log(`   ✅ ${test.name}: Working`);
          this.results.tests.push({ name: test.name, status: 'PASSED' });
        } else {
          throw new Error('Test returned false');
        }
      } catch (error) {
        console.log(`   ❌ ${test.name}: Failed - ${error.message}`);
        this.results.tests.push({ name: test.name, status: 'FAILED', error: error.message });
      }
    }

    console.log('');
  }

  checkWebhookConfiguration() {
    console.log('🔗 Checking Webhook Configuration:');
    
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (webhookSecret) {
      console.log('   ✅ Webhook secret configured');
      this.results.tests.push({ name: 'Webhook Configuration', status: 'PASSED' });
      
      // Test webhook verification
      const testPayload = JSON.stringify({ test: 'data' });
      const testSignature = 'test_signature';
      const isValid = paystackService.verifyWebhook(testPayload, testSignature);
      
      console.log(`   📝 Webhook verification: ${isValid ? 'Working' : 'Not working (expected in mock mode)'}`);
    } else {
      console.log('   ❌ Webhook secret not configured');
      this.results.tests.push({ name: 'Webhook Configuration', status: 'FAILED', error: 'Webhook secret missing' });
      this.results.recommendations.push('Configure PAYSTACK_WEBHOOK_SECRET for webhook handling');
    }

    console.log('');
  }

  generateRecommendations() {
    console.log('💡 Configuration Recommendations:');
    
    const hasSecretKey = !!process.env.PAYSTACK_SECRET_KEY;
    const hasPublicKey = !!process.env.PAYSTACK_PUBLIC_KEY;
    const hasWebhookSecret = !!process.env.PAYSTACK_WEBHOOK_SECRET;
    
    if (!hasSecretKey || !hasPublicKey) {
      console.log('   🔑 Get Paystack API keys from: https://dashboard.paystack.com/#/settings/developers');
      console.log('   📝 Add to .env file:');
      console.log('      PAYSTACK_SECRET_KEY=sk_test_...');
      console.log('      PAYSTACK_PUBLIC_KEY=pk_test_...');
    }
    
    if (!hasWebhookSecret) {
      console.log('   🔗 Configure webhook secret for production:');
      console.log('      PAYSTACK_WEBHOOK_SECRET=whsec_...');
    }
    
    if (!process.env.CLIENT_URL) {
      console.log('   🌐 Set client URL for callbacks:');
      console.log('      CLIENT_URL=http://localhost:3000');
    }
    
    console.log('');
  }

  printResults() {
    console.log('📊 VERIFICATION RESULTS');
    console.log('=' .repeat(60));
    
    const passedTests = this.results.tests.filter(t => t.status === 'PASSED').length;
    const failedTests = this.results.tests.filter(t => t.status === 'FAILED').length;
    const totalTests = this.results.tests.length;
    
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
    
    console.log('\n🔧 Configuration Status:');
    Object.entries(this.results.config).forEach(([key, value]) => {
      const status = value === 'configured' ? '✅' : 
                    value === 'missing' ? '❌' : 
                    value === 'optional' ? '⚠️' : '📝';
      console.log(`   ${status} ${key}: ${value}`);
    });
    
    if (this.results.recommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      this.results.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
    console.log('\n🎯 Next Steps:');
    if (this.results.config.mode === 'mock') {
      console.log('   1. Get Paystack test API keys from dashboard');
      console.log('   2. Add keys to .env file');
      console.log('   3. Restart the application');
      console.log('   4. Test with real Paystack integration');
    } else {
      console.log('   1. Test payment flow in the frontend');
      console.log('   2. Verify webhook endpoints');
      console.log('   3. Test with real payment methods');
      console.log('   4. Monitor transaction logs');
    }
    
    console.log('\n📚 Documentation:');
    console.log('   • Paystack API Docs: https://paystack.com/docs/api/');
    console.log('   • Testing Guide: ./PAYSTACK_TESTING_GUIDE.md');
    console.log('   • Integration Docs: ./PAYSTACK_INTEGRATION.md');
  }

  maskSensitiveData(value) {
    if (!value) return 'Not set';
    if (value.length <= 8) return value;
    return value.substring(0, 8) + '...' + value.substring(value.length - 4);
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  const verifier = new PaystackConfigVerifier();
  verifier.verifyConfiguration().catch(console.error);
}

module.exports = PaystackConfigVerifier;
