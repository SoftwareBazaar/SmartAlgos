/**
 * Blockchain Monitoring Service
 * Automatically verifies crypto payments by checking blockchain transactions
 * Supports: Bitcoin, Ethereum, USDT (TRC20/ERC20), USDC (ERC20)
 * 
 * Uses BlockCypher API for Bitcoin and Ethereum networks
 * Uses TRON API for TRC20 tokens (USDT on Tron)
 */

const axios = require('axios');

// Simple logger wrapper
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
};

class BlockchainMonitorService {
  constructor() {
    // BlockCypher API (free tier: 200 requests/hour)
    this.blockcypher = {
      apiKey: process.env.BLOCKCYPHER_API_KEY || null,
      baseUrl: 'https://api.blockcypher.com/v1',
      rateLimit: 200, // requests per hour
      requestCount: 0,
      resetTime: Date.now() + 3600000 // 1 hour
    };

    // TRON API for TRC20 tokens
    this.tron = {
      baseUrl: 'https://api.trongrid.io',
      apiKey: process.env.TRON_API_KEY || null
    };

    // Etherscan for Ethereum (if BlockCypher fails)
    this.etherscan = {
      apiKey: process.env.ETHERSCAN_API_KEY || null,
      baseUrl: 'https://api.etherscan.io/api'
    };

    // Blockchain.info for Bitcoin (fallback)
    this.blockchainInfo = {
      baseUrl: 'https://blockchain.info'
    };

    this.confirmationThresholds = {
      btc: 1, // Bitcoin: 1 confirmation (can increase to 3-6 for large amounts)
      eth: 12, // Ethereum: 12 confirmations (~3 minutes)
      usdt_trc20: 19, // TRC20: 19 confirmations (~1 minute)
      usdt_erc20: 12, // ERC20: 12 confirmations
      usdc: 12 // ERC20: 12 confirmations
    };
  }

  /**
   * Check if BlockCypher API key is available
   */
  hasBlockCypherKey() {
    return !!this.blockcypher.apiKey;
  }

  /**
   * Check if transaction exists on blockchain
   * @param {Object} payment - Payment record from database
   * @returns {Promise<Object>} { confirmed: boolean, txHash: string, confirmations: number, error: string }
   */
  async verifyTransaction(payment) {
    const { crypto_currency, wallet_address, crypto_amount, network } = payment;
    
    try {
      switch (crypto_currency.toLowerCase()) {
        case 'btc':
          return await this.verifyBitcoinTransaction(payment);
        
        case 'eth':
          return await this.verifyEthereumTransaction(payment);
        
        case 'usdt':
          if (network === 'TRC20') {
            return await this.verifyTRC20Transaction(payment);
          } else {
            // ERC20 USDT
            return await this.verifyERC20Transaction(payment, 'USDT');
          }
        
        case 'usdc':
          return await this.verifyERC20Transaction(payment, 'USDC');
        
        default:
          return {
            confirmed: false,
            error: `Unsupported cryptocurrency: ${crypto_currency}`
          };
      }
    } catch (error) {
      logger.error('[Blockchain Monitor] Verification error:', error);
      return {
        confirmed: false,
        error: error.message || 'Blockchain verification failed'
      };
    }
  }

  /**
   * Verify Bitcoin transaction
   */
  async verifyBitcoinTransaction(payment) {
    const { wallet_address, crypto_amount } = payment;
    const expectedAmount = parseFloat(crypto_amount);

    try {
      if (this.hasBlockCypherKey()) {
        // Use BlockCypher API
        const response = await axios.get(
          `${this.blockcypher.baseUrl}/btc/main/addrs/${wallet_address}/balance`,
          {
            params: { token: this.blockcypher.apiKey },
            timeout: 10000
          }
        );

        // Get recent transactions
        const txsResponse = await axios.get(
          `${this.blockcypher.baseUrl}/btc/main/addrs/${wallet_address}`,
          {
            params: { 
              token: this.blockcypher.apiKey,
              limit: 50,
              unspentOnly: false
            },
            timeout: 10000
          }
        );

        // Check if any transaction matches amount and is recent
        const transactions = txsResponse.data.txs || [];
        const recentTxs = transactions.filter(tx => {
          const txTime = new Date(tx.received);
          const paymentTime = new Date(payment.created_at);
          // Transaction must be after payment was created
          return txTime >= paymentTime;
        });

        for (const tx of recentTxs) {
          // Check if transaction sends to our address
          const receivedAmount = this.calculateReceivedAmount(tx, wallet_address);
          
          if (Math.abs(receivedAmount - expectedAmount) < 0.00000001) { // Account for fees
            const confirmations = tx.confirmations || 0;
            const confirmed = confirmations >= this.confirmationThresholds.btc;
            
            return {
              confirmed,
              txHash: tx.hash,
              confirmations,
              amount: receivedAmount,
              timestamp: tx.received
            };
          }
        }

        return {
          confirmed: false,
          error: 'No matching transaction found'
        };
      } else {
        // Fallback to Blockchain.info API
        return await this.verifyBitcoinBlockchainInfo(payment);
      }
    } catch (error) {
      logger.error('[Blockchain Monitor] Bitcoin verification error:', error);
      
      // Fallback to Blockchain.info if BlockCypher fails
      if (this.hasBlockCypherKey()) {
        try {
          return await this.verifyBitcoinBlockchainInfo(payment);
        } catch (fallbackError) {
          return {
            confirmed: false,
            error: `Blockchain API error: ${error.message}`
          };
        }
      }
      
      return {
        confirmed: false,
        error: error.message || 'Bitcoin verification failed'
      };
    }
  }

