#!/usr/bin/env node

/**
 * Crypto Payment Setup Script
 * Sets up basic crypto payment integration for AlgoSmart platform
 */

const fs = require('fs');
const path = require('path');

console.log('\n💰 AlgoSmart Crypto Payment Setup\n');
console.log('This script will set up crypto payment integration.\n');

// Create crypto payment service
function createCryptoPaymentService() {
  console.log('🔧 Creating crypto payment service...');
  
  const serviceCode = `
const axios = require('axios');
const crypto = require('crypto');

class CryptoPaymentService {
  constructor() {
    this.coinbaseApiKey = process.env.COINBASE_API_KEY;
    this.binanceApiKey = process.env.BINANCE_API_KEY;
    this.binanceSecretKey = process.env.BINANCE_SECRET_KEY;
    this.isMockMode = !this.coinbaseApiKey || this.coinbaseApiKey.includes('your_');
    
    if (this.isMockMode) {
      console.warn('[CryptoPayment] Running in mock mode. Add COINBASE_API_KEY to enable live payments.');
    }
  }

  /**
   * Generate payment request with crypto options
   */
  async createPaymentRequest(amount, currency = 'USD') {
    try {
      if (this.isMockMode) {
        return this.getMockCryptoOptions(amount);
      }

      // Get current crypto rates
      const rates = await this.getCryptoRates();
      
      return {
        paymentId: this.generatePaymentId(),
        amount: amount,
        currency: currency,
        cryptoOptions: {
          bitcoin: {
            address: this.generateBitcoinAddress(),
            amount: (amount / rates.BTC).toFixed(8),
            qrCode: this.generateQRCode('bitcoin:' + this.generateBitcoinAddress())
          },
          ethereum: {
            address: this.generateEthereumAddress(),
            amount: (amount / rates.ETH).toFixed(6),
            qrCode: this.generateQRCode('ethereum:' + this.generateEthereumAddress())
          },
          binance: {
            address: this.generateBinanceAddress(),
            amount: (amount / rates.BNB).toFixed(4),
            qrCode: this.generateQRCode('binance:' + this.generateBinanceAddress())
          }
        },
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      };
    } catch (error) {
      console.error('Error creating crypto payment request:', error);
      throw error;
    }
  }

  /**
   * Get current cryptocurrency rates
   */
  async getCryptoRates() {
    try {
      if (this.isMockMode) {
        return {
          BTC: 45000,
          ETH: 3000,
          BNB: 300
        };
      }

      const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
        params: {
          symbols: JSON.stringify(['BTCUSDT', 'ETHUSDT', 'BNBUSDT'])
        }
      });

      const rates = {};
      response.data.forEach(ticker => {
        const symbol = ticker.symbol.replace('USDT', '');
        rates[symbol] = parseFloat(ticker.price);
      });

      return rates;
    } catch (error) {
      console.error('Error fetching crypto rates:', error);
      // Fallback rates
      return {
        BTC: 45000,
        ETH: 3000,
        BNB: 300
      };
    }
  }

  /**
   * Verify crypto payment
   */
  async verifyPayment(paymentId, txHash, cryptoType) {
    try {
      // In mock mode, always return true for testing
      if (this.isMockMode) {
        console.log('[CryptoPayment] Mock verification - payment accepted');
        return true;
      }

      // Here you would implement actual blockchain verification
      // For now, we'll simulate verification
      return this.simulatePaymentVerification(txHash, cryptoType);
    } catch (error) {
      console.error('Error verifying crypto payment:', error);
      return false;
    }
  }

  /**
   * Simulate payment verification (replace with real blockchain verification)
   */
  async simulatePaymentVerification(txHash, cryptoType) {
    // This is a placeholder - implement real verification
    // Check transaction on blockchain
    // Verify amount and address
    // Wait for confirmations
    
    console.log(\`Verifying \${cryptoType} transaction: \${txHash}\`);
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept all transactions
    return true;
  }

  /**
   * Generate unique payment ID
   */
  generatePaymentId() {
    return 'crypto_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
  }

  /**
   * Generate Bitcoin address (placeholder - use real address generation)
   */
  generateBitcoinAddress() {
    // This should be a real Bitcoin address from your wallet
    return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
  }

  /**
   * Generate Ethereum address (placeholder - use real address generation)
   */
  generateEthereumAddress() {
    // This should be a real Ethereum address from your wallet
    return '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c';
  }

  /**
   * Generate Binance Smart Chain address (placeholder - use real address generation)
   */
  generateBinanceAddress() {
    // This should be a real BSC address from your wallet
    return '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c';
  }

  /**
   * Generate QR code URL (placeholder - use real QR generation)
   */
  generateQRCode(address) {
    // Use a QR code service like qr-server.com
    return \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(address)}\`;
  }

  /**
   * Get mock crypto options for testing
   */
  getMockCryptoOptions(amount) {
    return {
      paymentId: this.generatePaymentId(),
      amount: amount,
      currency: 'USD',
      cryptoOptions: {
        bitcoin: {
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          amount: (amount / 45000).toFixed(8),
          qrCode: \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\`
        },
        ethereum: {
          address: '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c',
          amount: (amount / 3000).toFixed(6),
          qrCode: \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ethereum:0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c\`
        },
        binance: {
          address: '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c',
          amount: (amount / 300).toFixed(4),
          qrCode: \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=binance:0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c\`
        }
      },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      isMock: true
    };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'crypto-payments',
      configured: !this.isMockMode,
      mode: this.isMockMode ? 'mock' : 'live',
      supportedCryptos: ['BTC', 'ETH', 'BNB'],
      features: [
        'payment_generation',
        'qr_codes',
        'rate_conversion',
        'payment_verification'
      ]
    };
  }
}

module.exports = new CryptoPaymentService();
`;

  try {
    fs.writeFileSync(path.join(__dirname, 'services', 'cryptoPaymentService.js'), serviceCode);
    console.log('   ✅ Crypto payment service created');
    return true;
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    return false;
  }
}

