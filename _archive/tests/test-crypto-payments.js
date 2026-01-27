#!/usr/bin/env node

/**
 * Crypto Payment Test Script
 * Tests the crypto payment integration
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';
let token = null;

async function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testCryptoPayment() {
  console.log('\n💰 Testing Crypto Payment Integration\n');

  try {
    // Test 1: Get crypto payment service status
    console.log('1. Testing crypto payment service status...');
    const statusResult = await makeRequest('/api/payments/crypto/status', 'GET', null, {
      'Authorization': `Bearer ${token || 'test_token'}`
    });

    if (statusResult.status === 200) {
      console.log('   ✅ Crypto payment service status:', statusResult.data.data);
    } else {
      console.log('   ❌ Failed to get status:', statusResult.status);
    }

    // Test 2: Initialize crypto payment
    console.log('\n2. Testing crypto payment initialization...');
    const initResult = await makeRequest('/api/payments/crypto/initialize', 'POST', {
      amount: 18,
      currency: 'USD'
    }, {
      'Authorization': `Bearer ${token || 'test_token'}`
    });

    if (initResult.status === 200) {
      console.log('   ✅ Crypto payment initialized');
      console.log('   Payment ID:', initResult.data.data.paymentId);
      console.log('   Bitcoin amount:', initResult.data.data.cryptoOptions.bitcoin.amount, 'BTC');
      console.log('   Ethereum amount:', initResult.data.data.cryptoOptions.ethereum.amount, 'ETH');
      console.log('   Binance amount:', initResult.data.data.cryptoOptions.binance.amount, 'BNB');
      console.log('   USDT amount:', initResult.data.data.cryptoOptions.usdt.amount, 'USDT');
      
      // Test 3: Verify crypto payment (mock)
      console.log('\n3. Testing crypto payment verification...');
      const verifyResult = await makeRequest('/api/payments/crypto/verify', 'POST', {
        paymentId: initResult.data.data.paymentId,
        txHash: 'mock_transaction_hash_123',
        cryptoType: 'BTC'
      }, {
        'Authorization': `Bearer ${token || 'test_token'}`
      });

      if (verifyResult.status === 200) {
        console.log('   ✅ Crypto payment verification successful');
      } else {
        console.log('   ❌ Verification failed:', verifyResult.status);
      }
    } else {
      console.log('   ❌ Failed to initialize crypto payment:', initResult.status);
    }

    console.log('\n🎉 Crypto payment tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run tests
testCryptoPayment();