  /**
   * Verify Bitcoin using Blockchain.info API (fallback)
   */
  async verifyBitcoinBlockchainInfo(payment) {
    const { wallet_address, crypto_amount } = payment;
    const expectedAmount = parseFloat(crypto_amount);

    try {
      const response = await axios.get(
        `${this.blockchainInfo.baseUrl}/rawaddr/${wallet_address}`,
        { timeout: 10000 }
      );

      const transactions = response.data.txs || [];
      const paymentTime = new Date(payment.created_at).getTime() / 1000;

      for (const tx of transactions) {
        // Transaction must be after payment was created
        if (tx.time < paymentTime) continue;

        // Calculate received amount
        for (const output of tx.out) {
          if (output.addr === wallet_address) {
            const receivedAmount = output.value / 100000000; // Satoshi to BTC
            
            if (Math.abs(receivedAmount - expectedAmount) < 0.00000001) {
              const confirmations = response.data.n_tx > 0 ? 1 : 0; // Basic check
              
              return {
                confirmed: confirmations >= this.confirmationThresholds.btc,
                txHash: tx.hash,
                confirmations,
                amount: receivedAmount,
                timestamp: new Date(tx.time * 1000).toISOString()
              };
            }
          }
        }
      }

      return {
        confirmed: false,
        error: 'No matching transaction found'
      };
    } catch (error) {
      return {
        confirmed: false,
        error: `Blockchain.info API error: ${error.message}`
      };
    }
  }

  /**
   * Verify Ethereum transaction
   */
  async verifyEthereumTransaction(payment) {
    const { wallet_address, crypto_amount } = payment;
    const expectedAmount = parseFloat(crypto_amount);

    try {
      if (this.hasBlockCypherKey()) {
        // Use BlockCypher API
        const response = await axios.get(
          `${this.blockcypher.baseUrl}/eth/main/addrs/${wallet_address}`,
          {
            params: { 
              token: this.blockcypher.apiKey,
              limit: 50
            },
            timeout: 10000
          }
        );

        const transactions = response.data.txs || [];
        const paymentTime = new Date(payment.created_at);

        for (const tx of transactions) {
          const txTime = new Date(tx.received);
          
          // Transaction must be after payment was created
          if (txTime < paymentTime) continue;

          // Check if transaction sends ETH to our address
          if (tx.addresses && tx.addresses.includes(wallet_address.toLowerCase())) {
            // Get transaction details
            const txDetailResponse = await axios.get(
              `${this.blockcypher.baseUrl}/eth/main/txs/${tx.hash}`,
              {
                params: { token: this.blockcypher.apiKey },
                timeout: 10000
              }
            );

            const txDetail = txDetailResponse.data;
            
            // Check if it's a transaction TO our address
            if (txDetail.outputs) {
              for (const output of txDetail.outputs) {
                if (output.addresses && output.addresses.includes(wallet_address.toLowerCase())) {
                  const receivedAmount = parseFloat(output.value) / 1e18; // Wei to ETH
                  
                  if (Math.abs(receivedAmount - expectedAmount) < 0.00000001) {
                    const confirmations = txDetail.confirmations || 0;
                    const confirmed = confirmations >= this.confirmationThresholds.eth;
                    
                    return {
                      confirmed,
                      txHash: tx.hash,
                      confirmations,
                      amount: receivedAmount,
                      timestamp: tx.received
                    };
                  }
                }
              }
            }
          }
        }

        return {
          confirmed: false,
          error: 'No matching transaction found'
        };
      } else if (this.etherscan.apiKey) {
        // Fallback to Etherscan
        return await this.verifyEthereumEtherscan(payment);
      } else {
        return {
          confirmed: false,
          error: 'No API keys configured for Ethereum verification'
        };
      }
    } catch (error) {
      logger.error('[Blockchain Monitor] Ethereum verification error:', error);
      return {
        confirmed: false,
        error: error.message || 'Ethereum verification failed'
      };
    }
  }

