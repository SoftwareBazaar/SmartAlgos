import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Download,
  Share2,
  RefreshCw,
  Calendar,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Star,
  Clock,
  Shield,
  Zap,
  Users,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  Bell,
  Bookmark,
  ExternalLink,
  Copy,
  Send,
  Info,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PortfolioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);

  // Mock Portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setTimeout(() => {
        setPortfolio({
          id: id,
          name: "My Trading Portfolio",
          description: "Diversified trading portfolio with forex, crypto, and stock positions",
          total_value: 125000,
          total_invested: 100000,
          total_profit: 25000,
          profit_percentage: 25.0,
          daily_change: 1250,
          daily_change_percentage: 1.01,
          risk_level: "Medium",
          max_drawdown: 8.5,
          sharpe_ratio: 1.8,
          win_rate: 68.5,
          total_trades: 156,
          profitable_trades: 107,
          created_at: "2023-01-15T10:30:00Z",
          updated_at: "2024-01-15T14:20:00Z",
          assets: [
            {
              id: 1,
              symbol: "EURUSD",
              name: "Euro/US Dollar",
              type: "Forex",
              quantity: 100000,
              entry_price: 1.0850,
              current_price: 1.0920,
              value: 109200,
              invested: 108500,
              profit: 700,
              profit_percentage: 0.65,
              weight: 87.36
            },
            {
              id: 2,
              symbol: "BTCUSDT",
              name: "Bitcoin",
              type: "Crypto",
              quantity: 0.5,
              entry_price: 45000,
              current_price: 52000,
              value: 26000,
              invested: 22500,
              profit: 3500,
              profit_percentage: 15.56,
              weight: 20.8
            },
            {
              id: 3,
              symbol: "AAPL",
              name: "Apple Inc.",
              type: "Stock",
              quantity: 10,
              entry_price: 170,
              current_price: 175,
              value: 1750,
              invested: 1700,
              profit: 50,
              profit_percentage: 2.94,
              weight: 1.4
            }
          ],
          performance_history: [
            { date: "2024-01-01", value: 100000, profit: 0 },
            { date: "2024-01-02", value: 101200, profit: 1200 },
            { date: "2024-01-03", value: 99800, profit: -200 },
            { date: "2024-01-04", value: 102500, profit: 2500 },
            { date: "2024-01-05", value: 103800, profit: 3800 },
            { date: "2024-01-06", value: 105200, profit: 5200 },
            { date: "2024-01-07", value: 104500, profit: 4500 },
            { date: "2024-01-08", value: 106800, profit: 6800 },
            { date: "2024-01-09", value: 108200, profit: 8200 },
            { date: "2024-01-10", value: 107500, profit: 7500 },
            { date: "2024-01-11", value: 109800, profit: 9800 },
            { date: "2024-01-12", value: 111200, profit: 11200 },
            { date: "2024-01-13", value: 110500, profit: 10500 },
            { date: "2024-01-14", value: 112800, profit: 12800 },
            { date: "2024-01-15", value: 125000, profit: 25000 }
          ],
          recent_trades: [
            {
              id: 1,
              symbol: "EURUSD",
              action: "BUY",
              quantity: 50000,
              entry_price: 1.0880,
              exit_price: 1.0920,
              profit: 200,
              profit_percentage: 0.37,
              duration: "2h 15m",
              timestamp: "2024-01-15T12:30:00Z"
            },
            {
              id: 2,
              symbol: "BTCUSDT",
              action: "BUY",
              quantity: 0.2,
              entry_price: 51000,
              exit_price: 52000,
              profit: 200,
              profit_percentage: 0.39,
              duration: "4h 30m",
              timestamp: "2024-01-15T10:15:00Z"
            }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchPortfolio();
  }, [id]);

  // Simulate real-time updates
  useEffect(() => {
    if (portfolio) {
      const interval = setInterval(() => {
        setRealTimeData({
          timestamp: new Date().toISOString(),
          total_value: portfolio.total_value + (Math.random() - 0.5) * 1000,
          daily_change: portfolio.daily_change + (Math.random() - 0.5) * 100
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [portfolio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Portfolio Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The portfolio you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/portfolio')}>
            Back to Portfolio
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
            onClick={() => navigate('/portfolio')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {portfolio.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {portfolio.description}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
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
                    Portfolio Value
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ${realTimeData.total_value.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      +${portfolio.total_profit.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Profit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      +{portfolio.profit_percentage}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Return</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${portfolio.daily_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolio.daily_change >= 0 ? '+' : ''}${portfolio.daily_change.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Today's Change</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <Card>
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'assets', label: 'Assets' },
                    { id: 'performance', label: 'Performance' },
                    { id: 'trades', label: 'Recent Trades' }
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Portfolio Metrics
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                            <span className="font-medium">{portfolio.risk_level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
                            <span className="font-medium text-red-600">-{portfolio.max_drawdown}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                            <span className="font-medium">{portfolio.sharpe_ratio}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                            <span className="font-medium text-green-600">{portfolio.win_rate}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Trading Stats
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Trades:</span>
                            <span className="font-medium">{portfolio.total_trades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Profitable Trades:</span>
                            <span className="font-medium text-green-600">{portfolio.profitable_trades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Invested:</span>
                            <span className="font-medium">${portfolio.total_invested.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                            <span className="font-medium">${portfolio.total_value.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'assets' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Portfolio Assets
                      </h4>
                      <Button size="sm" onClick={() => setShowAddAssetModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Asset
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {portfolio.assets.map((asset) => (
                        <div key={asset.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                                  {asset.symbol.substring(0, 2)}
                                </span>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                  {asset.symbol}
                                </h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {asset.name} • {asset.type}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 dark:text-gray-100">
                                ${asset.value.toLocaleString()}
                              </div>
                              <div className={`text-sm ${asset.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {asset.profit >= 0 ? '+' : ''}${asset.profit.toLocaleString()} ({asset.profit_percentage >= 0 ? '+' : ''}{asset.profit_percentage}%)
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                              <span className="ml-2 font-medium">{asset.quantity.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Entry Price:</span>
                              <span className="ml-2 font-medium">${asset.entry_price}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Current Price:</span>
                              <span className="ml-2 font-medium">${asset.current_price}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                              <span className="ml-2 font-medium">{asset.weight}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === 'performance' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Performance Chart
                    </h4>
                    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">Performance chart would be displayed here</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'trades' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Recent Trades
                    </h4>
                    <div className="space-y-4">
                      {portfolio.recent_trades.map((trade) => (
                        <div key={trade.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {trade.symbol}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                trade.action === 'BUY' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {trade.action}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trade.profit >= 0 ? '+' : ''}${trade.profit.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(trade.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                              <span className="ml-2 font-medium">{trade.quantity.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Entry:</span>
                              <span className="ml-2 font-medium">${trade.entry_price}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Exit:</span>
                              <span className="ml-2 font-medium">${trade.exit_price}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                              <span className="ml-2 font-medium">{trade.duration}</span>
                            </div>
                          </div>
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
            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Portfolio Settings
                  </Button>
                </div>
              </div>
            </Card>

            {/* Performance Summary */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Performance Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Return</span>
                    <span className="font-medium text-green-600">+{portfolio.profit_percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="font-medium text-green-600">{portfolio.win_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                    <span className="font-medium">{portfolio.sharpe_ratio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max Drawdown</span>
                    <span className="font-medium text-red-600">-{portfolio.max_drawdown}%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;
