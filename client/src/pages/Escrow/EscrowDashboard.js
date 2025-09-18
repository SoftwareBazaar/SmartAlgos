import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Bot,
  TrendingUp,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const EscrowDashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sample escrow transactions data
  const sampleTransactions = [
    {
      id: 'ESC_001',
      productType: 'ea_subscription',
      productName: 'Gold Scalper Pro EA',
      description: 'Gold Scalper Pro EA - Monthly Subscription',
      amount: 299,
      currency: 'USD',
      escrowFee: 2.66,
      totalAmount: 301.66,
      status: 'payment_completed',
      buyerEmail: user?.email || 'buyer@example.com',
      sellerEmail: 'seller@example.com',
      inspectionPeriod: 3, // days
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      paymentMethod: 'card',
      paymentReference: 'PAY_001_1234567890',
      inspectionEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ESC_002',
      productType: 'hft_rental',
      productName: 'Lightning Bot - Professional',
      description: 'HFT Bot Rental - Professional Plan',
      amount: 199,
      currency: 'USD',
      escrowFee: 1.77,
      totalAmount: 200.77,
      status: 'pending_agreement',
      buyerEmail: user?.email || 'buyer@example.com',
      sellerEmail: 'hft-provider@smartalgos.com',
      inspectionPeriod: 2,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      paymentMethod: 'bank_transfer',
      paymentReference: 'PAY_002_1234567890',
      inspectionEndDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ESC_003',
      productType: 'trading_signal',
      productName: 'Premium Trading Signals',
      description: 'Premium Trading Signals Package',
      amount: 99,
      currency: 'USD',
      escrowFee: 0.88,
      totalAmount: 99.88,
      status: 'completed',
      buyerEmail: user?.email || 'buyer@example.com',
      sellerEmail: 'signals@smartalgos.com',
      inspectionPeriod: 1,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      paymentMethod: 'card',
      paymentReference: 'PAY_003_1234567890',
      inspectionEndDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'ESC_004',
      productType: 'ea_subscription',
      productName: 'Multi Indicator EA',
      description: 'Multi Indicator EA - Quarterly Subscription',
      amount: 237,
      currency: 'USD',
      escrowFee: 2.11,
      totalAmount: 239.11,
      status: 'disputed',
      buyerEmail: user?.email || 'buyer@example.com',
      sellerEmail: 'seller@example.com',
      inspectionPeriod: 5,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      paymentMethod: 'crypto',
      paymentReference: 'PAY_004_1234567890',
      inspectionEndDate: new Date(Date.now() - 172800000).toISOString(),
      disputeReason: 'product_not_as_described'
    },
    {
      id: 'ESC_005',
      productType: 'hft_rental',
      productName: 'Arbitrage Bot - Enterprise',
      description: 'HFT Bot Rental - Enterprise Plan',
      amount: 499,
      currency: 'USD',
      escrowFee: 4.44,
      totalAmount: 503.44,
      status: 'cancelled',
      buyerEmail: user?.email || 'buyer@example.com',
      sellerEmail: 'hft-provider@smartalgos.com',
      inspectionPeriod: 7,
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
      paymentMethod: 'card',
      paymentReference: 'PAY_005_1234567890',
      inspectionEndDate: new Date(Date.now() - 259200000).toISOString(),
      cancellationReason: 'User request'
    }
  ];

  useEffect(() => {
    // Simulate loading and set sample data
    const loadTransactions = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTransactions(sampleTransactions);
      } catch (error) {
        console.error('Failed to load escrow transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_agreement':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'payment_pending':
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
      case 'pending_agreement':
        return 'Pending Agreement';
      case 'payment_pending':
        return 'Payment Pending';
      case 'payment_completed':
        return 'Payment Completed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'disputed':
        return 'Disputed';
      default:
        return 'Unknown';
    }
  };

  const getProductIcon = (productType) => {
    switch (productType) {
      case 'ea_subscription':
        return <Bot className="h-5 w-5 text-blue-500" />;
      case 'hft_rental':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'trading_signal':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: transactions.length,
    pending_agreement: transactions.filter(t => t.status === 'pending_agreement').length,
    payment_pending: transactions.filter(t => t.status === 'payment_pending').length,
    payment_completed: transactions.filter(t => t.status === 'payment_completed').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    cancelled: transactions.filter(t => t.status === 'cancelled').length,
    disputed: transactions.filter(t => t.status === 'disputed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Escrow Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your protected transactions and payments
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <Card.Body>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusCounts.all}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-2xl font-bold text-green-600">{statusCounts.payment_completed + statusCounts.pending_agreement}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{statusCounts.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disputed</p>
                    <p className="text-2xl font-bold text-orange-600">{statusCounts.disputed}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'pending_agreement', label: 'Pending', count: statusCounts.pending_agreement },
              { key: 'payment_completed', label: 'Active', count: statusCounts.payment_completed },
              { key: 'completed', label: 'Completed', count: statusCounts.completed },
              { key: 'disputed', label: 'Disputed', count: statusCounts.disputed }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={statusFilter === filter.key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.key)}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <Card.Body>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getProductIcon(transaction.productType)}
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {transaction.productName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {transaction.id}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          ${transaction.totalAmount} {transaction.currency}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getStatusText(transaction.status)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <Card>
            <Card.Body>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'You don\'t have any escrow transactions yet'
                  }
                </p>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Transaction Details
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {selectedTransaction.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {getStatusText(selectedTransaction.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedTransaction.productName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedTransaction.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Financial Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Product Price</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      ${selectedTransaction.amount} {selectedTransaction.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Escrow Fee</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      ${selectedTransaction.escrowFee} {selectedTransaction.currency}
                    </span>
                  </div>
                  <div className="border-t dark:border-gray-600 pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-gray-100">Total Amount</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${selectedTransaction.totalAmount} {selectedTransaction.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">Transaction Created</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(selectedTransaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedTransaction.status === 'payment_completed' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">Payment Completed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(selectedTransaction.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTransaction.status === 'completed' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">Transaction Completed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(selectedTransaction.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </Button>
                {selectedTransaction.status === 'payment_completed' && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      // Handle inspection period actions
                      console.log('Inspection period actions');
                    }}
                  >
                    Manage Inspection
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EscrowDashboard;