  /**
   * Verify Ethereum using Etherscan API (fallback)
   */
  async verifyEthereumEtherscan(payment) {
    const { wallet_address, crypto_amount } = payment;
    const expectedAmount = parseFloat(crypto_amount);
    const paymentTime = Math.floor(new Date(payment.created_at).getTime() / 1000);

    try {
      const response = await axios.get(this.etherscan.baseUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address: wallet_address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 100,
          sort: 'desc',
          apikey: this.etherscan.apiKey
        },
        timeout: 10000
      });

      if (response.data.status !== '1' || !response.data.result) {
        return {
          confirmed: false,
          error: 'No transactions found'
        };
      }

      const transactions = response.data.result;

      for (const tx of transactions) {
        // Transaction must be after payment was created and TO our address
        if (tx.timeStamp >= paymentTime && tx.to?.toLowerCase() === wallet_address.toLowerCase()) {
          const receivedAmount = parseFloat(tx.value) / 1e18; // Wei to ETH
          
          if (Math.abs(receivedAmount - expectedAmount) < 0.00000001) {
            const confirmations = parseInt(tx.confirmations) || 0;
            const confirmed = confirmations >= this.confirmationThresholds.eth;
            
            return {
              confirmed,
              txHash: tx.hash,
              confirmations,
              amount: receivedAmount,
              timestamp: new Date(tx.timeStamp * 1000).toISOString()
            };
          }
        }
      }

