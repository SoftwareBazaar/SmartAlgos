import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  Star,
  TrendingUp,
  Shield,
  CreditCard,
  Download,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import apiClient from '../../lib/apiClient';

const PublicEADetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ea, setEA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [email, setEmail] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchEA();
  }, [id]);

  const fetchEA = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/eas/${id}`);
      setEA(response.data.data);
    } catch (error) {
      console.error('Error fetching EA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    if (!ea) return;

    try {
      setProcessingPayment(true);

      const response = await apiClient.post('/api/payments/paystack/initialize', {
        email,
        amount: (ea.price_monthly || 0) * 100,
        currency: 'KES',
        metadata: {
          ea_id: ea.id,
          ea_name: ea.name,
          customer_email: email,
          purchase_type: 'ea_marketplace'
        }
      });

      if (response.data.data && response.data.data.authorization_url) {
        window.location.href = response.data.data.authorization_url;
      } else {
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading Expert Advisor...</p>
        </div>
      </div>
    );
  }

  if (!ea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Expert Advisor not found</p>
          <Button onClick={() => navigate('/ea-marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/ea-marketplace')}
            className="flex items-center gap-2 text-indigo-100 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Marketplace
          </button>
          <h1 className="text-4xl font-bold">{ea.name}</h1>
          <p className="text-indigo-100 mt-2">{ea.description}</p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 h-96 flex items-center justify-center"
            >
              {ea.image ? (
                <img
                  src={ea.image}
                  alt={ea.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Bot className="h-24 w-24 text-white opacity-50" />
              )}
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <Card.Body className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-2xl font-bold text-white">
                        {ea.average_rating || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Rating</p>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Body className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      <span className="text-2xl font-bold text-white">
                        {ea.win_rate || 'N/A'}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Win Rate</p>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Body className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      <span className="text-2xl font-bold text-white">
                        {ea.max_drawdown || 'N/A'}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Max Drawdown</p>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Body className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      <span className="text-2xl font-bold text-white">
                        {ea.monthly_return || 'N/A'}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Monthly Return</p>
                  </Card.Body>
                </Card>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
              <Card>
                <Card.Body>
                  <div className="space-y-3">
                    {ea.supported_pairs && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Supported Pairs</p>
                          <p className="text-sm text-gray-400">
                            {Array.isArray(ea.supported_pairs)
                              ? ea.supported_pairs.join(', ')
                              : ea.supported_pairs}
                          </p>
                        </div>
                      </div>
                    )}
                    {ea.timeframes && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Timeframes</p>
                          <p className="text-sm text-gray-400">
                            {Array.isArray(ea.timeframes)
                              ? ea.timeframes.join(', ')
                              : ea.timeframes}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-white">Strategy Type</p>
                        <p className="text-sm text-gray-400 capitalize">
                          {ea.strategy_type || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Purchase Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-4">
              <Card.Body>
                {/* Price */}
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Monthly Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${ea.price_monthly || 0}
                    </span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>No account needed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Download className="h-4 w-4" />
                    <span>Instant download</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment</span>
                  </div>
                </div>

                {/* Buy Button */}
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 mb-3"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>

                {/* Security Note */}
                <div className="flex items-start gap-2 p-3 bg-blue-900/30 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300">
                    Secured by Paystack. Your payment is safe and encrypted.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Payment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {ea.name}
            </p>

            {/* Amount */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                ${ea.price_monthly || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Monthly subscription
              </p>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                We'll send your download link and license key to this email
              </p>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-2 mb-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Secured by Paystack. Your card details are encrypted and secure.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowPaymentModal(false)}
                disabled={processingPayment}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleProceedToPayment}
                disabled={processingPayment || !email}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {processingPayment ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PublicEADetail;
