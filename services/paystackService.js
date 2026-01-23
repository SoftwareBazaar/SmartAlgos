/**
 * Secure Paystack Service
 * Direct API integration without vulnerable dependencies
 * Replaces the deprecated 'paystack' npm package
 */

const axios = require('axios');

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.baseURL = 'https://api.paystack.co';
    this.isMockMode = !this.secretKey || this.secretKey.includes('your_');

    if (this.isMockMode) {
      console.log('⚠️  Paystack running in MOCK MODE (no real API calls)');
    }
  }

  // Helper to make authenticated requests
  async makeRequest(endpoint, method = 'GET', data = null) {
    if (this.isMockMode) {
      return this.getMockResponse(endpoint, method, data);
    }

    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('❌ [Paystack API ERROR]:', error.message);
      if (error.response) {
        console.error('   Response status:', error.response.status);
        console.error('   Response data:', JSON.stringify(error.response.data));
      }
      throw new Error(error.response?.data?.message || error.message || 'Paystack API request failed');
    }
  }

  // Initialize a transaction
  async initializeTransaction(data) {
    const payload = {
      email: data.email,
      amount: Math.round(data.amount * 100), // Paystack uses kobo/cents
      currency: data.currency || 'NGN',
      reference: data.reference || this.generateReference(),
      callback_url: data.callback_url,
      metadata: data.metadata || {}
    };

    return await this.makeRequest('/transaction/initialize', 'POST', payload);
  }

  // Verify a transaction
  async verifyTransaction(reference) {
    return await this.makeRequest(`/transaction/verify/${reference}`, 'GET');
  }

  // Get transaction details
  async getTransaction(transactionId) {
    return await this.makeRequest(`/transaction/${transactionId}`, 'GET');
  }

  // Create a subscription
  async createSubscription(data) {
    const payload = {
      customer: data.customer_code,
      plan: data.plan_code,
      authorization: data.authorization_code,
      start_date: data.start_date
    };

    return await this.makeRequest('/subscription', 'POST', payload);
  }

  // Cancel a subscription
  async cancelSubscription(subscriptionCode, emailToken) {
    return await this.makeRequest('/subscription/disable', 'POST', {
      code: subscriptionCode,
      token: emailToken
    });
  }

  // Create a transfer recipient
  async createTransferRecipient(data) {
    const payload = {
      type: data.type || 'nuban',
      name: data.name,
      account_number: data.account_number,
      bank_code: data.bank_code,
      currency: data.currency || 'NGN'
    };

    return await this.makeRequest('/transferrecipient', 'POST', payload);
  }

  // Initiate a transfer
  async initiateTransfer(data) {
    const payload = {
      source: 'balance',
      amount: Math.round(data.amount * 100),
      recipient: data.recipient_code,
      reason: data.reason || 'Payment',
      currency: data.currency || 'NGN'
    };

    return await this.makeRequest('/transfer', 'POST', payload);
  }

  // List banks
  async listBanks(country = 'nigeria') {
    return await this.makeRequest(`/bank?country=${country}`, 'GET');
  }

  // Verify bank account
  async verifyBankAccount(accountNumber, bankCode) {
    return await this.makeRequest(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      'GET'
    );
  }

  // Generate unique reference
  generateReference() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `ALGO-${timestamp}-${random}`;
  }

  // Mock responses for development
  getMockResponse(endpoint, method, data) {
    console.log(`🎭 Mock Paystack ${method} ${endpoint}`, data ? 'with data' : '');

    if (endpoint === '/transaction/initialize' || method === 'POST') {
      return {
        status: true,
        message: 'Authorization URL created (MOCK)',
        data: {
          authorization_url: 'https://checkout.paystack.com/mock',
          access_code: 'mock_access_code_' + Date.now(),
          reference: data?.reference || this.generateReference()
        }
      };
    }

    if (endpoint.includes('/transaction/verify/')) {
      return {
        status: true,
        message: 'Verification successful (MOCK)',
        data: {
          status: 'success',
          reference: endpoint.split('/').pop(),
          amount: 50000, // 500 NGN
          currency: 'NGN',
          paid_at: new Date().toISOString(),
          customer: {
            email: 'mock@example.com'
          }
        }
      };
    }

    if (endpoint.includes('/subscription')) {
      return {
        status: true,
        message: 'Subscription created (MOCK)',
        data: {
          subscription_code: 'SUB_mock_' + Date.now(),
          status: 'active',
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
    }

    if (endpoint.includes('/bank')) {
      return {
        status: true,
        message: 'Banks retrieved (MOCK)',
        data: [
          { name: 'Access Bank', code: '044', currency: 'NGN' },
          { name: 'GTBank', code: '058', currency: 'NGN' },
          { name: 'Zenith Bank', code: '057', currency: 'NGN' }
        ]
      };
    }

    return {
      status: true,
      message: 'Mock response',
      data: {}
    };
  }

  // Health check
  isConfigured() {
    return !this.isMockMode;
  }

  getStatus() {
    return {
      configured: !this.isMockMode,
      mode: this.isMockMode ? 'mock' : 'live',
      hasSecretKey: !!this.secretKey && !this.secretKey.includes('your_'),
      hasPublicKey: !!this.publicKey && !this.publicKey.includes('your_')
    };
  }
}

module.exports = new PaystackService();