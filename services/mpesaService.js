/**
 * M-Pesa Daraja API Service
 * Handles STK Push (Lipa Na M-Pesa Online) payments
 * Supports both Sandbox and Production environments
 */

const axios = require('axios');
const moment = require('moment');

function resolveMpesaCallbackUrl() {
  const configured = (process.env.MPESA_CALLBACK_URL || '').trim();
  const isPlaceholder =
    !configured ||
    /yourdomain|your-domain|localhost/i.test(configured);

  if (!isPlaceholder) return configured.replace(/\/$/, '');

  const base = (
    process.env.BACKEND_URL ||
    process.env.PUBLIC_URL ||
    process.env.CLIENT_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  )
    .trim()
    .replace(/\/$/, '');

  if (base) return `${base}/api/mpesa/callback`;
  return 'http://localhost:5000/api/mpesa/callback';
}

class MpesaService {
  constructor() {
    // M-Pesa Credentials from environment variables
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'
    
    // M-Pesa API URLs
    this.baseURL = this.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    
    this.oauthURL = `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`;
    this.stkPushURL = `${this.baseURL}/mpesa/stkpush/v1/processrequest`;
    this.stkQueryURL = `${this.baseURL}/mpesa/stkpushquery/v1/query`;
    
    this.callbackURL = resolveMpesaCallbackUrl();
    
    // Cache for access token
    this.accessToken = null;
    this.tokenExpiry = null;

    console.log(`🟢 M-Pesa Service initialized in ${this.environment.toUpperCase()} mode`);
  }

  /**
   * Validate M-Pesa phone number format
   * @param {string} phone - Phone number to validate
   * @returns {string} - Formatted phone number (254XXXXXXXXX)
   */
  formatPhoneNumber(phone) {
    // Remove any spaces, dashes, or special characters
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Remove leading + if present
    if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    // If starts with 0, replace with 254
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    }
    
    // If starts with 7 or 1, add 254 prefix
    if (cleanPhone.startsWith('7') || cleanPhone.startsWith('1')) {
      cleanPhone = '254' + cleanPhone;
    }
    
    // Validate format
    if (!/^254[0-9]{9}$/.test(cleanPhone)) {
      throw new Error('Invalid phone number format. Expected format: 254XXXXXXXXX');
    }
    
