import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Bot,
  Zap,
  Shield,
  BarChart3,
  Target,
  Clock,
  Globe,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import PNLCalendar from '../../components/Analysis/PNLCalendar';
import EACarousel from '../../components/EA/EACarousel';
// TEMPORARILY DISABLED: OnboardingWizard - Testing for React Error #31
// import OnboardingWizard, { useOnboarding } from '../../components/Onboarding/OnboardingWizard';
import { useAuth } from '../../contexts/AuthContext';
import { useEA } from '../../contexts/EAContext';
import apiClient from '../../lib/apiClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getActiveEAs } = useEA();
  // TEMPORARILY DISABLED: const { shouldShow, markAsCompleted } = useOnboarding();
  
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // New state for signals and market data
  const [recentSignals, setRecentSignals] = useState([]);
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [marketOverview, setMarketOverview] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(true);

  // Fetch real dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true);
        const response = await apiClient.get('/api/users/dashboard-stats');
        if (response.data && response.data.success && response.data.data) {
          setStatsData(response.data.data);
        } else {
          // API returned but with no data - use fallback
          console.warn('Dashboard stats API returned no data, using fallback');
          setStatsData({
            portfolioValue: 0,
            todayPnL: 0,
            todayPnLPercent: 0,
            activeSignals: 0,
            winRate: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Use empty data when API fails
        setStatsData({
          portfolioValue: 0,
          todayPnL: 0,
          todayPnLPercent: 0,
          activeSignals: 0,
          winRate: 0
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch recent trading signals from API
  useEffect(() => {
    const fetchRecentSignals = async () => {
      try {
        setLoadingSignals(true);
        const response = await apiClient.get('/api/signals/active', {
          params: { 
            limit: 4,
            sort: '-createdAt'
          }
        });
        
        if (response.data && response.data.success && response.data.data) {
          const signals = response.data.data.map(signal => ({
            id: signal._id || signal.id,
            symbol: signal.asset?.symbol || signal.symbol || 'N/A',
            name: signal.asset?.name || signal.name || signal.asset?.symbol || 'Unknown',
            signal: signal.action?.toUpperCase() || 'HOLD',
            confidence: signal.confidence || signal.accuracy || 0,
            price: signal.asset?.price || signal.price || 0,
            change: signal.asset?.change || 0,
            changePercent: signal.asset?.changePercent || signal.changePercent || '0%',
            time: signal.createdAt ? getTimeAgo(new Date(signal.createdAt)) : 'Recently'
          }));
          setRecentSignals(signals);
          console.log('[Dashboard] ✅ Loaded', signals.length, 'recent signals');
        } else {
          console.log('[Dashboard] No signals data returned from API');
          setRecentSignals([]);
        }
      } catch (error) {
        console.error('[Dashboard] Failed to fetch signals:', error.message);
        setRecentSignals([]);
      } finally {
        setLoadingSignals(false);
      }
    };

    fetchRecentSignals();
  }, []);

  // Fetch market overview from API
  useEffect(() => {
    const fetchMarketOverview = async () => {
      try {
        setLoadingMarket(true);
        // Use simple markets endpoint for direct API calls
        const response = await apiClient.get('/api/simple-markets/overview');
        
        if (response.data && response.data.success && response.data.data) {
          const overview = response.data.data;
          
          if (overview.length > 0) {
            setMarketOverview(overview);
            console.log('[Dashboard] ✅ Loaded', overview.length, 'market indices from API');
          } else {
            console.log('[Dashboard] No market data in API response');
            setMarketOverview([]);
          }
        } else {
          console.log('[Dashboard] No market data returned from API');
          setMarketOverview([]);
        }
      } catch (error) {
        console.error('[Dashboard] Failed to fetch market data:', error.message);
        setMarketOverview([]);
      } finally {
        setLoadingMarket(false);
      }
    };

    fetchMarketOverview();
  }, []);

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Helper functions for market data formatting
  const formatMarketValue = (value) => {
    if (!value) return '0';
    const num = parseFloat(value);
    if (num >= 1000) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change) => {
    if (!change) return '+0.00';
    const num = parseFloat(change);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}`;
  };

  const formatChangePercent = (percent) => {
    if (!percent) return '+0.00%';
    const num = parseFloat(percent);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // TEMPORARILY DISABLED: Show onboarding wizard on first visit
  // useEffect(() => {
  //   if (shouldShow && user) {
  //     // Small delay to let dashboard load first
  //     const timer = setTimeout(() => {
  //       setShowOnboarding(true);
  //     }, 1500); // Increased delay to ensure everything is loaded
  //     return () => clearTimeout(timer);
  //   }
  // }, [shouldShow, user]);

  // Transform API data to stats format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0);
  };

  const formatPercent = (value) => {
    const num = parseFloat(value) || 0;
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const stats = statsData ? [
    {
      name: 'Portfolio Value',
      value: formatCurrency(statsData.portfolioValue),
      change: formatCurrency(Math.abs(statsData.todayPnL) || 0),
      changePercent: formatPercent(statsData.todayPnLPercent),
      trend: (statsData.todayPnL || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'primary',
      bgGradient: 'from-primary-500/10 via-primary-500/5 to-transparent dark:from-primary-400/20 dark:via-primary-400/10',
      iconBg: 'bg-primary-500/10 dark:bg-primary-400/20',
      iconColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: 'Today\'s P&L',
      value: formatCurrency(statsData.todayPnL),
      change: formatCurrency(Math.abs(statsData.todayPnL) * 0.1),
      changePercent: formatPercent(statsData.todayPnLPercent),
      trend: (statsData.todayPnL || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: (statsData.todayPnL || 0) >= 0 ? 'success' : 'danger',
      bgGradient: (statsData.todayPnL || 0) >= 0 
        ? 'from-success-500/10 via-success-500/5 to-transparent dark:from-success-400/20 dark:via-success-400/10'
        : 'from-danger-500/10 via-danger-500/5 to-transparent dark:from-danger-400/20 dark:via-danger-400/10',
      iconBg: (statsData.todayPnL || 0) >= 0 
        ? 'bg-success-500/10 dark:bg-success-400/20'
        : 'bg-danger-500/10 dark:bg-danger-400/20',
      iconColor: (statsData.todayPnL || 0) >= 0 
        ? 'text-success-600 dark:text-success-400'
        : 'text-danger-600 dark:text-danger-400',
    },
    {
      name: 'Active Signals',
      value: String(statsData.activeSignals || 0),
      change: '+0',
      changePercent: '+0%',
      trend: 'up',
      icon: Activity,
      color: 'warning',
      bgGradient: 'from-warning-500/10 via-warning-500/5 to-transparent dark:from-warning-400/20 dark:via-warning-400/10',
      iconBg: 'bg-warning-500/10 dark:bg-warning-400/20',
      iconColor: 'text-warning-600 dark:text-warning-400',
    },
    {
      name: 'Win Rate',
      value: formatPercent(statsData.winRate),
      change: '+0%',
      changePercent: '+0%',
      trend: (statsData.winRate || 0) >= 50 ? 'up' : 'down',
      icon: Target,
      color: 'info',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-400/20 dark:via-blue-400/10',
      iconBg: 'bg-blue-500/10 dark:bg-blue-400/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  ] : [];

  const activeEAs = getActiveEAs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800/50">
        <div className="container-custom py-4 sm:py-6 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.first_name ? `Welcome back, ${user.first_name}!` : 'Welcome back, Trader!'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {user?.first_name 
                  ? `Here's your personalized trading overview for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Track your portfolio performance, manage your positions, and discover new trading opportunities.`
                  : `Here's your trading overview for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Track your portfolio performance and discover new trading opportunities.`
                }
              </p>
            </div>
            
            {user?.role === 'admin' && user?.isAdminSession === true && (
              <div className="flex space-x-2 flex-shrink-0">
                <Button
                  onClick={() => window.open('/admin', '_blank')}
                  variant="outline"
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 dark:bg-primary-500 dark:hover:bg-primary-600 whitespace-nowrap"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Admin Access</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-6 sm:py-8 px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Stats Grid - Professional Trading Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {loadingStats ? (
            [1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="animate-pulse p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </Card>
            ))
          ) : stats.length > 0 ? (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700/50 transition-all duration-300 group h-full">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className="relative p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {stat.name}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                          <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4 text-success-600 dark:text-success-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-danger-600 dark:text-danger-400" />
                        )}
                        <span
                          className={`text-sm font-semibold ${
                            stat.trend === 'up'
                              ? 'text-success-600 dark:text-success-400'
                              : 'text-danger-600 dark:text-danger-400'
                          }`}
                        >
                          {stat.changePercent}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          vs yesterday
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-4">
              <Card className="text-center py-12">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Dashboard Statistics Loading
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    We're preparing your personalized trading dashboard. Your portfolio metrics, trading signals, and performance analytics will appear here once data is available.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Signals - Enhanced */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="h-full overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="p-2 bg-primary-500/10 dark:bg-primary-400/20 rounded-lg flex-shrink-0">
                      <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        Recent Trading Signals
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Live market signals and alerts
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex-shrink-0">
                    <span className="hidden sm:inline">View all</span>
                    <ChevronRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                {loadingSignals ? (
                  // Loading state
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : recentSignals.length > 0 ? (
                  // Signals list
                  recentSignals.map((signal, idx) => (
                    <motion.div
                      key={signal.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {signal.symbol}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {signal.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {signal.time}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 sm:flex-shrink-0">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            ${typeof signal.price === 'number' ? signal.price.toFixed(2) : '0.00'}
                          </p>
                          <p
                            className={`text-xs font-semibold whitespace-nowrap ${
                              String(signal.change).startsWith('+') || parseFloat(signal.change) >= 0
                                ? 'text-success-600 dark:text-success-400'
                                : 'text-danger-600 dark:text-danger-400'
                            }`}
                          >
                            {signal.change} ({signal.changePercent})
                          </p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                              signal.signal === 'BUY'
                                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 border border-success-200 dark:border-success-800'
                                : signal.signal === 'SELL'
                                ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400 border border-danger-200 dark:border-danger-800'
                                : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400 border border-warning-200 dark:border-warning-800'
                            }`}
                          >
                            {signal.signal}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
                            {signal.confidence}% confidence
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  // Empty state
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      No Trading Signals Yet
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs mx-auto mb-3">
                      Trading signals will appear here once they're generated by the AI system or added manually.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Check the Markets page to explore available signals.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Active EAs - Enhanced */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-500/10 dark:bg-primary-400/20 rounded-lg flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      Active EAs
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      Running expert advisors
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {activeEAs.length > 0 ? (
                  activeEAs.map((ea) => (
                    <div
                      key={ea.id}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700/50 transition-all overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1 min-w-0">
                          {ea.name}
                        </h4>
                        <div className="relative flex-shrink-0">
                          <span className="status-online animate-pulse"></span>
                          <span className="absolute inset-0 status-online animate-ping opacity-75"></span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 truncate">
                        {ea.category}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                        <div className="flex-shrink-0">
                          <span className="font-bold text-success-600 dark:text-success-400">
                            {ea.performance}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">
                            return
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {ea.trades} trades • {ea.winRate} win rate
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      No Active Expert Advisors
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                      Start automating your trading by subscribing to professional EAs from our marketplace.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/ea-marketplace')}
                      className="text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      Browse EA Marketplace
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Market Overview - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-500/10 dark:bg-primary-400/20 rounded-lg flex-shrink-0">
                  <Globe className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    Market Overview
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Real-time market indices
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {loadingMarket ? (
                  // Loading state
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  ))
                ) : marketOverview.length > 0 ? (
                  // Market data
                  marketOverview.map((market) => (
                    <div
                      key={market.symbol}
                      className="p-5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {market.symbol}
                        </p>
                        {market.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-success-600 dark:text-success-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-danger-600 dark:text-danger-400" />
                        )}
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {market.value}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p
                          className={`text-sm font-semibold ${
                            market.trend === 'up'
                              ? 'text-success-600 dark:text-success-400'
                              : 'text-danger-600 dark:text-danger-400'
                          }`}
                        >
                          {market.change}
                        </p>
                        <p
                          className={`text-xs ${
                            market.trend === 'up'
                              ? 'text-success-600 dark:text-success-400'
                              : 'text-danger-600 dark:text-danger-400'
                          }`}
                        >
                          {market.changePercent}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Empty state
                  <div className="col-span-full text-center py-8">
                    <Globe className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Market Data Loading
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-2">
                      Market indices will appear here once API keys are configured.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Configure ALPHA_VANTAGE_API_KEY and POLYGON_API_KEY in your environment variables.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* My EA Highlights Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <EACarousel />
        </motion.div>

        {/* PnL Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <PNLCalendar />
        </motion.div>
      </div>

      {/* TEMPORARILY DISABLED: Onboarding Wizard - Testing for React Error #31 */}
      {/* <OnboardingWizard
        show={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          markAsCompleted();
        }}
      /> */}
    </div>
  );
};

export default Dashboard;
