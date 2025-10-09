const axios = require('axios');
const crypto = require('crypto');

class BlockchainMonitorService {
  constructor() {
    this.isMockMode = !process.env.COINBASE_API_KEY || process.env.COINBASE_API_KEY.includes('your_');
    this.activePayments = new Map(); // Track active payments
    this.confirmationThresholds = {
      BTC: 6,  // Bitcoin requires 6 confirmations
      ETH: 12, // Ethereum requires 12 confirmations  
      BNB: 12, // BSC requires 12 confirmations
      USDT: 12 // USDT on Ethereum requires 12 confirmations
    };
  }

  /**
   * Start monitoring a payment
   */
  async startPaymentMonitoring(paymentData) {
    const {
      paymentId,
      eaId,
      subscriptionType,
      amount,
      currency,
      cryptoOptions,
      userId
    } = paymentData;

    // Store payment for monitoring
    this.activePayments.set(paymentId, {
      ...paymentData,
      status: 'pending',
      startTime: Date.now(),
      lastChecked: Date.now(),
      confirmations: {},
      attempts: 0
    });

    console.log(`[BlockchainMonitor] Started monitoring payment ${paymentId}`);

    // Start monitoring loop
    this.monitorPayment(paymentId);
    
    return {
      success: true,
      paymentId,
      monitoringStarted: true
    };
  }

  /**
   * Monitor a specific payment
   */
  async monitorPayment(paymentId) {
    const payment = this.activePayments.get(paymentId);
    if (!payment) return;

    const maxAttempts = 120; // 30 minutes (15 second intervals)
    const interval = 15000; // 15 seconds

    const checkPayment = async () => {
      payment.attempts++;
      payment.lastChecked = Date.now();

      console.log(`[BlockchainMonitor] Checking payment ${paymentId} (attempt ${payment.attempts})`);

      try {
        // Check each crypto option
        for (const [cryptoType, cryptoData] of Object.entries(payment.cryptoOptions)) {
          const isPaid = await this.checkCryptoPayment(cryptoType, cryptoData);
          
          if (isPaid) {
            console.log(`[BlockchainMonitor] Payment detected for ${cryptoType} - ${paymentId}`);
            
            // Verify the payment
            const verified = await this.verifyPayment(paymentId, cryptoType, cryptoData);
            
            if (verified) {
              await this.processSuccessfulPayment(paymentId, cryptoType);
              return; // Stop monitoring
            }
          }
        }

        // Check if payment expired
        if (payment.attempts >= maxAttempts) {
          console.log(`[BlockchainMonitor] Payment ${paymentId} expired after ${maxAttempts} attempts`);
          this.activePayments.delete(paymentId);
          return;
        }

        // Continue monitoring
        setTimeout(checkPayment, interval);

      } catch (error) {
        console.error(`[BlockchainMonitor] Error checking payment ${paymentId}:`, error);
        setTimeout(checkPayment, interval);
      }
    };

    // Start monitoring
    setTimeout(checkPayment, interval);
  }

  /**
   * Check if crypto payment was made
   */
  async checkCryptoPayment(cryptoType, cryptoData) {
    if (this.isMockMode) {
      // In mock mode, simulate random payment detection
      return Math.random() < 0.1; // 10% chance of payment detection per check
    }

    try {
      switch (cryptoType.toLowerCase()) {
        case 'bitcoin':
          return await this.checkBitcoinPayment(cryptoData);
        case 'ethereum':
          return await this.checkEthereumPayment(cryptoData);
        case 'binance':
          return await this.checkBinancePayment(cryptoData);
        case 'usdt':
          return await this.checkUSDTPayment(cryptoData);
        default:
          return false;
      }
    } catch (error) {
      console.error(`[BlockchainMonitor] Error checking ${cryptoType} payment:`, error);
      return false;
    }
  }

