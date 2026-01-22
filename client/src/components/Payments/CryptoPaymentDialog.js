import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Clock, Shield, CheckCircle, Download } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import useAutoDownload from '../../hooks/useAutoDownload';

const CryptoPaymentDialog = ({
  isOpen,
  onClose,
  amount,
  currency = 'USD',
  onPaymentSuccess
}) => {
  const [cryptoPayment, setCryptoPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [polling, setPolling] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState(null);
  const pollingIntervalRef = useRef(null);

  const { downloading, progress, downloadFromLinks } = useAutoDownload();

  useEffect(() => {
    if (isOpen && !cryptoPayment) {
      initializeCryptoPayment();
    }

    // Cleanup polling on unmount or dialog close
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isOpen]);

  const initializeCryptoPayment = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/payments/crypto/initialize', {
        amount,
        currency
      });

      if (response.data.success) {
        setCryptoPayment(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to initialize crypto payment');
      }
    } catch (error) {
      console.error('Crypto payment initialization error:', error);
      alert('Failed to initialize crypto payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentStatusPolling = () => {
    if (!cryptoPayment?.paymentId) return;

    setPolling(true);
    console.log('🔄 Starting payment status polling...');

    // Poll every 10 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        console.log('🔍 Checking payment status...');
        const response = await apiClient.get(`/api/payments/crypto/status/${cryptoPayment.paymentId}`);

        if (response.data.success && response.data.data.status === 'confirmed') {
          console.log('✅ Payment confirmed!');
          clearInterval(pollingIntervalRef.current);
          setPolling(false);
          setPaymentConfirmed(true);

          // Fetch download links
          await fetchDownloadLinks(cryptoPayment.paymentId);
        }
      } catch (error) {
        console.error('Payment status check error:', error);
      }
    }, 10000); // Poll every 10 seconds
  };

  const fetchDownloadLinks = async (transactionId) => {
    try {
      console.log('📥 Fetching download links...');
      const response = await apiClient.get(`/api/payments/crypto/${transactionId}/download-links`);

      if (response.data.success && response.data.data.downloadLinks) {
        const links = response.data.data.downloadLinks;
        setDownloadLinks(links);

        // Trigger automatic downloads
        console.log('🚀 Initiating automatic downloads...');
        const result = await downloadFromLinks(links);

        if (result.success) {
          console.log(`✅ Successfully downloaded ${result.downloaded} files`);
        } else {
          console.warn(`⚠️ Downloaded ${result.downloaded} files, ${result.failed} failed`);
        }

        // Call success callback
        if (onPaymentSuccess) {
          onPaymentSuccess({
            transactionId,
            downloadLinks: links,
            subscriptionId: response.data.data.subscriptionId
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch download links:', error);
      alert('Payment confirmed, but failed to fetch download links. Please check your Subscription page.');
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

  const formatCryptoAmount = (amount) => {
    return parseFloat(amount).toFixed(8).replace(/\.?0+$/, '');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pay with Cryptocurrency
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {paymentConfirmed ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Confirmed!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your files are being downloaded automatically.
              </p>

              {downloading && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Downloading {progress.current} of {progress.total} files...
                  </p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  You can also access your files anytime from the Subscription page.
                </p>
              </div>

              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Subscriptions
              </button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Amount: ${amount} {currency}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Send the exact amount to any address below. Payment expires in 30 minutes.
                    </p>
                  </div>
                </div>
              </div>

              {polling && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Monitoring payment... Your files will download automatically when confirmed.
                    </p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Initializing crypto payment...</p>
                </div>
              ) : cryptoPayment ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(cryptoPayment.cryptoOptions).map(([crypto, data]) => (
                      <div
                        key={crypto}
                        className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${selectedCrypto === crypto
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        onClick={() => setSelectedCrypto(crypto)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg">{getCryptoIcon(crypto)}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getCryptoName(crypto)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Amount:
                          </div>
                          <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                            {formatCryptoAmount(data.amount)} {crypto.toUpperCase()}
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Address:
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 truncate">
                              {data.address}
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(data.address, crypto);
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {copiedAddress === crypto && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Copied!
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedCrypto && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                        {getCryptoName(selectedCrypto)} Payment Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            QR Code:
                          </div>
                          <img
                            src={cryptoPayment.cryptoOptions[selectedCrypto].qrCode}
                            alt={`${selectedCrypto} QR Code`}
                            className="w-32 h-32 border rounded"
                          />
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Send to this address:
                          </div>
                          <div className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded border break-all">
                            {cryptoPayment.cryptoOptions[selectedCrypto].address}
                          </div>
                          <button
                            onClick={() => copyToClipboard(
                              cryptoPayment.cryptoOptions[selectedCrypto].address,
                              selectedCrypto
                            )}
                            className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
                          >
                            Copy Address
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            Payment expires at: {new Date(cryptoPayment.expiresAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={onClose}
                      disabled={polling}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        startPaymentStatusPolling();
                        alert('Payment monitoring started. Your files will download automatically when payment is confirmed.');
                      }}
                      disabled={polling}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {polling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Monitoring...
                        </>
                      ) : (
                        "I've Sent Payment"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Failed to initialize crypto payment</p>
                  <button
                    onClick={initializeCryptoPayment}
                    className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CryptoPaymentDialog;