// Add crypto payment routes
function addCryptoPaymentRoutes() {
  console.log('\n🔧 Adding crypto payment routes...');
  
  const routesCode = `
// Crypto Payment Routes
const cryptoPaymentService = require('../services/cryptoPaymentService');

// @route   POST /api/payments/crypto/initialize
// @desc    Initialize crypto payment
// @access  Private
router.post('/crypto/initialize', [
  auth,
  updateActivity,
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'EUR', 'GBP']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, currency } = req.body;
    
    const cryptoPayment = await cryptoPaymentService.createPaymentRequest(amount, currency);
    
    // Log crypto payment initialization
    securityService.logSecurityEvent('crypto_payment_initialized', {
      userId: req.user._id,
      amount,
      currency,
      paymentId: cryptoPayment.paymentId,
      ip: securityService.getClientIP(req)
    });

    res.json({
      success: true,
      data: cryptoPayment,
      message: 'Crypto payment request created'
    });

  } catch (error) {
    console.error('Crypto payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize crypto payment'
    });
  }
});

// @route   POST /api/payments/crypto/verify
// @desc    Verify crypto payment
// @access  Private
router.post('/crypto/verify', [
  auth,
  body('paymentId').isString().withMessage('Payment ID is required'),
  body('txHash').isString().withMessage('Transaction hash is required'),
  body('cryptoType').isIn(['BTC', 'ETH', 'BNB']).withMessage('Invalid crypto type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { paymentId, txHash, cryptoType } = req.body;
    
    const verified = await cryptoPaymentService.verifyPayment(paymentId, txHash, cryptoType);
    
    if (verified) {
      // Log successful verification
      securityService.logSecurityEvent('crypto_payment_verified', {
        userId: req.user._id,
        paymentId,
        txHash,
        cryptoType,
        ip: securityService.getClientIP(req)
      });
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId,
          txHash,
          cryptoType,
          verifiedAt: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Crypto payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify crypto payment'
    });
  }
});

// @route   GET /api/payments/crypto/status
// @desc    Get crypto payment service status
// @access  Private
router.get('/crypto/status', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const status = cryptoPaymentService.getStatus();
    
    res.json({
      success: true,
      data: status,
      message: 'Crypto payment service status retrieved'
    });

  } catch (error) {
    console.error('Get crypto payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crypto payment service status'
    });
  }
});
`;

  try {
    const paymentsFile = path.join(__dirname, 'routes', 'payments.js');
    let content = fs.readFileSync(paymentsFile, 'utf8');
    
    // Add crypto routes before the last line (module.exports)
    const lastLine = content.lastIndexOf('module.exports = router;');
    const beforeExports = content.substring(0, lastLine);
    const afterExports = content.substring(lastLine);
    
    const newContent = beforeExports + routesCode + '\n' + afterExports;
    fs.writeFileSync(paymentsFile, newContent);
    
    console.log('   ✅ Crypto payment routes added');
    return true;
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    return false;
  }
}

