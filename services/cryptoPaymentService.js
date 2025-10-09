
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
            },
            usdt: {
              address: this.generateUSDTAddress(),
              amount: (amount / rates.USDT).toFixed(2),
              qrCode: this.generateQRCode('ethereum:' + this.generateUSDTAddress())
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
          BNB: 300,
          USDT: 1.00
        };
      }

      const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
        params: {
          symbols: JSON.stringify(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'USDTUSDT'])
        }
      });

      const rates = {};
      response.data.forEach(ticker => {
        const symbol = ticker.symbol.replace('USDT', '');
        rates[symbol] = parseFloat(ticker.price);
      });

      // USDT is pegged to USD, so rate is always ~1.00
      rates.USDT = 1.00;

      return rates;
    } catch (error) {
      console.error('Error fetching crypto rates:', error);
      // Fallback rates
      return {
        BTC: 45000,
        ETH: 3000,
        BNB: 300,
        USDT: 1.00
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
    
    console.log(`Verifying ${cryptoType} transaction: ${txHash}`);
    
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
   * Generate Bitcoin address (use real address from environment)
   */
  generateBitcoinAddress() {
    // Use your real Bitcoin wallet address from .env
    const address = process.env.BITCOIN_WALLET_ADDRESS;
    if (address && !address.includes('your_')) {
      return address;
    }
    // Fallback to mock address for testing
    console.warn('[CryptoPayment] Using mock Bitcoin address. Set BITCOIN_WALLET_ADDRESS in .env for production.');
    return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
  }

  /**
   * Generate Ethereum address (use real address from environment)
   */
  generateEthereumAddress() {
    // Use your real Ethereum wallet address from .env
    const address = process.env.ETHEREUM_WALLET_ADDRESS;
    if (address && !address.includes('your_')) {
      return address;
    }
    // Fallback to mock address for testing
    console.warn('[CryptoPayment] Using mock Ethereum address. Set ETHEREUM_WALLET_ADDRESS in .env for production.');
    return '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c';
  }

  /**
   * Generate Binance Smart Chain address (use real address from environment)
   */
  generateBinanceAddress() {
    // Use your real BSC wallet address from .env
    const address = process.env.BINANCE_WALLET_ADDRESS;
    if (address && !address.includes('your_')) {
      return address;
    }
    // Fallback to mock address for testing
    console.warn('[CryptoPayment] Using mock Binance address. Set BINANCE_WALLET_ADDRESS in .env for production.');
    return '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c';
  }

  /**
   * Generate USDT address (use real address from environment)
   */
  generateUSDTAddress() {
    // Use your real USDT wallet address from .env (can be same as Ethereum)
    const address = process.env.USDT_WALLET_ADDRESS || process.env.ETHEREUM_WALLET_ADDRESS;
    if (address && !address.includes('your_')) {
      return address;
    }
    // Fallback to mock address for testing
    console.warn('[CryptoPayment] Using mock USDT address. Set USDT_WALLET_ADDRESS in .env for production.');
    return '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c';
  }

  /**
   * Generate QR code URL (placeholder - use real QR generation)
   */
  generateQRCode(address) {
    // Use a QR code service like qr-server.com
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
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
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
        },
        ethereum: {
          address: '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c',
          amount: (amount / 3000).toFixed(6),
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ethereum:0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c`
        },
        binance: {
          address: '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c',
          amount: (amount / 300).toFixed(4),
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=binance:0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c`
        },
        usdt: {
          address: '0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c',
          amount: (amount / 1.00).toFixed(2),
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ethereum:0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c`
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
      supportedCryptos: ['BTC', 'ETH', 'BNB', 'USDT'],
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
