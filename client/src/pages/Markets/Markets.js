import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Search, Filter, RefreshCw, Globe, Activity } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
// import { useAuth } from '../../contexts/AuthContext';
// import { useWebSocket } from '../../contexts/WebSocketContext';
// import axios from 'axios';

const Markets = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  // const { socket } = useWebSocket();
  const [activeTab, setActiveTab] = useState('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('US');
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState({
    stocks: [],
    forex: [],
    crypto: [],
    commodities: [],
    indices: []
  });
  const [marketStatus, setMarketStatus] = useState({});
  const [realTimeData, setRealTimeData] = useState({});

  // Mock market data - moved inside fetchMarketData to be reactive
  const getMockMarketData = (market) => ({
    stocks: market === 'NSE' ? [
      // NSE Kenyan Stocks
      { symbol: 'SCOM', name: 'Safaricom PLC', price: 18.50, change: 0.85, changePercent: 4.82, volume: '45.2M', sector: 'Telecommunications' },
      { symbol: 'EQTY', name: 'Equity Group Holdings', price: 42.30, change: 1.20, changePercent: 2.92, volume: '12.8M', sector: 'Banking' },
      { symbol: 'KCB', name: 'Kenya Commercial Bank', price: 28.75, change: 0.65, changePercent: 2.31, volume: '8.9M', sector: 'Banking' },
      { symbol: 'COOP', name: 'Co-operative Bank', price: 12.45, change: -0.15, changePercent: -1.19, volume: '5.2M', sector: 'Banking' },
      { symbol: 'EABL', name: 'East African Breweries', price: 125.50, change: -3.25, changePercent: -2.52, volume: '2.8M', sector: 'Manufacturing' },
      { symbol: 'BAT', name: 'British American Tobacco', price: 185.00, change: -8.50, changePercent: -4.39, volume: '1.2M', sector: 'Manufacturing' },
      { symbol: 'ABSA', name: 'Absa Bank Kenya', price: 8.90, change: 0.20, changePercent: 2.30, volume: '3.8M', sector: 'Banking' },
      { symbol: 'NCBA', name: 'NCBA Group PLC', price: 22.10, change: -0.30, changePercent: -1.34, volume: '2.1M', sector: 'Banking' },
      { symbol: 'KENGEN', name: 'Kenya Electricity Generating', price: 3.25, change: 0.10, changePercent: 3.17, volume: '4.2M', sector: 'Energy' },
      { symbol: 'JUBILEE', name: 'Jubilee Holdings', price: 185.00, change: 2.50, changePercent: 1.37, volume: '0.5M', sector: 'Insurance' },
      { symbol: 'UNGA', name: 'Unga Group Limited', price: 15.80, change: 0.40, changePercent: 2.60, volume: '0.8M', sector: 'Manufacturing' },
      { symbol: 'BAMBURI', name: 'Bamburi Cement', price: 35.20, change: -0.80, changePercent: -2.22, volume: '0.4M', sector: 'Construction' },
      { symbol: 'TELKOM', name: 'Telkom Kenya', price: 2.15, change: 0.05, changePercent: 2.38, volume: '1.8M', sector: 'Telecommunications' },
      { symbol: 'CIC', name: 'CIC Insurance Group', price: 2.85, change: -0.05, changePercent: -1.72, volume: '0.3M', sector: 'Insurance' },
      { symbol: 'KPLC', name: 'Kenya Power & Lighting', price: 1.85, change: -0.05, changePercent: -2.63, volume: '2.1M', sector: 'Utilities' },
      { symbol: 'KAPCHORUA', name: 'Kapchorua Tea Company', price: 45.00, change: 1.50, changePercent: 3.45, volume: '0.2M', sector: 'Agriculture' },
      { symbol: 'STANLIB', name: 'STANLIB Fahari I-REIT', price: 8.50, change: 0.15, changePercent: 1.80, volume: '0.3M', sector: 'Real Estate' },
      { symbol: 'ICDC', name: 'ICDC', price: 2.10, change: 0.05, changePercent: 2.44, volume: '0.2M', sector: 'Investment' },
      { symbol: 'NMG', name: 'Nation Media Group', price: 18.50, change: -0.30, changePercent: -1.59, volume: '0.1M', sector: 'Media' },
      { symbol: 'KUKU', name: 'Kuku Foods Limited', price: 12.50, change: 0.25, changePercent: 2.04, volume: '0.1M', sector: 'Agriculture' }
    ] : [
      // US Stocks
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 2.50, changePercent: 1.45, volume: '45.2M' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.80, change: -5.20, changePercent: -2.07, volume: '32.1M' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.30, change: 1.80, changePercent: 1.28, volume: '28.7M' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: 3.40, changePercent: 0.91, volume: '22.3M' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.20, change: -1.30, changePercent: -0.83, volume: '18.9M' }
    ],
    forex: [
      { symbol: 'EUR/USD', name: 'Euro/US Dollar', price: 1.0920, change: 0.0025, changePercent: 0.23, volume: '1.25B' },
      { symbol: 'GBP/USD', name: 'British Pound/US Dollar', price: 1.2650, change: -0.0015, changePercent: -0.12, volume: '890M' },
      { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', price: 148.20, change: 0.45, changePercent: 0.30, volume: '1.1B' },
      { symbol: 'AUD/USD', name: 'Australian Dollar/US Dollar', price: 0.6580, change: 0.0012, changePercent: 0.18, volume: '567M' }
    ],
    crypto: [
      { symbol: 'BTC/USDT', name: 'Bitcoin', price: 52450.00, change: 1500.00, changePercent: 2.94, volume: '2.1B' },
      { symbol: 'ETH/USDT', name: 'Ethereum', price: 3150.50, change: 85.20, changePercent: 2.78, volume: '1.8B' },
      { symbol: 'BNB/USDT', name: 'Binance Coin', price: 315.80, change: 8.50, changePercent: 2.77, volume: '456M' },
      { symbol: 'ADA/USDT', name: 'Cardano', price: 0.4850, change: 0.0120, changePercent: 2.54, volume: '234M' }
    ],
    commodities: [
      { symbol: 'GOLD', name: 'Gold', price: 1950.50, change: 12.30, changePercent: 0.63, volume: '89.2M' },
      { symbol: 'SILVER', name: 'Silver', price: 23.45, change: 0.25, changePercent: 1.08, volume: '45.7M' },
      { symbol: 'OIL', name: 'Crude Oil', price: 78.20, change: -0.85, changePercent: -1.08, volume: '123.4M' },
      { symbol: 'COPPER', name: 'Copper', price: 3.85, change: 0.05, changePercent: 1.32, volume: '67.8M' }
    ],
    indices: [
      { symbol: 'SPX', name: 'S&P 500', price: 4780.50, change: 15.20, changePercent: 0.32, volume: '2.1B' },
      { symbol: 'DJI', name: 'Dow Jones', price: 37520.30, change: 125.40, changePercent: 0.34, volume: '1.8B' },
      { symbol: 'IXIC', name: 'NASDAQ', price: 14850.20, change: 45.80, changePercent: 0.31, volume: '1.9B' }
    ]
  });

  // Fetch market data
  const fetchMarketData = useCallback(async (market = 'US') => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock data for now
      setMarketData(getMockMarketData(market));
      setMarketStatus({ status: 'open', message: 'Market is open' });
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Fallback to mock data
      setMarketData(getMockMarketData(market));
      setMarketStatus({ status: 'open', message: 'Market is open' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specific market data
  const fetchSpecificMarketData = async (type, market = 'US') => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data for now
      setMarketData(prev => ({
        ...prev,
        [type]: getMockMarketData(selectedMarket)[type] || []
      }));
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMarketData(selectedMarket);
  }, [selectedMarket, fetchMarketData]);

  // Refresh data
  const handleRefresh = () => {
    fetchMarketData(selectedMarket);
  };

  // Handle market change
  const handleMarketChange = (market) => {
    setSelectedMarket(market);
    fetchMarketData(market);
  };

  const tabs = [
    { id: 'stocks', name: 'Stocks', count: marketData.stocks.length },
    { id: 'forex', name: 'Forex', count: marketData.forex.length },
    { id: 'crypto', name: 'Crypto', count: marketData.crypto.length },
    { id: 'commodities', name: 'Commodities', count: marketData.commodities.length },
  ];

  const filteredData = (marketData[activeTab] || []).filter(item =>
    item.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get real-time price for symbol
  const getRealTimePrice = (symbol) => {
    // For now, just return the original price
    return null;
  };

  // Get market status indicator
  const getMarketStatusIndicator = () => {
    const status = marketStatus.status || 'unknown';
    const isOpen = status === 'open';
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-success-500' : 'bg-gray-400'}`} />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {marketStatus.message || 'Market Status Unknown'}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Markets
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Real-time market data and analysis across all asset classes
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            {getMarketStatusIndicator()}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <select
                value={selectedMarket}
                onChange={(e) => handleMarketChange(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm"
              >
                <option value="US">US Markets</option>
                <option value="NSE">NSE (Kenya)</option>
              </select>
            </div>
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search markets..."
                  leftIcon={<Search className="h-4 w-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
                  Filters
                </Button>
                <Button 
                  variant="outline" 
                  icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Market Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <Card.Body>
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.name}
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Market Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <Card.Body>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-primary-500 mr-2" />
                          <span className="text-gray-500 dark:text-gray-400">Loading market data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No market data available</p>
                          <p className="text-sm mt-1">Try refreshing or selecting a different market</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                    <motion.tr
                      key={item.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                              {item.symbol.split('/')[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.symbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <span>{selectedMarket === 'NSE' ? 'KES ' : '$'}{(item.price || 0).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                          {(item.change || 0) >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-danger-500 mr-1" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              (item.change || 0) >= 0
                                ? 'text-success-600 dark:text-success-400'
                                : 'text-danger-600 dark:text-danger-400'
                            }`}
                          >
                            {(item.change || 0) >= 0 ? '+' : ''}{item.change || 0} ({(item.changePercent || 0) >= 0 ? '+' : ''}{item.changePercent || 0}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.volume}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/markets/${item.symbol}`)}
                          >
                            View
                          </Button>
                          <Button size="sm" variant="primary">
                            Trade
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default Markets;
