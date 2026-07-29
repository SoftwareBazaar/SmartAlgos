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
  CreditCard,
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
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../../components/UI/Button';
import { ScreenshotDisplay } from '../../components/ImageDisplay';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import apiClient from '../../lib/apiClient';
import { useEA } from '../../contexts/EAContext';
import CryptoPaymentDialog from '../../components/Payments/CryptoPaymentDialog';
import SelfServiceCryptoDialog from '../../components/Payments/SelfServiceCryptoDialog';
import { PaymentMethodDialog, PaystackPayment } from '../../components/Payments';
import EADownloadSection from '../../components/Downloads/EADownloadSection';

const EADetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ea, setEa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [showSelfServiceCrypto, setShowSelfServiceCrypto] = useState(false);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [showPaystackPayment, setShowPaystackPayment] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);

  // Fetch user subscription for this EA
  const fetchUserSubscription = async () => {
    try {
      const response = await apiClient.get('/api/subscriptions');
      if (response.data.success && response.data.data) {
        // Find subscription for this EA
        const subscription = response.data.data.find(sub =>
          sub.ea_id === id && sub.status === 'active'
        );
        setUserSubscription(subscription);
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  // Load EA from API
  useEffect(() => {
    const fetchEA = async () => {
      try {
        setLoading(true);
        console.log('[EADetail] Loading EA:', id);

        const response = await apiClient.get(`/api/eas/${id}`);

        if (response.data.success) {
          const eaData = response.data.data;
          console.log('[EADetail] ✅ Loaded EA:', eaData);
          console.log('[EADetail] Screenshots:', eaData.screenshots);

          // Set EA with proper defaults for missing fields
          setEa({
            ...eaData,
            // Ensure arrays exist
            supported_pairs: eaData.supported_pairs || [],
            timeframes: eaData.timeframes || [],
            keywords: eaData.keywords || [],
            screenshots: eaData.screenshots || [],
            // Ensure numbers are parsed
            win_rate: parseFloat(eaData.win_rate) || 0,
            profit_factor: parseFloat(eaData.profit_factor) || 0,
            max_drawdown: parseFloat(eaData.max_drawdown) || 0,
            price_weekly: parseFloat(eaData.price_weekly) || 0,
            price_monthly: parseFloat(eaData.price_monthly) || 0,
            price_yearly: parseFloat(eaData.price_yearly) || 0,
            // Set default backtest/live results if missing
            backtest_results: eaData.backtest_results || {
              period: "Backtest Data",
              total_return: 0,
              max_drawdown: parseFloat(eaData.max_drawdown) || 0,
              win_rate: parseFloat(eaData.win_rate) || 0,
              profit_factor: parseFloat(eaData.profit_factor) || 0,
              total_trades: parseInt(eaData.total_trades) || 0
            },
            live_results: eaData.live_results || {
              period: "Live Results",
              total_return: 0,
              max_drawdown: parseFloat(eaData.max_drawdown) || 0,
              sharpe_ratio: parseFloat(eaData.sharpe_ratio) || 0,
              win_rate: parseFloat(eaData.win_rate) || 0,
              profit_factor: parseFloat(eaData.profit_factor) || 0,
              total_trades: parseInt(eaData.total_trades) || 0
            }
          });
          setLoading(false);
        } else {
          console.error('[EADetail] Failed to load EA');
          setLoading(false);
        }
      } catch (error) {
        console.error('[EADetail] Error loading EA:', error);
        setLoading(false);
      }
    };

    fetchEA();
    fetchUserSubscription();

    // Listen for EA update events
    const handleEAUpdate = () => {
      console.log('[EADetail] EA updated, refetching...');
      fetchEA();
    };

    // Listen for page focus to refresh subscription data
    const handlePageFocus = () => {
      console.log('[EADetail] Page focused, refreshing subscription data...');
      fetchUserSubscription();
    };

    window.addEventListener('ea-updated', handleEAUpdate);
    window.addEventListener('focus', handlePageFocus);

    return () => {
      window.removeEventListener('ea-updated', handleEAUpdate);
      window.removeEventListener('focus', handlePageFocus);
    };
  }, [id]);

  const pricingPlans = [
    {
      id: 'weekly',
      name: 'Weekly Access',
      price: ea?.price_weekly || 0,
      period: 'week',
      features: ['Full EA access', 'Email support', 'Updates included'],
      badge: 'Try it out',
      popular: false
    },
    {
      id: 'monthly',
      name: 'Monthly Access',
      price: ea?.price_monthly || 0,
      period: 'month',
      features: ['Full EA access', 'Priority support', 'All updates', 'Trading signals'],
      badge: 'MOST POPULAR',
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: ea?.price_yearly || 0,
      period: 'one-time',
      features: ['Full EA access', 'VIP support', 'All updates', 'Custom modifications', 'Source code access'],
      popular: false
    }
  ].filter(plan => plan.price > 0); // Only show plans with valid prices

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
                  {(ea.views || 0).toLocaleString()} views
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {(ea.downloads || 0).toLocaleString()} downloads
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {(ea.active_subscribers || 0).toLocaleString()} active users
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
                {ea.screenshots && ea.screenshots.length > 0 ? (
                  <div className="relative">
                    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
                      {ea.screenshots.map((screenshot, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-64 relative group cursor-pointer"
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setLightboxOpen(true);
                          }}
                        >
                          <ScreenshotDisplay
                            screenshots={[screenshot]}
                            className="w-full h-48"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {ea.screenshots.length > 2 && (
                      <div className="text-center mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ← Scroll to see all {ea.screenshots.length} screenshots →
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      No screenshots available yet.
                    </p>
                  </div>
                )}
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
                    { id: 'reviews', label: 'Reviews' },
                    { id: 'downloads', label: 'Downloads' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${selectedTab === tab.id
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
                          {(ea.supported_pairs || []).map((pair) => (
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
                          {(ea.timeframes || []).map((tf) => (
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
                          <span className="ml-2 font-medium">${(ea.min_deposit || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Recommended Deposit:</span>
                          <span className="ml-2 font-medium">${(ea.recommended_deposit || 0).toLocaleString()}</span>
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
                          Backtest Results ({ea.backtest_results?.period || 'N/A'})
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                            <span className="font-medium text-green-600">+{ea.backtest_results?.total_return || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
                            <span className="font-medium text-red-600">-{ea.backtest_results?.max_drawdown || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                            <span className="font-medium">{ea.backtest_results?.sharpe_ratio || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                            <span className="font-medium">{ea.backtest_results?.win_rate || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Profit Factor:</span>
                            <span className="font-medium">{ea.backtest_results?.profit_factor || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Trades:</span>
                            <span className="font-medium">{ea.backtest_results?.total_trades || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Live Results ({ea.live_results?.period || 'N/A'})
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                            <span className="font-medium text-green-600">+{ea.live_results?.total_return || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
                            <span className="font-medium text-red-600">-{ea.live_results?.max_drawdown || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                            <span className="font-medium">{ea.live_results?.sharpe_ratio || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                            <span className="font-medium">{ea.live_results?.win_rate || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Profit Factor:</span>
                            <span className="font-medium">{ea.live_results?.profit_factor || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Trades:</span>
                            <span className="font-medium">{ea.live_results?.total_trades || 0}</span>
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
                        {(ea.features || []).map((feature, index) => (
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
                          <span className="ml-2 font-medium">{ea.requirements?.broker || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">VPS:</span>
                          <span className="ml-2 font-medium">{ea.requirements?.vps || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Internet:</span>
                          <span className="ml-2 font-medium">{ea.requirements?.internet || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">CPU:</span>
                          <span className="ml-2 font-medium">{ea.requirements?.cpu || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">RAM:</span>
                          <span className="ml-2 font-medium">{ea.requirements?.ram || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">OS:</span>
                          <span className="ml-2 font-medium">{ea.requirements?.os || 'N/A'}</span>
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
                                className={`h-4 w-4 ${star <= Math.floor(ea.average_rating)
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
                                    className={`h-4 w-4 ${star <= review.rating
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

                {selectedTab === 'downloads' && (
                  <div className="space-y-6">
                    {/* Subscription Management */}
                    {userSubscription && userSubscription.status === 'active' && (
                      <Card>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-green-900 dark:text-green-100">
                                Active Subscription
                              </h4>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                Plan: {userSubscription.subscription_type || 'N/A'} |
                                Expires: {userSubscription.end_date ? new Date(userSubscription.end_date).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to cancel this subscription? You will lose access to downloads.')) {
                                  try {
                                    const response = await apiClient.delete(`/api/subscriptions/${userSubscription.id}`);
                                    if (response.data.success) {
                                      alert('✅ Subscription cancelled successfully!');
                                      setUserSubscription(null);
                                      await fetchUserSubscription();
                                    }
                                  } catch (error) {
                                    console.error('Cancel subscription error:', error);
                                    alert('❌ Failed to cancel subscription: ' + (error.response?.data?.message || 'Unknown error'));
                                  }
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel Subscription
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}

                    <EADownloadSection
                      ea={ea}
                      subscription={userSubscription}
                      onDownloadSuccess={(fileType) => {
                        console.log(`Download successful: ${fileType}`);
                        // Optionally refresh subscription data
                        fetchUserSubscription();
                      }}
                    />
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
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === plan.id
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

                {userSubscription && userSubscription.status === 'active' ? (
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => setSelectedTab('downloads')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Files
                    </Button>
                    <div className="text-center">
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ Active Subscription
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => setShowPurchaseModal(true)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Subscribe Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedTab('downloads')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Downloads
                    </Button>
                  </div>
                )}
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
                    <span className="font-medium">{(ea.total_trades || 0).toLocaleString()}</span>
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
                      {(ea.creator_name || 'U').charAt(0)}
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
              <Button
                className="w-full"
                onClick={() => {
                  setShowPaymentMethodDialog(true);
                  setShowPurchaseModal(false);
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Choose Payment Method
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowCryptoPayment(true);
                  setShowPurchaseModal(false);
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Pay with Crypto
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                onClick={() => {
                  setShowSelfServiceCrypto(true);
                  setShowPurchaseModal(false);
                }}
              >
                <span className="mr-2">🚀</span>
                Self-Service Crypto (Auto-Detection)
              </Button>

              {/* Escrow Payment for Lifetime Access */}
              <div className="border-2 border-primary-500/30 rounded-lg p-3 bg-primary-500/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary-500" />
                    <span className="font-semibold text-sm">Secure Escrow Payment</span>
                  </div>
                  <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">Lifetime</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Use Escrow for <strong>lifetime access</strong> purchase. Your payment is held securely until you confirm EA delivery.
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  <Shield className="h-3 w-3 mr-2" />
                  Pay via Escrow (Lifetime Access)
                </Button>
              </div>

              <Button
                className="w-full bg-[#09a5db] hover:bg-[#0894c4] text-white border-0"
                onClick={() => {
                  setShowPaystackPayment(true);
                  setShowPurchaseModal(false);
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Card / Bank
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

      {/* Screenshot Lightbox Modal */}
      {lightboxOpen && ea && ea.screenshots && ea.screenshots.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-6 w-6 text-gray-900 dark:text-gray-100" />
            </button>

            {/* Previous Button */}
            {ea.screenshots.length > 1 && currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex - 1);
                }}
                className="absolute left-4 z-10 p-3 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-8 w-8 text-gray-900 dark:text-gray-100" />
              </button>
            )}

            {/* Image */}
            <div
              className="max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={ea.screenshots[currentImageIndex]}
                alt={`Screenshot ${currentImageIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>

            {/* Next Button */}
            {ea.screenshots.length > 1 && currentImageIndex < ea.screenshots.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex + 1);
                }}
                className="absolute right-4 z-10 p-3 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="h-8 w-8 text-gray-900 dark:text-gray-100" />
              </button>
            )}

            {/* Image Counter */}
            {ea.screenshots.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {currentImageIndex + 1} / {ea.screenshots.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Method Dialog (Card/M-Pesa/Crypto) */}
      <PaymentMethodDialog
        isOpen={showPaymentMethodDialog}
        onClose={() => setShowPaymentMethodDialog(false)}
        amount={pricingPlans.find(p => p.id === selectedPlan)?.price || 0}
        currency="USD"
        accountReference={`EA_${ea?.id}_${Date.now()}`}
        transactionDesc={`Purchase: ${ea?.name} (${selectedPlan})`}
        metadata={{
          eaId: ea?.id,
          eaName: ea?.name,
          subscriptionType: selectedPlan
        }}
        onPaymentSuccess={async (result) => {
          console.log('💚 M-Pesa Payment successful:', result);

          // Refresh subscription status to show download button
          await fetchUserSubscription();

          // Automatically switch to downloads tab
          setSelectedTab('downloads');

          // Close the dialog
          setShowPaymentMethodDialog(false);

          alert('Payment successful! Your subscription is now active.');
        }}
        onPaymentError={(error) => {
          console.error('Payment error:', error);
        }}
      />

      {/* Crypto Payment Dialog */}
      <CryptoPaymentDialog
        isOpen={showCryptoPayment}
        onClose={() => setShowCryptoPayment(false)}
        amount={pricingPlans.find(p => p.id === selectedPlan)?.price || 0}
        currency="USD"
        onPaymentSuccess={() => {
          setShowCryptoPayment(false);
          alert('Payment successful! EA will be available in your dashboard.');
        }}
      />

      <SelfServiceCryptoDialog
        isOpen={showSelfServiceCrypto}
        onClose={() => setShowSelfServiceCrypto(false)}
        eaId={ea?.id}
        eaName={ea?.name}
        amount={pricingPlans.find(p => p.id === selectedPlan)?.price || 0}
        currency="USD"
        subscriptionType="lifetime"
        onPaymentSuccess={() => {
          setShowSelfServiceCrypto(false);
          alert('Payment confirmed! Your EA is ready for download.');
        }}
      />

      {/* Paystack Payment Dialog */}
      <PaystackPayment
        isOpen={showPaystackPayment}
        onClose={() => setShowPaystackPayment(false)}
        ea={ea}
        subscriptionType={selectedPlan}
        onPaymentSuccess={async (result) => {
          console.log('💚 Paystack Payment successful:', result);

          // Refresh subscription status to show download button
          await fetchUserSubscription();

          // Automatically switch to downloads tab
          setSelectedTab('downloads');

          // Close the payment dialog
          setShowPaystackPayment(false);

          // Show success message
          alert(result.message || 'Payment successful! Your subscription is now active.');
        }}
      />
    </div>
  );
};

export default EADetail;
