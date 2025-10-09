#!/usr/bin/env node

/**
 * Create .env file with all wallet address placeholders
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 Creating .env file with all wallet address placeholders...\n');

const envContent = `# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost
ENCRYPTION_KEY=base64-encoded-32-byte-key
REACT_APP_API_URL=http://localhost:5000
REACT_APP_VISME_EMBED_ENABLED=false

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Payment Gateway Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Market Data API Keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
IEX_CLOUD_API_KEY=your_iex_cloud_key
POLYGON_API_KEY=zWxIZDCoMru2yl8q4ER9OH1NVPb4Dupj
POLYGON_S3_ACCESS_KEY=0bb483e2-9a38-40dd-8e70-b216910bb680
POLYGON_S3_SECRET_KEY=zWxIZDCoMru2yl8q4ER9OH1NVPb4Dupj
POLYGON_S3_ENDPOINT=https://files.polygon.io
POLYGON_S3_BUCKET=flatfiles
MARKETAUX_API_KEY=UQuKirjX1oPrPMH9C4hsFCrvfwXMWkFWUI5q65XC
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Kenyan Market Data
NSE_API_KEY=your_nse_api_key
NSE_API_URL=https://api.nse.co.ke

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=your-32-byte-encryption-key-here
VALID_API_KEYS=api_key_1,api_key_2,api_key_3
ADMIN_REGISTRATION_CODE=ADMIN_SMART_ALGOS_2024

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# WebSocket Configuration
WS_PORT=5001

# AI/ML Configuration
OPENAI_API_KEY=your_openai_api_key
ML_MODEL_PATH=./models

# Blockchain Configuration
ETHEREUM_MAINNET_RPC=https://mainnet.infura.io/v3/your_project_id
ETHEREUM_TESTNET_RPC=https://goerli.infura.io/v3/your_project_id
POLYGON_MAINNET_RPC=https://polygon-rpc.com
POLYGON_TESTNET_RPC=https://rpc-mumbai.maticvigil.com
BSC_MAINNET_RPC=https://bsc-dataseed.binance.org
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545

# Escrow Configuration
# Escrow.com API Credentials
ESCROW_EMAIL=your-email@example.com
ESCROW_PASSWORD=your-escrow-password
ESCROW_API_KEY=your-escrow-api-key
ESCROW_WEBHOOK_SECRET=your-escrow-webhook-secret

# Blockchain Escrow (Optional)
MULTISIG_CONTRACT_ADDRESS=0x...
ESCROW_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_ethereum_private_key


# Crypto Payment Configuration
COINBASE_API_KEY=your_coinbase_commerce_api_key
COINBASE_WEBHOOK_SECRET=your_webhook_secret

# Binance Integration (for crypto rates)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Optional: Other crypto services
BITPAY_API_KEY=your_bitpay_api_key
CRYPTOCOM_API_KEY=your_crypto_com_api_key

# Your Wallet Addresses (add these for crypto payments)
BITCOIN_WALLET_ADDRESS=your_bitcoin_wallet_address_here
ETHEREUM_WALLET_ADDRESS=your_ethereum_wallet_address_here
BINANCE_WALLET_ADDRESS=your_binance_smart_chain_wallet_address_here
USDT_WALLET_ADDRESS=your_usdt_wallet_address_here

# Bitcoin/Ethereum RPC (for direct blockchain access)
BITCOIN_RPC_URL=https://mainnet.infura.io/v3/your_project_id
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id`;

try {
  // Check if .env already exists
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('📝 Adding wallet address placeholders to existing .env file...');
    
    // Read existing .env content
    let existingContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if wallet addresses section exists
    if (!existingContent.includes('# Your Wallet Addresses')) {
      // Add wallet addresses section
      const walletAddressesSection = `

# Your Wallet Addresses (add these for crypto payments)
BITCOIN_WALLET_ADDRESS=your_bitcoin_wallet_address_here
ETHEREUM_WALLET_ADDRESS=your_ethereum_wallet_address_here
BINANCE_WALLET_ADDRESS=your_binance_smart_chain_wallet_address_here
USDT_WALLET_ADDRESS=your_usdt_wallet_address_here`;
      
      existingContent += walletAddressesSection;
      fs.writeFileSync(envPath, existingContent);
      console.log('   ✅ Wallet address placeholders added to existing .env file');
    } else {
      console.log('   ✅ Wallet address placeholders already exist in .env file');
    }
  } else {
    // Create new .env file
    fs.writeFileSync(envPath, envContent);
    console.log('   ✅ .env file created with all placeholders');
  }
  
  console.log('\n🎉 Setup Complete!\n');
  console.log('📋 Your .env file now contains these wallet address placeholders:');
  console.log('   • BITCOIN_WALLET_ADDRESS=your_bitcoin_wallet_address_here');
  console.log('   • ETHEREUM_WALLET_ADDRESS=your_ethereum_wallet_address_here');
  console.log('   • BINANCE_WALLET_ADDRESS=your_binance_smart_chain_wallet_address_here');
  console.log('   • USDT_WALLET_ADDRESS=your_usdt_wallet_address_here');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Edit your .env file and replace the placeholder values');
  console.log('2. Or run: node setup-wallet-addresses.js (now includes USDT!)');
  console.log('3. Start your server: npm start');
  console.log('4. Test crypto payments: node test-crypto-payments.js');
  
  console.log('\n💡 Tip: You can edit your .env file with:');
  console.log('   • notepad .env (Windows)');
  console.log('   • nano .env (Linux/Mac)');
  console.log('   • code .env (VS Code)');
  
  console.log('\n🔐 Security: Keep your private keys safe and never share them!\n');

} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n💡 You can manually copy env.example to .env:');
  console.log('   cp env.example .env');
}
