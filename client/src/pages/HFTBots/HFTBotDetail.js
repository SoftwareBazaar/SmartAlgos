import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  Download, 
  ShoppingCart, 
  Play, 
  Pause, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  Shield,
  Users,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Monitor,
  Settings,
  Activity
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const HFTBotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  // Mock HFT Bot data - replace with actual API call
  useEffect(() => {
    const fetchBot = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setBot({
          id: id,
          name: "Lightning Speed HFT Bot",
          description: "Ultra-high frequency trading bot designed for cryptocurrency markets. Features microsecond execution times and advanced arbitrage detection algorithms.",
          version: "3.2.1",
          strategy: "Arbitrage",
          exchange: "Binance",
          strategy_type: "Market Making",
          markets: ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT"],
          timeframes: ["1s", "5s", "15s", "1m"],
          symbols: ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"],
          win_rate: 94.2,
          profit_factor: 3.8,
          max_drawdown: 5.1,
          sharpe_ratio: 2.4,
          total_trades: 45678,
          profitable_trades: 43023,
          average_trade_duration: 45,
          risk_level: "High",
          max_position_size: 10000,
          max_daily_loss: 2000,
          stop_loss_percentage: 1.5,
          take_profit_percentage: 0.8,
          configuration: {
            latency_threshold: 10,
            max_spread: 0.1,
            order_size: 100,
            max_orders_per_second: 100
          },
          api_requirements: {
            level: "VIP",
            permissions: ["spot_trading", "margin_trading", "futures_trading"],
            rate_limits: "1000 requests/second"
          },
          minimum_cpu: "Intel i7-10700K",
          recommended_cpu: "Intel i9-12900K",
          network_latency: 1,
          vps_required: true,
          operating_system: "Ubuntu 20.04 LTS",
          status: "approved",
          is_active: true,
          is_featured: true,
          creator_name: "HFT Master",
          total_subscribers: 2341,
          active_subscribers: 1876,
          average_rating: 4.8,
          total_reviews: 234,
          views: 45620,
          downloads: 1876,
          screenshots: [
            "/api/placeholder/800/400",
            "/api/placeholder/800/400",
            "/api/placeholder/800/400"
          ],
          live_results: {
            period: "2023-2024",
            total_return: 156.7,
            max_drawdown: 5.1,
            sharpe_ratio: 2.4,
            win_rate: 94.2,
            profit_factor: 3.8,
            total_trades: 45678,
            daily_return: 0.8,
            monthly_return: 12.3
          },
          backtest_results: {
            period: "2020-2024",
            total_return: 892.4,
            max_drawdown: 8.2,
            sharpe_ratio: 2.1,
            win_rate: 91.8,
            profit_factor: 3.2,
            total_trades: 156789
          },
          features: [
            "Microsecond execution times",
            "Advanced arbitrage detection",
            "Multi-exchange support",
            "Real-time market data processing",
            "Dynamic position sizing",
            "Risk management algorithms",
            "24/7 monitoring dashboard",
            "Customizable trading parameters",
            "API integration ready",
            "Backtesting capabilities"
          ],
          requirements: {
            vps: "Required - Low latency VPS",
            internet: "Fiber optic connection (1Gbps+)",
            cpu: "Minimum 8 cores, 3.0GHz+",
            ram: "Minimum 16GB DDR4",
            storage: "SSD 500GB+",
            os: "Ubuntu 20.04 LTS or Windows Server 2019",
            api_access: "Exchange API with high limits"
          },
          pricing: {
            monthly: 299.99,
            yearly: 2999.99,
            lifetime: 9999.99
          },
          created_at: "2023-03-15T10:30:00Z",
          updated_at: "2024-01-15T14:20:00Z"
        });
        setLoading(false);
      }, 1000);
    };

    fetchBot();
  }, [id]);

  const pricingPlans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: bot?.pricing?.monthly || 299.99,
      period: 'month',
      features: ['Full bot access', 'Email support', 'Updates included', 'Basic monitoring'],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: bot?.pricing?.yearly || 2999.99,
      period: 'year',
      features: ['Full bot access', 'Priority support', 'Updates included', 'Advanced monitoring', '2 months free'],
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: bot?.pricing?.lifetime || 9999.99,
      period: 'lifetime',
      features: ['Full bot access', 'VIP support', 'All updates', 'Custom modifications', 'Source code access', 'White-label license'],
      popular: false
    }
  ];

  const reviews = [
    {
      id: 1,
      user: "CryptoTrader",
      rating: 5,
      date: "2024-01-10",
      comment: "Incredible performance! Made consistent profits for 8 months. The latency is unmatched.",
      verified: true
    },
    {
      id: 2,
      user: "HFTPro",
      rating: 4,
      date: "2024-01-08",
      comment: "Great bot, but requires expensive VPS for optimal results. Support is excellent.",
      verified: true
    },
    {
      id: 3,
      user: "ArbitrageKing",
      rating: 5,
      date: "2024-01-05",
      comment: "Best HFT bot I've used. Win rate is impressive and drawdown is very controlled.",
      verified: false
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            HFT Bot Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The HFT Bot you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/hft-bots')}>
            Back to HFT Bots
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/hft-bots')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to HFT Bots
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {bot.status}
                </span>
                {bot.is_featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Featured
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {bot.strategy}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {bot.name}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {bot.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {bot.views.toLocaleString()} views
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {bot.downloads.toLocaleString()} downloads
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {bot.active_subscribers.toLocaleString()} active users
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  {bot.network_latency}ms latency
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Screenshots */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Screenshots & Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bot.screenshots.map((screenshot, index) => (
                    <div key={index} className="relative group cursor-pointer">
                      <img
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Card>
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'performance', label: 'Performance' },
                    { id: 'features', label: 'Features' },
                    { id: 'requirements', label: 'Requirements' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        selectedTab === tab.id
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {selectedTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Strategy Overview
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {bot.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Supported Markets
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {bot.markets.map((market) => (
                            <span
                              key={market}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded"
                            >
                              {market}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Timeframes
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {bot.timeframes.map((tf) => (
                            <span
                              key={tf}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded"
                            >
                              {tf}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Configuration
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Max Position Size:</span>
                          <span className="ml-2 font-medium">${bot.max_position_size.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Max Daily Loss:</span>
                          <span className="ml-2 font-medium">${bot.max_daily_loss.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Stop Loss:</span>
                          <span className="ml-2 font-medium">{bot.stop_loss_percentage}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Take Profit:</span>
                          <span className="ml-2 font-medium">{bot.take_profit_percentage}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Network Latency:</span>
                          <span className="ml-2 font-medium">{bot.network_latency}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">VPS Required:</span>
                          <span className="ml-2 font-medium">{bot.vps_required ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'performance' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Live Results ({bot.live_results.period})
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                            <span className="font-medium text-green-600">+{bot.live_results.total_return}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Daily Return:</span>
                            <span className="font-medium text-green-600">+{bot.live_results.daily_return}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Monthly Return:</span>
                            <span className="font-medium text-green-600">+{bot.live_results.monthly_return}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
                            <span className="font-medium text-red-600">-{bot.live_results.max_drawdown}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                            <span className="font-medium">{bot.live_results.sharpe_ratio}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                            <span className="font-medium">{bot.live_results.win_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Profit Factor:</span>
                            <span className="font-medium">{bot.live_results.profit_factor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Trades:</span>
                            <span className="font-medium">{bot.live_results.total_trades.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Backtest Results ({bot.backtest_results.period})
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                            <span className="font-medium text-green-600">+{bot.backtest_results.total_return}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
                            <span className="font-medium text-red-600">-{bot.backtest_results.max_drawdown}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                            <span className="font-medium">{bot.backtest_results.sharpe_ratio}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                            <span className="font-medium">{bot.backtest_results.win_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Profit Factor:</span>
                            <span className="font-medium">{bot.backtest_results.profit_factor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Trades:</span>
                            <span className="font-medium">{bot.backtest_results.total_trades.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'features' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Key Features
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {bot.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        API Requirements
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">API Level:</span>
                          <span className="ml-2 font-medium">{bot.api_requirements.level}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Rate Limits:</span>
                          <span className="ml-2 font-medium">{bot.api_requirements.rate_limits}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Permissions:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {bot.api_requirements.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'requirements' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        System Requirements
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500 dark:text-gray-400">CPU:</span>
                          <span className="ml-2 font-medium">{bot.requirements.cpu}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500 dark:text-gray-400">RAM:</span>
                          <span className="ml-2 font-medium">{bot.requirements.ram}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500 dark:text-gray-400">Storage:</span>
                          <span className="ml-2 font-medium">{bot.requirements.storage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500 dark:text-gray-400">OS:</span>
                          <span className="ml-2 font-medium">{bot.requirements.os}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500 dark:text-gray-400">Internet:</span>
                          <span className="ml-2 font-medium">{bot.requirements.internet}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500 dark:text-gray-400">VPS:</span>
                          <span className="ml-2 font-medium">{bot.requirements.vps}</span>
                        </div>
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-500 dark:text-gray-400">API Access:</span>
                            <span className="ml-2 font-medium">{bot.requirements.api_access}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                          Important Notice
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        This HFT bot requires a high-performance VPS with low latency to the exchange servers. 
                        Recommended VPS providers include AWS, Google Cloud, or specialized trading VPS providers.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Reviews ({bot.total_reviews})
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.floor(bot.average_rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {bot.average_rating} out of 5
                          </span>
                        </div>
                      </div>
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Write Review
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {review.user}
                              </span>
                              {review.verified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Choose Your Plan
                </h3>
                
                <div className="space-y-3">
                  {pricingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-2">
                          Most Popular
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {plan.name}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          ${plan.price}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        per {plan.period}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => setShowPurchaseModal(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase Now
                </Button>

                <div className="mt-4 text-center">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Free Trial (3 days)
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Stats
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="font-medium text-green-600">{bot.win_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Profit Factor</span>
                    <span className="font-medium">{bot.profit_factor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max Drawdown</span>
                    <span className="font-medium text-red-600">-{bot.max_drawdown}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                    <span className="font-medium">{bot.sharpe_ratio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Trades</span>
                    <span className="font-medium">{bot.total_trades.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Trade Duration</span>
                    <span className="font-medium">{bot.average_trade_duration}s</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Creator Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Created by
                </h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {bot.creator_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {bot.creator_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Verified Creator
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Complete Purchase
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Selected Plan:</span>
                <span className="font-medium">
                  {pricingPlans.find(p => p.id === selectedPlan)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="font-bold text-lg">
                  ${pricingPlans.find(p => p.id === selectedPlan)?.price}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full">
                <DollarSign className="h-4 w-4 mr-2" />
                Pay with Credit Card
              </Button>
              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Pay with Crypto
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPurchaseModal(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HFTBotDetail;
