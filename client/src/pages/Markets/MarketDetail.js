import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
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
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink,
  Copy,
  Send,
  Bookmark,
  Star,
  Clock,
  Shield,
  Users,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  Info,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Plus,
  Minus,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Minus as MinusIcon,
  Plus as PlusIcon
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const MarketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [showOrderModal, setShowOrderModal] = useState(false);

  // NSE Stock helper functions
  const getNSEStockName = (symbol) => {
    const names = {
      'SCOM': 'Safaricom PLC',
      'EQTY': 'Equity Group Holdings Limited',
      'KCB': 'Kenya Commercial Bank Group',
      'COOP': 'Co-operative Bank of Kenya',
      'EABL': 'East African Breweries Limited',
      'BAT': 'British American Tobacco Kenya',
      'ABSA': 'Absa Bank Kenya PLC',
      'NCBA': 'NCBA Group PLC',
      'KENGEN': 'Kenya Electricity Generating Company',
      'JUBILEE': 'Jubilee Holdings Limited',
      'UNGA': 'Unga Group Limited',
      'BAMBURI': 'Bamburi Cement Limited',
      'TELKOM': 'Telkom Kenya Limited',
      'CIC': 'CIC Insurance Group',
      'KPLC': 'Kenya Power and Lighting Company',
      'KAPCHORUA': 'Kapchorua Tea Company',
      'STANLIB': 'STANLIB Fahari I-REIT',
      'ICDC': 'Industrial and Commercial Development Corporation',
      'NMG': 'Nation Media Group',
      'KUKU': 'Kuku Foods Limited'
    };
    return names[symbol] || symbol;
  };

  const getNSEStockSector = (symbol) => {
    const sectors = {
      'SCOM': 'Telecommunications',
      'TELKOM': 'Telecommunications',
      'EQTY': 'Banking',
      'KCB': 'Banking',
      'COOP': 'Banking',
      'ABSA': 'Banking',
      'NCBA': 'Banking',
      'EABL': 'Manufacturing',
      'BAT': 'Manufacturing',
      'UNGA': 'Manufacturing',
      'BAMBURI': 'Construction',
      'JUBILEE': 'Insurance',
      'CIC': 'Insurance',
      'KENGEN': 'Energy',
      'KPLC': 'Utilities',
      'KAPCHORUA': 'Agriculture',
      'KUKU': 'Agriculture',
      'STANLIB': 'Real Estate',
      'ICDC': 'Investment',
      'NMG': 'Media'
    };
    return sectors[symbol] || 'General';
  };

  const getNSEStockPrice = (symbol) => {
    const prices = {
      'SCOM': 18.50,
      'EQTY': 42.30,
      'KCB': 28.75,
      'COOP': 12.45,
      'EABL': 125.50,
      'BAT': 185.00,
      'ABSA': 8.90,
      'NCBA': 22.10,
      'KENGEN': 3.25,
      'JUBILEE': 185.00,
      'UNGA': 15.80,
      'BAMBURI': 35.20,
      'TELKOM': 2.15,
      'CIC': 2.85,
      'KPLC': 1.85,
      'KAPCHORUA': 45.00,
      'STANLIB': 8.50,
      'ICDC': 2.10,
      'NMG': 18.50,
      'KUKU': 12.50
    };
    return prices[symbol] || 10.00;
  };

  const getNSEStockChange = (symbol) => {
    const changes = {
      'SCOM': 0.85,
      'EQTY': 1.20,
      'KCB': 0.65,
      'COOP': -0.15,
      'EABL': -3.25,
      'BAT': -8.50,
      'ABSA': 0.20,
      'NCBA': -0.30,
      'KENGEN': 0.10,
      'JUBILEE': 2.50,
      'UNGA': 0.40,
      'BAMBURI': -0.80,
      'TELKOM': 0.05,
      'CIC': -0.05,
      'KPLC': -0.05,
      'KAPCHORUA': 1.50,
      'STANLIB': 0.15,
      'ICDC': 0.05,
      'NMG': -0.30,
      'KUKU': 0.25
    };
    return changes[symbol] || 0.10;
  };

  const getNSEStockChangePercent = (symbol) => {
    const price = getNSEStockPrice(symbol);
    const change = getNSEStockChange(symbol);
    return ((change / price) * 100).toFixed(2);
  };

  const getNSEStockVolume = (symbol) => {
    const volumes = {
      'SCOM': 45200000,
      'EQTY': 12800000,
      'KCB': 8900000,
      'COOP': 5200000,
      'EABL': 2800000,
      'BAT': 1200000,
      'ABSA': 3800000,
      'NCBA': 2100000,
      'KENGEN': 4200000,
      'JUBILEE': 500000,
      'UNGA': 800000,
      'BAMBURI': 400000,
      'TELKOM': 1800000,
      'CIC': 300000,
      'KPLC': 2100000,
      'KAPCHORUA': 200000,
      'STANLIB': 300000,
      'ICDC': 200000,
      'NMG': 100000,
      'KUKU': 100000
    };
    return volumes[symbol] || 1000000;
  };

  const getNSEStockMarketCap = (symbol) => {
    const marketCaps = {
      'SCOM': '742.5B KES',
      'EQTY': '158.2B KES',
      'KCB': '89.4B KES',
      'COOP': '74.7B KES',
      'EABL': '47.3B KES',
      'BAT': '37.0B KES',
      'ABSA': '26.7B KES',
      'NCBA': '33.2B KES',
      'KENGEN': '20.8B KES',
      'JUBILEE': '18.5B KES',
      'UNGA': '3.2B KES',
      'BAMBURI': '7.0B KES',
      'TELKOM': '8.6B KES',
      'CIC': '2.9B KES',
      'KPLC': '7.4B KES',
      'KAPCHORUA': '1.8B KES',
      'STANLIB': '2.1B KES',
      'ICDC': '1.3B KES',
      'NMG': '3.7B KES',
      'KUKU': '0.6B KES'
    };
    return marketCaps[symbol] || '1.0B KES';
  };

  const getNSEStockDescription = (symbol) => {
    const descriptions = {
      'SCOM': 'Safaricom PLC is Kenya\'s leading telecommunications company, providing mobile, fixed-line, and internet services. The company is also a major player in mobile money through M-Pesa.',
      'EQTY': 'Equity Group Holdings Limited is one of East Africa\'s leading financial services groups, offering banking, insurance, and investment services across the region.',
      'KCB': 'Kenya Commercial Bank Group is one of Kenya\'s largest banks, providing comprehensive banking and financial services to individuals and businesses.',
      'EABL': 'East African Breweries Limited is the leading alcoholic beverages company in East Africa, producing and distributing beer, spirits, and other alcoholic drinks.',
      'BAT': 'British American Tobacco Kenya is a leading tobacco company in Kenya, manufacturing and distributing cigarettes and other tobacco products.'
    };
    return descriptions[symbol] || 'Leading company in its sector with strong market position and growth potential in the Kenyan market.';
  };

  const getNSEStockWebsite = (symbol) => {
    const websites = {
      'SCOM': 'https://www.safaricom.co.ke',
      'EQTY': 'https://www.equitybank.co.ke',
      'KCB': 'https://www.kcbbankgroup.com',
      'EABL': 'https://www.eabl.com',
      'BAT': 'https://www.bat.com'
    };
    return websites[symbol] || '#';
  };

  const generateNSEPriceHistory = (symbol) => {
    const basePrice = getNSEStockPrice(symbol);
    const history = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      history.push({
        timestamp: date.toISOString(),
        price: basePrice + (Math.random() - 0.5) * (basePrice * 0.1),
        volume: Math.floor(Math.random() * getNSEStockVolume(symbol) * 0.1) + getNSEStockVolume(symbol) * 0.05
      });
    }
    
    return history;
  };

  const generateOrderBook = (symbol) => {
    const price = getNSEStockPrice(symbol);
    return {
      bids: [
        { price: price - 0.05, amount: 100000, total: 100000 },
        { price: price - 0.10, amount: 150000, total: 250000 },
        { price: price - 0.15, amount: 200000, total: 450000 },
        { price: price - 0.20, amount: 120000, total: 570000 },
        { price: price - 0.25, amount: 180000, total: 750000 }
      ],
      asks: [
        { price: price + 0.05, amount: 80000, total: 80000 },
        { price: price + 0.10, amount: 120000, total: 200000 },
        { price: price + 0.15, amount: 150000, total: 350000 },
        { price: price + 0.20, amount: 100000, total: 450000 },
        { price: price + 0.25, amount: 160000, total: 610000 }
      ]
    };
  };

  const generateRecentTrades = (symbol) => {
    const price = getNSEStockPrice(symbol);
    return [
      { id: 1, price: price, amount: 50000, side: "buy", timestamp: new Date().toISOString() },
      { id: 2, price: price - 0.01, amount: 75000, side: "sell", timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: 3, price: price + 0.01, amount: 30000, side: "buy", timestamp: new Date(Date.now() - 120000).toISOString() },
      { id: 4, price: price, amount: 60000, side: "sell", timestamp: new Date(Date.now() - 180000).toISOString() },
      { id: 5, price: price - 0.01, amount: 40000, side: "buy", timestamp: new Date(Date.now() - 240000).toISOString() }
    ];
  };

  const generateTechnicalIndicators = (symbol) => {
    const price = getNSEStockPrice(symbol);
    return {
      rsi: Math.floor(Math.random() * 40) + 30,
      macd: (Math.random() - 0.5) * 2,
      bollinger_upper: price * 1.05,
      bollinger_middle: price,
      bollinger_lower: price * 0.95,
      moving_average_20: price * (0.98 + Math.random() * 0.04),
      moving_average_50: price * (0.95 + Math.random() * 0.1),
      moving_average_200: price * (0.9 + Math.random() * 0.2),
      support_levels: [price * 0.95, price * 0.90, price * 0.85],
      resistance_levels: [price * 1.05, price * 1.10, price * 1.15]
    };
  };

  const generateNSEStockNews = (symbol) => {
    return [
      {
        id: 1,
        title: `${symbol} Reports Strong Quarterly Performance`,
        summary: `The company exceeded analyst expectations with robust revenue growth and improved profitability.`,
        impact: "positive",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: "Business Daily"
      },
      {
        id: 2,
        title: `Market Analysis: ${symbol} Shows Bullish Momentum`,
        summary: `Technical indicators suggest continued upward momentum with strong institutional support.`,
        impact: "positive",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: "NSE News"
      },
      {
        id: 3,
        title: `${symbol} Announces Strategic Partnership`,
        summary: `The company has entered into a strategic partnership to expand its market reach.`,
        impact: "positive",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: "Capital FM"
      }
    ];
  };

  // Mock Market data
  useEffect(() => {
    const fetchMarket = async () => {
      setLoading(true);
      setTimeout(() => {
        // Check if it's an NSE stock
        const nseStocks = ['SCOM', 'EQTY', 'KCB', 'COOP', 'EABL', 'BAT', 'ABSA', 'NCBA', 'KENGEN', 'JUBILEE', 'UNGA', 'BAMBURI', 'TELKOM', 'CIC', 'KPLC', 'KAPCHORUA', 'STANLIB', 'ICDC', 'NMG', 'KUKU'];
        const isNSEStock = nseStocks.includes(id);
        
        if (isNSEStock) {
          // NSE Stock data
          setMarket({
            id: id,
            symbol: id,
            name: getNSEStockName(id),
            type: "Stock",
            category: getNSEStockSector(id),
            current_price: getNSEStockPrice(id),
            change_24h: getNSEStockChange(id),
            change_percentage_24h: getNSEStockChangePercent(id),
            high_24h: getNSEStockPrice(id) * 1.05,
            low_24h: getNSEStockPrice(id) * 0.95,
            volume_24h: getNSEStockVolume(id),
            market_cap: getNSEStockMarketCap(id),
            all_time_high: getNSEStockPrice(id) * 1.5,
            all_time_low: getNSEStockPrice(id) * 0.6,
            price_change_7d: getNSEStockChange(id) * 2,
            price_change_30d: getNSEStockChange(id) * 5,
            price_change_1y: getNSEStockChange(id) * 10,
            volatility: 0.75,
            spread: 0.01,
            pip_value: 1,
            margin_requirement: 5.0,
            leverage: 20,
            trading_hours: "9:00 AM - 3:00 PM EAT",
            session_active: "NSE",
            status: "active",
            is_tradable: true,
            is_featured: id === 'SCOM',
            description: getNSEStockDescription(id),
            base_currency: "KES",
            quote_currency: "KES",
            base_currency_name: "Kenyan Shilling",
            quote_currency_name: "Kenyan Shilling",
            exchange: "NSE",
            country: "Kenya",
            sector: getNSEStockSector(id),
            industry: getNSEStockSector(id),
            website: getNSEStockWebsite(id),
            created_at: "2000-01-01T00:00:00Z",
            updated_at: new Date().toISOString(),
            price_history: generateNSEPriceHistory(id),
            order_book: generateOrderBook(id),
            recent_trades: generateRecentTrades(id),
            technical_indicators: generateTechnicalIndicators(id),
            news: generateNSEStockNews(id)
          });
        } else {
          // Forex data (existing)
          setMarket({
            id: id,
            symbol: "EURUSD",
            name: "Euro/US Dollar",
            type: "Forex",
            category: "Major Pairs",
            current_price: 1.0920,
            change_24h: 0.0025,
            change_percentage_24h: 0.23,
            high_24h: 1.0945,
            low_24h: 1.0880,
            volume_24h: 1250000000,
            market_cap: null,
            circulating_supply: null,
            total_supply: null,
            max_supply: null,
            all_time_high: 1.6038,
            all_time_low: 0.8225,
            price_change_7d: 0.0085,
            price_change_30d: 0.0156,
            price_change_1y: 0.0234,
            volatility: 0.85,
            spread: 0.0001,
            pip_value: 10,
            margin_requirement: 3.33,
            leverage: 30,
            trading_hours: "24/7",
            session_active: "London",
            status: "active",
            is_tradable: true,
            is_featured: true,
            description: "The EUR/USD pair represents the exchange rate between the Euro and the US Dollar. It is the most traded currency pair in the world, accounting for approximately 28% of all forex transactions.",
            base_currency: "EUR",
            quote_currency: "USD",
            base_currency_name: "Euro",
            quote_currency_name: "US Dollar",
            exchange: "Forex",
            country: "International",
            sector: "Currency",
            industry: "Foreign Exchange",
            website: "https://www.ecb.europa.eu",
            whitepaper: null,
            github: null,
            twitter: null,
            telegram: null,
            discord: null,
            reddit: null,
            created_at: "1971-01-01T00:00:00Z",
            updated_at: "2024-01-15T14:20:00Z",
            price_history: [
            { timestamp: "2024-01-15T00:00:00Z", price: 1.0880, volume: 1250000000 },
            { timestamp: "2024-01-15T01:00:00Z", price: 1.0885, volume: 1180000000 },
            { timestamp: "2024-01-15T02:00:00Z", price: 1.0890, volume: 1120000000 },
            { timestamp: "2024-01-15T03:00:00Z", price: 1.0895, volume: 1080000000 },
            { timestamp: "2024-01-15T04:00:00Z", price: 1.0900, volume: 1050000000 },
            { timestamp: "2024-01-15T05:00:00Z", price: 1.0905, volume: 1020000000 },
            { timestamp: "2024-01-15T06:00:00Z", price: 1.0910, volume: 980000000 },
            { timestamp: "2024-01-15T07:00:00Z", price: 1.0915, volume: 950000000 },
            { timestamp: "2024-01-15T08:00:00Z", price: 1.0920, volume: 920000000 },
            { timestamp: "2024-01-15T09:00:00Z", price: 1.0925, volume: 890000000 },
            { timestamp: "2024-01-15T10:00:00Z", price: 1.0930, volume: 860000000 },
            { timestamp: "2024-01-15T11:00:00Z", price: 1.0935, volume: 830000000 },
            { timestamp: "2024-01-15T12:00:00Z", price: 1.0940, volume: 800000000 },
            { timestamp: "2024-01-15T13:00:00Z", price: 1.0945, volume: 770000000 },
            { timestamp: "2024-01-15T14:00:00Z", price: 1.0920, volume: 740000000 }
            ],
            order_book: {
              bids: [
                { price: 1.0919, amount: 1000000, total: 1000000 },
                { price: 1.0918, amount: 1500000, total: 2500000 },
                { price: 1.0917, amount: 2000000, total: 4500000 },
                { price: 1.0916, amount: 1200000, total: 5700000 },
                { price: 1.0915, amount: 1800000, total: 7500000 }
              ],
              asks: [
                { price: 1.0921, amount: 800000, total: 800000 },
                { price: 1.0922, amount: 1200000, total: 2000000 },
                { price: 1.0923, amount: 1500000, total: 3500000 },
                { price: 1.0924, amount: 1000000, total: 4500000 },
                { price: 1.0925, amount: 1600000, total: 6100000 }
              ]
            },
            recent_trades: [
              { id: 1, price: 1.0920, amount: 500000, side: "buy", timestamp: "2024-01-15T14:20:00Z" },
              { id: 2, price: 1.0919, amount: 750000, side: "sell", timestamp: "2024-01-15T14:19:45Z" },
              { id: 3, price: 1.0921, amount: 300000, side: "buy", timestamp: "2024-01-15T14:19:30Z" },
              { id: 4, price: 1.0920, amount: 600000, side: "sell", timestamp: "2024-01-15T14:19:15Z" },
              { id: 5, price: 1.0919, amount: 400000, side: "buy", timestamp: "2024-01-15T14:19:00Z" }
            ],
            technical_indicators: {
              rsi: 58.5,
              macd: 0.0008,
              bollinger_upper: 1.0950,
              bollinger_middle: 1.0920,
              bollinger_lower: 1.0890,
              moving_average_20: 1.0915,
              moving_average_50: 1.0900,
              moving_average_200: 1.0885,
              support_levels: [1.0880, 1.0860, 1.0840],
              resistance_levels: [1.0940, 1.0960, 1.0980]
            },
            news: [
              {
                id: 1,
                title: "ECB Maintains Interest Rates at 4.5%",
                summary: "The European Central Bank kept its main refinancing rate unchanged at 4.5% as expected.",
                impact: "positive",
                timestamp: "2024-01-15T13:45:00Z",
                source: "Reuters"
              },
              {
                id: 2,
                title: "US Inflation Data Shows Modest Increase",
                summary: "Consumer price index rose 0.2% in December, slightly above expectations.",
                impact: "negative",
                timestamp: "2024-01-15T13:30:00Z",
                source: "Bloomberg"
              }
            ]
          });
        }
        setLoading(false);
      }, 1000);
    };

    fetchMarket();
  }, [id]);

  // Simulate real-time updates
  useEffect(() => {
    if (market) {
      const interval = setInterval(() => {
        setRealTimeData({
          timestamp: new Date().toISOString(),
          price: market.current_price + (Math.random() - 0.5) * 0.001,
          volume: market.volume_24h + (Math.random() - 0.5) * 10000000,
          change_24h: market.change_24h + (Math.random() - 0.5) * 0.0001
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [market]);

  const timeframes = [
    { id: '1m', label: '1M', value: '1m' },
    { id: '5m', label: '5M', value: '5m' },
    { id: '15m', label: '15M', value: '15m' },
    { id: '1h', label: '1H', value: '1h' },
    { id: '4h', label: '4H', value: '4h' },
    { id: '1d', label: '1D', value: '1d' },
    { id: '1w', label: '1W', value: '1w' },
    { id: '1M', label: '1M', value: '1M' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Market Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The market you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/markets')}>
            Back to Markets
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
            onClick={() => navigate('/markets')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {market.status}
                </span>
                {market.is_featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Featured
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {market.type}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {market.symbol} - {market.name}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {market.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {market.exchange}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {market.trading_hours}
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  {market.session_active} Session
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Trade
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Price */}
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
                    Live Price
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {market?.base_currency === 'KES' ? 'KES ' : '$'}{realTimeData.price.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold flex items-center justify-center ${realTimeData.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {realTimeData.change_24h >= 0 ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                      {realTimeData.change_24h >= 0 ? '+' : ''}{realTimeData.change_24h.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">24h Change</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {market?.base_currency === 'KES' ? 'KES ' : '$'}{market.high_24h.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">24h High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {market?.base_currency === 'KES' ? 'KES ' : '$'}{market.low_24h.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">24h Low</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Price Chart
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {timeframes.map((tf) => (
                        <button
                          key={tf.id}
                          onClick={() => setSelectedTimeframe(tf.value)}
                          className={`px-3 py-1 text-sm rounded ${
                            selectedTimeframe === tf.value
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Price chart would be displayed here</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Timeframe: {selectedTimeframe}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Card>
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'price-history', label: 'Price History' },
                    { id: 'financials', label: 'Financials' },
                    { id: 'predictions', label: 'AI Predictions' },
                    { id: 'orderbook', label: 'Order Book' },
                    { id: 'trades', label: 'Recent Trades' },
                    { id: 'technical', label: 'Technical Analysis' },
                    { id: 'news', label: 'News' }
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
                          Market Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Symbol:</span>
                            <span className="font-medium">{market.symbol}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <span className="font-medium">{market.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                            <span className="font-medium">{market.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Exchange:</span>
                            <span className="font-medium">{market.exchange}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Trading Hours:</span>
                            <span className="font-medium">{market.trading_hours}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Active Session:</span>
                            <span className="font-medium">{market.session_active}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Trading Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Spread:</span>
                            <span className="font-medium">{market.spread}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Pip Value:</span>
                            <span className="font-medium">${market.pip_value}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Margin Requirement:</span>
                            <span className="font-medium">{market.margin_requirement}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Leverage:</span>
                            <span className="font-medium">1:{market.leverage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Volatility:</span>
                            <span className="font-medium">{market.volatility}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Volume 24h:</span>
                            <span className="font-medium">{market.volume_24h.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Price History
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {market.all_time_high.toFixed(4)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">All Time High</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {market.all_time_low.toFixed(4)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">All Time Low</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {market.price_change_1y >= 0 ? '+' : ''}{market.price_change_1y.toFixed(4)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">1 Year Change</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'orderbook' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Order Book
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-red-600 mb-3">Sell Orders (Asks)</h5>
                        <div className="space-y-2">
                          {market.order_book.asks.map((ask, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                              <span className="font-medium text-red-600">{ask.price.toFixed(4)}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{ask.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-green-600 mb-3">Buy Orders (Bids)</h5>
                        <div className="space-y-2">
                          {market.order_book.bids.map((bid, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                              <span className="font-medium text-green-600">{bid.price.toFixed(4)}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{bid.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'trades' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Recent Trades
                    </h4>
                    <div className="space-y-2">
                      {market.recent_trades.map((trade) => (
                        <div key={trade.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trade.side === 'buy' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {trade.side.toUpperCase()}
                            </span>
                            <span className="font-medium">{trade.price.toFixed(4)}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{trade.amount.toLocaleString()}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(trade.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === 'technical' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Technical Indicators
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Oscillators</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">RSI (14):</span>
                            <span className="font-medium">{market.technical_indicators.rsi}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">MACD:</span>
                            <span className="font-medium">{market.technical_indicators.macd}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Moving Averages</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">MA (20):</span>
                            <span className="font-medium">{market.technical_indicators.moving_average_20.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">MA (50):</span>
                            <span className="font-medium">{market.technical_indicators.moving_average_50.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">MA (200):</span>
                            <span className="font-medium">{market.technical_indicators.moving_average_200.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Support & Resistance</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="text-sm font-medium text-green-600 mb-2">Support Levels</h6>
                          <div className="space-y-1">
                            {market.technical_indicators.support_levels.map((level, index) => (
                              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                {level.toFixed(4)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium text-red-600 mb-2">Resistance Levels</h6>
                          <div className="space-y-1">
                            {market.technical_indicators.resistance_levels.map((level, index) => (
                              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                {level.toFixed(4)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'price-history' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Price History & Performance
                      </h4>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {market.price_change_7d >= 0 ? '+' : ''}{market.price_change_7d.toFixed(4)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">7 Day Change</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {market.price_change_30d >= 0 ? '+' : ''}{market.price_change_30d.toFixed(4)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">30 Day Change</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {market.price_change_1y >= 0 ? '+' : ''}{market.price_change_1y.toFixed(4)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">1 Year Change</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {market.volatility}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Volatility</div>
                      </div>
                    </div>

                    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">Price history chart would be displayed here</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Interactive candlestick chart with volume</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'financials' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Financial Summary
                      </h4>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Financial Report
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Market Metrics</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Current Price:</span>
                            <span className="font-medium">{market.current_price.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">24h Volume:</span>
                            <span className="font-medium">{market.volume_24h.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Market Cap:</span>
                            <span className="font-medium">$2.3B</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Spread:</span>
                            <span className="font-medium">{market.spread}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Trading Information</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Leverage:</span>
                            <span className="font-medium">1:{market.leverage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Margin Req.:</span>
                            <span className="font-medium">{market.margin_requirement}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Pip Value:</span>
                            <span className="font-medium">${market.pip_value}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Trading Hours:</span>
                            <span className="font-medium">{market.trading_hours}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Performance Analysis</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {((market.current_price / market.all_time_low - 1) * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">From ATH</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {((market.current_price / market.all_time_high - 1) * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">From ATL</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {market.volatility}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Risk Level</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'predictions' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        AI Trading Predictions
                      </h4>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Analysis
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Short-term Prediction (24h)</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Predicted Price:</span>
                            <span className="font-medium text-green-600">1.0950</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                            <span className="font-medium">87%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Direction:</span>
                            <span className="font-medium text-green-600">Bullish ↗</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Medium-term Prediction (7d)</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Predicted Price:</span>
                            <span className="font-medium text-blue-600">1.1020</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                            <span className="font-medium">74%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Direction:</span>
                            <span className="font-medium text-blue-600">Bullish ↗</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">AI Analysis Factors</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Technical Score:</span>
                            <span className="font-medium">8.5/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sentiment Score:</span>
                            <span className="font-medium">7.2/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Volume Analysis:</span>
                            <span className="font-medium">6.8/10</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Market Conditions:</span>
                            <span className="font-medium">Favorable</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                            <span className="font-medium text-yellow-600">Medium</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Recommended Action:</span>
                            <span className="font-medium text-green-600">Buy</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2">AI Recommendation</h6>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Based on technical analysis, market sentiment, and volume patterns, our AI model suggests a bullish outlook for {market.symbol} 
                        with a target price of 1.1020 in the next 7 days. Consider entering a long position with proper risk management.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTab === 'news' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Latest News
                    </h4>
                    <div className="space-y-4">
                      {market.news.map((article) => (
                        <div key={article.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">
                              {article.title}
                            </h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              article.impact === 'positive' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {article.impact}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Source: {article.source}</span>
                            <span>{new Date(article.timestamp).toLocaleString()}</span>
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
            {/* Quick Trade */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Trade
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order Type
                    </label>
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <option>Market Order</option>
                      <option>Limit Order</option>
                      <option>Stop Order</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Side
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="text-green-600 border-green-600">
                        Buy
                      </Button>
                      <Button variant="outline" className="text-red-600 border-red-600">
                        Sell
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <Button className="w-full">
                    Place Order
                  </Button>
                </div>
              </div>
            </Card>

            {/* Market Stats */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Market Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">24h Volume</span>
                    <span className="font-medium">{market.volume_24h.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Volatility</span>
                    <span className="font-medium">{market.volatility}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Spread</span>
                    <span className="font-medium">{market.spread}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Leverage</span>
                    <span className="font-medium">1:{market.leverage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Margin Req.</span>
                    <span className="font-medium">{market.margin_requirement}%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Price Alerts */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Price Alerts
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Bell className="h-4 w-4 mr-2" />
                    Set Price Alert
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Set Target Price
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
