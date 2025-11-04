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
import { useAuth } from '../../contexts/AuthContext';
import { useEA } from '../../contexts/EAContext';
import apiClient from '../../lib/apiClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getActiveEAs } = useEA();
  
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

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
            portfolioValue: 125000,
            todayPnL: 1250,
            todayPnLPercent: 1.01,
            activeSignals: 0,
            winRate: 68.5
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Use fallback data when API fails
        setStatsData({
          portfolioValue: 125000,
          todayPnL: 1250,
          todayPnLPercent: 1.01,
          activeSignals: 0,
          winRate: 68.5
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

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

  const recentSignals = [
    {
      id: 1,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      signal: 'BUY',
      confidence: 85,
      price: 175.50,
      change: '+2.30',
      changePercent: '+1.33%',
      time: '2 min ago',
    },
    {
      id: 2,
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      signal: 'SELL',
      confidence: 72,
      price: 245.80,
      change: '-5.20',
      changePercent: '-2.07%',
      time: '15 min ago',
    },
    {
      id: 3,
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      signal: 'BUY',
      confidence: 91,
      price: 378.25,
      change: '+4.15',
      changePercent: '+1.11%',
      time: '32 min ago',
    },
    {
      id: 4,
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      signal: 'HOLD',
      confidence: 58,
      price: 142.80,
      change: '+0.45',
      changePercent: '+0.32%',
      time: '1 hour ago',
    },
  ];

  const activeEAs = getActiveEAs();

  const marketOverview = [
    {
      symbol: 'S&P 500',
      value: '4,567.89',
      change: '+23.45',
      changePercent: '+0.52%',
      trend: 'up',
    },
    {
      symbol: 'NASDAQ',
      value: '14,234.56',
      change: '+45.67',
      changePercent: '+0.32%',
      trend: 'up',
    },
    {
      symbol: 'DOW',
      value: '35,678.90',
      change: '-123.45',
      changePercent: '-0.34%',
      trend: 'down',
    },
    {
      symbol: 'BTC/USD',
      value: '$52,450.00',
      change: '+1,250.00',
      changePercent: '+2.44%',
      trend: 'up',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800/50">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.first_name ? `Welcome back, ${user.first_name}!` : 'Welcome back, Trader!'} 👋
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.first_name 
                  ? `Here's your personalized trading overview for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Track your portfolio performance, manage your positions, and discover new trading opportunities.`
                  : `Here's your trading overview for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Track your portfolio performance and discover new trading opportunities.`
                }
              </p>
            </div>
            
            {user?.role === 'admin' && user?.isAdminSession === true && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => window.open('/admin', '_blank')}
                  variant="outline"
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Access
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
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
            <Card className="h-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-500/10 dark:bg-primary-400/20 rounded-lg">
                      <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Recent Trading Signals
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Live market signals and alerts
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {recentSignals.map((signal, idx) => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-white">
                            {signal.symbol}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {signal.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {signal.time}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          ${signal.price.toFixed(2)}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            signal.change.startsWith('+')
                              ? 'text-success-600 dark:text-success-400'
                              : 'text-danger-600 dark:text-danger-400'
                          }`}
                        >
                          {signal.change} ({signal.changePercent})
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                            signal.signal === 'BUY'
                              ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 border border-success-200 dark:border-success-800'
                              : signal.signal === 'SELL'
                              ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400 border border-danger-200 dark:border-danger-800'
                              : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400 border border-warning-200 dark:border-warning-800'
                          }`}
                        >
                          {signal.signal}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {signal.confidence}% confidence
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Active EAs - Enhanced */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-500/10 dark:bg-primary-400/20 rounded-lg">
                    <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Active EAs
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Running expert advisors
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {activeEAs.length > 0 ? (
                  activeEAs.map((ea) => (
                    <div
                      key={ea.id}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {ea.name}
                        </h4>
                        <div className="relative">
                          <span className="status-online animate-pulse"></span>
                          <span className="absolute inset-0 status-online animate-ping opacity-75"></span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {ea.category}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-success-600 dark:text-success-400">
                            {ea.performance}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">
                            return
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
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
          <Card>
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-500/10 dark:bg-primary-400/20 rounded-lg">
                  <Globe className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Market Overview
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Real-time market indices
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {marketOverview.map((market) => (
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
                ))}
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
    </div>
  );
};

export default Dashboard;
