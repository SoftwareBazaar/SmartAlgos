#!/usr/bin/env node

/**
 * Wallet Address Setup Script
 * Helps you add your crypto wallet addresses to the .env file
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🏦 AlgoSmart Wallet Address Setup\n');
console.log('This script will help you add your crypto wallet addresses to the .env file.\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupWalletAddresses() {
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, 'env.example');
    
    if (!fs.existsSync(envPath)) {
      console.log('📋 Creating .env file from env.example...');
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('   ✅ .env file created');
      } else {
        console.log('   ❌ env.example not found. Please create .env file manually.');
        return;
      }
    }

    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('\n🔐 Please provide your crypto wallet addresses:');
    console.log('(Press Enter to skip any address you don\'t have)\n');

    // Get Bitcoin address
    const bitcoinAddress = await question('Bitcoin Wallet Address (starts with 1, 3, or bc1): ');
    
    // Get Ethereum address
    const ethereumAddress = await question('Ethereum Wallet Address (starts with 0x): ');
    
    // Get Binance Smart Chain address
    const binanceAddress = await question('Binance Smart Chain Address (starts with 0x): ');
    
    // Get USDT address
    const usdtAddress = await question('USDT Wallet Address (starts with 0x, can be same as Ethereum): ');

    console.log('\n📝 Adding wallet addresses to .env file...');

    // Remove existing wallet address lines if they exist
    envContent = envContent.replace(/^BITCOIN_WALLET_ADDRESS=.*$/gm, '');
    envContent = envContent.replace(/^ETHEREUM_WALLET_ADDRESS=.*$/gm, '');
    envContent = envContent.replace(/^BINANCE_WALLET_ADDRESS=.*$/gm, '');
    envContent = envContent.replace(/^USDT_WALLET_ADDRESS=.*$/gm, '');

    // Add wallet addresses
    const walletAddresses = [];
    
    if (bitcoinAddress.trim()) {
      walletAddresses.push(`BITCOIN_WALLET_ADDRESS=${bitcoinAddress.trim()}`);
      console.log('   ✅ Bitcoin address added');
    }
    
    if (ethereumAddress.trim()) {
      walletAddresses.push(`ETHEREUM_WALLET_ADDRESS=${ethereumAddress.trim()}`);
      console.log('   ✅ Ethereum address added');
    }
    
    if (binanceAddress.trim()) {
      walletAddresses.push(`BINANCE_WALLET_ADDRESS=${binanceAddress.trim()}`);
      console.log('   ✅ Binance Smart Chain address added');
    }
    
    if (usdtAddress.trim()) {
      walletAddresses.push(`USDT_WALLET_ADDRESS=${usdtAddress.trim()}`);
      console.log('   ✅ USDT address added');
    }

    if (walletAddresses.length > 0) {
      // Find the crypto payment configuration section
      const cryptoConfigIndex = envContent.indexOf('# Crypto Payment Configuration');
      
      if (cryptoConfigIndex !== -1) {
        // Find the end of the crypto configuration section
        const lines = envContent.split('\n');
        let insertIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('# Crypto Payment Configuration')) {
            // Find the next empty line or section
            for (let j = i + 1; j < lines.length; j++) {
              if (lines[j].trim() === '' || lines[j].startsWith('#')) {
                insertIndex = j;
                break;
              }
            }
            break;
          }
        }
        
        if (insertIndex !== -1) {
          // Insert wallet addresses
          const walletConfig = '\n# Your Wallet Addresses\n' + walletAddresses.join('\n') + '\n';
          lines.splice(insertIndex, 0, walletConfig);
          envContent = lines.join('\n');
        }
      } else {
        // Add at the end of the file
        envContent += '\n\n# Your Wallet Addresses\n' + walletAddresses.join('\n') + '\n';
      }

      // Write updated .env file
      fs.writeFileSync(envPath, envContent);
      console.log('   ✅ .env file updated successfully');
    } else {
      console.log('   ⚠️  No wallet addresses provided. Using mock addresses for testing.');
    }

    console.log('\n🎉 Setup Complete!\n');
    
    if (walletAddresses.length > 0) {
      console.log('✅ Your wallet addresses have been added to the .env file');
      console.log('✅ Crypto payments will now use your real wallet addresses');
      console.log('✅ Users can send crypto directly to your wallets');
    } else {
      console.log('⚠️  No wallet addresses were added');
      console.log('⚠️  Crypto payments will use mock addresses for testing');
      console.log('⚠️  Add your wallet addresses later for production use');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Test crypto payments: node test-crypto-payments.js');
    console.log('3. Try the payment dialog in your app');
    
    if (walletAddresses.length === 0) {
      console.log('\n💡 To add wallet addresses later:');
      console.log('   - Edit your .env file');
      console.log('   - Add these lines:');
      console.log('   BITCOIN_WALLET_ADDRESS=your_bitcoin_address');
      console.log('   ETHEREUM_WALLET_ADDRESS=your_ethereum_address');
      console.log('   BINANCE_WALLET_ADDRESS=your_bsc_address');
    }

    console.log('\n🔐 Security Reminder:');
    console.log('- Keep your private keys safe');
    console.log('- Never share your private keys');
    console.log('- Test with small amounts first');
    console.log('- Monitor your wallet addresses for payments\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup
setupWalletAddresses();