      return {
        confirmed: false,
        error: 'No matching transaction found'
      };
    } catch (error) {
      return {
        confirmed: false,
        error: `Etherscan API error: ${error.message}`
      };
    }
  }

  /**
   * Verify ERC20 token transaction (USDT/USDC on Ethereum)
   */
  async verifyERC20Transaction(payment, tokenSymbol) {
    const { wallet_address, crypto_amount } = payment;
    const expectedAmount = parseFloat(crypto_amount);

    // ERC20 token contract addresses
    const tokenContracts = {
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    };

    const tokenContract = tokenContracts[tokenSymbol];
    if (!tokenContract) {
      return {
        confirmed: false,
        error: `Unknown ERC20 token: ${tokenSymbol}`
      };
    }

    try {
      if (this.etherscan.apiKey) {
        // Use Etherscan for ERC20 tokens
        const paymentTime = Math.floor(new Date(payment.created_at).getTime() / 1000);

        const response = await axios.get(this.etherscan.baseUrl, {
          params: {
            module: 'account',
            action: 'tokentx',
            contractaddress: tokenContract,
            address: wallet_address,
            page: 1,
            offset: 100,
            sort: 'desc',
            apikey: this.etherscan.apiKey
          },
          timeout: 10000
        });

        if (response.data.status !== '1' || !response.data.result) {
          return {
            confirmed: false,
            error: 'No token transactions found'
          };
        }

        const transactions = response.data.result;

        for (const tx of transactions) {
          // Transaction must be after payment was created and TO our address
          if (tx.timeStamp >= paymentTime && tx.to?.toLowerCase() === wallet_address.toLowerCase()) {
            // ERC20 amounts are in token decimals (usually 6 for USDT/USDC)
            const decimals = parseInt(tx.tokenDecimal) || 6;
            const receivedAmount = parseFloat(tx.value) / Math.pow(10, decimals);
            
            if (Math.abs(receivedAmount - expectedAmount) < 0.000001) {
              const confirmations = parseInt(tx.confirmations) || 0;
              const threshold = this.confirmationThresholds[tokenSymbol.toLowerCase()] || 
                               this.confirmationThresholds.usdt_erc20;
              const confirmed = confirmations >= threshold;
              
              return {
                confirmed,
                txHash: tx.hash,
                confirmations,
                amount: receivedAmount,
                timestamp: new Date(tx.timeStamp * 1000).toISOString()
              };
            }
          }
        }

        return {
          confirmed: false,
          error: 'No matching token transaction found'
        };
      } else {
        return {
          confirmed: false,
          error: 'Etherscan API key required for ERC20 token verification'
        };
      }
    } catch (error) {
      logger.error(`[Blockchain Monitor] ERC20 ${tokenSymbol} verification error:`, error);
      return {
        confirmed: false,
        error: error.message || `${tokenSymbol} verification failed`
      };
    }
  }

  /**
   * Verify TRC20 token transaction (USDT on Tron)
   */
  async verifyTRC20Transaction(payment) {
    const { wallet_address, crypto_amount } = payment;
    const expectedAmount = parseFloat(crypto_amount);

    // USDT TRC20 contract address
    const USDT_TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

    try {
      // Use TRON API
      const response = await axios.post(
        `${this.tron.baseUrl}/v1/accounts/${wallet_address}/transactions/trc20`,
        {
          limit: 50,
          only_confirmed: false
        },
        {
          headers: {
            'TRON-PRO-API-KEY': this.tron.apiKey || ''
          },
          timeout: 10000
        }
      );

      if (!response.data.data || !Array.isArray(response.data.data)) {
        return {
          confirmed: false,
          error: 'No transactions found'
        };
      }

      const transactions = response.data.data;
      const paymentTime = new Date(payment.created_at).getTime();

      for (const tx of transactions) {
        // Check if transaction is for USDT and to our address
        if (tx.token_info?.address === USDT_TRC20_CONTRACT && 
            tx.to?.toLowerCase() === wallet_address.toLowerCase()) {
          
          const txTime = tx.block_timestamp || 0;
          
          // Transaction must be after payment was created
          if (txTime < paymentTime) continue;

          // TRC20 amounts are in sun (1 USDT = 1,000,000 sun)
          const receivedAmount = parseFloat(tx.value || 0) / 1000000;
          
          if (Math.abs(receivedAmount - expectedAmount) < 0.000001) {
            const confirmations = tx.confirmed ? 19 : 0;
            const confirmed = confirmations >= this.confirmationThresholds.usdt_trc20;
            
            return {
              confirmed,
              txHash: tx.transaction_id,
              confirmations,
              amount: receivedAmount,
              timestamp: new Date(txTime).toISOString()
            };
          }
        }
      }

      return {
        confirmed: false,
        error: 'No matching TRC20 transaction found'
      };
    } catch (error) {
      logger.error('[Blockchain Monitor] TRC20 verification error:', error);
      return {
        confirmed: false,
        error: error.message || 'TRC20 verification failed'
      };
    }
  }

  /**
   * Calculate received amount from Bitcoin transaction
   */
  calculateReceivedAmount(tx, address) {
    let received = 0;
    for (const output of tx.outputs || []) {
      if (output.addresses && output.addresses.includes(address)) {
        received += output.value || 0;
      }
    }
    return received / 100000000; // Satoshi to BTC
  }

  /**
   * Get transaction details by hash
   */
  async getTransactionDetails(txHash, currency) {
    try {
      switch (currency.toLowerCase()) {
        case 'btc':
          if (this.hasBlockCypherKey()) {
            const response = await axios.get(
              `${this.blockcypher.baseUrl}/btc/main/txs/${txHash}`,
              {
                params: { token: this.blockcypher.apiKey },
                timeout: 10000
              }
            );
            return {
              hash: response.data.hash,
              confirmations: response.data.confirmations || 0,
              received: response.data.received
            };
          }
          break;
        
        case 'eth':
          if (this.hasBlockCypherKey()) {
            const response = await axios.get(
              `${this.blockcypher.baseUrl}/eth/main/txs/${txHash}`,
              {
                params: { token: this.blockcypher.apiKey },
                timeout: 10000
              }
            );
            return {
              hash: response.data.hash,
              confirmations: response.data.confirmations || 0,
              received: response.data.received
            };
          } else if (this.etherscan.apiKey) {
            const response = await axios.get(this.etherscan.baseUrl, {
              params: {
                module: 'proxy',
                action: 'eth_getTransactionByHash',
                txhash: txHash,
                apikey: this.etherscan.apiKey
              },
              timeout: 10000
            });
            return response.data.result;
          }
          break;
      }
      
      return null;
    } catch (error) {
      logger.error(`[Blockchain Monitor] Get transaction details error:`, error);
      return null;
    }
  }
}

module.exports = new BlockchainMonitorService();

