/**
 * Enable Real Payments Script
 * This script helps you transition from mock to real payment mode
 * Run this before testing real M-Pesa and crypto payments
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Enabling Real Payment Mode\n');
console.log('=' .repeat(70));

// Check .env file
const envPath = path.join(__dirname, '.env');
let envExists = fs.existsSync(envPath);

console.log('\n📋 Current Configuration:');
console.log('-'.repeat(70));

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check MOCK_AUTH setting
  const mockAuthMatch = envContent.match(/^MOCK_AUTH=(.+)$/m);
  if (mockAuthMatch) {
    console.log(`  MOCK_AUTH: ${mockAuthMatch[1]}`);
    if (mockAuthMatch[1] === 'true') {
      console.log('  ⚠️  WARNING: Mock mode is ENABLED');
    } else {
      console.log('  ✅ Mock mode is DISABLED');
    }
  } else {
    console.log('  MOCK_AUTH: Not set (defaults based on Supabase key)');
  }
  
  // Check Supabase configuration
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseKey || supabaseKey.includes('your-') || supabaseKey.includes('example')) {
    console.log('  ⚠️  WARNING: Supabase key appears to be a placeholder');
    console.log('  This will trigger mock mode automatically');
  } else {
    console.log('  ✅ Supabase key appears to be configured');
  }
  
  // Check M-Pesa configuration
  const mpesaKey = process.env.MPESA_CONSUMER_KEY;
  const mpesaEnv = process.env.MPESA_ENVIRONMENT;
  console.log(`\n  M-Pesa Environment: ${mpesaEnv || 'sandbox'}`);
  if (!mpesaKey || mpesaKey.includes('your-')) {
    console.log('  ⚠️  WARNING: M-Pesa credentials not configured');
  } else {
    console.log('  ✅ M-Pesa credentials appear to be configured');
  }
  
  // Check crypto wallet addresses
  const btcAddress = process.env.BTC_WALLET_ADDRESS;
  const ethAddress = process.env.ETH_WALLET_ADDRESS;
  const usdtAddress = process.env.USDT_WALLET_ADDRESS;
  
  console.log('\n  Crypto Wallet Addresses:');
  console.log(`    BTC: ${btcAddress ? '✅ Configured' : '❌ Not set'}`);
  console.log(`    ETH: ${ethAddress ? '✅ Configured' : '❌ Not set'}`);
  console.log(`    USDT: ${usdtAddress ? '✅ Configured' : '❌ Not set'}`);
  
} else {
  console.log('  ❌ .env file not found');
  console.log('  Environment variables must be set in your hosting platform');
}

console.log('\n' + '='.repeat(70));
console.log('\n📝 Steps to Enable Real Payments:\n');

console.log('1. Set MOCK_AUTH to false:');
console.log('   Add to .env file: MOCK_AUTH=false');
console.log('   Or set in Railway/Vercel environment variables\n');

console.log('2. Configure M-Pesa credentials:');
console.log('   MPESA_CONSUMER_KEY=your_consumer_key');
console.log('   MPESA_CONSUMER_SECRET=your_consumer_secret');
console.log('   MPESA_BUSINESS_SHORTCODE=your_shortcode');
console.log('   MPESA_PASSKEY=your_passkey');
console.log('   MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback');
console.log('   MPESA_ENVIRONMENT=sandbox (or production)\n');

console.log('3. Configure Crypto wallet addresses:');
console.log('   BTC_WALLET_ADDRESS=your_btc_address');
console.log('   ETH_WALLET_ADDRESS=your_eth_address');
console.log('   USDT_WALLET_ADDRESS=your_usdt_trc20_address\n');

console.log('4. Cancel existing test subscriptions:');
console.log('   Run: psql <connection-string> -f cancel-all-subscriptions.sql');
console.log('   Or use Supabase SQL Editor to run cancel-all-subscriptions.sql\n');

console.log('5. Restart your server to apply changes\n');

console.log('6. Test with small amounts:');
console.log('   M-Pesa: 5 KES minimum');
console.log('   Crypto: Check network minimum transfer amounts\n');

console.log('='.repeat(70));
console.log('\n✅ After completing these steps, payments will be real!\n');
console.log('⚠️  Make sure to test with small amounts first.\n');

