import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  Shield,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Play,
  Pause
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const Signals = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('day-trading'); // 'day-trading' or 'swing-trading'
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // Simulated real-time data updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      // Simulate price updates
      setDayTradingSignal(prev => ({
        ...prev,
        currentPrice: prev.currentPrice + (Math.random() - 0.5) * 10,
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  // AI-Consolidated Day Trading Signal
  const [dayTradingSignal, setDayTradingSignal] = useState({
    action: 'BUY', // 'BUY', 'SELL', 'NO_SIGNAL', 'CHOPPY'
    symbol: 'XAUUSD',
    name: 'Gold',
    confidence: 87,
    currentPrice: 2045.50,
    entryPrice: 2046.00,
    stopLoss: 2038.00,
    takeProfit: 2058.00,
    riskReward: 1.5,
    timeframe: '15M',
    validFor: '2 hours',
    lastUpdate: new Date().toLocaleTimeString(),
    aiScore: 85,
    technicalScore: 88,
    fundamentalScore: 82,
    cotScore: 90,
    openInterestScore: 84,
    volumeScore: 86,
    marketSentiment: 'Bullish',
    volatility: 'Medium',
    trend: 'Uptrend',
    keyLevels: {
      resistance: [2050, 2055, 2060],
      support: [2040, 2035, 2030]
    }
  });

  // AI-Consolidated Swing Trading Signal
  const swingTradingSignal = {
    action: 'NO_SIGNAL', // 'BUY', 'SELL', 'NO_SIGNAL', 'CHOPPY'
    symbol: 'EURUSD',
    name: 'Euro/US Dollar',
    confidence: 45,
    currentPrice: 1.0850,
    entryPrice: null,
    stopLoss: null,
    takeProfit: null,
    riskReward: null,
    timeframe: '4H',
    validFor: '24 hours',
    lastUpdate: new Date().toLocaleTimeString(),
    aiScore: 42,
    technicalScore: 48,
    fundamentalScore: 40,
    cotScore: 45,
    openInterestScore: 43,
    volumeScore: 41,
    marketSentiment: 'Neutral',
    volatility: 'Low',
    trend: 'Sideways',
    reason: 'Market consolidating. Waiting for breakout confirmation.'
  };

  // Mock signal services data (kept for reference)
  const signalServices = [];

  const getSignalIcon = (action) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="h-8 w-8" />;
      case 'SELL':
        return <TrendingDown className="h-8 w-8" />;
      case 'NO_SIGNAL':
        return <Minus className="h-8 w-8" />;
      case 'CHOPPY':
        return <Activity className="h-8 w-8" />;
      default:
        return <AlertCircle className="h-8 w-8" />;
    }
  };

  const getSignalColor = (action) => {
    switch (action) {
      case 'BUY':
        return {
          bg: 'from-emerald-500 to-green-600',
          text: 'text-emerald-500',
          glow: 'shadow-emerald-500/50',
          border: 'border-emerald-500'
        };
      case 'SELL':
        return {
          bg: 'from-rose-500 to-red-600',
          text: 'text-rose-500',
          glow: 'shadow-rose-500/50',
          border: 'border-rose-500'
        };
      case 'NO_SIGNAL':
        return {
          bg: 'from-slate-500 to-gray-600',
          text: 'text-slate-500',
          glow: 'shadow-slate-500/50',
          border: 'border-slate-500'
        };
      case 'CHOPPY':
        return {
          bg: 'from-amber-500 to-orange-600',
          text: 'text-amber-500',
          glow: 'shadow-amber-500/50',
          border: 'border-amber-500'
        };
      default:
        return {
          bg: 'from-gray-500 to-gray-600',
          text: 'text-gray-500',
          glow: 'shadow-gray-500/50',
          border: 'border-gray-500'
        };
    }
  };

  const currentSignal = activeTab === 'day-trading' ? dayTradingSignal : swingTradingSignal;
  const colors = getSignalColor(currentSignal.action);

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Live Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            AI Trading Signals
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Real-time market analysis consolidated into actionable signals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isLive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {isLive ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </motion.div>

      {/* Trading Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <button
          onClick={() => setActiveTab('day-trading')}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
            activeTab === 'day-trading'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-5 w-5" />
            Day Trading
          </div>
        </button>
        <button
          onClick={() => setActiveTab('swing-trading')}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
            activeTab === 'swing-trading'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Swing Trading
          </div>
        </button>
      </motion.div>

      {/* Main Signal Card - The Decision Point */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} p-1 shadow-2xl ${colors.glow}`}>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-8">
              {/* Signal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: currentSignal.action === 'BUY' ? [0, 5, 0] : currentSignal.action === 'SELL' ? [0, -5, 0] : 0
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${colors.bg} text-white shadow-lg`}
                  >
                    {getSignalIcon(currentSignal.action)}
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {currentSignal.symbol}
                      </h2>
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        {currentSignal.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {currentSignal.timeframe}
                      </span>
                      <span>•</span>
                      <span>Updated {currentSignal.lastUpdate}</span>
                    </div>
                  </div>
                </div>

                {/* Auto Trade Toggle */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => setAutoTradeEnabled(!autoTradeEnabled)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      autoTradeEnabled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {autoTradeEnabled ? 'Auto Trade ON' : 'Auto Trade OFF'}
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Valid for {currentSignal.validFor}
                  </span>
                </div>
              </div>

              {/* Main Signal Decision */}
              <div className="mb-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-8 px-6 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className={`text-6xl font-black mb-3 ${colors.text}`}>
                    {currentSignal.action.replace('_', ' ')}
                  </div>
                  
                  {currentSignal.action === 'NO_SIGNAL' || currentSignal.action === 'CHOPPY' ? (
                    <div className="space-y-2">
                      <p className="text-xl text-gray-600 dark:text-gray-400">
                        {currentSignal.reason || 'No clear signal at this time'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Market Sentiment: {currentSignal.marketSentiment} • Volatility: {currentSignal.volatility}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-6 mt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Entry</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${currentSignal.entryPrice?.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Stop Loss</p>
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                          ${currentSignal.stopLoss?.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Take Profit</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          ${currentSignal.takeProfit?.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">R:R Ratio</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          1:{currentSignal.riskReward}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Confidence Meter */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        AI Confidence
                      </span>
                      <span className={`text-lg font-bold ${colors.text}`}>
                        {currentSignal.confidence}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentSignal.confidence}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className={`h-full bg-gradient-to-r ${colors.bg} rounded-full`}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              {(currentSignal.action === 'BUY' || currentSignal.action === 'SELL') && (
                <div className="flex gap-4 mb-8">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className={`bg-gradient-to-r ${colors.bg} hover:opacity-90`}
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Execute {currentSignal.action} Signal
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-48"
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Set Alert
                  </Button>
                </div>
              )}

              {/* AI Analysis Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <AnalysisScore
                  label="AI Score"
                  score={currentSignal.aiScore}
                  icon={<Zap className="h-4 w-4" />}
                />
                <AnalysisScore
                  label="Technical"
                  score={currentSignal.technicalScore}
                  icon={<BarChart3 className="h-4 w-4" />}
                />
                <AnalysisScore
                  label="Fundamental"
                  score={currentSignal.fundamentalScore}
                  icon={<Activity className="h-4 w-4" />}
                />
                <AnalysisScore
                  label="COT Data"
                  score={currentSignal.cotScore}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <AnalysisScore
                  label="Open Interest"
                  score={currentSignal.openInterestScore}
                  icon={<Target className="h-4 w-4" />}
                />
                <AnalysisScore
                  label="Volume"
                  score={currentSignal.volumeScore}
                  icon={<BarChart3 className="h-4 w-4" />}
                />
              </div>

              {/* Market Context */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Market Sentiment</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentSignal.marketSentiment}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Volatility</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentSignal.volatility}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trend</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentSignal.trend}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Levels (if available) */}
              {currentSignal.keyLevels && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Resistance Levels
                      </p>
                      <div className="space-y-2">
                        {currentSignal.keyLevels.resistance.map((level, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">R{i + 1}</span>
                            <span className="font-semibold text-rose-600 dark:text-rose-400">${level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Support Levels
                      </p>
                      <div className="space-y-2">
                        {currentSignal.keyLevels.support.map((level, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">S{i + 1}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">${level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <QuickStat
          label="Today's Signals"
          value="12"
          change="+3"
          positive={true}
          icon={<Zap className="h-5 w-5" />}
        />
        <QuickStat
          label="Win Rate"
          value="87%"
          change="+2%"
          positive={true}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <QuickStat
          label="Active Trades"
          value="5"
          change="-1"
          positive={false}
          icon={<Activity className="h-5 w-5" />}
        />
        <QuickStat
          label="Avg R:R"
          value="1:2.3"
          change="+0.2"
          positive={true}
          icon={<Target className="h-5 w-5" />}
        />
      </motion.div>
    </div>
  );
};

// Helper Components
const AnalysisScore = ({ label, score, icon }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl ${getScoreColor(score)}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium opacity-80">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{score}</div>
      <div className="mt-2 h-1 bg-white/30 dark:bg-black/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full bg-current rounded-full"
        />
      </div>
    </motion.div>
  );
};

const QuickStat = ({ label, value, change, positive, icon }) => {
  return (
    <Card>
      <Card.Body>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {positive ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              )}
              <span className={`text-sm font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {change}
              </span>
            </div>
          </div>
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Signals;
