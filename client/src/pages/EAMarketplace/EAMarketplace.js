import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Star, 
  Search, 
  Filter,
  Settings,
  Eye,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import EscrowIntegration from '../../components/EscrowIntegration';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../lib/apiClient';

const EAMarketplace = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [eas, setEas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEA, setSelectedEA] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [subscribing, setSubscribing] = useState(false);
  const [useEscrow, setUseEscrow] = useState(true);
  const [escrowTransaction, setEscrowTransaction] = useState(null);

  // Fetch EAs from Supabase
  useEffect(() => {
    const fetchEAs = async () => {
      try {
        setLoading(true);
        const params = {
          limit: 24
        };
        if (activeCategory !== 'all') {
          params.category = activeCategory;
        }
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        const response = await apiClient.get('/api/eas', { params });
        setEas(response.data?.data || mockEAs);
      } catch (error) {
        console.error('Error fetching EAs:', error);
        // Fallback to mock data if API fails
        setEas(mockEAs);
      } finally {
        setLoading(false);
      }
    };

    fetchEAs();
  }, [activeCategory, searchTerm]);

  const handleSubscribe = (ea) => {
    setSelectedEA(ea);
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionSubmit = async () => {
    if (!selectedEA) return;
    
    try {
      setSubscribing(true);
      // For now, simulate successful subscription
      // TODO: Connect to real API when authentication is working
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Subscription created successfully!');
      setShowSubscriptionModal(false);
      setSelectedEA(null);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  // Mock EA data (fallback)
  const mockEAs = [
    {
      id: 1,
      name: 'Gold Scalper Pro v2.0',
      description: 'Institutional-grade Expert Advisor for XAUUSD trading with 89.84% win rate and 0.19% max drawdown',
      category: 'scalping',
      creator: 'Smart Algos',
      rating: 4.9,
      reviews: 324,
      price: 299,
      currency: 'USD',
      period: 'monthly',
      winRate: 89.84,
      totalTrades: 256,
      profitFactor: 1.42,
      maxDrawdown: 0.19,
      monthlyReturn: 1.96,
      isLive: true,
      isFeatured: true,
      status: 'working',
      tags: ['Gold', 'XAUUSD', 'Institutional', 'High Win Rate', 'Low Drawdown'],
      image: '/api/placeholder/300/200',
      documentation: 'GoldScalperPro_Documentation.md',
      verified: true,
      performance: {
        totalProfit: 196.44,
        sharpeRatio: 2.34,
        recoveryFactor: 1.00,
        averageTradeDuration: 45,
        longestWinStreak: 47,
        longestLossStreak: 3
      }
    },
    {
      id: 2,
      name: 'Multi Indicator EA',
      description: 'Multi-indicator EA that opens positions based on signal alerts from multiple technical indicators',
      category: 'multi-indicator',
      creator: 'SignalMaster',
      rating: 4.7,
      reviews: 89,
      price: 79,
      currency: 'USD',
      period: 'monthly',
      winRate: 72,
      totalTrades: 567,
      profitFactor: 1.68,
      maxDrawdown: 10.5,
      monthlyReturn: 9.8,
      isLive: true,
      isFeatured: true,
      status: 'working',
      tags: ['Multi-Indicator', 'Signal Alerts', 'Technical Analysis'],
      image: '/api/placeholder/300/200',
    },
    {
      id: 3,
      name: 'Trend Master EA',
      description: 'Professional trend following EA with advanced risk management',
      category: 'trend',
      creator: 'EATrader',
      rating: 4.6,
      reviews: 89,
      price: 49,
      currency: 'USD',
      period: 'monthly',
      winRate: 65,
      totalTrades: 567,
      profitFactor: 1.72,
      maxDrawdown: 12.1,
      monthlyReturn: 8.2,
      isLive: false,
      isFeatured: false,
      status: 'upcoming',
      tags: ['Trend', 'Multi-Pair', 'Risk Management'],
      image: '/api/placeholder/300/200',
    },
    {
      id: 4,
      name: 'News Trader Bot',
      description: 'Event-driven EA that trades on news releases and economic events',
      category: 'news',
      creator: 'NewsTrader',
      rating: 4.9,
      reviews: 234,
      price: 79,
      currency: 'USD',
      period: 'monthly',
      winRate: 83,
      totalTrades: 89,
      profitFactor: 2.15,
      maxDrawdown: 5.8,
      monthlyReturn: 15.8,
      isLive: false,
      isFeatured: false,
      status: 'upcoming',
      tags: ['News', 'Events', 'High Profit'],
      image: '/api/placeholder/300/200',
    },
    {
      id: 5,
      name: 'Arbitrage Hunter',
      description: 'Multi-broker arbitrage EA for risk-free profit opportunities',
      category: 'arbitrage',
      creator: 'ArbTrader',
      rating: 4.7,
      reviews: 123,
      price: 99,
      currency: 'USD',
      period: 'monthly',
      winRate: 95,
      totalTrades: 234,
      profitFactor: 3.25,
      maxDrawdown: 2.1,
      monthlyReturn: 4.2,
      isLive: false,
      isFeatured: false,
      status: 'upcoming',
      tags: ['Arbitrage', 'Risk-Free', 'Multi-Broker'],
      image: '/api/placeholder/300/200',
    },
    {
      id: 6,
      name: 'Hedging Master',
      description: 'Advanced hedging EA for portfolio protection and profit optimization',
      category: 'hedging',
      creator: 'HedgePro',
      rating: 4.5,
      reviews: 78,
      price: 59,
      currency: 'USD',
      period: 'monthly',
      winRate: 68,
      totalTrades: 445,
      profitFactor: 1.45,
      maxDrawdown: 6.7,
      monthlyReturn: 7.8,
      isLive: false,
      isFeatured: false,
      status: 'upcoming',
      tags: ['Hedging', 'Protection', 'Portfolio'],
      image: '/api/placeholder/300/200',
    },
  ];

  const categories = [
    { id: 'all', name: 'All EAs', count: eas.length },
    { id: 'scalping', name: 'Scalping', count: eas.filter(ea => ea.category === 'scalping').length },
    { id: 'trend', name: 'Trend', count: eas.filter(ea => ea.category === 'trend').length },
    { id: 'news', name: 'News', count: eas.filter(ea => ea.category === 'news').length },
    { id: 'grid', name: 'Grid', count: eas.filter(ea => ea.category === 'grid').length },
    { id: 'arbitrage', name: 'Arbitrage', count: eas.filter(ea => ea.category === 'arbitrage').length },
    { id: 'hedging', name: 'Hedging', count: eas.filter(ea => ea.category === 'hedging').length },
  ];

  const filteredEAs = eas.filter(ea => {
    const matchesCategory = activeCategory === 'all' || ea.category === activeCategory;
    const matchesSearch = ea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ea.tags && ea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category) => {
    const colors = {
      scalping: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      trend: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      news: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      grid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      arbitrage: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      hedging: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              EA Marketplace
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Discover and rent professional Expert Advisors
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              My EAs
            </Button>
            <Button 
              variant="primary"
              onClick={() => navigate('/create-ea')}
            >
              <Bot className="h-4 w-4 mr-2" />
              Create EA
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search EAs..."
                  leftIcon={<Search className="h-4 w-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
                  Filters
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Featured EAs */}
      {activeCategory === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Featured EAs
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eas.filter(ea => ea.isFeatured).map((ea, index) => (
              <motion.div
                key={ea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-600 rounded-t-lg flex items-center justify-center">
                      <Bot className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ea.category)}`}>
                        {ea.category}
                      </span>
                    </div>
                  </div>
                  
                  <Card.Body>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {ea.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {ea.creator}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {ea.rating}
                        </span>
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          ({ea.reviews})
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {ea.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {ea.winRate}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Return</p>
                        <p className="text-sm font-semibold text-success-600 dark:text-success-400">
                          +{ea.monthlyReturn}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${ea.price}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          /{ea.period}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {ea.isLive ? (
                          <div className="flex items-center text-success-600 dark:text-success-400">
                            <div className="w-2 h-2 bg-success-500 rounded-full mr-1"></div>
                            <span className="text-xs">Live</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                            <span className="text-xs">Offline</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="primary" 
                        fullWidth
                        onClick={() => handleSubscribe(ea)}
                      >
                        Subscribe
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/ea-marketplace/${ea.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {ea.documentation && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/src/pages/EAMarketplace/${ea.documentation}`, '_blank')}
                          title="View Documentation"
                        >
                          📄
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All EAs Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {activeCategory === 'all' ? 'All EAs' : categories.find(c => c.id === activeCategory)?.name}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEAs.map((ea, index) => (
            <motion.div
              key={ea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card hover className="h-full">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-600 rounded-t-lg flex items-center justify-center">
                    <Bot className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ea.category)}`}>
                      {ea.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ea.status === 'working' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {ea.status === 'working' ? 'Working' : 'Upcoming'}
                    </span>
                    {ea.verified && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                
                <Card.Body>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {ea.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {ea.creator}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {ea.rating}
                      </span>
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                        ({ea.reviews})
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {ea.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {ea.winRate}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Return</p>
                      <p className="text-sm font-semibold text-success-600 dark:text-success-400">
                        +{ea.monthlyReturn}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${ea.price}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        /{ea.period}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {ea.isLive ? (
                        <div className="flex items-center text-success-600 dark:text-success-400">
                          <div className="w-2 h-2 bg-success-500 rounded-full mr-1"></div>
                          <span className="text-xs">Live</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                          <span className="text-xs">Offline</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="primary" 
                      fullWidth
                      onClick={() => handleSubscribe(ea)}
                    >
                      Subscribe
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/ea-marketplace/${ea.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* No Results */}
      {filteredEAs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No EAs found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedEA && (
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
            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Subscribe to {selectedEA.name}
              </h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* EA Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Bot className="h-8 w-8 text-primary-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedEA.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by {selectedEA.creator || selectedEA.creatorName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subscription Period
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['weekly', 'monthly', 'quarterly', 'yearly'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSubscriptionType(type)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        subscriptionType === type
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="capitalize">{type}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${selectedEA.pricing?.[type] || selectedEA.price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'card', name: 'Credit Card', icon: CreditCard },
                    { id: 'bank_transfer', name: 'Bank Transfer', icon: CreditCard },
                    { id: 'mobile_money', name: 'Mobile Money', icon: CreditCard },
                    { id: 'crypto', name: 'Cryptocurrency', icon: Shield }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-3 rounded-lg border flex items-center space-x-3 transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <method.icon className="h-5 w-5" />
                      <span>{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Escrow Protection Toggle */}
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Escrow Protection
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useEscrow}
                      onChange={(e) => setUseEscrow(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {useEscrow 
                    ? "Your payment is held in escrow until you confirm the EA is working as expected."
                    : "Direct payment - no escrow protection. Payment goes directly to the seller."
                  }
                </p>
              </div>

              {/* Escrow Integration */}
              {useEscrow && selectedEA && (
                <EscrowIntegration
                  productType="ea_subscription"
                  productId={selectedEA.id}
                  productName={selectedEA.name}
                  productPrice={selectedEA.pricing?.[subscriptionType] || selectedEA.price}
                  sellerEmail={selectedEA.creator || selectedEA.creatorName}
                  onTransactionCreated={(transaction) => {
                    setEscrowTransaction(transaction);
                    setSubscribing(false);
                  }}
                  onError={(error) => {
                    console.error('Escrow error:', error);
                    setSubscribing(false);
                  }}
                />
              )}

              {/* Total */}
              <div className="border-t dark:border-gray-600 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Product Price</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      ${selectedEA.pricing?.[subscriptionType] || selectedEA.price}
                    </span>
                  </div>
                  {useEscrow && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Escrow Fee</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        ${((selectedEA.pricing?.[subscriptionType] || selectedEA.price) * 0.0089).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t dark:border-gray-600 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ${useEscrow 
                          ? ((selectedEA.pricing?.[subscriptionType] || selectedEA.price) * 1.0089).toFixed(2)
                          : selectedEA.pricing?.[subscriptionType] || selectedEA.price
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    setEscrowTransaction(null);
                    setUseEscrow(true);
                  }}
                >
                  Cancel
                </Button>
                {useEscrow && escrowTransaction ? (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => window.open(`/api/escrow/transactions/${escrowTransaction.id}`, '_blank')}
                  >
                    View Escrow Transaction
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={useEscrow ? () => {} : handleSubscriptionSubmit}
                    disabled={subscribing || (useEscrow && !escrowTransaction)}
                  >
                    {subscribing ? 'Processing...' : useEscrow ? 'Create Escrow Transaction' : 'Subscribe Now'}
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

export default EAMarketplace;
