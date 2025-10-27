#!/usr/bin/env node

/**
 * Quick Crypto Wallet Setup Script
 * Adds your wallet addresses to Railway environment variables
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Crypto Wallet Setup for AlgoSmart\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Creating one...');
  fs.writeFileSync(envPath, '# AlgoSmart Environment Variables\n');
}

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// Add crypto wallet configuration section if it doesn't exist
if (!envContent.includes('# Crypto Wallet Addresses')) {
  envContent += '\n# Crypto Wallet Addresses\n';
  envContent += '# Add your real wallet addresses here:\n';
  envContent += 'BITCOIN_WALLET_ADDRESS=your_bitcoin_wallet_address_here\n';
  envContent += 'ETHEREUM_WALLET_ADDRESS=your_ethereum_wallet_address_here\n';
  envContent += 'USDT_WALLET_ADDRESS=your_usdt_wallet_address_here\n';
  envContent += 'USDC_WALLET_ADDRESS=your_usdc_wallet_address_here\n';
  envContent += '\n# Crypto Exchange Rates (update these regularly)\n';
  envContent += 'BTC_USD_RATE=65000\n';
  envContent += 'ETH_USD_RATE=3500\n';
  envContent += 'USDT_USD_RATE=1\n';
  envContent += 'USDC_USD_RATE=1\n';
}

// Write updated .env file
fs.writeFileSync(envPath, envContent);

console.log('✅ .env file updated with crypto wallet configuration');
console.log('\n📝 Next Steps:');
console.log('1. Edit your .env file and add your real wallet addresses');
console.log('2. Update Railway environment variables with your wallet addresses');
console.log('3. Test crypto payments');

console.log('\n🔧 Railway Environment Variables to Add:');
console.log('BITCOIN_WALLET_ADDRESS=your_bitcoin_address');
console.log('ETHEREUM_WALLET_ADDRESS=your_ethereum_address');
console.log('USDT_WALLET_ADDRESS=your_usdt_address');
console.log('USDC_WALLET_ADDRESS=your_usdc_address');

console.log('\n💰 Example Wallet Addresses:');
console.log('Bitcoin: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
console.log('Ethereum: 0x742d35Cc6634C0532925a3b8D1A4f4C4C6C4C6C4');
console.log('USDT (TRC20): TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE');

console.log('\n🚀 Your crypto payments will work immediately after adding real addresses!');
