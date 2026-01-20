/**
 * M-Pesa Payment Component
 * Handles M-Pesa STK Push payments with real-time status updates
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Smartphone,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Phone
} from 'lucide-react';

const MpesaPayment = ({
  amount,
  onSuccess,
  onError,
  onClose,
  accountReference,
  transactionDesc,
  metadata = {}
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, pending, success, failed
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-query transaction status
  useEffect(() => {
    if (checkoutRequestID && status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `/api/mpesa/query/${checkoutRequestID}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data.success) {
            const { resultCode, resultDesc } = response.data.data;

            if (resultCode === '0') {
              // Payment successful
              setStatus('success');
              setMessage('Payment completed successfully!');
              clearInterval(interval);
              setTimeout(() => {
                onSuccess?.(response.data.data);
              }, 2000);
            } else if (resultCode === '1032') {
              // User cancelled
              setStatus('failed');
              setErrorMessage('Payment cancelled by user');
              clearInterval(interval);
            } else if (resultCode) {
              // Other failure
              setStatus('failed');
              setErrorMessage(resultDesc || 'Payment failed');
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Status query error:', error);
        }
      }, 3000); // Query every 3 seconds

      // Stop querying after 2 minutes
      setTimeout(() => clearInterval(interval), 120000);

      return () => clearInterval(interval);
    }
  }, [checkoutRequestID, status, onSuccess]);

  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    let cleanPhone = phone.replace(/\D/g, '');

    // If starts with 0, replace with 254
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    }

    // If starts with 7 or 1 (without country code), add 254
    if (cleanPhone.length === 9 && (cleanPhone.startsWith('7') || cleanPhone.startsWith('1'))) {
      cleanPhone = '254' + cleanPhone;
    }

    return cleanPhone;
  };

  const validatePhoneNumber = (phone) => {
    const cleanPhone = formatPhoneNumber(phone);
    // Valid Kenyan phone number: 254XXXXXXXXX (12 digits total)
    return /^254[0-9]{9}$/.test(cleanPhone);
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();

    // Validate phone number
    if (!phoneNumber) {
      setErrorMessage('Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Invalid phone number. Format: 0712345678 or 254712345678');
      return;
    }

    // Validate amount
    if (!amount || amount <= 0) {
      setErrorMessage('Invalid amount');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const formattedPhone = formatPhoneNumber(phoneNumber);

      console.log('Initiating M-Pesa payment:', {
        amount,
        phone: formattedPhone,
        reference: accountReference
      });

      const response = await axios.post(
        '/api/mpesa/stk-push',
        {
          amount,
          phoneNumber: formattedPhone,
          accountReference: accountReference || 'ALGOSMART',
          transactionDesc: transactionDesc || 'AlgoSmart Payment',
          metadata
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setStatus('pending');
        setCheckoutRequestID(response.data.data.checkoutRequestID);
        setMessage('STK Push sent! Please check your phone and enter M-Pesa PIN.');
      } else {
        setStatus('failed');
        setErrorMessage(response.data.message || 'Failed to initiate payment');
      }

    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setStatus('failed');

      // Extract the most detailed error message
      let detailedError = 'Failed to initiate M-Pesa payment';

      if (error.response?.data?.error?.errorMessage) {
        // M-Pesa API error format
        detailedError = error.response.data.error.errorMessage;
        if (error.response.data.error.errorCode) {
          detailedError += ` (Code: ${error.response.data.error.errorCode})`;
        }
      } else if (error.response?.data?.message) {
        detailedError = error.response.data.message;
      } else if (error.message) {
        detailedError = error.message;
      }

      // Show helpful message for common errors
      if (detailedError.includes('Merchant does not exist') || detailedError.includes('500.001.1001')) {
        detailedError = 'M-Pesa Configuration Error: Invalid Business Shortcode. Please contact support.';
      } else if (detailedError.includes('Invalid Access Token') || detailedError.includes('400.002.02')) {
        detailedError = 'M-Pesa Authentication Error: Invalid credentials. Please contact support.';
      } else if (detailedError.includes('Bad Request') || detailedError.includes('400.008.01')) {
        detailedError = 'Invalid phone number format. Please use format: 254712345678';
      }

      setErrorMessage(detailedError);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and basic formatting characters
    const cleaned = value.replace(/[^\d+]/g, '');
    setPhoneNumber(cleaned);
    setErrorMessage('');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Smartphone className="h-12 w-12 text-green-600" />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {status === 'success' ? 'Payment Successful!' :
            status === 'failed' ? 'Payment Failed' :
              status === 'pending' ? 'Waiting for Payment...' :
                'Pay with M-Pesa'}
        </h2>
        <p className="text-gray-600">
          Amount: <span className="font-bold text-green-600">KES {amount}</span>
        </p>
      </div>

      {/* Form */}
      {status === 'idle' && (
        <form onSubmit={handleInitiatePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="0712345678 or 254712345678"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400"
              disabled={loading}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the phone number to receive the STK push
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !phoneNumber}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Initiating...</span>
              </>
            ) : (
              <>
                <Smartphone className="h-5 w-5" />
                <span>Send STK Push</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Cancel
            </button>
          )}
        </form>
      )}

      {/* Pending Status */}
      {status === 'pending' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Loader className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {message}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  This may take a few seconds...
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Check your phone for the M-Pesa prompt</li>
              <li>Enter your M-Pesa PIN</li>
              <li>Confirm the payment</li>
              <li>Wait for confirmation</li>
            </ol>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          )}
        </div>
      )}

      {/* Success Status */}
      {status === 'success' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-center text-green-800 font-medium">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Failed Status */}
      {status === 'failed' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-center text-red-800 font-medium">
              {errorMessage || 'Payment failed. Please try again.'}
            </p>
          </div>
          <button
            onClick={() => {
              setStatus('idle');
              setErrorMessage('');
              setMessage('');
              setCheckoutRequestID(null);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* M-Pesa Logo/Branding */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Smartphone className="h-4 w-4 text-green-600" />
          <span>Secured by M-Pesa</span>
        </div>
      </div>
    </div>
  );
};

export default MpesaPayment;