    return cleanPhone;
  }

  /**
   * Generate M-Pesa API access token using OAuth
   * @returns {Promise<string>} - Access token
   */
  async generateAccessToken() {
    try {
      // Check if we have a valid cached token
      if (this.accessToken && this.tokenExpiry && moment().isBefore(this.tokenExpiry)) {
        console.log('📌 Using cached M-Pesa access token');
        return this.accessToken;
      }

      console.log('🔑 Generating new M-Pesa access token...');

      // Create Basic Auth credentials
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

      const response = await axios.get(this.oauthURL, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.access_token) {
        throw new Error('Failed to generate access token');
      }

      this.accessToken = response.data.access_token;
      // Token expires in 3599 seconds, cache for 50 minutes to be safe
      this.tokenExpiry = moment().add(50, 'minutes');

      console.log('✅ M-Pesa access token generated successfully');
      return this.accessToken;

    } catch (error) {
      console.error('❌ M-Pesa access token generation failed:', error.response?.data || error.message);
      throw new Error(`Failed to generate M-Pesa access token: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Generate M-Pesa password for STK Push
   * Format: Base64(BusinessShortCode + Passkey + Timestamp)
   * @param {string} timestamp - Timestamp in format YYYYMMDDHHmmss
   * @returns {string} - Base64 encoded password
   */
  generatePassword(timestamp) {
    const passwordString = this.businessShortCode + this.passkey + timestamp;
    return Buffer.from(passwordString).toString('base64');
  }

  /**
   * Generate timestamp in M-Pesa format: YYYYMMDDHHmmss
   * @returns {string} - Timestamp string
   */
  generateTimestamp() {
    return moment().format('YYYYMMDDHHmmss');
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   * @param {Object} params - STK Push parameters
   * @param {number} params.amount - Amount to charge
   * @param {string} params.phoneNumber - Customer phone number (254XXXXXXXXX)
   * @param {string} params.accountReference - Account reference (e.g., invoice number, user ID)
   * @param {string} params.transactionDesc - Transaction description
   * @param {Object} params.metadata - Additional metadata to store with transaction
   * @returns {Promise<Object>} - STK Push response
   */
  async initiateSTKPush({ amount, phoneNumber, accountReference, transactionDesc, metadata = {} }) {
    try {
      // Validate inputs
      if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }

      // Format and validate phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Generate access token
      const accessToken = await this.generateAccessToken();

      // Generate timestamp and password
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      // Prepare STK Push request
      const stkPushData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // M-Pesa requires integer amount
        PartyA: formattedPhone, // Customer phone number
        PartyB: this.businessShortCode, // Business receiving the payment
        PhoneNumber: formattedPhone, // Phone number to receive STK push
        CallBackURL: this.callbackURL,
        AccountReference: accountReference || 'ALGOSMART',
        TransactionDesc: transactionDesc || 'Payment for AlgoSmart services'
      };

      console.log('📱 Initiating STK Push:', {
        amount: stkPushData.Amount,
        phone: formattedPhone,
        reference: stkPushData.AccountReference
      });

      // Send STK Push request
      const response = await axios.post(this.stkPushURL, stkPushData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Check response
      if (response.data.ResponseCode === '0') {
        console.log('✅ STK Push initiated successfully:', response.data.CheckoutRequestID);
        
        return {
          success: true,
          message: 'STK Push sent successfully. Please check your phone.',
          data: {
            merchantRequestID: response.data.MerchantRequestID,
            checkoutRequestID: response.data.CheckoutRequestID,
            responseCode: response.data.ResponseCode,
            responseDescription: response.data.ResponseDescription,
            customerMessage: response.data.CustomerMessage,
            amount: Math.round(amount),
            phoneNumber: formattedPhone,
            accountReference,
            metadata
          }
        };
      } else {
        throw new Error(response.data.ResponseDescription || 'STK Push failed');
      }

    } catch (error) {
      console.error('❌ STK Push failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.errorMessage || error.message || 'Failed to initiate STK Push',
        error: {
          code: error.response?.data?.errorCode,
          message: error.response?.data?.errorMessage || error.message
        }
      };
    }
  }

  /**
   * Query STK Push transaction status
   * @param {string} checkoutRequestID - Checkout Request ID from STK Push response
   * @returns {Promise<Object>} - Transaction status
   */
  async querySTKPushStatus(checkoutRequestID) {
    try {
      if (!checkoutRequestID) {
        throw new Error('Checkout Request ID is required');
      }

      // Generate access token
      const accessToken = await this.generateAccessToken();

      // Generate timestamp and password
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      // Prepare query request
      const queryData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      console.log('🔍 Querying STK Push status:', checkoutRequestID);

      // Send query request
      const response = await axios.post(this.stkQueryURL, queryData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ STK Push query response:', response.data);

      return {
        success: true,
        data: {
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
          merchantRequestID: response.data.MerchantRequestID,
          checkoutRequestID: response.data.CheckoutRequestID,
          resultCode: response.data.ResultCode,
          resultDesc: response.data.ResultDesc
        }
      };

    } catch (error) {
      console.error('❌ STK Push query failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.errorMessage || error.message || 'Failed to query transaction status',
        error: {
          code: error.response?.data?.errorCode,
          message: error.response?.data?.errorMessage || error.message
        }
      };
    }
  }

  /**
   * Process M-Pesa callback/webhook data
   * @param {Object} callbackData - Callback data from M-Pesa
   * @returns {Object} - Processed callback data
   */
  processCallback(callbackData) {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;

      const result = {
        merchantRequestID: stkCallback.MerchantRequestID,
        checkoutRequestID: stkCallback.CheckoutRequestID,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc
      };

      // If payment was successful (ResultCode = 0)
      if (stkCallback.ResultCode === 0) {
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
        
        // Extract metadata items
        const metadata = {};
        callbackMetadata.forEach(item => {
          metadata[item.Name] = item.Value;
        });

        result.success = true;
        result.amount = metadata.Amount;
        result.mpesaReceiptNumber = metadata.MpesaReceiptNumber;
        result.transactionDate = metadata.TransactionDate;
        result.phoneNumber = metadata.PhoneNumber;
        
        console.log('✅ M-Pesa payment successful:', result.mpesaReceiptNumber);
      } else {
        result.success = false;
        console.log('❌ M-Pesa payment failed:', result.resultDesc);
      }

      return result;

    } catch (error) {
      console.error('❌ Failed to process M-Pesa callback:', error);
      throw error;
    }
  }

  /**
   * Validate M-Pesa credentials
   * @returns {Promise<boolean>} - True if credentials are valid
   */
  async validateCredentials() {
    try {
      const token = await this.generateAccessToken();
      return !!token;
    } catch (error) {
      console.error('❌ M-Pesa credentials validation failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new MpesaService();

