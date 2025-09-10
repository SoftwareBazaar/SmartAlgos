import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
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
  Plus as PlusIcon,
  Search,
  Layers,
  Cpu,
  Brain,
  Lightbulb,
  TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon2,
  DollarSign,
  Percent,
  Calculator,
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
  SignalFive
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AnalysisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [showExportModal, setShowExportModal] = useState(false);

  // Mock Analysis data
  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setTimeout(() => {
        setAnalysis({
          id: id,
          title: "EUR/USD Technical Analysis",
          description: "Comprehensive technical analysis of EUR/USD pair with AI-powered insights and market sentiment analysis",
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
          analysis_summary: "The EUR/USD pair shows bullish momentum with strong support at 1.0880. Technical indicators suggest a potential breakout above 1.0950 resistance level.",
          key_findings: [
            "Strong bullish momentum indicated by RSI above 50",
            "Price breaking above 20-day moving average",
            "Volume increasing on upward moves",
            "Support level holding at 1.0880",
            "Resistance at 1.0950 needs to be broken for continuation"
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
            resistance_levels: [1.0940, 1.0960, 1.0980],
            fibonacci_levels: {
              "23.6%": 1.0895,
              "38.2%": 1.0910,
              "50%": 1.0925,
              "61.8%": 1.0940,
              "78.6%": 1.0955
            }
          },
          market_sentiment: {
            bullish: 65,
            bearish: 25,
            neutral: 10,
            fear_greed_index: 72,
            social_sentiment: "Positive",
            news_sentiment: "Neutral",
            analyst_consensus: "Buy"
          },
          ai_insights: {
            pattern_recognition: "Ascending Triangle",
            trend_direction: "Bullish",
            momentum_score: 8.5,
            volatility_score: 6.2,
            volume_analysis: "Above Average",
            market_structure: "Healthy",
            risk_reward_ratio: 2.8,
            probability_of_success: 78
          },
          fundamental_analysis: {
            economic_indicators: {
              gdp_growth: "Positive",
              inflation_rate: "Stable",
              interest_rates: "Neutral",
              employment_data: "Strong"
            },
            central_bank_policy: "Dovish",
            geopolitical_factors: "Neutral",
            market_liquidity: "High",
            correlation_analysis: {
              usd_index: -0.85,
              gold: 0.45,
              oil: 0.32,
              bonds: -0.67
            }
          },
          risk_assessment: {
            market_risk: "Medium",
            liquidity_risk: "Low",
            volatility_risk: "Medium",
            correlation_risk: "Low",
            overall_risk_score: 6.5,
            risk_factors: [
              "Central bank policy changes",
              "Economic data releases",
              "Geopolitical tensions",
              "Market volatility"
            ]
          },
          recommendations: [
            {
              action: "Buy",
              confidence: 85,
              reasoning: "Strong technical setup with bullish momentum",
              target: 1.0950,
              stop_loss: 1.0880,
              time_horizon: "1-3 days"
            },
            {
              action: "Hold",
              confidence: 70,
              reasoning: "Wait for confirmation above 1.0940",
              target: 1.0960,
              stop_loss: 1.0890,
              time_horizon: "3-7 days"
            }
          ],
          charts: [
            {
              id: 1,
              type: "Price Chart",
              description: "EUR/USD price action with technical indicators",
              url: "/charts/eurusd-price.png"
            },
            {
              id: 2,
              type: "Volume Analysis",
              description: "Volume profile and trading activity",
              url: "/charts/eurusd-volume.png"
            },
            {
              id: 3,
              type: "Sentiment Analysis",
              description: "Market sentiment and social media analysis",
              url: "/charts/eurusd-sentiment.png"
            }
          ],
          historical_performance: {
            accuracy_1m: 82.5,
            accuracy_3m: 85.2,
            accuracy_6m: 87.8,
            accuracy_1y: 89.1,
            total_analyses: 156,
            successful_predictions: 139,
            average_return: 2.3,
            max_drawdown: 5.2
          }
        });
        setLoading(false);
      }, 1000);
    };

    fetchAnalysis();
  }, [id]);

  // Simulate real-time updates
  useEffect(() => {
    if (analysis) {
      const interval = setInterval(() => {
        setRealTimeData({
          timestamp: new Date().toISOString(),
          current_price: analysis.current_price + (Math.random() - 0.5) * 0.001,
          confidence_level: analysis.confidence_level,
          market_sentiment: analysis.market_sentiment
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [analysis]);

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

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Analysis Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The analysis you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/analysis')}>
            Back to Analysis
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
            onClick={() => navigate('/analysis')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {analysis.status}
                </span>
                {analysis.is_featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Featured
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {analysis.type}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {analysis.confidence_level}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {analysis.title}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {analysis.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {analysis.views.toLocaleString()} views
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {analysis.likes} likes
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  {analysis.shares} shares
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(analysis.updated_at).toLocaleDateString()}
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
              <Button variant="outline" onClick={() => setShowExportModal(true)}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Analysis Stats */}
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
                    Live Analysis
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {realTimeData.current_price.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analysis.accuracy_score}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analysis.ai_insights.probability_of_success}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Probability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analysis.market_sentiment.fear_greed_index}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Fear & Greed Index</div>
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
                    { id: 'technical', label: 'Technical' },
                    { id: 'fundamental', label: 'Fundamental' },
                    { id: 'sentiment', label: 'Sentiment' },
                    { id: 'ai', label: 'AI Insights' },
                    { id: 'charts', label: 'Charts' }
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
                        Analysis Summary
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {analysis.analysis_summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Key Findings
                      </h4>
                      <div className="space-y-2">
                        {analysis.key_findings.map((finding, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300">{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Recommendations
                        </h4>
                        <div className="space-y-3">
                          {analysis.recommendations.map((rec, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  rec.action === 'Buy' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {rec.action}
                                </span>
                                <span className="text-sm font-medium">{rec.confidence}% confidence</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {rec.reasoning}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Target: {rec.target}</span>
                                <span>SL: {rec.stop_loss}</span>
                                <span>{rec.time_horizon}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Risk Assessment
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Overall Risk:</span>
                            <span className="font-medium">{analysis.risk_assessment.overall_risk_score}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Market Risk:</span>
                            <span className="font-medium">{analysis.risk_assessment.market_risk}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Liquidity Risk:</span>
                            <span className="font-medium">{analysis.risk_assessment.liquidity_risk}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Volatility Risk:</span>
                            <span className="font-medium">{analysis.risk_assessment.volatility_risk}</span>
                          </div>
                        </div>
                      </div>
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
                            <span className="font-medium">{analysis.technical_indicators.rsi}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">MACD:</span>
                            <span className="font-medium">{analysis.technical_indicators.macd}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Moving Averages</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">MA (20):</span>
                            <span className="font-medium">{analysis.technical_indicators.moving_average_20.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">MA (50):</span>
                            <span className="font-medium">{analysis.technical_indicators.moving_average_50.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">MA (200):</span>
                            <span className="font-medium">{analysis.technical_indicators.moving_average_200.toFixed(4)}</span>
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
                            {analysis.technical_indicators.support_levels.map((level, index) => (
                              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                {level.toFixed(4)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium text-red-600 mb-2">Resistance Levels</h6>
                          <div className="space-y-1">
                            {analysis.technical_indicators.resistance_levels.map((level, index) => (
                              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                {level.toFixed(4)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Fibonacci Levels</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(analysis.technical_indicators.fibonacci_levels).map(([level, value]) => (
                          <div key={level} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-xs text-gray-500 dark:text-gray-400">{level}</div>
                            <div className="font-medium">{value.toFixed(4)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'fundamental' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Fundamental Analysis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Economic Indicators</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">GDP Growth:</span>
                            <span className="font-medium text-green-600">{analysis.fundamental_analysis.economic_indicators.gdp_growth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Inflation Rate:</span>
                            <span className="font-medium text-blue-600">{analysis.fundamental_analysis.economic_indicators.inflation_rate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Interest Rates:</span>
                            <span className="font-medium text-yellow-600">{analysis.fundamental_analysis.economic_indicators.interest_rates}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Employment:</span>
                            <span className="font-medium text-green-600">{analysis.fundamental_analysis.economic_indicators.employment_data}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Market Factors</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Central Bank Policy:</span>
                            <span className="font-medium">{analysis.fundamental_analysis.central_bank_policy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Geopolitical:</span>
                            <span className="font-medium">{analysis.fundamental_analysis.geopolitical_factors}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Liquidity:</span>
                            <span className="font-medium text-green-600">{analysis.fundamental_analysis.market_liquidity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Correlation Analysis</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(analysis.fundamental_analysis.correlation_analysis).map(([asset, correlation]) => (
                          <div key={asset} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{asset}</div>
                            <div className={`font-medium ${correlation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {correlation >= 0 ? '+' : ''}{correlation.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'sentiment' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Market Sentiment
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Sentiment Breakdown</h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Bullish:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analysis.market_sentiment.bullish}%` }}></div>
                              </div>
                              <span className="font-medium">{analysis.market_sentiment.bullish}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Bearish:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${analysis.market_sentiment.bearish}%` }}></div>
                              </div>
                              <span className="font-medium">{analysis.market_sentiment.bearish}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Neutral:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${analysis.market_sentiment.neutral}%` }}></div>
                              </div>
                              <span className="font-medium">{analysis.market_sentiment.neutral}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Sentiment Sources</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Social Sentiment:</span>
                            <span className="font-medium text-green-600">{analysis.market_sentiment.social_sentiment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">News Sentiment:</span>
                            <span className="font-medium text-yellow-600">{analysis.market_sentiment.news_sentiment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Analyst Consensus:</span>
                            <span className="font-medium text-green-600">{analysis.market_sentiment.analyst_consensus}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'ai' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      AI-Powered Insights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Pattern Recognition</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Pattern:</span>
                            <span className="font-medium">{analysis.ai_insights.pattern_recognition}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Trend Direction:</span>
                            <span className="font-medium text-green-600">{analysis.ai_insights.trend_direction}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Market Structure:</span>
                            <span className="font-medium text-green-600">{analysis.ai_insights.market_structure}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">AI Scores</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Momentum Score:</span>
                            <span className="font-medium">{analysis.ai_insights.momentum_score}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Volatility Score:</span>
                            <span className="font-medium">{analysis.ai_insights.volatility_score}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Risk/Reward Ratio:</span>
                            <span className="font-medium">{analysis.ai_insights.risk_reward_ratio}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Volume Analysis</h5>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {analysis.ai_insights.volume_analysis}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Trading volume compared to historical average
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'charts' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Analysis Charts
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysis.charts.map((chart) => (
                        <div key={chart.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {chart.type}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {chart.description}
                          </p>
                          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 dark:text-gray-400">Chart would be displayed here</p>
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
                    <Target className="h-4 w-4 mr-2" />
                    Set Price Alert
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Bell className="h-4 w-4 mr-2" />
                    Follow Analysis
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Analysis
                  </Button>
                </div>
              </div>
            </Card>

            {/* Analysis Stats */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Analysis Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Accuracy Score</span>
                    <span className="font-medium text-green-600">{analysis.accuracy_score}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Confidence Level</span>
                    <span className="font-medium text-blue-600">{analysis.confidence_level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
                    <span className="font-medium text-yellow-600">{analysis.risk_level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Success Probability</span>
                    <span className="font-medium text-green-600">{analysis.ai_insights.probability_of_success}%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Historical Performance */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Historical Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">1 Month</span>
                    <span className="font-medium text-green-600">{analysis.historical_performance.accuracy_1m}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">3 Months</span>
                    <span className="font-medium text-green-600">{analysis.historical_performance.accuracy_3m}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">6 Months</span>
                    <span className="font-medium text-green-600">{analysis.historical_performance.accuracy_6m}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">1 Year</span>
                    <span className="font-medium text-green-600">{analysis.historical_performance.accuracy_1y}%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Author Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Analysis Author
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {analysis.author}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      AI Analysis Engine
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Export Analysis
            </h3>
            
            <div className="space-y-3">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
              <Button variant="outline" className="w-full">
                <Image className="h-4 w-4 mr-2" />
                Export Charts
              </Button>
              <Button variant="outline" className="w-full">
                <File className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowExportModal(false)}
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

export default AnalysisDetail;
