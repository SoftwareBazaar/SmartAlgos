import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Star,
  Clock,
  Target,
  Shield
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const Signals = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock signal services data
  const signalServices = [
    {
      id: 1,
      name: "Premium Forex Signals Pro",
      description: "Professional forex trading signals with 85%+ accuracy rate",
      category: "Forex",
      accuracy_rate: 87.3,
      total_signals: 1247,
      profitable_signals: 1089,
      average_pips: 45.2,
      price_monthly: 49.99,
      price_yearly: 499.99,
      currency: "USD",
      is_featured: true,
      creator_name: "ForexMaster Pro",
      total_subscribers: 2341,
      active_subscribers: 1876,
      average_rating: 4.8,
      total_reviews: 234,
      views: 45620,
      signal_frequency: "3-5 signals per day",
      response_time: "< 30 seconds",
      delivery_methods: ["Telegram", "WhatsApp", "Email", "SMS"],
      markets: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD"],
      timeframes: ["M15", "M30", "H1", "H4", "D1"],
      risk_level: "Medium",
      max_drawdown: 8.7,
      sharpe_ratio: 2.1
    },
    {
      id: 2,
      name: "Crypto Signals Elite",
      description: "High-frequency cryptocurrency trading signals with advanced AI analysis",
      category: "Crypto",
      accuracy_rate: 82.1,
      total_signals: 892,
      profitable_signals: 732,
      average_pips: 38.7,
      price_monthly: 79.99,
      price_yearly: 799.99,
      currency: "USD",
      is_featured: true,
      creator_name: "CryptoMaster",
      total_subscribers: 1567,
      active_subscribers: 1234,
      average_rating: 4.6,
      total_reviews: 189,
      views: 32150,
      signal_frequency: "5-8 signals per day",
      response_time: "< 15 seconds",
      delivery_methods: ["Telegram", "Discord", "Email", "Push Notification"],
      markets: ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"],
      timeframes: ["M5", "M15", "M30", "H1"],
      risk_level: "High",
      max_drawdown: 12.3,
      sharpe_ratio: 1.8
    },
    {
      id: 3,
      name: "Stock Market Signals",
      description: "Professional stock trading signals with fundamental and technical analysis",
      category: "Stocks",
      accuracy_rate: 79.5,
      total_signals: 567,
      profitable_signals: 451,
      average_pips: 52.3,
      price_monthly: 99.99,
      price_yearly: 999.99,
      currency: "USD",
      is_featured: false,
      creator_name: "StockTrader Pro",
      total_subscribers: 892,
      active_subscribers: 678,
      average_rating: 4.4,
      total_reviews: 134,
      views: 28940,
      signal_frequency: "2-4 signals per day",
      response_time: "< 45 seconds",
      delivery_methods: ["Email", "SMS", "Push Notification"],
      markets: ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"],
      timeframes: ["H1", "H4", "D1", "W1"],
      risk_level: "Medium",
      max_drawdown: 10.2,
      sharpe_ratio: 1.9
    }
  ];

  // Mock individual signals data
  const signals = [
    {
      id: 1,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      signal: 'BUY',
      confidence: 85,
      currentPrice: 175.50,
      targetPrice: 185.00,
      stopLoss: 170.00,
      timeframe: '1D',
      assetType: 'stock',
      market: 'US',
      createdAt: '2 minutes ago',
      validUntil: '24 hours',
      riskLevel: 'medium',
      category: 'swing',
      aiScore: 78,
      technicalScore: 82,
      fundamentalScore: 75,
    },
    {
      id: 2,
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      signal: 'SELL',
      confidence: 72,
      currentPrice: 245.80,
      targetPrice: 235.00,
      stopLoss: 255.00,
      timeframe: '4H',
      assetType: 'stock',
      market: 'US',
      createdAt: '15 minutes ago',
      validUntil: '12 hours',
      riskLevel: 'high',
      category: 'day-trading',
      aiScore: 68,
      technicalScore: 75,
      fundamentalScore: 65,
    },
    {
      id: 3,
      symbol: 'EUR/USD',
      name: 'Euro/US Dollar',
      signal: 'BUY',
      confidence: 91,
      currentPrice: 1.0850,
      targetPrice: 1.0920,
      stopLoss: 1.0800,
      timeframe: '1H',
      assetType: 'forex',
      market: 'Forex',
      createdAt: '32 minutes ago',
      validUntil: '8 hours',
      riskLevel: 'low',
      category: 'scalping',
      aiScore: 88,
      technicalScore: 85,
      fundamentalScore: 92,
    },
    {
      id: 4,
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      signal: 'HOLD',
      confidence: 58,
      currentPrice: 52450.00,
      targetPrice: 54000.00,
      stopLoss: 50000.00,
      timeframe: '1D',
      assetType: 'crypto',
      market: 'Crypto',
      createdAt: '1 hour ago',
      validUntil: '48 hours',
      riskLevel: 'high',
      category: 'position',
      aiScore: 55,
      technicalScore: 60,
      fundamentalScore: 58,
    },
    {
      id: 5,
      symbol: 'GOLD',
      name: 'Gold',
      signal: 'BUY',
      confidence: 76,
      currentPrice: 1950.50,
      targetPrice: 1980.00,
      stopLoss: 1920.00,
      timeframe: '4H',
      assetType: 'commodity',
      market: 'Commodities',
      createdAt: '2 hours ago',
      validUntil: '24 hours',
      riskLevel: 'medium',
      category: 'swing',
      aiScore: 72,
      technicalScore: 78,
      fundamentalScore: 74,
    },
  ];

  const filters = [
    { id: 'all', name: 'All Signals', count: signals.length },
    { id: 'buy', name: 'Buy Signals', count: signals.filter(s => s.signal === 'BUY').length },
    { id: 'sell', name: 'Sell Signals', count: signals.filter(s => s.signal === 'SELL').length },
    { id: 'hold', name: 'Hold Signals', count: signals.filter(s => s.signal === 'HOLD').length },
    { id: 'high-confidence', name: 'High Confidence', count: signals.filter(s => s.confidence >= 80).length },
  ];

  const filteredSignals = signals.filter(signal => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'buy' && signal.signal === 'BUY') ||
      (activeFilter === 'sell' && signal.signal === 'SELL') ||
      (activeFilter === 'hold' && signal.signal === 'HOLD') ||
      (activeFilter === 'high-confidence' && signal.confidence >= 80);
    
    const matchesSearch = signal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'SELL':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      case 'HOLD':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low':
        return 'text-success-600 dark:text-success-400';
      case 'medium':
        return 'text-warning-600 dark:text-warning-400';
      case 'high':
        return 'text-danger-600 dark:text-danger-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
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
              Trading Signals
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              AI-powered trading signals with real-time analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span>Live</span>
            </div>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
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
                  placeholder="Search signals..."
                  leftIcon={<Search className="h-4 w-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
                  Advanced Filters
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.name}
                  <span className="ml-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Signal Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Signal Services
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {signalServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-600 rounded-t-lg flex items-center justify-center">
                    <Bell className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute top-4 right-4">
                    {service.is_featured && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-white bg-opacity-90 text-gray-800 text-xs font-medium rounded-full">
                      {service.category}
                    </span>
                  </div>
                </div>
                
                <Card.Body>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {service.creator_name}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {service.average_rating}
                      </span>
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                        ({service.total_reviews})
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
                      <p className="text-sm font-semibold text-green-600">
                        {service.accuracy_rate}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg Pips</p>
                      <p className="text-sm font-semibold text-primary-600">
                        {service.average_pips}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${service.price_monthly}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        /month
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {service.active_subscribers.toLocaleString()} subscribers
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="primary" 
                      fullWidth
                      onClick={() => navigate(`/signals/${service.id}`)}
                    >
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Live Signals Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Live Trading Signals
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredSignals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card hover className="h-full">
              <Card.Body>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {signal.symbol.split('/')[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {signal.symbol}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {signal.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSignalColor(signal.signal)}`}>
                      {signal.signal}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {signal.confidence}% confidence
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Current Price</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${signal.currentPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Target Price</span>
                    <span className="text-sm font-medium text-success-600 dark:text-success-400">
                      ${signal.targetPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Stop Loss</span>
                    <span className="text-sm font-medium text-danger-600 dark:text-danger-400">
                      ${signal.stopLoss.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Risk Level</span>
                    <span className={`text-sm font-medium ${getRiskColor(signal.riskLevel)}`}>
                      {signal.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Timeframe</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {signal.timeframe}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Valid Until</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {signal.validUntil}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>AI Analysis</span>
                    <span>{signal.aiScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${signal.aiScore}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Technical: {signal.technicalScore}/100</span>
                    <span>Fundamental: {signal.fundamentalScore}/100</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button size="sm" variant="primary" fullWidth>
                    Execute Signal
                  </Button>
                  <Button size="sm" variant="outline">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {signal.createdAt}
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {signal.category}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        ))}
        </div>
      </motion.div>

      {/* No Results */}
      {filteredSignals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No signals found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Signals;