// Update environment example
function updateEnvExample() {
  console.log('\n🔧 Updating environment example...');
  
  const envAdditions = `
# Crypto Payment Configuration
COINBASE_API_KEY=your_coinbase_commerce_api_key
COINBASE_WEBHOOK_SECRET=your_webhook_secret

# Binance Integration (for crypto rates)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Optional: Other crypto services
BITPAY_API_KEY=your_bitpay_api_key
CRYPTOCOM_API_KEY=your_crypto_com_api_key

# Bitcoin/Ethereum RPC (for direct blockchain access)
BITCOIN_RPC_URL=https://mainnet.infura.io/v3/your_project_id
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
`;

  try {
    const envFile = path.join(__dirname, 'env.example');
    fs.appendFileSync(envFile, envAdditions);
    console.log('   ✅ Environment variables added');
    return true;
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    return false;
  }
}

// Create frontend crypto payment component
function createCryptoPaymentComponent() {
  console.log('\n🔧 Creating crypto payment component...');
  
  const componentCode = `
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Clock, Shield } from 'lucide-react';
import apiClient from '../../lib/apiClient';

const CryptoPaymentDialog = ({ 
  isOpen, 
  onClose, 
  amount = 18, 
  currency = 'USD',
  onPaymentSuccess 
}) => {
  const [cryptoPayment, setCryptoPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);

  useEffect(() => {
    if (isOpen && !cryptoPayment) {
      initializeCryptoPayment();
    }
  }, [isOpen]);

  const initializeCryptoPayment = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/payments/crypto/initialize', {
        amount,
        currency
      });

      if (response.data.success) {
        setCryptoPayment(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to initialize crypto payment');
      }
    } catch (error) {
      console.error('Crypto payment initialization error:', error);
      alert('Failed to initialize crypto payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatCryptoAmount = (amount) => {
    return parseFloat(amount).toFixed(8).replace(/\.?0+$/, '');
  };

  const getCryptoIcon = (crypto) => {
    const icons = {
      bitcoin: '₿',
      ethereum: 'Ξ',
      binance: '🟡'
    };
    return icons[crypto] || '₿';
  };

  const getCryptoName = (crypto) => {
    const names = {
      bitcoin: 'Bitcoin (BTC)',
      ethereum: 'Ethereum (ETH)',
      binance: 'Binance Coin (BNB)'
    };
    return names[crypto] || crypto;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pay with Cryptocurrency
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Amount: ${amount} {currency}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Send the exact amount to any address below. Payment expires in 30 minutes.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Initializing crypto payment...</p>
            </div>
          ) : cryptoPayment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(cryptoPayment.cryptoOptions).map(([crypto, data]) => (
                  <div
                    key={crypto}
                    className={\`border-2 rounded-lg p-4 transition-all cursor-pointer \${
                      selectedCrypto === crypto
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }\`}
                    onClick={() => setSelectedCrypto(crypto)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg">{getCryptoIcon(crypto)}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getCryptoName(crypto)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Amount:
                      </div>
                      <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {formatCryptoAmount(data.amount)} {crypto.toUpperCase()}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Address:
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 truncate">
                          {data.address}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(data.address, crypto);
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {copiedAddress === crypto && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Copied!
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedCrypto && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    {getCryptoName(selectedCrypto)} Payment Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        QR Code:
                      </div>
                      <img
                        src={cryptoPayment.cryptoOptions[selectedCrypto].qrCode}
                        alt={\`\${selectedCrypto} QR Code\`}
                        className="w-32 h-32 border rounded"
                      />
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Send to this address:
                      </div>
                      <div className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded border break-all">
                        {cryptoPayment.cryptoOptions[selectedCrypto].address}
                      </div>
                      <button
                        onClick={() => copyToClipboard(
                          cryptoPayment.cryptoOptions[selectedCrypto].address, 
                          selectedCrypto
                        )}
                        className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
                      >
                        Copy Address
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        Payment expires at: {new Date(cryptoPayment.expiresAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Here you would implement payment verification
                    alert('After sending crypto, please contact support with your transaction hash for verification.');
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  I've Sent Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Failed to initialize crypto payment</p>
              <button
                onClick={initializeCryptoPayment}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CryptoPaymentDialog;
`;

  try {
    ensureDir(path.join(__dirname, 'client', 'src', 'components', 'Payments'));
    fs.writeFileSync(
      path.join(__dirname, 'client', 'src', 'components', 'Payments', 'CryptoPaymentDialog.js'), 
      componentCode
    );
    console.log('   ✅ Crypto payment component created');
    return true;
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    return false;
  }
}

