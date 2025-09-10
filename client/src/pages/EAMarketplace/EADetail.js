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
  MessageCircle
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const EADetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ea, setEa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  // Mock EA data - replace with actual API call
  useEffect(() => {
    const fetchEA = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setEa({
          id: id,
          name: "Advanced Forex Scalper Pro",
          description: "A sophisticated Expert Advisor designed for high-frequency scalping in the forex market. Uses advanced machine learning algorithms to identify optimal entry and exit points.",
          version: "2.1.4",
          category: "Forex",
          strategy_type: "Scalping",
          win_rate: 78.5,
          profit_factor: 2.3,
          max_drawdown: 12.4,
          sharpe_ratio: 1.8,
          total_trades: 1247,
          profitable_trades: 978,
          price_monthly: 99.99,
          price_yearly: 999.99,
          currency: "USD",
          supported_pairs: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD"],
          timeframes: ["M1", "M5", "M15", "M30"],
          min_deposit: 1000,
          recommended_deposit: 5000,
          max_spread: 2,
          slippage_tolerance: 3,
          risk_level: "Medium",
          max_risk_per_trade: 2.0,
          max_daily_risk: 5.0,
          stop_loss_enabled: true,
          take_profit_enabled: true,
          status: "approved",
          is_active: true,
          is_featured: true,
          creator_name: "TradingMaster Pro",
          total_subscribers: 1247,
          active_subscribers: 892,
          average_rating: 4.7,
          total_reviews: 156,
          views: 15420,
          downloads: 892,
          screenshots: [
            "/api/placeholder/800/400",
            "/api/placeholder/800/400",
            "/api/placeholder/800/400"
          ],
          backtest_results: {
            period: "2020-2024",
            total_return: 245.6,
            max_drawdown: 12.4,
            sharpe_ratio: 1.8,
            win_rate: 78.5,
            profit_factor: 2.3,
            total_trades: 1247
          },
          live_results: {
            period: "2023-2024",
            total_return: 89.2,
            max_drawdown: 8.7,
            sharpe_ratio: 1.6,
            win_rate: 76.8,
            profit_factor: 2.1,
            total_trades: 456
          },
          features: [
            "Advanced ML-based signal generation",
            "Multi-timeframe analysis",
            "Dynamic risk management",
            "News filter integration",
            "Customizable parameters",
            "Real-time monitoring",
            "Mobile notifications",
            "24/7 support"
          ],
          requirements: {
            broker: "Any MT4/MT5 broker",
            vps: "Recommended for optimal performance",
            internet: "Stable connection required",
            cpu: "Minimum 2 cores",
            ram: "Minimum 4GB",
            os: "Windows 7+ or Linux"
          },
          created_at: "2023-01-15T10:30:00Z",
          updated_at: "2024-01-15T14:20:00Z"
        });
        setLoading(false);
      }, 1000);
    };

    fetchEA();
  }, [id]);

  const pricingPlans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: ea?.price_monthly || 99.99,
      period: 'month',
      features: ['Full EA access', 'Email support', 'Updates included'],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: ea?.price_yearly || 999.99,
      period: 'year',
      features: ['Full EA access', 'Priority support', 'Updates included', '2 months free'],
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 2499.99,
      period: 'lifetime',
      features: ['Full EA access', 'VIP support', 'All updates', 'Custom modifications', 'Source code access'],
      popular: false
    }
  ];

  const reviews = [
    {
      id: 1,
      user: "TraderJohn",
      rating: 5,
      date: "2024-01-10",
      comment: "Excellent EA! Made consistent profits for 6 months. Highly recommended.",
      verified: true
    },
    {
      id: 2,
      user: "ForexMaster",
      rating: 4,
      date: "2024-01-08",
      comment: "Good performance, but requires VPS for optimal results. Support is responsive.",
      verified: true
    },
    {
      id: 3,
      user: "ScalpingPro",
      rating: 5,
      date: "2024-01-05",
      comment: "Best scalping EA I've used. Win rate is impressive and drawdown is controlled.",
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

  if (!ea) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            EA Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The Expert Advisor you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/ea-marketplace')}>
            Back to Marketplace
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
            onClick={() => navigate('/ea-marketplace')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {ea.status}
                </span>
                {ea.is_featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Featured
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {ea.name}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {ea.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {ea.views.toLocaleString()} views
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {ea.downloads.toLocaleString()} downloads
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {ea.active_subscribers.toLocaleString()} active users
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
                  Screenshots
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ea.screenshots.map((screenshot, index) => (
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
                        {ea.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Supported Pairs
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {ea.supported_pairs.map((pair) => (
                            <span
                              key={pair}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded"
                            >
                              {pair}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Timeframes
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {ea.timeframes.map((tf) => (
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
                        Requirements
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Minimum Deposit:</span>
                          <span className="ml-2 font-medium">${ea.min_deposit.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Recommended Deposit:</span>
                          <span className="ml-2 font-medium">${ea.recommended_deposit.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Max Spread:</span>
                          <span className="ml-2 font-medium">{ea.max_spread} pips</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Risk Level:</span>
                          <span className="ml-2 font-medium">{ea.risk_level}</span>
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
                          Backtest Results ({ea.backtest_results.period})
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                            <span className="font-medium text-green-600">+{ea.backtest_results.total_return}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
                            <span className="font-medium text-red-600">-{ea.backtest_results.max_drawdown}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                            <span className="font-medium">{ea.backtest_results.sharpe_ratio}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                            <span className="font-medium">{ea.backtest_results.win_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Profit Factor:</span>
                            <span className="font-medium">{ea.backtest_results.profit_factor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Trades:</span>
                            <span className="font-medium">{ea.backtest_results.total_trades}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Live Results ({ea.live_results.period})
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                            <span className="font-medium text-green-600">+{ea.live_results.total_return}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
                            <span className="font-medium text-red-600">-{ea.live_results.max_drawdown}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                            <span className="font-medium">{ea.live_results.sharpe_ratio}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                            <span className="font-medium">{ea.live_results.win_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Profit Factor:</span>
                            <span className="font-medium">{ea.live_results.profit_factor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Trades:</span>
                            <span className="font-medium">{ea.live_results.total_trades}</span>
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
                        {ea.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        System Requirements
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Broker:</span>
                          <span className="ml-2 font-medium">{ea.requirements.broker}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">VPS:</span>
                          <span className="ml-2 font-medium">{ea.requirements.vps}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Internet:</span>
                          <span className="ml-2 font-medium">{ea.requirements.internet}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">CPU:</span>
                          <span className="ml-2 font-medium">{ea.requirements.cpu}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">RAM:</span>
                          <span className="ml-2 font-medium">{ea.requirements.ram}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">OS:</span>
                          <span className="ml-2 font-medium">{ea.requirements.os}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Reviews ({ea.total_reviews})
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.floor(ea.average_rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {ea.average_rating} out of 5
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
                    Free Trial (7 days)
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
                    <span className="font-medium text-green-600">{ea.win_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Profit Factor</span>
                    <span className="font-medium">{ea.profit_factor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max Drawdown</span>
                    <span className="font-medium text-red-600">-{ea.max_drawdown}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                    <span className="font-medium">{ea.sharpe_ratio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Trades</span>
                    <span className="font-medium">{ea.total_trades.toLocaleString()}</span>
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
                      {ea.creator_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {ea.creator_name}
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

export default EADetail;
