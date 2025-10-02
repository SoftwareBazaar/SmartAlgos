import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Users,
  Bot,
  Zap,
  ArrowLeft,
  Settings,
  Shield
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import PNLCalendar from '../../components/Analysis/PNLCalendar';
import { useAuth } from '../../contexts/AuthContext';
// import { useWebSocket } from '../../contexts/WebSocketContext';
import { useEA } from '../../contexts/EAContext';
import apiClient from '../../lib/apiClient';

const Dashboard = () => {
  const { user } = useAuth();
  // const { connected } = useWebSocket();
  const { getActiveEAs } = useEA();
  
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch real dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true);
        const response = await apiClient.get('/api/users/dashboard-stats');
        if (response.data.success) {
          setStatsData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Transform API data to stats format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  const formatPercent = (value) => {
    const num = parseFloat(value) || 0;
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const stats = statsData ? [
    {
      name: 'Portfolio Value',
      value: formatCurrency(statsData.portfolioValue),
      change: formatCurrency(Math.abs(statsData.todayPnL) || 0),
      changePercent: formatPercent(statsData.todayPnLPercent),
      trend: (statsData.todayPnL || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
    },
    {
      name: 'Today\'s P&L',
      value: formatCurrency(statsData.todayPnL),
      change: formatCurrency(Math.abs(statsData.todayPnL) * 0.1),
      changePercent: formatPercent(statsData.todayPnLPercent),
      trend: (statsData.todayPnL || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUp,
    },
    {
      name: 'Active Signals',
      value: String(statsData.activeSignals || 0),
      change: '+0',
      changePercent: '+0%',
      trend: 'up',
      icon: Activity,
    },
    {
      name: 'Win Rate',
      value: formatPercent(statsData.winRate),
      change: '+0%',
      changePercent: '+0%',
      trend: (statsData.winRate || 0) >= 50 ? 'up' : 'down',
      icon: TrendingUp,
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
    <div className="space-y-6 text-white">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, Trader! 👋
            </h1>
          </div>
        </div>
        
        {/* Admin Access Buttons - Only visible to admins */}
        {user?.role === 'admin' && (
          <div className="flex space-x-2">
            <Button
              onClick={() => window.open('/admin', '_blank')}
              variant="outline"
              size="sm"
              className="bg-primary-500 hover:bg-primary-600 text-white border-primary-500"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Access
            </Button>
            <Button
              onClick={() => window.open('/admin-login', '_blank')}
              variant="outline"
              size="sm"
              className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin Login
            </Button>
          </div>
        )}
      </div>

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's what's happening with your trading today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {loadingStats ? (
          // Loading skeleton
          [1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </Card>
          ))
        ) : stats.length > 0 ? (
          stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} hover className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-1">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-success-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-danger-500" />
                      )}
                      <span
                        className={`text-sm font-medium ml-1 ${
                          stat.trend === 'up'
                            ? 'text-success-600 dark:text-success-400'
                            : 'text-danger-600 dark:text-danger-400'
                        }`}
                      >
                        {stat.changePercent}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        vs yesterday
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          // Empty state
          <div className="col-span-4 text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Unable to load dashboard statistics</p>
          </div>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Signals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Trading Signals
                </h3>
                <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  View all
                </button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {recentSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                            {signal.symbol}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {signal.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {signal.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${signal.price}
                        </p>
                        <p
                          className={`text-xs ${
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
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            signal.signal === 'BUY'
                              ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                              : signal.signal === 'SELL'
                              ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200'
                              : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                          }`}
                        >
                          {signal.signal}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {signal.confidence}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Active EAs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Active EAs
                </h3>
                <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {activeEAs.map((ea) => (
                  <div
                    key={ea.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {ea.name}
                      </h4>
                      <span className="status-online"></span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {ea.category}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-success-600 dark:text-success-400 font-medium">
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
                ))}
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>

      {/* Market Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Market Overview
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {marketOverview.map((market) => (
                <div
                  key={market.symbol}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {market.symbol}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {market.value}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
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
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <PNLCalendar />
      </motion.div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed bottom-4 right-4"
      >
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-2 h-2 rounded-full bg-success-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Connected
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
