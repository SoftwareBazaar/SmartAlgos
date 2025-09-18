const axios = require('axios');
const crypto = require('crypto');
const securityService = require('./securityService');

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.baseURL = 'https://api.paystack.co';
    this.webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    
    if (!this.secretKey || !this.publicKey) {
      console.warn('Paystack keys not configured. Using mock mode.');
    }
  }

  // ==================== INITIALIZATION ====================

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Smart-Algos-Platform/1.0.0'
    };
  }

  // ==================== TRANSACTION MANAGEMENT ====================

  async chargeAuthorization(chargeData) {
    try {
      const {
        authorization_code,
        email,
        amount,
        currency = 'NGN',
        reference = null,
        callback_url = null,
        metadata = {}
      } = chargeData;

      // Validate required fields
      if (!authorization_code || !email || !amount) {
        throw new Error('Authorization code, email, and amount are required');
      }

      // Convert amount to kobo (smallest currency unit)
      const amountInKobo = Math.round(amount * 100);

      const payload = {
        authorization_code,
        email,
        amount: amountInKobo,
        currency,
        reference: reference || this.generateReference('CHG'),
        callback_url,
        metadata: {
          ...metadata,
          platform: 'smart-algos',
          timestamp: new Date().toISOString()
        }
      };

      if (this.secretKey) {
        const response = await axios.post(
          `${this.baseURL}/transaction/charge_authorization`,
          payload,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock response for development
        return this.getMockChargeResponse(payload);
      }
    } catch (error) {
      console.error('Charge authorization error:', error);
      throw new Error(`Failed to charge authorization: ${error.message}`);
    }
  }

  async initializeTransaction(transactionData) {
    try {
      const {
        email,
        amount,
        currency = 'NGN',
        reference,
        callback_url,
        metadata = {},
        channels = ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      } = transactionData;

      // Validate required fields
      if (!email || !amount || !reference) {
        throw new Error('Email, amount, and reference are required');
      }

      // Convert amount to kobo (smallest currency unit)
      const amountInKobo = Math.round(amount * 100);

      const payload = {
        email,
        amount: amountInKobo,
        currency,
        reference,
        callback_url,
        metadata: {
          ...metadata,
          platform: 'smart-algos',
          timestamp: new Date().toISOString()
        },
        channels
      };

      if (this.secretKey) {
        const response = await axios.post(
          `${this.baseURL}/transaction/initialize`,
          payload,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock response for development
        return this.getMockInitializeResponse(payload);
      }
    } catch (error) {
      console.error('Initialize transaction error:', error);
      throw new Error(`Failed to initialize transaction: ${error.message}`);
    }
  }

  async initializeTransactionWithPause(transactionData) {
    try {
      const {
        email,
        amount,
        currency = 'NGN',
        reference,
        callback_url,
        metadata = {},
        channels = ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      } = transactionData;

      // Validate required fields
      if (!email || !amount || !reference) {
        throw new Error('Email, amount, and reference are required');
      }

      // Convert amount to kobo (smallest currency unit)
      const amountInKobo = Math.round(amount * 100);

      const payload = {
        email,
        amount: amountInKobo,
        currency,
        reference,
        callback_url,
        metadata: {
          ...metadata,
          platform: 'smart-algos',
          timestamp: new Date().toISOString()
        },
        channels
      };

      if (this.secretKey) {
        const response = await axios.post(
          `${this.baseURL}/transaction/initialize`,
          payload,
          { headers: this.getHeaders() }
        );

        // Add paused state to response (as shown in your example)
        const responseData = response.data.data;
        responseData.paused = true;

        return {
          success: true,
          data: responseData,
          message: response.data.message
        };
      } else {
        // Mock response for development with paused state
        return this.getMockInitializeWithPauseResponse(payload);
      }
    } catch (error) {
      console.error('Initialize transaction with pause error:', error);
      throw new Error(`Failed to initialize transaction with pause: ${error.message}`);
    }
  }

  async verifyTransaction(reference) {
    try {
      if (!reference) {
        throw new Error('Transaction reference is required');
      }

      if (this.secretKey) {
        const response = await axios.get(
          `${this.baseURL}/transaction/verify/${reference}`,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock verification for development
        return this.getMockVerifyResponse(reference);
      }
    } catch (error) {
      console.error('Verify transaction error:', error);
      throw new Error(`Failed to verify transaction: ${error.message}`);
    }
  }

  async getTransaction(transactionId) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      if (this.secretKey) {
        const response = await axios.get(
          `${this.baseURL}/transaction/${transactionId}`,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock transaction data for development
        return this.getMockTransactionResponse(transactionId);
      }
    } catch (error) {
      console.error('Get transaction error:', error);
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  async listTransactions(options = {}) {
    try {
      const {
        page = 1,
        perPage = 50,
        customer = null,
        status = null,
        from = null,
        to = null,
        amount = null
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString()
      });

      if (customer) params.append('customer', customer);
      if (status) params.append('status', status);
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (amount) params.append('amount', amount);

      if (this.secretKey) {
        const response = await axios.get(
          `${this.baseURL}/transaction?${params.toString()}`,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          meta: response.data.meta,
          message: response.data.message
        };
      } else {
        // Mock transaction list for development
        return this.getMockTransactionListResponse(options);
      }
    } catch (error) {
      console.error('List transactions error:', error);
      throw new Error(`Failed to list transactions: ${error.message}`);
    }
  }

  // ==================== CUSTOMER MANAGEMENT ====================

  async createCustomer(customerData) {
    try {
      const {
        email,
        first_name,
        last_name,
        phone,
        metadata = {}
      } = customerData;

      if (!email) {
        throw new Error('Customer email is required');
      }

      const payload = {
        email,
        first_name,
        last_name,
        phone,
        metadata: {
          ...metadata,
          platform: 'smart-algos',
          created_at: new Date().toISOString()
        }
      };

      if (this.secretKey) {
        const response = await axios.post(
          `${this.baseURL}/customer`,
          payload,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock customer creation for development
        return this.getMockCustomerResponse(payload);
      }
    } catch (error) {
      console.error('Create customer error:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async getCustomer(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      if (this.secretKey) {
        const response = await axios.get(
          `${this.baseURL}/customer/${customerId}`,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock customer data for development
        return this.getMockCustomerResponse({ id: customerId });
      }
    } catch (error) {
      console.error('Get customer error:', error);
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  async updateCustomer(customerId, updateData) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const payload = {
        ...updateData,
        metadata: {
          ...updateData.metadata,
          platform: 'smart-algos',
          updated_at: new Date().toISOString()
        }
      };

      if (this.secretKey) {
        const response = await axios.put(
          `${this.baseURL}/customer/${customerId}`,
          payload,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock customer update for development
        return this.getMockCustomerResponse({ id: customerId, ...payload });
      }
    } catch (error) {
      console.error('Update customer error:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  async createSubscription(subscriptionData) {
    try {
      const {
        customer,
        plan,
        authorization,
        start_date = null
      } = subscriptionData;

      if (!customer || !plan) {
        throw new Error('Customer and plan are required');
      }

      const payload = {
        customer,
        plan,
        authorization,
        start_date
      };

      if (this.secretKey) {
        const response = await axios.post(
          `${this.baseURL}/subscription`,
          payload,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock subscription creation for development
        return this.getMockSubscriptionResponse(payload);
      }
    } catch (error) {
      console.error('Create subscription error:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async getSubscription(subscriptionId) {
    try {
      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }

      if (this.secretKey) {
        const response = await axios.get(
          `${this.baseURL}/subscription/${subscriptionId}`,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock subscription data for development
        return this.getMockSubscriptionResponse({ id: subscriptionId });
      }
    } catch (error) {
      console.error('Get subscription error:', error);
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  async disableSubscription(subscriptionId) {
    try {
      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }

      if (this.secretKey) {
        const response = await axios.post(
          `${this.baseURL}/subscription/${subscriptionId}/disable`,
          {},
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock subscription disable for development
        return this.getMockSubscriptionResponse({ 
          id: subscriptionId, 
          status: 'cancelled' 
        });
      }
    } catch (error) {
      console.error('Disable subscription error:', error);
      throw new Error(`Failed to disable subscription: ${error.message}`);
    }
  }

  // ==================== PLAN MANAGEMENT ====================

  async createPlan(planData) {
    try {
      const {
        name,
        interval,
        amount,
        currency = 'NGN',
        description = null,
        send_invoices = true,
        send_sms = true,
        hosted_page = false,
        hosted_page_url = null,
        hosted_page_summary = null,
        redirect_url = null
      } = planData;

      if (!name || !interval || !amount) {
        throw new Error('Name, interval, and amount are required');
      }

      const payload = {
        name,
        interval,
        amount: Math.round(amount * 100), // Convert to kobo
        currency,
        description,
        send_invoices,
        send_sms,
        hosted_page,
        hosted_page_url,
        hosted_page_summary,
        redirect_url
      };

      if (this.secretKey) {
        const response = await axios.post(
          `${this.baseURL}/plan`,
          payload,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock plan creation for development
        return this.getMockPlanResponse(payload);
      }
    } catch (error) {
      console.error('Create plan error:', error);
      throw new Error(`Failed to create plan: ${error.message}`);
    }
  }

  async getPlan(planId) {
    try {
      if (!planId) {
        throw new Error('Plan ID is required');
      }

      if (this.secretKey) {
        const response = await axios.get(
          `${this.baseURL}/plan/${planId}`,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock plan data for development
        return this.getMockPlanResponse({ id: planId });
      }
    } catch (error) {
      console.error('Get plan error:', error);
      throw new Error(`Failed to get plan: ${error.message}`);
    }
  }

  // ==================== REFUND MANAGEMENT ====================

  async createRefund(refundData) {
    try {
      const {
        transaction,
        amount = null,
        currency = 'NGN',
        customer_note = null,
        merchant_note = null
      } = refundData;

      if (!transaction) {
        throw new Error('Transaction reference is required');
      }

      const payload = {
        transaction,
        amount: amount ? Math.round(amount * 100) : null, // Convert to kobo
        currency,
        customer_note,
        merchant_note
      };

      if (this.secretKey) {
        const response = await axios.post(
          `${this.baseURL}/refund`,
          payload,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock refund creation for development
        return this.getMockRefundResponse(payload);
      }
    } catch (error) {
      console.error('Create refund error:', error);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  async getRefund(refundId) {
    try {
      if (!refundId) {
        throw new Error('Refund ID is required');
      }

      if (this.secretKey) {
        const response = await axios.get(
          `${this.baseURL}/refund/${refundId}`,
          { headers: this.getHeaders() }
        );

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // Mock refund data for development
        return this.getMockRefundResponse({ id: refundId });
      }
    } catch (error) {
      console.error('Get refund error:', error);
      throw new Error(`Failed to get refund: ${error.message}`);
    }
  }

  // ==================== WEBHOOK VERIFICATION ====================

  verifyWebhook(payload, signature) {
    try {
      if (!this.webhookSecret) {
        console.warn('Webhook secret not configured');
        return false;
      }

      const hash = crypto
        .createHmac('sha512', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }

  // ==================== UTILITY METHODS ====================

  generateReference(prefix = 'SA') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  formatAmount(amount, currency = 'NGN') {
    // Convert from kobo to main currency unit
    return amount / 100;
  }

  parseWebhookEvent(payload) {
    try {
      const event = JSON.parse(payload);
      return {
        event: event.event,
        data: event.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Parse webhook event error:', error);
      throw new Error('Invalid webhook payload');
    }
  }

  // ==================== MOCK RESPONSES (Development) ====================

  getMockChargeResponse(payload) {
    return {
      success: true,
      data: {
        id: Math.floor(Math.random() * 1000000),
        domain: 'test',
        status: 'success',
        reference: payload.reference,
        amount: payload.amount,
        message: 'Charge successful',
        gateway_response: 'Successful',
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        channel: 'card',
        currency: payload.currency,
        ip_address: '127.0.0.1',
        metadata: payload.metadata,
        log: null,
        fees: Math.round(payload.amount * 0.03), // 3% fee
        fees_split: null,
        authorization: {
          authorization_code: payload.authorization_code,
          bin: '408408',
          last4: '4081',
          exp_month: '12',
          exp_year: '2025',
          channel: 'card',
          card_type: 'visa',
          bank: 'TEST BANK',
          country_code: 'NG',
          brand: 'visa',
          reusable: true,
          signature: `SIG_${Date.now()}`
        },
        customer: {
          id: Math.floor(Math.random() * 1000000),
          first_name: 'John',
          last_name: 'Doe',
          email: payload.email,
          customer_code: `CUS_${Date.now()}`,
          phone: '+2348012345678',
          metadata: null,
          risk_action: 'default'
        },
        plan: null,
        split: {},
        order_id: null,
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        requested_amount: payload.amount
      },
      message: 'Charge successful'
    };
  }

  getMockInitializeWithPauseResponse(payload) {
    const reference = payload.reference || this.generateReference();
    const accessCode = `access_code_${Date.now()}`;
    
    return {
      success: true,
      data: {
        authorization_url: `https://checkout.paystack.com/resume/${accessCode}`,
        reference: reference,
        access_code: accessCode,
        paused: true
      },
      message: 'Please, redirect your customer to the authorization url provided'
    };
  }

  getMockInitializeResponse(payload) {
    const reference = payload.reference || this.generateReference();
    
    return {
      success: true,
      data: {
        authorization_url: `https://checkout.paystack.com/${reference}`,
        access_code: `access_code_${Date.now()}`,
        reference: reference
      },
      message: 'Authorization URL created'
    };
  }

  getMockVerifyResponse(reference) {
    return {
      success: true,
      data: {
        id: Math.floor(Math.random() * 1000000),
        domain: 'test',
        status: 'success',
        reference: reference,
        amount: 290000, // 2900 NGN in kobo
        message: 'Successful',
        gateway_response: 'Successful',
        paid_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 300000).toISOString(),
        channel: 'card',
        currency: 'NGN',
        ip_address: '127.0.0.1',
        metadata: {
          platform: 'smart-algos'
        },
        log: null,
        fees: 8700, // 87 NGN in kobo
        fees_split: null,
        authorization: {
          authorization_code: `AUTH_${Date.now()}`,
          bin: '408408',
          last4: '4081',
          exp_month: '12',
          exp_year: '2025',
          channel: 'card',
          card_type: 'visa',
          bank: 'TEST BANK',
          country_code: 'NG',
          brand: 'visa',
          reusable: true,
          signature: `SIG_${Date.now()}`
        },
        customer: {
          id: Math.floor(Math.random() * 1000000),
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          customer_code: `CUS_${Date.now()}`,
          phone: '+2348012345678',
          metadata: null,
          risk_action: 'default'
        },
        plan: null,
        split: {},
        order_id: null,
        paidAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 300000).toISOString(),
        requested_amount: 290000
      },
      message: 'Verification successful'
    };
  }

  getMockTransactionResponse(transactionId) {
    return {
      success: true,
      data: {
        id: parseInt(transactionId) || Math.floor(Math.random() * 1000000),
        domain: 'test',
        status: 'success',
        reference: this.generateReference(),
        amount: 290000,
        message: 'Successful',
        gateway_response: 'Successful',
        paid_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 300000).toISOString(),
        channel: 'card',
        currency: 'NGN',
        ip_address: '127.0.0.1',
        metadata: {
          platform: 'smart-algos'
        },
        log: null,
        fees: 8700,
        fees_split: null,
        authorization: {
          authorization_code: `AUTH_${Date.now()}`,
          bin: '408408',
          last4: '4081',
          exp_month: '12',
          exp_year: '2025',
          channel: 'card',
          card_type: 'visa',
          bank: 'TEST BANK',
          country_code: 'NG',
          brand: 'visa',
          reusable: true,
          signature: `SIG_${Date.now()}`
        },
        customer: {
          id: Math.floor(Math.random() * 1000000),
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          customer_code: `CUS_${Date.now()}`,
          phone: '+2348012345678',
          metadata: null,
          risk_action: 'default'
        },
        plan: null,
        split: {},
        order_id: null,
        paidAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 300000).toISOString(),
        requested_amount: 290000
      },
      message: 'Transaction retrieved'
    };
  }

  getMockTransactionListResponse(options) {
    const transactions = [];
    for (let i = 0; i < 10; i++) {
      transactions.push({
        id: Math.floor(Math.random() * 1000000),
        domain: 'test',
        status: 'success',
        reference: this.generateReference(),
        amount: Math.floor(Math.random() * 1000000) + 100000,
        message: 'Successful',
        gateway_response: 'Successful',
        paid_at: new Date(Date.now() - i * 86400000).toISOString(),
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        channel: 'card',
        currency: 'NGN',
        ip_address: '127.0.0.1',
        metadata: {
          platform: 'smart-algos'
        }
      });
    }

    return {
      success: true,
      data: transactions,
      meta: {
        total: 100,
        skipped: 0,
        perPage: options.perPage || 50,
        page: options.page || 1,
        pageCount: 2
      },
      message: 'Transactions retrieved'
    };
  }

  getMockCustomerResponse(customerData) {
    return {
      success: true,
      data: {
        id: customerData.id || Math.floor(Math.random() * 1000000),
        first_name: customerData.first_name || 'John',
        last_name: customerData.last_name || 'Doe',
        email: customerData.email || 'john@example.com',
        customer_code: `CUS_${Date.now()}`,
        phone: customerData.phone || '+2348012345678',
        metadata: customerData.metadata || {
          platform: 'smart-algos'
        },
        risk_action: 'default',
        international_format_phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message: 'Customer retrieved'
    };
  }

  getMockSubscriptionResponse(subscriptionData) {
    return {
      success: true,
      data: {
        id: subscriptionData.id || Math.floor(Math.random() * 1000000),
        domain: 'test',
        status: subscriptionData.status || 'active',
        subscription_code: `SUB_${Date.now()}`,
        email_token: `email_token_${Date.now()}`,
        amount: 290000,
        cron_expression: '0 0 28 * *',
        next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        open_invoice: null,
        open_invoice_human_readable: null,
        closed_invoice: null,
        closed_invoice_human_readable: null,
        created_at: new Date().toISOString(),
        plan: {
          id: Math.floor(Math.random() * 1000000),
          name: 'Basic Plan',
          plan_code: 'PLN_1234567890',
          description: 'Basic subscription plan',
          amount: 290000,
          interval: 'monthly',
          send_invoices: true,
          send_sms: true,
          hosted_page: false,
          hosted_page_url: null,
          hosted_page_summary: null,
          currency: 'NGN',
          migrate: null,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        authorization: {
          authorization_code: `AUTH_${Date.now()}`,
          bin: '408408',
          last4: '4081',
          exp_month: '12',
          exp_year: '2025',
          channel: 'card',
          card_type: 'visa',
          bank: 'TEST BANK',
          country_code: 'NG',
          brand: 'visa',
          reusable: true,
          signature: `SIG_${Date.now()}`
        },
        customer: {
          id: Math.floor(Math.random() * 1000000),
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          customer_code: `CUS_${Date.now()}`,
          phone: '+2348012345678',
          metadata: null,
          risk_action: 'default'
        }
      },
      message: 'Subscription retrieved'
    };
  }

  getMockPlanResponse(planData) {
    return {
      success: true,
      data: {
        id: planData.id || Math.floor(Math.random() * 1000000),
        name: planData.name || 'Basic Plan',
        plan_code: `PLN_${Date.now()}`,
        description: planData.description || 'Basic subscription plan',
        amount: planData.amount || 290000,
        interval: planData.interval || 'monthly',
        send_invoices: planData.send_invoices !== undefined ? planData.send_invoices : true,
        send_sms: planData.send_sms !== undefined ? planData.send_sms : true,
        hosted_page: planData.hosted_page || false,
        hosted_page_url: planData.hosted_page_url || null,
        hosted_page_summary: planData.hosted_page_summary || null,
        currency: planData.currency || 'NGN',
        migrate: null,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message: 'Plan retrieved'
    };
  }

  getMockRefundResponse(refundData) {
    return {
      success: true,
      data: {
        id: refundData.id || Math.floor(Math.random() * 1000000),
        domain: 'test',
        status: 'success',
        reference: refundData.transaction || this.generateReference(),
        amount: refundData.amount || 290000,
        transaction: {
          id: Math.floor(Math.random() * 1000000),
          domain: 'test',
          status: 'success',
          reference: refundData.transaction || this.generateReference(),
          amount: 290000,
          message: 'Successful',
          gateway_response: 'Successful',
          paid_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 300000).toISOString(),
          channel: 'card',
          currency: 'NGN',
          ip_address: '127.0.0.1',
          metadata: {
            platform: 'smart-algos'
          }
        },
        customer_note: refundData.customer_note || null,
        merchant_note: refundData.merchant_note || null,
        currency: refundData.currency || 'NGN',
        deducted_amount: refundData.amount || 290000,
        fully_deducted: true,
        integration: Math.floor(Math.random() * 1000000),
        channel: 'card',
        reason: 'duplicate',
        refunded_at: new Date().toISOString(),
        expected_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message: 'Refund created'
    };
  }
}

// Create singleton instance
const paystackService = new PaystackService();

module.exports = paystackService;
