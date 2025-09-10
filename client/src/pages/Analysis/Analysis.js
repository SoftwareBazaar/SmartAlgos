import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Heart, 
  Share2, 
  Star,
  Clock,
  Target,
  Brain,
  Cpu,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  Download,
  Bell,
  MessageCircle,
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
  Edit,
  Trash2,
  Copy,
  Send,
  Bookmark,
  ExternalLink,
  FileText,
  Image,
  Video,
  Music,
  File,
  Folder,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero,
  SignalOne,
  SignalTwo,
  SignalThree,
  SignalFour,
  SignalFive,
  Layers,
  Calculator,
  Percent,
  DollarSign
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const Analysis = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock analyses data
  const analyses = [
    {
      id: 1,
      title: "EUR/USD Technical Analysis",
      description: "Comprehensive technical analysis of EUR/USD pair with AI-powered insights",
      type: "Technical Analysis",
      category: "Forex",
      symbol: "EURUSD",
      timeframe: "1H",
      status: "active",
      is_featured: true,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T14:20:00Z",
      author: "AI Analysis Engine",
      views: 1250,
      likes: 89,
      shares: 23,
      accuracy_score: 87.5,
      confidence_level: "High",
      risk_level: "Medium",
      target_price: 1.0950,
      stop_loss: 1.0880,
      current_price: 1.0920,
      price_change: 0.0025,
      price_change_percentage: 0.23,
      ai_insights: {
        pattern_recognition: "Ascending Triangle",
        trend_direction: "Bullish",
        momentum_score: 8.5,
        volatility_score: 6.2,
        probability_of_success: 78
      },
      market_sentiment: {
        bullish: 65,
        bearish: 25,
        neutral: 10,
        fear_greed_index: 72
      }
    },
    {
      id: 2,
      title: "Bitcoin Market Sentiment Analysis",
      description: "Deep dive into Bitcoin market sentiment and social media analysis",
      type: "Sentiment Analysis",
      category: "Crypto",
      symbol: "BTCUSDT",
      timeframe: "4H",
      status: "active",
      is_featured: true,
      created_at: "2024-01-15T09:15:00Z",
      updated_at: "2024-01-15T13:45:00Z",
      author: "Crypto Analyst Pro",
      views: 2100,
      likes: 156,
      shares: 45,
      accuracy_score: 82.3,
      confidence_level: "High",
      risk_level: "High",
      target_price: 55000,
      stop_loss: 48000,
      current_price: 52000,
      price_change: 1500,
      price_change_percentage: 2.97,
      ai_insights: {
        pattern_recognition: "Bull Flag",
        trend_direction: "Bullish",
        momentum_score: 7.8,
        volatility_score: 8.5,
        probability_of_success: 72
      },
      market_sentiment: {
        bullish: 72,
        bearish: 18,
        neutral: 10,
        fear_greed_index: 68
      }
    },
    {
      id: 3,
      title: "Apple Stock Fundamental Analysis",
      description: "Comprehensive fundamental analysis of Apple Inc. with earnings projections",
      type: "Fundamental Analysis",
      category: "Stocks",
      symbol: "AAPL",
      timeframe: "1D",
      status: "active",
      is_featured: false,
      created_at: "2024-01-15T08:00:00Z",
      updated_at: "2024-01-15T12:30:00Z",
      author: "Equity Research Team",
      views: 890,
      likes: 67,
      shares: 19,
      accuracy_score: 91.2,
      confidence_level: "Very High",
      risk_level: "Low",
      target_price: 185,
      stop_loss: 170,
      current_price: 175,
      price_change: 2.5,
      price_change_percentage: 1.45,
      ai_insights: {
        pattern_recognition: "Cup and Handle",
        trend_direction: "Bullish",
        momentum_score: 8.2,
        volatility_score: 4.8,
        probability_of_success: 85
      },
      market_sentiment: {
        bullish: 78,
        bearish: 12,
        neutral: 10,
        fear_greed_index: 75
      }
    }
  ];

  const filters = [
    { id: 'all', name: 'All Analyses', count: analyses.length },
    { id: 'featured', name: 'Featured', count: analyses.filter(a => a.is_featured).length },
    { id: 'technical', name: 'Technical', count: analyses.filter(a => a.type === 'Technical Analysis').length },
    { id: 'fundamental', name: 'Fundamental', count: analyses.filter(a => a.type === 'Fundamental Analysis').length },
    { id: 'sentiment', name: 'Sentiment', count: analyses.filter(a => a.type === 'Sentiment Analysis').length },
    { id: 'high-accuracy', name: 'High Accuracy', count: analyses.filter(a => a.accuracy_score >= 85).length }
  ];

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'featured' && analysis.is_featured) ||
      (activeFilter === 'technical' && analysis.type === 'Technical Analysis') ||
      (activeFilter === 'fundamental' && analysis.type === 'Fundamental Analysis') ||
      (activeFilter === 'sentiment' && analysis.type === 'Sentiment Analysis') ||
      (activeFilter === 'high-accuracy' && analysis.accuracy_score >= 85);
    
    const matchesSearch = analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'Very High': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'High': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Analysis
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Advanced market analysis and insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Analysis
            </Button>
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
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search analyses..."
                  leftIcon={<Search className="h-4 w-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
                  Advanced Filters
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.name}
                  <span className="ml-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Analyses Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
      >
        {filteredAnalyses.map((analysis, index) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card hover className="h-full">
              <Card.Body>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {analysis.symbol}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {analysis.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {analysis.is_featured && (
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(analysis.confidence_level)}`}>
                      {analysis.confidence_level}
                    </span>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {analysis.title}
                </h4>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {analysis.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Current Price</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${analysis.current_price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Target Price</span>
                    <span className="text-sm font-medium text-green-600">
                      ${analysis.target_price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Accuracy Score</span>
                    <span className="text-sm font-medium text-blue-600">
                      {analysis.accuracy_score}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Success Probability</span>
                    <span className="text-sm font-medium text-green-600">
                      {analysis.ai_insights.probability_of_success}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.risk_level)}`}>
                      {analysis.risk_level} Risk
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {analysis.timeframe}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {analysis.views}
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {analysis.likes}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="primary" 
                    fullWidth
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Analysis
                  </Button>
                  <Button size="sm" variant="outline">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(analysis.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Brain className="h-3 w-3 mr-1" />
                    {analysis.author}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* No Results */}
      {filteredAnalyses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No analyses found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Analysis;
