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
  Bell,
  Zap,
  Activity,
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink,
  Copy,
  Send,
  Bookmark,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Minus,
  Plus,
  Info,
  Settings,
  Globe,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const SignalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [realTimeData, setRealTimeData] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Mock Signal data - replace with actual API call
  useEffect(() => {
    const fetchSignal = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setSignal({
          id: id,
          name: "Premium Forex Signals Pro",
          description: "Professional forex trading signals with 85%+ accuracy rate. Delivered in real-time via multiple channels including Telegram, WhatsApp, and email.",
          version: "2.3.1",
          category: "Forex",
          signal_type: "Manual + Automated",
          markets: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "NZDUSD"],
          timeframes: ["M15", "M30", "H1", "H4", "D1"],
          accuracy_rate: 87.3,
          total_signals: 1247,
          profitable_signals: 1089,
          average_pips: 45.2,
          max_drawdown: 8.7,
          sharpe_ratio: 2.1,
          risk_level: "Medium",
          max_risk_per_trade: 2.0,
          max_daily_risk: 5.0,
          stop_loss_enabled: true,
          take_profit_enabled: true,
          trailing_stop: true,
          status: "active",
          is_active: true,
          is_featured: true,
          creator_name: "ForexMaster Pro",
          total_subscribers: 2341,
          active_subscribers: 1876,
          average_rating: 4.8,
          total_reviews: 234,
          views: 45620,
          downloads: 1876,
          delivery_methods: ["Telegram", "WhatsApp", "Email", "SMS", "Push Notification"],
          signal_frequency: "3-5 signals per day",
          market_hours: "24/7 (Forex)",
          response_time: "< 30 seconds",
          price_monthly: 49.99,
          price_yearly: 499.99,
          currency: "USD",
          features: [
            "Real-time signal delivery",
            "Multiple delivery channels",
            "Risk management guidelines",
            "Market analysis reports",
            "Entry and exit points",
            "Stop loss and take profit levels",
            "Trailing stop recommendations",
            "24/7 market monitoring",
            "Mobile app notifications",
            "Historical performance data",
            "Custom risk settings",
            "Signal filtering options"
          ],
          requirements: {
            broker: "Any regulated forex broker",
            minimum_deposit: 100,
            recommended_deposit: 1000,
            trading_platform: "MT4, MT5, or any major platform",
            internet: "Stable connection for real-time updates",
            mobile_app: "Available for iOS and Android"
          },
          performance_stats: {
            last_30_days: {
              total_signals: 89,
              profitable_signals: 78,
              accuracy_rate: 87.6,
              total_pips: 1245,
              average_pips_per_signal: 14.0,
              max_winning_streak: 12,
              max_losing_streak: 3
            },
            last_90_days: {
              total_signals: 267,
              profitable_signals: 231,
              accuracy_rate: 86.5,
              total_pips: 3890,
              average_pips_per_signal: 14.6,
              max_winning_streak: 15,
              max_losing_streak: 4
            },
            last_year: {
              total_signals: 1089,
              profitable_signals: 951,
              accuracy_rate: 87.3,
              total_pips: 15670,
              average_pips_per_signal: 14.4,
              max_winning_streak: 18,
              max_losing_streak: 5
            }
          },
          recent_signals: [
            {
              id: 1,
              pair: "EURUSD",
              action: "BUY",
              entry_price: 1.0850,
              current_price: 1.0875,
              stop_loss: 1.0820,
              take_profit: 1.0900,
              pips: 25,
              status: "active",
              timestamp: "2024-01-15T14:30:00Z",
              timeframe: "H1"
            },
            {
              id: 2,
              pair: "GBPUSD",
              action: "SELL",
              entry_price: 1.2650,
              current_price: 1.2620,
              stop_loss: 1.2680,
              take_profit: 1.2580,
              pips: 30,
              status: "closed",
              timestamp: "2024-01-15T12:15:00Z",
              timeframe: "H4"
            },
            {
              id: 3,
              pair: "USDJPY",
              action: "BUY",
              entry_price: 148.20,
              current_price: 148.45,
              stop_loss: 147.90,
              take_profit: 148.80,
              pips: 25,
              status: "active",
              timestamp: "2024-01-15T10:45:00Z",
              timeframe: "M30"
            }
          ],
          created_at: "2023-01-15T10:30:00Z",
          updated_at: "2024-01-15T14:20:00Z"
        });
        setLoading(false);
      }, 1000);
    };

    fetchSignal();
  }, [id]);

  // Simulate real-time data updates
  useEffect(() => {
    if (signal) {
      const interval = setInterval(() => {
        setRealTimeData({
          timestamp: new Date().toISOString(),
          active_signals: Math.floor(Math.random() * 5) + 1,
          today_pips: Math.floor(Math.random() * 100) + 50,
          accuracy_today: Math.floor(Math.random() * 20) + 80
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [signal]);

  const pricingPlans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: signal?.price_monthly || 49.99,
      period: 'month',
      features: ['All signals', 'Email delivery', 'Basic support', 'Mobile app'],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: signal?.price_yearly || 499.99,
      period: 'year',
      features: ['All signals', 'All delivery methods', 'Priority support', 'Mobile app', '2 months free'],
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 999.99,
      period: 'lifetime',
      features: ['All signals', 'All delivery methods', 'VIP support', 'Mobile app', 'Custom alerts', 'Source code access'],
      popular: false
    }
  ];

  const reviews = [
    {
      id: 1,
      user: "ForexTrader",
      rating: 5,
      date: "2024-01-10",
      comment: "Excellent signals! Made consistent profits for 6 months. The accuracy is impressive.",
      verified: true
    },
    {
      id: 2,
      user: "SignalMaster",
      rating: 4,
      date: "2024-01-08",
      comment: "Good signals, but sometimes delivery is delayed during high volatility.",
      verified: true
    },
    {
      id: 3,
      user: "PipHunter",
      rating: 5,
      date: "2024-01-05",
      comment: "Best signal service I've used. Win rate is consistently high and risk management is excellent.",
      verified: false
    }
  ];

  const getSignalStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getActionColor = (action) => {
    return action === 'BUY' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Signal Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The signal service you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/signals')}>
            Back to Signals
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
            onClick={() => navigate('/signals')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Signals
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {signal.status}
                </span>
                {signal.is_featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Featured
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {signal.signal_type}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {signal.name}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {signal.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {signal.views.toLocaleString()} views
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {signal.active_subscribers.toLocaleString()} active subscribers
                </div>
                <div className="flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  {signal.signal_frequency}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {signal.response_time}
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

        {/* Real-time Stats */}
        {realTimeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Live Performance
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {realTimeData.active_signals}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Signals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      +{realTimeData.today_pips}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Today's Pips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {realTimeData.accuracy_today}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Today's Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {signal.accuracy_rate}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Overall Accuracy</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Signals */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Recent Signals
                  </h3>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-4">
                  {signal.recent_signals.map((sig) => (
                    <div key={sig.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {sig.pair}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalStatusColor(sig.status)}`}>
                            {sig.status}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {sig.timeframe}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getActionColor(sig.action)}`}>
                            {sig.action}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(sig.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Entry:</span>
                          <span className="ml-2 font-medium">{sig.entry_price}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Current:</span>
                          <span className="ml-2 font-medium">{sig.current_price}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">SL:</span>
                          <span className="ml-2 font-medium">{sig.stop_loss}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">TP:</span>
                          <span className="ml-2 font-medium">{sig.take_profit}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4">
                          <Button size="sm" variant="outline">
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Chart
                          </Button>
                        </div>
                        <div className={`font-bold ${sig.pips > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {sig.pips > 0 ? '+' : ''}{sig.pips} pips
                        </div>
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
                    { id: 'delivery', label: 'Delivery' },
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
                        Service Overview
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {signal.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Supported Markets
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {signal.markets.map((market) => (
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
                          {signal.timeframes.map((tf) => (
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
                        Service Details
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Signal Frequency:</span>
                          <span className="ml-2 font-medium">{signal.signal_frequency}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Market Hours:</span>
                          <span className="ml-2 font-medium">{signal.market_hours}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Response Time:</span>
                          <span className="ml-2 font-medium">{signal.response_time}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Risk Level:</span>
                          <span className="ml-2 font-medium">{signal.risk_level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'performance' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.entries(signal.performance_stats).map(([period, stats]) => (
                        <div key={period} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize">
                            {period.replace('_', ' ')}
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Total Signals:</span>
                              <span className="font-medium">{stats.total_signals}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Profitable:</span>
                              <span className="font-medium text-green-600">{stats.profitable_signals}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                              <span className="font-medium text-blue-600">{stats.accuracy_rate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Total Pips:</span>
                              <span className="font-medium text-green-600">+{stats.total_pips}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Avg Pips:</span>
                              <span className="font-medium">{stats.average_pips_per_signal}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Max Win Streak:</span>
                              <span className="font-medium text-green-600">{stats.max_winning_streak}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Max Loss Streak:</span>
                              <span className="font-medium text-red-600">{stats.max_losing_streak}</span>
                            </div>
                          </div>
                        </div>
                      ))}
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
                        {signal.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Requirements
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Broker:</span>
                          <span className="ml-2 font-medium">{signal.requirements.broker}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Min Deposit:</span>
                          <span className="ml-2 font-medium">${signal.requirements.minimum_deposit}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Recommended:</span>
                          <span className="ml-2 font-medium">${signal.requirements.recommended_deposit}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Platform:</span>
                          <span className="ml-2 font-medium">{signal.requirements.trading_platform}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Internet:</span>
                          <span className="ml-2 font-medium">{signal.requirements.internet}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Mobile App:</span>
                          <span className="ml-2 font-medium">{signal.requirements.mobile_app}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'delivery' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Delivery Methods
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {signal.delivery_methods.map((method, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            {method === 'Telegram' && <MessageSquare className="h-5 w-5 text-blue-500" />}
                            {method === 'WhatsApp' && <MessageSquare className="h-5 w-5 text-green-500" />}
                            {method === 'Email' && <Mail className="h-5 w-5 text-gray-500" />}
                            {method === 'SMS' && <Smartphone className="h-5 w-5 text-purple-500" />}
                            {method === 'Push Notification' && <Bell className="h-5 w-5 text-orange-500" />}
                            <span className="font-medium text-gray-900 dark:text-gray-100">{method}</span>
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-900 dark:text-blue-200">
                          Delivery Information
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Signals are delivered instantly via your chosen method. You can customize delivery preferences 
                        in your account settings and receive notifications on multiple devices simultaneously.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Reviews ({signal.total_reviews})
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.floor(signal.average_rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {signal.average_rating} out of 5
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
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Subscribe Now
                </Button>

                <div className="mt-4 text-center">
                  <Button variant="outline" className="w-full">
                    <Bell className="h-4 w-4 mr-2" />
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
                    <span className="text-gray-600 dark:text-gray-400">Accuracy Rate</span>
                    <span className="font-medium text-green-600">{signal.accuracy_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Signals</span>
                    <span className="font-medium">{signal.total_signals.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Profitable Signals</span>
                    <span className="font-medium text-green-600">{signal.profitable_signals.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Average Pips</span>
                    <span className="font-medium">{signal.average_pips}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max Drawdown</span>
                    <span className="font-medium text-red-600">-{signal.max_drawdown}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                    <span className="font-medium">{signal.sharpe_ratio}</span>
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
                      {signal.creator_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {signal.creator_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Verified Signal Provider
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

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Subscribe to Signals
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
                onClick={() => setShowSubscriptionModal(false)}
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

export default SignalDetail;