// Helper function to ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Create test script
function createCryptoPaymentTest() {
  console.log('\n🔧 Creating crypto payment test...');
  
  const testCode = `#!/usr/bin/env node

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
  console.log('\\n💰 Testing Crypto Payment Integration\\n');

  try {
    // Test 1: Get crypto payment service status
    console.log('1. Testing crypto payment service status...');
    const statusResult = await makeRequest('/api/payments/crypto/status', 'GET', null, {
      'Authorization': \`Bearer \${token || 'test_token'}\`
    });

    if (statusResult.status === 200) {
      console.log('   ✅ Crypto payment service status:', statusResult.data.data);
    } else {
      console.log('   ❌ Failed to get status:', statusResult.status);
    }

    // Test 2: Initialize crypto payment
    console.log('\\n2. Testing crypto payment initialization...');
    const initResult = await makeRequest('/api/payments/crypto/initialize', 'POST', {
      amount: 18,
      currency: 'USD'
    }, {
      'Authorization': \`Bearer \${token || 'test_token'}\`
    });

    if (initResult.status === 200) {
      console.log('   ✅ Crypto payment initialized');
      console.log('   Payment ID:', initResult.data.data.paymentId);
      console.log('   Bitcoin amount:', initResult.data.data.cryptoOptions.bitcoin.amount, 'BTC');
      console.log('   Ethereum amount:', initResult.data.data.cryptoOptions.ethereum.amount, 'ETH');
      console.log('   Binance amount:', initResult.data.data.cryptoOptions.binance.amount, 'BNB');
      
      // Test 3: Verify crypto payment (mock)
      console.log('\\n3. Testing crypto payment verification...');
      const verifyResult = await makeRequest('/api/payments/crypto/verify', 'POST', {
        paymentId: initResult.data.data.paymentId,
        txHash: 'mock_transaction_hash_123',
        cryptoType: 'BTC'
      }, {
        'Authorization': \`Bearer \${token || 'test_token'}\`
      });

      if (verifyResult.status === 200) {
        console.log('   ✅ Crypto payment verification successful');
      } else {
        console.log('   ❌ Verification failed:', verifyResult.status);
      }
    } else {
      console.log('   ❌ Failed to initialize crypto payment:', initResult.status);
    }

    console.log('\\n🎉 Crypto payment tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run tests
testCryptoPayment();`;

  try {
    fs.writeFileSync(path.join(__dirname, 'test-crypto-payments.js'), testCode);
    console.log('   ✅ Crypto payment test created');
    return true;
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    return false;
  }
}

// Main execution
async function runSetup() {
  console.log('Setting up crypto payment integration...\n');
  console.log('═'.repeat(60));
  
  const results = {
    service: createCryptoPaymentService(),
    routes: addCryptoPaymentRoutes(),
    env: updateEnvExample(),
    component: createCryptoPaymentComponent(),
    test: createCryptoPaymentTest()
  };

  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 SETUP RESULTS\n');
  
  let successCount = 0;
  Object.entries(results).forEach(([key, success]) => {
    if (success) {
      successCount++;
      console.log(`✅ ${key}: Success`);
    } else {
      console.log(`❌ ${key}: Failed`);
    }
  });

  console.log('\n' + '═'.repeat(60));
  console.log(`\n🎉 Setup Complete! ${successCount}/5 components created\n`);
  
  console.log('📋 NEXT STEPS:');
  console.log('1. Add crypto payment environment variables to .env');
  console.log('2. Restart your server: npm start');
  console.log('3. Test crypto payments: node test-crypto-payments.js');
  console.log('4. Update your payment dialog to use CryptoPaymentDialog component');
  console.log('5. Configure real crypto wallet addresses');
  
  console.log('\n📚 DOCUMENTATION:');
  console.log('- See CRYPTO_PAYMENT_SETUP_GUIDE.md for detailed instructions');
  console.log('- Component location: client/src/components/Payments/CryptoPaymentDialog.js');
  console.log('- Service location: services/cryptoPaymentService.js');
  
  console.log('\n⚠️  IMPORTANT:');
  console.log('- This is currently in MOCK mode for testing');
  console.log('- Add real wallet addresses before production use');
  console.log('- Implement real blockchain verification');
  console.log('- Configure actual crypto payment providers');
  
  console.log('\n');
}

// Run setup
runSetup().catch(console.error);
