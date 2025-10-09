import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  Shield, 
  Clock, 
  ExternalLink, 
  Download, 
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import apiClient from '../../lib/apiClient';

const SelfServiceCryptoDialog = ({ 
  isOpen, 
  onClose, 
  eaId,
  eaName,
  amount = 18, 
  currency = 'USD',
  subscriptionType = 'lifetime',
  onPaymentSuccess 
}) => {
  const [cryptoPayment, setCryptoPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showInstructions, setShowInstructions] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [autoMonitoring, setAutoMonitoring] = useState(true);

  useEffect(() => {
    if (isOpen && !cryptoPayment) {
      initializeCryptoPayment();
    }
  }, [isOpen, eaId]);

  useEffect(() => {
    let statusInterval;
    
    if (cryptoPayment && autoMonitoring) {
      // Check payment status every 10 seconds
      statusInterval = setInterval(() => {
        checkPaymentStatus();
      }, 10000);
    }

    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [cryptoPayment, autoMonitoring]);

  const initializeCryptoPayment = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/payments/crypto/subscribe', {
        eaId,
        amount,
        currency,
        subscriptionType
      });

      if (response.data.success) {
        setCryptoPayment(response.data.data);
        setPaymentStatus('pending');
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Failed to initialize crypto payment:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!cryptoPayment?.paymentId) return;

    try {
      const response = await apiClient.get(`/api/payments/crypto/status/${cryptoPayment.paymentId}`);
      
      if (response.data.success) {
        const status = response.data.data.status;
        setPaymentStatus(status);

        if (status === 'completed') {
          setAutoMonitoring(false);
          if (onPaymentSuccess) {
            onPaymentSuccess(cryptoPayment);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    }
  };

  const confirmPayment = async () => {
    if (!txHash.trim()) {
      alert('Please enter your transaction hash');
      return;
    }

    setConfirming(true);
    try {
      const response = await apiClient.post('/api/payments/crypto/confirm', {
        paymentId: cryptoPayment.paymentId,
        txHash: txHash.trim(),
        cryptoType: selectedCrypto?.toUpperCase()
      });

      if (response.data.success) {
        setPaymentStatus('confirmed');
        setAutoMonitoring(false);
        if (onPaymentSuccess) {
          onPaymentSuccess(cryptoPayment);
        }
      } else {
        alert('Payment verification failed. Please check your transaction hash.');
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      alert('Failed to confirm payment. Please try again.');
    } finally {
      setConfirming(false);
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

  const getCryptoIcon = (crypto) => {
    const icons = {
      bitcoin: '₿',
      ethereum: 'Ξ',
      binance: '🟡',
      usdt: '💎'
    };
    return icons[crypto] || '₿';
  };

  const getCryptoName = (crypto) => {
    const names = {
      bitcoin: 'Bitcoin (BTC)',
      ethereum: 'Ethereum (ETH)',
      binance: 'Binance Coin (BNB)',
      usdt: 'Tether USD (USDT)'
    };
    return names[crypto] || crypto;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pay with Cryptocurrency</h2>
              <p className="text-gray-600 mt-1">
                {eaName} - {subscriptionType === 'lifetime' ? 'Lifetime Access' : `${subscriptionType} Subscription`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Initializing payment...</span>
              </div>
            ) : cryptoPayment ? (
              <div className="space-y-6">
                {/* Payment Status */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">Amount: ${amount} {currency}</p>
                        <p className="text-blue-700 text-sm">
                          Send the exact amount to any address below. Payment expires in 30 minutes.
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(paymentStatus)}`}>
                      {getStatusIcon(paymentStatus)}
                      <span className="text-sm font-medium capitalize">{paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Auto Monitoring Toggle */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="font-medium text-gray-900">Automatic Monitoring</p>
                    <p className="text-sm text-gray-600">
                      System automatically detects your payment and grants access
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoMonitoring(!autoMonitoring)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoMonitoring ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoMonitoring ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Crypto Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Choose Cryptocurrency</h3>
                  {Object.entries(cryptoPayment.cryptoOptions).map(([crypto, data]) => (
                    <div
                      key={crypto}
                      className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                        selectedCrypto === crypto
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCrypto(crypto)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getCryptoIcon(crypto)}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{getCryptoName(crypto)}</h4>
                            <p className="text-lg font-bold text-gray-700">{data.amount} {crypto.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 break-all max-w-xs">{data.address}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(data.address, crypto);
                            }}
                            className="mt-2 flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                          >
                            {copiedAddress === crypto ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              {copiedAddress === crypto ? 'Copied!' : 'Copy'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                {showInstructions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-green-50 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-green-900 mb-2">How to Pay:</h4>
                    <div className="space-y-2 text-green-800 text-sm">
                      <p>1. Select your preferred cryptocurrency above</p>
                      <p>2. Copy the wallet address</p>
                      <p>3. Send the exact amount from your wallet</p>
                      <p>4. Wait for automatic confirmation (or enter transaction hash below)</p>
                      <p>5. Download your EA immediately after confirmation</p>
                    </div>
                  </motion.div>
                )}

                {/* Manual Confirmation */}
                {paymentStatus === 'pending' && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-3">Already Sent Payment?</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transaction Hash
                        </label>
                        <input
                          type="text"
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          placeholder="Enter your transaction hash (txHash)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={confirmPayment}
                        disabled={confirming || !txHash.trim()}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {confirming ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Confirm Payment & Get Access</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {paymentStatus === 'completed' || paymentStatus === 'confirmed' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 rounded-lg p-6 text-center"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-900 mb-2">Payment Confirmed!</h3>
                    <p className="text-green-700 mb-4">
                      Your payment has been verified. You now have {subscriptionType} access to {eaName}.
                    </p>
                    <button
                      onClick={() => {
                        // TODO: Implement EA download
                        alert('EA download will be implemented');
                      }}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download EA</span>
                    </button>
                  </motion.div>
                ) : null}

                {/* Refresh Button */}
                <div className="flex justify-center">
                  <button
                    onClick={checkPaymentStatus}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh Status</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Failed to initialize payment. Please try again.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SelfServiceCryptoDialog;
