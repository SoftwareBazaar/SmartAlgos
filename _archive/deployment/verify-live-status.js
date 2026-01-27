/**
 * Quick verification script for Paystack Live Connection
 */
require('dotenv').config();
const paystackService = require('./services/paystackService');

console.log('--- Paystack Connection Verification ---');
const status = paystackService.getStatus();
console.log('Status Object:', JSON.stringify(status, null, 2));

if (status.mode === 'live' && status.configured) {
  console.log('✅ SUCCESS: Paystack is connected to the LIVE API.');
} else {
  console.log('❌ FAILURE: Paystack is still in MOCK MODE or misconfigured.');
  console.log('Check if PAYSTACK_SECRET_KEY starts with sk_live_ and is correctly loaded.');
}
console.log('----------------------------------------');
