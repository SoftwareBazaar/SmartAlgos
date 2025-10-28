import React, { useState, useEffect } from 'react';
import { 
  Bitcoin, 
  Ethereum, 
  Copy, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  QrCode,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

// Version: v2.1 - Fixed colors and contrast issues
const CryptoPayment = ({ 
  amount, 
  currency = 'USD',
  onPaymentSuccess, 
  onPaymentError,
  productType = 'ea_subscription',
  productId,
  metadata = {}
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState('usdt');
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const cryptoOptions = [
    { 
      value: 'usdt', 
      label: 'USDT', 
      name: 'Tether (USDT)', 
      icon: '₮',
      network: 'TRC20',
      color: 'text-green-500'
    },
    { 
      value: 'btc', 
      label: 'BTC', 
      name: 'Bitcoin', 
      icon: '₿',
      network: 'Bitcoin',
      color: 'text-orange-500'
    },
    { 
      value: 'eth', 
      label: 'ETH', 
      name: 'Ethereum', 
      icon: 'Ξ',
      network: 'Ethereum',
      color: 'text-blue-500'
    },
    { 
      value: 'usdc', 
      label: 'USDC', 
      name: 'USD Coin', 
      icon: '◊',
      network: 'ERC20',
      color: 'text-blue-600'
    }
  ];

  // Currency conversion rates to USD
  const currencyToUSD = {
    USD: 1,
    EUR: 1.1,
    GBP: 1.27,
    KES: 0.0067 // 1 KES = 0.0067 USD (approx 150 KES = 1 USD)
  };

  const exchangeRates = {
    usdt: 1,
    btc: 65000,
    eth: 3500,
    usdc: 1
  };

  useEffect(() => {
    if (paymentData) {
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPaymentStatus('expired');
            onPaymentError?.('Payment expired. Please generate a new payment address.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentData, onPaymentError]);

  const generatePaymentAddress = async () => {
    setIsLoading(true);
    try {
      // Use the correct API endpoint with proper base URL
      const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
      const response = await fetch(`${baseUrl}/api/payments/crypto/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test_token'}`
        },
        body: JSON.stringify({
          amount,
          currency,
          cryptoCurrency: selectedCrypto,
          productType,
          productId,
          metadata
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentData(data.data);
          setPaymentStatus('pending');
          setTimeLeft(1800); // Reset timer
        } else {
          throw new Error(data.message || 'Failed to generate payment address');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Payment generation error:', error);
      alert(`Payment failed: ${error.message}`);
      onPaymentError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.transactionId) return;

    try {
      const response = await fetch(`/api/payments/crypto/status/${paymentData.transactionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test_token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.status === 'confirmed') {
          setPaymentStatus('confirmed');
          onPaymentSuccess?.(data.data);
        }
      }
    } catch (error) {
      console.error('Payment status check error:', error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount, crypto) => {
    // Convert amount to USD first if needed
    const conversionRate = currencyToUSD[currency] || 1;
    const amountInUSD = amount * conversionRate;
    
    // Convert USD to crypto
    const rate = exchangeRates[crypto];
    const cryptoAmount = (amountInUSD / rate).toFixed(8);
    return `${cryptoAmount} ${crypto.toUpperCase()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'expired': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'expired': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (!paymentData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bitcoin className="w-6 h-6 mr-2 text-orange-500" />
          Crypto Payment
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Cryptocurrency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {cryptoOptions.map((crypto) => (
                <button
                  key={crypto.value}
                  onClick={() => setSelectedCrypto(crypto.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedCrypto === crypto.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${crypto.color}`}>
                      {crypto.icon}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {crypto.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {crypto.network}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-300">Amount:</span>
              <span className="text-gray-900 dark:text-white font-semibold">
                {formatAmount(amount, selectedCrypto)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                {currency === 'USD' ? 'USD Value:' : `${currency} Value:`}
              </span>
              <span className="text-gray-900 dark:text-white">{currency} {amount}</span>
            </div>
            {currency !== 'USD' && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-300 text-sm">USD Equivalent:</span>
                <span className="text-gray-900 dark:text-white text-sm">
                  ${(amount * (currencyToUSD[currency] || 1)).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={generatePaymentAddress}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating Payment...
              </>
            ) : (
              <>
                <Bitcoin className="w-5 h-5 mr-2" />
                Generate Payment Address
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Bitcoin className="w-6 h-6 mr-2 text-orange-500" />
          Crypto Payment
        </h3>
        <div className={`flex items-center space-x-2 ${getStatusColor(paymentStatus)}`}>
          {getStatusIcon(paymentStatus)}
          <span className="text-sm font-medium capitalize">{paymentStatus}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Payment Details */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-300">Amount to Pay:</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {formatAmount(amount, selectedCrypto)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              {currency === 'USD' ? 'USD Value:' : `${currency} Value:`}
            </span>
            <span className="text-gray-900 dark:text-white">{currency} {amount}</span>
          </div>
          {currency !== 'USD' && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-300 text-sm">USD Equivalent:</span>
              <span className="text-gray-900 dark:text-white text-sm">
                ${(amount * (currencyToUSD[currency] || 1)).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Send to this address:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={paymentData.address}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm font-mono"
            />
            <button
              onClick={() => copyToClipboard(paymentData.address)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Copy address"
            >
              {copiedAddress ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Network: {cryptoOptions.find(c => c.value === selectedCrypto)?.network}
          </p>
        </div>

        {/* QR Code */}
        {paymentData.qrCode && (
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-lg">
              <img 
                src={paymentData.qrCode} 
                alt="Payment QR Code"
                className="w-32 h-32"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Scan with your crypto wallet
            </p>
          </div>
        )}

        {/* Timer */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-yellow-200 text-sm">
              Time remaining:
            </span>
            <span className="text-yellow-400 font-mono text-lg">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <h4 className="text-blue-200 font-medium mb-2">Payment Instructions:</h4>
          <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
            <li>Send exactly {formatAmount(amount, selectedCrypto)} to the address above</li>
            <li>Use the {cryptoOptions.find(c => c.value === selectedCrypto)?.network} network</li>
            <li>Payment will be confirmed automatically (may take 10-30 minutes)</li>
            <li>Do not send from an exchange wallet</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={checkPaymentStatus}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Status
          </button>
          <button
            onClick={() => window.open(`https://blockchain.info/address/${paymentData.address}`, '_blank')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Blockchain
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoPayment;
