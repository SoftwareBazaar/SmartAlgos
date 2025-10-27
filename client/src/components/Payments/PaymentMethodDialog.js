/**
 * Payment Method Selection Dialog
 * Unified payment interface supporting multiple payment providers
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  X,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import MpesaPayment from '../MpesaPayment';
import CryptoPayment from '../CryptoPayment';

const PaymentMethodDialog = ({ 
  isOpen, 
  onClose, 
  amount, 
  currency = 'USD',
  onPaymentSuccess,
  onPaymentError,
  accountReference,
  transactionDesc,
  metadata = {}
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showPaystackForm, setShowPaystackForm] = useState(false);
  const [paystackData, setPaystackData] = useState({
    email: '',
    paymentMethod: 'initialize'
  });

  // Payment method configurations
  const paymentMethods = [
    {
      id: 'card',
      name: 'Card Payment',
      description: 'Pay with Credit/Debit Card via Paystack',
      icon: CreditCard,
      color: 'blue',
      currencies: ['NGN', 'USD', 'GHS', 'ZAR', 'KES'],
      available: true
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay with M-Pesa Mobile Money (Kenya)',
      icon: Smartphone,
      color: 'green',
      currencies: ['KES'],
      available: currency === 'KES' || amount // Always show, we'll convert
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Pay with BTC, ETH, USDT, USDC',
      icon: Bitcoin,
      color: 'orange',
      currencies: ['USD', 'EUR', 'GBP'],
      available: true
    }
  ];

  // Convert amount to KES if needed for M-Pesa
  const getConvertedAmount = (targetCurrency) => {
    if (currency === targetCurrency) return amount;
    
    // Simple conversion rates (in production, use real-time rates)
    const conversionRates = {
      'USD': { 'KES': 150 },
      'EUR': { 'KES': 165 },
      'GBP': { 'KES': 185 },
      'KES': { 'USD': 0.0067, 'EUR': 0.0061, 'GBP': 0.0054 }
    };

    const rate = conversionRates[currency]?.[targetCurrency] || 1;
    return Math.round(amount * rate);
  };

  const handlePaystackPayment = async () => {
    try {
      // Implement Paystack payment initialization
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          currency,
          email: paystackData.email,
          metadata: {
            ...metadata,
            accountReference,
            transactionDesc
          }
        })
      });

      const data = await response.json();

      if (data.success && data.data.authorization_url) {
        // Redirect to Paystack
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error(data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Paystack payment error:', error);
      onPaymentError?.(error);
    }
  };

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    if (methodId === 'card') {
      setShowPaystackForm(true);
    }
  };

  const handleBack = () => {
    setSelectedMethod(null);
    setShowPaystackForm(false);
  };

  const handleMpesaSuccess = (result) => {
    onPaymentSuccess?.(result);
    onClose();
  };

  const handleCryptoSuccess = (result) => {
    onPaymentSuccess?.(result);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedMethod ? 'Complete Payment' : 'Choose Payment Method'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Amount: <span className="font-semibold">{currency} {amount}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedMethod ? (
            // Payment Method Selection
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  disabled={!method.available}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    method.available
                      ? `border-gray-200 dark:border-gray-700 hover:border-${method.color}-500 hover:bg-${method.color}-50 dark:hover:bg-${method.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-${method.color}-100 dark:bg-${method.color}-900/30`}>
                      <method.icon className={`h-6 w-6 text-${method.color}-600`} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {method.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                      {method.id === 'mpesa' && currency !== 'KES' && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ≈ KES {getConvertedAmount('KES')} (Auto-converted)
                        </p>
                      )}
                    </div>
                  </div>
                  {method.available && (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          ) : selectedMethod === 'mpesa' ? (
            // M-Pesa Payment Component
            <div>
              <button
                onClick={handleBack}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center text-sm"
              >
                ← Back to payment methods
              </button>
              <MpesaPayment
                amount={currency === 'KES' ? amount : getConvertedAmount('KES')}
                accountReference={accountReference}
                transactionDesc={transactionDesc}
                metadata={metadata}
                onSuccess={handleMpesaSuccess}
                onError={onPaymentError}
                onClose={onClose}
              />
            </div>
          ) : selectedMethod === 'crypto' ? (
            // Crypto Payment Component
            <div>
              <button
                onClick={handleBack}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center text-sm"
              >
                ← Back to payment methods
              </button>
              <CryptoPayment
                amount={amount}
                currency={currency}
                onPaymentSuccess={handleCryptoSuccess}
                onPaymentError={onPaymentError}
                productType="ea_subscription"
                productId={metadata?.eaId || metadata?.ea_id}
              />
            </div>
          ) : selectedMethod === 'card' && showPaystackForm ? (
            // Paystack Card Payment Form
            <div>
              <button
                onClick={handleBack}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center text-sm"
              >
                ← Back to payment methods
              </button>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Amount: {currency} {amount}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transactionDesc || 'Payment for AlgoSmart services'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={paystackData.email}
                    onChange={(e) => setPaystackData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <button
                  onClick={handlePaystackPayment}
                  disabled={!paystackData.email}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed to Payment</span>
                </button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Secured by Paystack. Your card details are encrypted and secure.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodDialog;

