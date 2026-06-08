import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot,
  Star,
  Search,
  Filter,
  TrendingUp,
  Shield,
  CreditCard,
  ArrowRight,
  Download,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import apiClient from '../../lib/apiClient';

const PublicEAMarketplace = () => {
  const navigate = useNavigate();
  const [eas, setEAs] = useState([]);
  const [filteredEAs, setFilteredEAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedEA, setSelectedEA] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [email, setEmail] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState('monthly');

  // Fetch EAs on mount
  useEffect(() => {
    fetchEAs();
  }, []);

  // Filter and sort EAs
  useEffect(() => {
    let filtered = eas;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ea =>
        ea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ea.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(ea => ea.category === activeCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.price_monthly || 0) - (b.price_monthly || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.price_monthly || 0) - (a.price_monthly || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'win_rate':
        filtered.sort((a, b) => (b.win_rate || 0) - (a.win_rate || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredEAs(filtered);
  }, [eas, searchTerm, activeCategory, sortBy]);

  const fetchEAs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/eas');
      setEAs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching EAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (ea) => {
    setSelectedEA(ea);
    setShowPaymentModal(true);
    setEmail('');
  };

  const handleProceedToPayment = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    if (!selectedEA) return;

    try {
      setProcessingPayment(true);

      // Initialize Paystack payment
      const response = await apiClient.post('/api/payments/paystack/initialize', {
        eaId: selectedEA.id,
        subscriptionType: subscriptionType,
        email: email
      });

      if (response.data.data && response.data.data.authorization_url) {
        // Redirect to Paystack
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

  const categories = [
    { id: 'all', label: 'All EAs' },
    { id: 'trend', label: 'Trend Following' },
    { id: 'scalping', label: 'Scalping' },
    { id: 'breakout', label: 'Breakout' },
    { id: 'mean_reversion', label: 'Mean Reversion' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Expert Advisors Marketplace</h1>
          </div>
          <p className="text-lg text-indigo-100 max-w-2xl">
            Marketplace
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search Expert Advisors..."
                leftIcon={<Search className="h-5 w-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="win_rate">Best Win Rate</option>
            </select>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* EAs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <Zap className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Expert Advisors...</p>
          </div>
        ) : filteredEAs.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No Expert Advisors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEAs.map((ea, index) => (
              <motion.div
                key={ea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full flex flex-col bg-white dark:bg-gray-800">
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
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
                      <Bot className="h-16 w-16 text-white opacity-50" />
                    )}
                  </div>

                  <Card.Body className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {ea.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {ea.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 py-4 border-y border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {ea.average_rating || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {ea.win_rate || 'N/A'}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {ea.max_drawdown || 'N/A'}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Max DD</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BarChart3 className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {ea.monthly_return || 'N/A'}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly</p>
                      </div>
                    </div>

                    {/* Price and Button */}
                    <div className="mt-auto space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${ea.price_monthly || 0}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => handleBuyNow(ea)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>

                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => navigate(`/ea-marketplace/${ea.id}`)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedEA && (
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
              {selectedEA.name}
            </p>

            {/* Amount */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                ${(subscriptionType === 'weekly' ? selectedEA.price_weekly : subscriptionType === 'monthly' ? selectedEA.price_monthly : subscriptionType === 'quarterly' ? selectedEA.price_quarterly : selectedEA.price_yearly) || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)} subscription
              </p>
            </div>

            {/* Subscription Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subscription Period
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'weekly', label: 'Weekly', price: selectedEA.price_weekly },
                  { type: 'monthly', label: 'Monthly', price: selectedEA.price_monthly },
                  { type: 'quarterly', label: 'Quarterly', price: selectedEA.price_quarterly },
                  { type: 'yearly', label: 'Yearly', price: selectedEA.price_yearly }
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setSubscriptionType(option.type)}
                    className={`px-4 py-2 rounded-lg border-2 transition ${
                      subscriptionType === option.type
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-600'
                    }`}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs">${option.price || 0}</div>
                  </button>
                ))}
              </div>
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

export default PublicEAMarketplace;
