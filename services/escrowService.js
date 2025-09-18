const axios = require('axios');
const crypto = require('crypto');

class EscrowService {
  constructor() {
    this.baseURL = 'https://api.escrow.com/2017-09-01';
    this.email = process.env.ESCROW_EMAIL;
    this.password = process.env.ESCROW_PASSWORD;
    this.apiKey = process.env.ESCROW_API_KEY;
    
    if (!this.email || !this.password) {
      console.warn('Escrow credentials not configured. Using mock mode.');
    }
  }

  // ==================== AUTHENTICATION ====================

  getAuthHeaders() {
    if (this.email && this.password) {
      const credentials = Buffer.from(`${this.email}:${this.password}`).toString('base64');
      return {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Smart-Algos-Platform/1.0.0'
      };
    }
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'Smart-Algos-Platform/1.0.0'
    };
  }

  // ==================== TRANSACTION MANAGEMENT ====================

  async createTransaction(transactionData) {
    try {
      const {
        buyerEmail,
        sellerEmail,
        amount,
        currency = 'USD',
        description,
        productType = 'ea_subscription',
        inspectionPeriod = 259200, // 3 days in seconds
        metadata = {}
      } = transactionData;

      // Validate required fields
      if (!buyerEmail || !sellerEmail || !amount || !description) {
        throw new Error('Buyer email, seller email, amount, and description are required');
      }

      const payload = {
        parties: [
          {
            role: 'buyer',
            customer: buyerEmail
          },
          {
            role: 'seller',
            customer: sellerEmail
          }
        ],
        currency: currency.toLowerCase(),
        description: description,
        items: [
          {
            title: description,
            description: `Smart Algos ${productType} - ${description}`,
            type: this.getEscrowItemType(productType),
            inspection_period: inspectionPeriod,
            quantity: 1,
            schedule: [
              {
                amount: parseFloat(amount),
                payer_customer: buyerEmail,
                beneficiary_customer: sellerEmail
              }
            ]
          }
        ],
        metadata: {
          ...metadata,
          platform: 'smart-algos',
          product_type: productType,
          created_at: new Date().toISOString()
        }
      };

      if (this.email && this.password) {
        const response = await axios.post(
          `${this.baseURL}/transaction`,
          payload,
          { headers: this.getAuthHeaders() }
        );

        return {
          success: true,
          data: response.data,
          message: 'Escrow transaction created successfully'
        };
      } else {
        // Mock response for development
        return this.getMockTransactionResponse(payload);
      }
    } catch (error) {
      console.error('Create escrow transaction error:', error);
      throw new Error(`Failed to create escrow transaction: ${error.message}`);
    }
  }

  async getTransaction(transactionId) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      if (this.email && this.password) {
        const response = await axios.get(
          `${this.baseURL}/transaction/${transactionId}`,
          { headers: this.getAuthHeaders() }
        );

        return {
          success: true,
          data: response.data,
          message: 'Transaction retrieved successfully'
        };
      } else {
        // Mock transaction data for development
        return this.getMockTransactionResponse({ id: transactionId });
      }
    } catch (error) {
      console.error('Get escrow transaction error:', error);
      throw new Error(`Failed to get escrow transaction: ${error.message}`);
    }
  }

  async updateTransaction(transactionId, updateData) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const payload = {
        ...updateData,
        metadata: {
          ...updateData.metadata,
          platform: 'smart-algos',
          updated_at: new Date().toISOString()
        }
      };

      if (this.email && this.password) {
        const response = await axios.patch(
          `${this.baseURL}/transaction/${transactionId}`,
          payload,
          { headers: this.getAuthHeaders() }
        );

        return {
          success: true,
          data: response.data,
          message: 'Transaction updated successfully'
        };
      } else {
        // Mock update response for development
        return this.getMockTransactionResponse({ id: transactionId, ...payload });
      }
    } catch (error) {
      console.error('Update escrow transaction error:', error);
      throw new Error(`Failed to update escrow transaction: ${error.message}`);
    }
  }

  async cancelTransaction(transactionId, reason = 'User request') {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const payload = {
        action: 'cancel',
        reason: reason,
        metadata: {
          platform: 'smart-algos',
          cancelled_at: new Date().toISOString()
        }
      };

      if (this.email && this.password) {
        const response = await axios.patch(
          `${this.baseURL}/transaction/${transactionId}`,
          payload,
          { headers: this.getAuthHeaders() }
        );

        return {
          success: true,
          data: response.data,
          message: 'Transaction cancelled successfully'
        };
      } else {
        // Mock cancellation response for development
        return this.getMockTransactionResponse({ 
          id: transactionId, 
          status: 'cancelled',
          cancellation_reason: reason
        });
      }
    } catch (error) {
      console.error('Cancel escrow transaction error:', error);
      throw new Error(`Failed to cancel escrow transaction: ${error.message}`);
    }
  }

  // ==================== PAYMENT MANAGEMENT ====================

  async initiatePayment(transactionId, paymentData) {
    try {
      const {
        amount,
        currency = 'USD',
        paymentMethod = 'card',
        metadata = {}
      } = paymentData;

      const payload = {
        transaction_id: transactionId,
        amount: parseFloat(amount),
        currency: currency.toLowerCase(),
        payment_method: paymentMethod,
        metadata: {
          ...metadata,
          platform: 'smart-algos',
          initiated_at: new Date().toISOString()
        }
      };

      if (this.email && this.password) {
        const response = await axios.post(
          `${this.baseURL}/transaction/${transactionId}/payment`,
          payload,
          { headers: this.getAuthHeaders() }
        );

        return {
          success: true,
          data: response.data,
          message: 'Payment initiated successfully'
        };
      } else {
        // Mock payment initiation response for development
        return this.getMockPaymentResponse(transactionId, payload);
      }
    } catch (error) {
      console.error('Initiate escrow payment error:', error);
      throw new Error(`Failed to initiate escrow payment: ${error.message}`);
    }
  }

  async getPaymentStatus(transactionId, paymentId) {
    try {
      if (!transactionId || !paymentId) {
        throw new Error('Transaction ID and Payment ID are required');
      }

      if (this.email && this.password) {
        const response = await axios.get(
          `${this.baseURL}/transaction/${transactionId}/payment/${paymentId}`,
          { headers: this.getAuthHeaders() }
        );

        return {
          success: true,
          data: response.data,
          message: 'Payment status retrieved successfully'
        };
      } else {
        // Mock payment status response for development
        return this.getMockPaymentStatusResponse(transactionId, paymentId);
      }
    } catch (error) {
      console.error('Get escrow payment status error:', error);
      throw new Error(`Failed to get escrow payment status: ${error.message}`);
    }
  }

  // ==================== DISPUTE MANAGEMENT ====================

  async createDispute(transactionId, disputeData) {
    try {
      const {
        reason,
        description,
        evidence = [],
        metadata = {}
      } = disputeData;

      const payload = {
        transaction_id: transactionId,
        reason: reason,
        description: description,
        evidence: evidence,
        metadata: {
          ...metadata,
          platform: 'smart-algos',
          created_at: new Date().toISOString()
        }
      };

      if (this.email && this.password) {
        const response = await axios.post(
          `${this.baseURL}/transaction/${transactionId}/dispute`,
          payload,
          { headers: this.getAuthHeaders() }
        );

        return {
          success: true,
          data: response.data,
          message: 'Dispute created successfully'
        };
      } else {
        // Mock dispute creation response for development
        return this.getMockDisputeResponse(transactionId, payload);
      }
    } catch (error) {
      console.error('Create escrow dispute error:', error);
      throw new Error(`Failed to create escrow dispute: ${error.message}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  getEscrowItemType(productType) {
    const typeMap = {
      'ea_subscription': 'digital_goods',
      'hft_rental': 'digital_goods',
      'trading_signal': 'digital_goods',
      'consultation': 'services',
      'training': 'services',
      'software': 'digital_goods'
    };
    return typeMap[productType] || 'general_merchandise';
  }

  calculateEscrowFee(amount, currency = 'USD') {
    // Escrow.com fee structure (approximate)
    const feeRates = {
      'USD': 0.0089, // 0.89%
      'EUR': 0.0089,
      'GBP': 0.0089,
      'NGN': 0.0089
    };
    
    const rate = feeRates[currency.toUpperCase()] || 0.0089;
    return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
  }

  generateTransactionReference(prefix = 'ESC') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  // ==================== MOCK RESPONSES (Development) ====================

  getMockTransactionResponse(payload) {
    const transactionId = payload.id || Math.floor(Math.random() * 1000000) + 3000000;
    
    return {
      success: true,
      data: {
        id: transactionId,
        description: payload.description || 'Smart Algos EA Subscription',
        items: [
          {
            status: {
              received: false,
              rejected_returned: false,
              rejected: false,
              received_returned: false,
              shipped: false,
              accepted: false,
              shipped_returned: false,
              accepted_returned: false
            },
            description: payload.items?.[0]?.description || 'EA Subscription with escrow protection',
            schedule: [
              {
                amount: payload.items?.[0]?.schedule?.[0]?.amount?.toString() || '299.00',
                payer_customer: payload.parties?.[0]?.customer || 'buyer@example.com',
                beneficiary_customer: payload.parties?.[1]?.customer || 'seller@example.com',
                status: {
                  secured: false
                }
              }
            ],
            title: payload.items?.[0]?.title || 'EA Subscription',
            inspection_period: payload.items?.[0]?.inspection_period || 259200,
            fees: [
              {
                payer_customer: payload.parties?.[0]?.customer || 'buyer@example.com',
                amount: this.calculateEscrowFee(
                  parseFloat(payload.items?.[0]?.schedule?.[0]?.amount || 299),
                  payload.currency || 'USD'
                ).toString(),
                type: 'escrow'
              }
            ],
            type: payload.items?.[0]?.type || 'digital_goods',
            id: Math.floor(Math.random() * 1000000) + 3000000,
            quantity: 1
          }
        ],
        creation_date: new Date().toISOString(),
        currency: payload.currency || 'usd',
        parties: [
          {
            customer: payload.parties?.[0]?.customer || 'buyer@example.com',
            agreed: true,
            role: 'buyer',
            initiator: true
          },
          {
            customer: payload.parties?.[1]?.customer || 'seller@example.com',
            agreed: false,
            role: 'seller',
            initiator: false
          }
        ],
        status: 'pending_agreement',
        escrow_fee: this.calculateEscrowFee(
          parseFloat(payload.items?.[0]?.schedule?.[0]?.amount || 299),
          payload.currency || 'USD'
        )
      },
      message: 'Escrow transaction created successfully (Mock)'
    };
  }

  getMockPaymentResponse(transactionId, payload) {
    return {
      success: true,
      data: {
        id: Math.floor(Math.random() * 1000000) + 4000000,
        transaction_id: transactionId,
        amount: payload.amount,
        currency: payload.currency,
        payment_method: payload.payment_method,
        status: 'pending',
        payment_url: `https://pay.escrow.com/mock/${transactionId}`,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      },
      message: 'Payment initiated successfully (Mock)'
    };
  }

  getMockPaymentStatusResponse(transactionId, paymentId) {
    return {
      success: true,
      data: {
        id: paymentId,
        transaction_id: transactionId,
        status: 'completed',
        amount: '299.00',
        currency: 'usd',
        payment_method: 'card',
        completed_at: new Date().toISOString(),
        reference: `PAY_${Date.now()}`
      },
      message: 'Payment status retrieved successfully (Mock)'
    };
  }

  getMockDisputeResponse(transactionId, payload) {
    return {
      success: true,
      data: {
        id: Math.floor(Math.random() * 1000000) + 5000000,
        transaction_id: transactionId,
        reason: payload.reason,
        description: payload.description,
        status: 'open',
        created_at: new Date().toISOString(),
        evidence: payload.evidence || []
      },
      message: 'Dispute created successfully (Mock)'
    };
  }
}

// Create singleton instance
const escrowService = new EscrowService();

module.exports = escrowService;