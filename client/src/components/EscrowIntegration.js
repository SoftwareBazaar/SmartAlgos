import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  CreditCard,
  Banknote
} from 'lucide-react';
import Button from './UI/Button';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';

const EscrowIntegration = ({ 
  productType = 'ea_subscription',
  productId,
  productName,
  productPrice,
  sellerEmail,
  onTransactionCreated,
  onError 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [inspectionPeriod, setInspectionPeriod] = useState(3); // days
  const [escrowFee, setEscrowFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (productPrice) {
      calculateEscrowFee();
    }
  }, [productPrice]);

  const calculateEscrowFee = async () => {
    try {
      const response = await apiClient.get('/api/escrow/fee-calculator', {
        params: {
          amount: productPrice,
          currency: 'USD'
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test_token'}`
        }
      });

      if (response.data.success) {
        setEscrowFee(response.data.data.escrowFee);
        setTotalAmount(response.data.data.totalAmount);
      }
    } catch (error) {
      console.error('Failed to calculate escrow fee:', error);
      // Fallback calculation (0.89% fee)
      const fee = Math.round(productPrice * 0.0089 * 100) / 100;
      setEscrowFee(fee);
      setTotalAmount(productPrice + fee);
    }
  };

  const createEscrowTransaction = async () => {
    if (!user) {
      onError?.('Please log in to create an escrow transaction');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        buyerEmail: user.email,
        sellerEmail: sellerEmail,
        amount: productPrice,
        currency: 'USD',
        description: `${productName} - ${productType.replace('_', ' ')}`,
        productType: productType,
        inspectionPeriod: inspectionPeriod * 24 * 60 * 60, // convert days to seconds
        metadata: {
          productId: productId,
          productName: productName,
          userId: user._id,
          platform: 'smart-algos'
        }
      };

      const response = await apiClient.post('/api/escrow/transactions', transactionData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test_token'}`
        }
      });

      if (response.data.success) {
        setTransaction(response.data.data);
        setEscrowStatus('created');
        onTransactionCreated?.(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to create escrow transaction');
      }
    } catch (error) {
      console.error('Escrow transaction error:', error);
      onError?.(error.response?.data?.message || error.message || 'Failed to create escrow transaction');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!transaction) return;

    setLoading(true);
    try {
      const paymentData = {
        amount: productPrice,
        currency: 'USD',
        paymentMethod: 'card',
        metadata: {
          transactionId: transaction.id,
          productId: productId
        }
      };

      const response = await apiClient.post(
        `/api/escrow/transactions/${transaction.id}/payments`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || 'test_token'}`
          }
        }
      );

      if (response.data.success) {
        // Redirect to payment URL
        window.open(response.data.data.payment_url, '_blank');
        setEscrowStatus('payment_initiated');
      } else {
        throw new Error(response.data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      onError?.(error.response?.data?.message || error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'payment_initiated':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'payment_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'disputed':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'created':
        return 'Transaction Created';
      case 'payment_initiated':
        return 'Payment Initiated';
      case 'payment_completed':
        return 'Payment Completed';
      case 'completed':
        return 'Transaction Completed';
      case 'cancelled':
        return 'Transaction Cancelled';
      case 'disputed':
        return 'Dispute Created';
      default:
        return 'Ready to Create';
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Processing escrow transaction...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Protected by Escrow
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your payment is held securely until you confirm the product works as expected
              </p>
            </div>
          </div>

          {/* Transaction Status */}
          {transaction && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(escrowStatus)}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getStatusText(escrowStatus)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>

              {showDetails && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {transaction.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Inspection Period:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {inspectionPeriod} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {transaction.status || 'pending_agreement'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
              Pricing Breakdown
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">Product Price:</span>
                <span className="text-blue-900 dark:text-blue-100">${productPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">Escrow Fee:</span>
                <span className="text-blue-900 dark:text-blue-100">${escrowFee}</span>
              </div>
              <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-blue-900 dark:text-blue-100">Total Amount:</span>
                  <span className="text-blue-900 dark:text-blue-100">${totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inspection Period Selection */}
          {!transaction && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inspection Period
              </label>
              <select
                value={inspectionPeriod}
                onChange={(e) => setInspectionPeriod(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={1}>1 Day</option>
                <option value={2}>2 Days</option>
                <option value={3}>3 Days</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Time to test and confirm the product works as expected
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!transaction ? (
              <Button
                variant="primary"
                fullWidth
                onClick={createEscrowTransaction}
                disabled={loading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Create Escrow Transaction
              </Button>
            ) : escrowStatus === 'created' ? (
              <Button
                variant="primary"
                fullWidth
                onClick={initiatePayment}
                disabled={loading}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Payment
              </Button>
            ) : escrowStatus === 'payment_initiated' ? (
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.open(`/api/escrow/transactions/${transaction.id}`, '_blank')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Transaction
              </Button>
            ) : null}
          </div>

          {/* Benefits */}
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Escrow Protection Benefits
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Payment held securely until you confirm satisfaction</li>
              <li>• Full refund if product doesn't work as described</li>
              <li>• Dispute resolution if issues arise</li>
              <li>• Professional mediation service</li>
            </ul>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EscrowIntegration;