  /**
   * Check Bitcoin payment using blockchain API
   */
  async checkBitcoinPayment(cryptoData) {
    try {
      const address = cryptoData.address;
      const expectedAmount = parseFloat(cryptoData.amount);
      
      // Use BlockCypher API to check transactions
      const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
      
      if (response.data && response.data.balance > 0) {
        // Check recent transactions
        const txsResponse = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/txs`);
        
        for (const tx of txsResponse.data.txs) {
          // Check if transaction is recent (last 30 minutes)
          const txTime = new Date(tx.received);
          const now = new Date();
          const timeDiff = (now - txTime) / 1000 / 60; // minutes
          
          if (timeDiff <= 30) {
            // Check if amount matches (within 5% tolerance)
            const txAmount = tx.total / 100000000; // Convert satoshis to BTC
            if (Math.abs(txAmount - expectedAmount) / expectedAmount <= 0.05) {
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('[BlockchainMonitor] Error checking Bitcoin payment:', error);
      return false;
    }
  }

  /**
   * Check Ethereum payment using Etherscan API
   */
  async checkEthereumPayment(cryptoData) {
    try {
      const address = cryptoData.address.toLowerCase();
      const expectedAmount = parseFloat(cryptoData.amount);
      
      // Use Etherscan API
      const apiKey = process.env.ETHERSCAN_API_KEY || 'YourEtherscanAPIKey';
      const response = await axios.get(`https://api.etherscan.io/api`, {
        params: {
          module: 'account',
          action: 'txlist',
          address: address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 10,
          sort: 'desc',
          apikey: apiKey
        }
      });

      if (response.data && response.data.result) {
        const now = Math.floor(Date.now() / 1000);
        
        for (const tx of response.data.result) {
          // Check if transaction is recent (last 30 minutes)
          const txTime = parseInt(tx.timeStamp);
          const timeDiff = (now - txTime) / 60; // minutes
          
          if (timeDiff <= 30 && tx.to.toLowerCase() === address) {
            // Check if amount matches (within 5% tolerance)
            const txAmount = parseFloat(tx.value) / Math.pow(10, 18); // Convert wei to ETH
            if (Math.abs(txAmount - expectedAmount) / expectedAmount <= 0.05) {
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('[BlockchainMonitor] Error checking Ethereum payment:', error);
      return false;
    }
  }

  /**
   * Check Binance Smart Chain payment
   */
  async checkBinancePayment(cryptoData) {
    try {
      const address = cryptoData.address.toLowerCase();
      const expectedAmount = parseFloat(cryptoData.amount);
      
      // Use BSCScan API (similar to Etherscan)
      const apiKey = process.env.BSCSCAN_API_KEY || 'YourBSCScanAPIKey';
      const response = await axios.get(`https://api.bscscan.com/api`, {
        params: {
          module: 'account',
          action: 'txlist',
          address: address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 10,
          sort: 'desc',
          apikey: apiKey
        }
      });

      if (response.data && response.data.result) {
        const now = Math.floor(Date.now() / 1000);
        
        for (const tx of response.data.result) {
          const txTime = parseInt(tx.timeStamp);
          const timeDiff = (now - txTime) / 60;
          
          if (timeDiff <= 30 && tx.to.toLowerCase() === address) {
            const txAmount = parseFloat(tx.value) / Math.pow(10, 18);
            if (Math.abs(txAmount - expectedAmount) / expectedAmount <= 0.05) {
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('[BlockchainMonitor] Error checking Binance payment:', error);
      return false;
    }
  }

  /**
   * Check USDT payment (on Ethereum network)
   */
  async checkUSDTPayment(cryptoData) {
    // USDT is an ERC-20 token, so we check for token transfers
    try {
      const address = cryptoData.address.toLowerCase();
      const expectedAmount = parseFloat(cryptoData.amount) * Math.pow(10, 6); // USDT has 6 decimals
      
      // USDT contract address on Ethereum mainnet
      const usdtContract = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      
      const apiKey = process.env.ETHERSCAN_API_KEY || 'YourEtherscanAPIKey';
      const response = await axios.get(`https://api.etherscan.io/api`, {
        params: {
          module: 'account',
          action: 'tokentx',
          contractaddress: usdtContract,
          address: address,
          page: 1,
          offset: 10,
          sort: 'desc',
          apikey: apiKey
        }
      });

      if (response.data && response.data.result) {
        const now = Math.floor(Date.now() / 1000);
        
        for (const tx of response.data.result) {
          const txTime = parseInt(tx.timeStamp);
          const timeDiff = (now - txTime) / 60;
          
          if (timeDiff <= 30 && tx.to.toLowerCase() === address) {
            const txAmount = parseFloat(tx.value);
            if (Math.abs(txAmount - expectedAmount) / expectedAmount <= 0.05) {
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('[BlockchainMonitor] Error checking USDT payment:', error);
      return false;
    }
  }

  /**
   * Verify payment with additional security checks
   */
  async verifyPayment(paymentId, cryptoType, cryptoData) {
    const payment = this.activePayments.get(paymentId);
    if (!payment) return false;

    try {
      // Additional verification steps
      const verificationChecks = [
        this.checkPaymentAmount(cryptoData, payment.amount),
        this.checkPaymentTiming(payment),
        this.checkDuplicatePayment(paymentId, cryptoData)
      ];

      const results = await Promise.all(verificationChecks);
      const allPassed = results.every(result => result === true);

      if (allPassed) {
        console.log(`[BlockchainMonitor] Payment ${paymentId} verified successfully`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`[BlockchainMonitor] Error verifying payment ${paymentId}:`, error);
      return false;
    }
  }

  /**
   * Check if payment amount is correct
   */
  async checkPaymentAmount(cryptoData, expectedAmount) {
    const receivedAmount = parseFloat(cryptoData.amount);
    const tolerance = 0.05; // 5% tolerance
    
    return Math.abs(receivedAmount - expectedAmount) / expectedAmount <= tolerance;
  }

  /**
   * Check if payment timing is valid
   */
  async checkPaymentTiming(payment) {
    const now = Date.now();
    const timeDiff = (now - payment.startTime) / 1000 / 60; // minutes
    
    // Payment must be within 30 minutes
    return timeDiff <= 30;
  }

  /**
   * Check for duplicate payments
   */
  async checkDuplicatePayment(paymentId, cryptoData) {
    // In a real implementation, you'd check against a database
    // For now, we'll assume no duplicates
    return true;
  }

  /**
   * Process successful payment
   */
  async processSuccessfulPayment(paymentId, cryptoType) {
    const payment = this.activePayments.get(paymentId);
    if (!payment) return;

    try {
      console.log(`[BlockchainMonitor] Processing successful payment ${paymentId}`);

      // Update payment status
      payment.status = 'completed';
      payment.completedAt = Date.now();
      payment.cryptoType = cryptoType;

      // Grant access to EA
      await this.grantEAAccess(payment);

      // Send confirmation email/notification
      await this.sendConfirmation(payment);

      // Clean up
      this.activePayments.delete(paymentId);

      console.log(`[BlockchainMonitor] Payment ${paymentId} processed successfully`);

    } catch (error) {
      console.error(`[BlockchainMonitor] Error processing payment ${paymentId}:`, error);
    }
  }

  /**
   * Grant EA access to user
   */
  async grantEAAccess(payment) {
    try {
      // In a real implementation, you'd update the database
      // to grant the user access to the EA
      
      console.log(`[BlockchainMonitor] Granting EA access:`, {
        userId: payment.userId,
        eaId: payment.eaId,
        subscriptionType: payment.subscriptionType,
        amount: payment.amount
      });

      // TODO: Implement database update
      // await updateUserSubscription(payment.userId, payment.eaId, payment.subscriptionType);

    } catch (error) {
      console.error('[BlockchainMonitor] Error granting EA access:', error);
    }
  }

  /**
   * Send payment confirmation
   */
  async sendConfirmation(payment) {
    try {
      console.log(`[BlockchainMonitor] Sending confirmation for payment ${payment.paymentId}`);
      
      // TODO: Implement email/notification system
      // await sendPaymentConfirmationEmail(payment);

    } catch (error) {
      console.error('[BlockchainMonitor] Error sending confirmation:', error);
    }
  }

  /**
   * Get payment status
   */
  getPaymentStatus(paymentId) {
    const payment = this.activePayments.get(paymentId);
    
    if (!payment) {
      return {
        status: 'not_found',
        message: 'Payment not found or expired'
      };
    }

    return {
      status: payment.status,
      startTime: payment.startTime,
      lastChecked: payment.lastChecked,
      attempts: payment.attempts,
      expiresAt: payment.startTime + (30 * 60 * 1000) // 30 minutes
    };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'blockchain-monitor',
      configured: !this.isMockMode,
      mode: this.isMockMode ? 'mock' : 'live',
      activePayments: this.activePayments.size,
      supportedNetworks: ['Bitcoin', 'Ethereum', 'BSC', 'USDT'],
      features: [
        'automatic_monitoring',
        'payment_detection',
        'verification',
        'access_granting'
      ]
    };
  }
}

module.exports = new BlockchainMonitorService();
