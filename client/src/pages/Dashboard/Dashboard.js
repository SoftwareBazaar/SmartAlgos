import React from 'react';
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
  ArrowLeft
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import PNLCalendar from '../../components/Analysis/PNLCalendar';
// import { useAuth } from '../../contexts/AuthContext';
// import { useWebSocket } from '../../contexts/WebSocketContext';

const Dashboard = () => {
  // const { user } = useAuth();
  // const { connected } = useWebSocket();

  // Mock data - in production, this would come from API calls
  const stats = [
    {
      name: 'Portfolio Value',
      value: '$125,430.50',
      change: '+$2,450.30',
      changePercent: '+2.0%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      name: 'Today\'s P&L',
      value: '+$1,250.75',
      change: '+$150.25',
      changePercent: '+13.6%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      name: 'Active Signals',
      value: '12',
      change: '+3',
      changePercent: '+33.3%',
      trend: 'up',
      icon: Activity,
    },
    {
      name: 'Win Rate',
      value: '68.5%',
      change: '+2.1%',
      changePercent: '+3.2%',
      trend: 'up',
      icon: TrendingUp,
    },
  ];

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

  const activeEAs = [
    {
      id: 1,
      name: 'Gold Scalping Pro',
      category: 'Scalping',
      performance: '+12.5%',
      trades: 45,
      winRate: '78%',
      status: 'active',
    },
    {
      id: 2,
      name: 'Trend Master EA',
      category: 'Trend',
      performance: '+8.2%',
      trades: 23,
      winRate: '65%',
      status: 'active',
    },
    {
      id: 3,
      name: 'News Trader Bot',
      category: 'News',
      performance: '+15.8%',
      trades: 12,
      winRate: '83%',
      status: 'active',
    },
  ];

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
        {stats.map((stat, index) => {
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
        })}
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
