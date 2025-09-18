import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  Play,
  Pause,
  Settings,
  Download,
  Eye,
  Clock,
  Shield,
  Activity,
  Bot,
  Star,
  CreditCard,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  DollarSign,
  BarChart3,
  Target,
  Gauge
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import EscrowIntegration from '../../components/EscrowIntegration';
// import { useAuth } from '../../contexts/AuthContext';
// import axios from 'axios';

const HFTBots = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const user = null; // Temporary fallback
  const [activeStrategy, setActiveStrategy] = useState('all');
  const [activeExchange, setActiveExchange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState(null);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [rentalType, setRentalType] = useState('professional');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [renting, setRenting] = useState(false);
  const [useEscrow, setUseEscrow] = useState(true);
  const [escrowTransaction, setEscrowTransaction] = useState(null);

  // Use mock data for now
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setBots(mockBots);
      setLoading(false);
    }, 500);
  }, [activeStrategy, activeExchange, searchTerm]);

  const handleRent = (bot) => {
    setSelectedBot(bot);
    setShowRentalModal(true);
  };

  const handleRentalSubmit = async () => {
    if (!selectedBot) return;
    
    try {
      setRenting(true);
      // Simulate rental process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Bot rental initiated successfully!');
      setShowRentalModal(false);
      setSelectedBot(null);
    } catch (error) {
      console.error('Rental error:', error);
      alert('Failed to initiate bot rental. Please try again.');
    } finally {
      setRenting(false);
    }
  };

  // Mock HFT Bot data (fallback)
  const mockBots = [
    {
      id: 1,
      name: 'HFT Scalping Bot',
      description: 'Ultra-fast scalping bot with microsecond execution for high-frequency trading',
      strategy: 'scalping',
      exchange: 'binance',
      creator: 'HFTMaster',
      rating: 4.9,
      reviews: 89,
      pricing: {
        basic: 299,
        professional: 699,
        enterprise: 1499
      },
      currency: 'USD',
      winRate: 95,
      totalTrades: 15420,
      profitFactor: 2.85,
      maxDrawdown: 2.1,
      monthlyReturn: 18.5,
      isLive: true,
      isFeatured: true,
      status: 'working',
      latency: 5,
      markets: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
      systemRequirements: {
        minimumRAM: 8,
        recommendedRAM: 16,
        networkLatency: 10,
        vpsRequired: true
      }
    },
    {
      id: 2,
      name: 'Market Maker Elite',
      description: 'Professional market making bot with advanced risk management',
      strategy: 'market-making',
      exchange: 'binance',
      creator: 'HFTMaster',
      rating: 4.7,
      reviews: 156,
      pricing: {
        basic: 299,
        professional: 699,
        enterprise: 1499
      },
      currency: 'USD',
      winRate: 78,
      totalTrades: 8920,
      profitFactor: 1.95,
      maxDrawdown: 8.5,
      monthlyReturn: 12.3,
      isLive: false,
      isFeatured: false,
      status: 'incoming',
      latency: 8,
      markets: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
      systemRequirements: {
        minimumRAM: 16,
        recommendedRAM: 32,
        networkLatency: 5,
        vpsRequired: true
      }
    },
    {
      id: 3,
      name: 'Momentum Hunter',
      description: 'High-speed momentum trading bot for volatile markets',
      strategy: 'momentum',
      exchange: 'binance',
      creator: 'SpeedTrader',
      rating: 4.6,
      reviews: 67,
      pricing: {
        basic: 149,
        professional: 399,
        enterprise: 799
      },
      currency: 'USD',
      winRate: 72,
      totalTrades: 5670,
      profitFactor: 1.68,
      maxDrawdown: 12.3,
      monthlyReturn: 15.7,
      isLive: false,
      isFeatured: false,
      status: 'incoming',
      latency: 3,
      markets: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
      systemRequirements: {
        minimumRAM: 8,
        recommendedRAM: 16,
        networkLatency: 15,
        vpsRequired: true
      }
    },
    {
      id: 4,
      name: 'Grid Trading Master',
      description: 'Sophisticated grid trading bot with dynamic grid spacing',
      strategy: 'grid-trading',
      exchange: 'binance',
      creator: 'GridPro',
      rating: 4.4,
      reviews: 123,
      pricing: {
        basic: 99,
        professional: 249,
        enterprise: 499
      },
      currency: 'USD',
      winRate: 85,
      totalTrades: 12340,
      profitFactor: 1.45,
      maxDrawdown: 6.8,
      monthlyReturn: 8.9,
      isLive: false,
      isFeatured: false,
      status: 'incoming',
      latency: 12,
      markets: ['BTCUSDT', 'ETHUSDT', 'DOTUSDT'],
      systemRequirements: {
        minimumRAM: 4,
        recommendedRAM: 8,
        networkLatency: 50,
        vpsRequired: false
      }
    },
    {
      id: 5,
      name: 'Liquidation Hunter',
      description: 'Specialized bot for hunting liquidation opportunities',
      strategy: 'liquidation-hunter',
      exchange: 'binance',
      creator: 'LiquidHunter',
      rating: 4.8,
      reviews: 45,
      pricing: {
        basic: 399,
        professional: 899,
        enterprise: 1999
      },
      currency: 'USD',
      winRate: 88,
      totalTrades: 2340,
      profitFactor: 3.25,
      maxDrawdown: 4.2,
      monthlyReturn: 22.1,
      isLive: false,
      isFeatured: false,
      status: 'incoming',
      latency: 2,
      markets: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
      systemRequirements: {
        minimumRAM: 16,
        recommendedRAM: 32,
        networkLatency: 5,
        vpsRequired: true
      }
    },
    {
      id: 6,
      name: 'Statistical Arbitrage Bot',
      description: 'Advanced statistical arbitrage with machine learning',
      strategy: 'statistical-arbitrage',
      exchange: 'binance',
      creator: 'StatArb',
      rating: 4.5,
      reviews: 78,
      pricing: {
        basic: 249,
        professional: 599,
        enterprise: 1299
      },
      currency: 'USD',
      winRate: 82,
      totalTrades: 6780,
      profitFactor: 2.15,
      maxDrawdown: 7.5,
      monthlyReturn: 14.2,
      isLive: true,
      isFeatured: false,
      latency: 6,
      markets: ['BTCUSDT', 'ETHUSDT', 'LINKUSDT'],
      systemRequirements: {
        minimumRAM: 12,
        recommendedRAM: 24,
        networkLatency: 20,
        vpsRequired: true
      }
    }
  ];

  const strategies = [
    { id: 'all', name: 'All Strategies', count: bots.length },
    { id: 'arbitrage', name: 'Arbitrage', count: bots.filter(bot => bot.strategy === 'arbitrage').length },
    { id: 'market-making', name: 'Market Making', count: bots.filter(bot => bot.strategy === 'market-making').length },
    { id: 'momentum', name: 'Momentum', count: bots.filter(bot => bot.strategy === 'momentum').length },
    { id: 'grid-trading', name: 'Grid Trading', count: bots.filter(bot => bot.strategy === 'grid-trading').length },
    { id: 'liquidation-hunter', name: 'Liquidation Hunter', count: bots.filter(bot => bot.strategy === 'liquidation-hunter').length },
    { id: 'statistical-arbitrage', name: 'Statistical Arbitrage', count: bots.filter(bot => bot.strategy === 'statistical-arbitrage').length }
  ];

  const exchanges = [
    { id: 'all', name: 'All Exchanges', count: bots.length },
    { id: 'binance', name: 'Binance', count: bots.filter(bot => bot.exchange === 'binance').length },
    { id: 'coinbase', name: 'Coinbase', count: bots.filter(bot => bot.exchange === 'coinbase').length },
    { id: 'kraken', name: 'Kraken', count: bots.filter(bot => bot.exchange === 'kraken').length }
  ];

  const filteredBots = bots.filter(bot => {
    const matchesStrategy = activeStrategy === 'all' || bot.strategy === activeStrategy;
    const matchesExchange = activeExchange === 'all' || bot.exchange === activeExchange;
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStrategy && matchesExchange && matchesSearch;
  });

  const getStrategyColor = (strategy) => {
    const colors = {
      arbitrage: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'market-making': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      momentum: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'grid-trading': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'liquidation-hunter': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'statistical-arbitrage': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };
    return colors[strategy] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getExchangeIcon = (exchange) => {
    const icons = {
      binance: '🟡',
      coinbase: '🔵',
      kraken: '🟣',
      bitfinex: '🟠',
      huobi: '🔴',
      okx: '⚫',
      bybit: '🟢'
    };
    return icons[exchange] || '🤖';
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
              HFT Bots
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              High-frequency trading bots for cryptocurrency markets
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              My Bots
            </Button>
            <Button variant="primary">
              <Bot className="h-4 w-4 mr-2" />
              Create Bot
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
                  placeholder="Search HFT bots..."
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

      {/* Strategy Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-wrap gap-2">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setActiveStrategy(strategy.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStrategy === strategy.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {strategy.name}
                  <span className="ml-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {strategy.count}
                  </span>
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Exchange Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-wrap gap-2">
              {exchanges.map((exchange) => (
                <button
                  key={exchange.id}
                  onClick={() => setActiveExchange(exchange.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeExchange === exchange.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-2">{getExchangeIcon(exchange.id)}</span>
                  {exchange.name}
                  <span className="ml-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {exchange.count}
                  </span>
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Featured Bots */}
      {activeStrategy === 'all' && activeExchange === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Featured HFT Bots
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bots.filter(bot => bot.isFeatured).map((bot, index) => (
              <motion.div
                key={bot.id}
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrategyColor(bot.strategy)}`}>
                        {bot.strategy.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {getExchangeIcon(bot.exchange)} {bot.exchange}
                      </span>
                    </div>
                  </div>
                  
                  <Card.Body>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {bot.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {bot.creator}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {bot.rating}
                        </span>
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          ({bot.reviews})
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {bot.description}
                    </p>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {bot.winRate}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Return</p>
                        <p className="text-sm font-semibold text-success-600 dark:text-success-400">
                          +{bot.monthlyReturn}%
                        </p>
                      </div>
                    </div>

                    {/* System Requirements */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Cpu className="h-3 w-3 mr-1" />
                          {bot.systemRequirements.minimumRAM}GB RAM
                        </div>
                        <div className="flex items-center">
                          <Wifi className="h-3 w-3 mr-1" />
                          {bot.latency}ms
                        </div>
                        <div className="flex items-center">
                          <Server className="h-3 w-3 mr-1" />
                          {bot.systemRequirements.vpsRequired ? 'VPS' : 'Local'}
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${bot.pricing.professional}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          /month
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {bot.isLive ? (
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
                        onClick={() => handleRent(bot)}
                      >
                        Rent Bot
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/hft-bots/${bot.id}`)}
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
      )}

      {/* All Bots Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {activeStrategy === 'all' && activeExchange === 'all' ? 'All HFT Bots' : 'Filtered Results'}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBots.map((bot, index) => (
            <motion.div
              key={bot.id}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrategyColor(bot.strategy)}`}>
                      {bot.strategy.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bot.status === 'working' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }`}>
                      {bot.status === 'working' ? 'Working' : 'Incoming'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {getExchangeIcon(bot.exchange)} {bot.exchange}
                    </span>
                  </div>
                </div>
                
                <Card.Body>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {bot.creator}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {bot.rating}
                      </span>
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                        ({bot.reviews})
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {bot.description}
                  </p>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {bot.winRate}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Return</p>
                      <p className="text-sm font-semibold text-success-600 dark:text-success-400">
                        +{bot.monthlyReturn}%
                      </p>
                    </div>
                  </div>

                  {/* System Requirements */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Cpu className="h-3 w-3 mr-1" />
                        {bot.systemRequirements.minimumRAM}GB RAM
                      </div>
                      <div className="flex items-center">
                        <Wifi className="h-3 w-3 mr-1" />
                        {bot.latency}ms
                      </div>
                      <div className="flex items-center">
                        <Server className="h-3 w-3 mr-1" />
                        {bot.systemRequirements.vpsRequired ? 'VPS' : 'Local'}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${bot.pricing.professional}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        /month
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {bot.isLive ? (
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
                      onClick={() => handleRent(bot)}
                    >
                      Rent Bot
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/hft-bots/${bot.id}`)}
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
      {filteredBots.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No HFT bots found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}

      {/* Rental Modal */}
      {showRentalModal && selectedBot && (
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
                Rent {selectedBot.name}
              </h3>
              <button
                onClick={() => setShowRentalModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Bot Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Bot className="h-8 w-8 text-primary-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedBot.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedBot.strategy.replace('-', ' ')} • {selectedBot.exchange}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rental Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rental Plan
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'basic', name: 'Basic', price: selectedBot.pricing.basic, features: ['Basic support', 'Standard latency', 'Limited markets'] },
                    { id: 'professional', name: 'Professional', price: selectedBot.pricing.professional, features: ['Priority support', 'Low latency', 'All markets', 'Advanced analytics'] },
                    { id: 'enterprise', name: 'Enterprise', price: selectedBot.pricing.enterprise, features: ['24/7 support', 'Ultra-low latency', 'Custom markets', 'Dedicated VPS', 'API access'] }
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setRentalType(plan.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        rentalType === plan.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {plan.features.join(' • ')}
                          </div>
                        </div>
                        <div className="text-lg font-bold">${plan.price}</div>
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
                    { id: 'crypto', name: 'Cryptocurrency', icon: Shield },
                    { id: 'bank_transfer', name: 'Bank Transfer', icon: CreditCard }
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

              {/* System Requirements */}
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    System Requirements
                  </span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <div>• {selectedBot.systemRequirements.minimumRAM}GB RAM minimum</div>
                  <div>• {selectedBot.latency}ms latency</div>
                  <div>• {selectedBot.systemRequirements.vpsRequired ? 'VPS recommended' : 'Local deployment OK'}</div>
                </div>
              </div>

              {/* Escrow Protection Toggle */}
              <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {useEscrow 
                    ? "Your payment is held in escrow until you confirm the HFT bot is working as expected."
                    : "Direct payment - no escrow protection. Payment goes directly to the provider."
                  }
                </p>
              </div>

              {/* Escrow Integration */}
              {useEscrow && selectedBot && (
                <EscrowIntegration
                  productType="hft_rental"
                  productId={selectedBot.id}
                  productName={`${selectedBot.name} - ${rentalType.charAt(0).toUpperCase() + rentalType.slice(1)} Plan`}
                  productPrice={selectedBot.pricing[rentalType]}
                  sellerEmail="hft-provider@smartalgos.com"
                  onTransactionCreated={(transaction) => {
                    setEscrowTransaction(transaction);
                    setRenting(false);
                  }}
                  onError={(error) => {
                    console.error('Escrow error:', error);
                    setRenting(false);
                  }}
                />
              )}

              {/* Total */}
              <div className="border-t dark:border-gray-600 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Bot Rental</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      ${selectedBot.pricing[rentalType]}
                    </span>
                  </div>
                  {useEscrow && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Escrow Fee</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        ${(selectedBot.pricing[rentalType] * 0.0089).toFixed(2)}
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
                          ? (selectedBot.pricing[rentalType] * 1.0089).toFixed(2)
                          : selectedBot.pricing[rentalType]
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowRentalModal(false);
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
                    onClick={useEscrow ? () => {} : handleRentalSubmit}
                    disabled={renting || (useEscrow && !escrowTransaction)}
                  >
                    {renting ? 'Processing...' : useEscrow ? 'Create Escrow Transaction' : 'Rent Now'}
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

export default HFTBots;