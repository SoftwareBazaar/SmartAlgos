import React, { useState } from 'react';
import { 
  Bot, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Clock, 
  DollarSign, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Bitcoin,
  Sparkles,
  Zap,
  Shield,
  TrendingDown,
  Activity,
  User,
  Mail,
  Phone,
  Building,
  Globe,
  Calendar,
  Check
} from 'lucide-react';
import FloatingChatButton from '../../components/FloatingChatButton';
import CryptoPayment from '../../components/CryptoPayment';

const CreateEA = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    eaName: '',
    description: '',
    tradingExperience: '',
    
    // EA Type
    eaType: '',
    strategy: '',
    
    // Technical Preferences
    indicators: [],
    timeframes: [],
    riskLevel: '',
    
    // Statistical Arbitrage
    statArb: {
      enabled: false,
      pairs: [],
      correlation: '',
      meanReversion: false,
      momentum: false
    },
    
    // Quantitative
    quant: {
      enabled: false,
      algorithms: [],
      dataFeeds: [],
      backtesting: false,
      optimization: false
    },
    
    // IDEA (Investment Decision Enhancement Algorithm)
    idea: {
      enabled: false,
      sentiment: false,
      news: false,
      social: false,
      macro: false
    },
    
    // Timeline
    timeline: {
      urgency: '',
      startDate: '',
      deliveryDate: '',
      milestones: []
    },
    
    // Budget
    budget: {
      range: '',
      currency: 'USD',
      paymentTerms: '',
      additional: ''
    },
    
    // Contact Information
    contact: {
      name: '',
      email: '',
      phone: '',
      company: '',
      timezone: ''
    }
  });

  const eaTypes = [
    { value: 'scalping', label: 'Scalping EA', description: 'High-frequency trading with small profits' },
    { value: 'swing', label: 'Swing Trading EA', description: 'Medium-term position holding' },
    { value: 'trend', label: 'Trend Following EA', description: 'Follows market trends' },
    { value: 'mean-reversion', label: 'Mean Reversion EA', description: 'Trades price reversals' },
    { value: 'arbitrage', label: 'Arbitrage EA', description: 'Exploits price differences' },
    { value: 'grid', label: 'Grid Trading EA', description: 'Grid-based trading system' },
    { value: 'martingale', label: 'Martingale EA', description: 'Progressive position sizing' },
    { value: 'custom', label: 'Custom Strategy', description: 'Bespoke trading algorithm' }
  ];

  const strategies = [
    { value: 'momentum', label: 'Momentum Strategy' },
    { value: 'contrarian', label: 'Contrarian Strategy' },
    { value: 'breakout', label: 'Breakout Strategy' },
    { value: 'support-resistance', label: 'Support/Resistance' },
    { value: 'fibonacci', label: 'Fibonacci Trading' },
    { value: 'ichimoku', label: 'Ichimoku Cloud' },
    { value: 'multi-timeframe', label: 'Multi-Timeframe' },
    { value: 'news-based', label: 'News-Based Trading' }
  ];

  const indicators = [
    { value: 'sma', label: 'Simple Moving Average (SMA)' },
    { value: 'ema', label: 'Exponential Moving Average (EMA)' },
    { value: 'rsi', label: 'Relative Strength Index (RSI)' },
    { value: 'macd', label: 'MACD' },
    { value: 'bollinger', label: 'Bollinger Bands' },
    { value: 'stochastic', label: 'Stochastic Oscillator' },
    { value: 'atr', label: 'Average True Range (ATR)' },
    { value: 'adx', label: 'Average Directional Index (ADX)' },
    { value: 'cci', label: 'Commodity Channel Index (CCI)' },
    { value: 'williams', label: 'Williams %R' },
    { value: 'parabolic', label: 'Parabolic SAR' },
    { value: 'ichimoku', label: 'Ichimoku Cloud' },
    { value: 'fibonacci', label: 'Fibonacci Retracements' },
    { value: 'pivot', label: 'Pivot Points' },
    { value: 'volume', label: 'Volume Indicators' },
    { value: 'custom', label: 'Custom Indicator' }
  ];

  const timeframes = [
    { value: 'm1', label: '1 Minute' },
    { value: 'm5', label: '5 Minutes' },
    { value: 'm15', label: '15 Minutes' },
    { value: 'm30', label: '30 Minutes' },
    { value: 'h1', label: '1 Hour' },
    { value: 'h4', label: '4 Hours' },
    { value: 'd1', label: 'Daily' },
    { value: 'w1', label: 'Weekly' },
    { value: 'mn1', label: 'Monthly' }
  ];

  const riskLevels = [
    { value: 'conservative', label: 'Conservative', description: 'Low risk, steady returns' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced risk and return' },
    { value: 'aggressive', label: 'Aggressive', description: 'High risk, high potential returns' },
    { value: 'custom', label: 'Custom', description: 'Specify your own risk parameters' }
  ];

  const quantAlgorithms = [
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'neural-networks', label: 'Neural Networks' },
    { value: 'genetic-algorithm', label: 'Genetic Algorithm' },
    { value: 'reinforcement-learning', label: 'Reinforcement Learning' },
    { value: 'deep-learning', label: 'Deep Learning' },
    { value: 'ensemble-methods', label: 'Ensemble Methods' },
    { value: 'time-series', label: 'Time Series Analysis' },
    { value: 'pattern-recognition', label: 'Pattern Recognition' }
  ];

  const dataFeeds = [
    { value: 'tick-data', label: 'Tick Data' },
    { value: 'ohlc', label: 'OHLC Data' },
    { value: 'volume', label: 'Volume Data' },
    { value: 'order-book', label: 'Order Book Data' },
    { value: 'news', label: 'News Feed' },
    { value: 'economic', label: 'Economic Calendar' },
    { value: 'sentiment', label: 'Sentiment Data' },
    { value: 'social', label: 'Social Media Data' }
  ];

  const budgetRanges = [
    { value: 'under-1k', label: 'Under $1,000' },
    { value: '1k-5k', label: '$1,000 - $5,000' },
    { value: '5k-10k', label: '$5,000 - $10,000' },
    { value: '10k-25k', label: '$10,000 - $25,000' },
    { value: '25k-50k', label: '$25,000 - $50,000' },
    { value: '50k-100k', label: '$50,000 - $100,000' },
    { value: 'over-100k', label: 'Over $100,000' },
    { value: 'custom', label: 'Custom Budget' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!formData.eaName || !formData.description || !formData.eaType || !formData.strategy) {
        alert('Please fill in all required fields');
        return;
      }

      // Send the data to the backend
      const response = await fetch('/api/eas/custom-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test_token'}`
        },
        body: JSON.stringify({
          ...formData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          estimatedPrice: calculateEstimatedPrice(formData)
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('EA creation request submitted successfully! Our team will contact you within 24 hours.');
        // Reset form or redirect
        setCurrentStep(1);
        setFormData({
          eaName: '',
          description: '',
          tradingExperience: '',
          eaType: '',
          strategy: '',
          indicators: [],
          timeframes: [],
          riskLevel: '',
          statArb: { enabled: false, pairs: [], correlation: '', meanReversion: false, momentum: false },
          quant: { enabled: false, algorithms: [], dataFeeds: [], backtesting: false, optimization: false },
          idea: { enabled: false, sentiment: false, news: false, social: false, macro: false },
          timeline: { urgency: '', startDate: '', deliveryDate: '', milestones: [] },
          budget: { range: '', currency: 'USD', paymentTerms: '', additional: '' },
          contact: { name: '', email: '', phone: '', company: '', timezone: '' }
        });
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit request. Please try again or contact support.');
    }
  };

  const calculateEstimatedPrice = (data) => {
    let basePrice = 500;
    
    // Add pricing based on complexity
    if (data.statArb.enabled) basePrice += 300;
    if (data.quant.enabled) basePrice += 500;
    if (data.idea.enabled) basePrice += 200;
    
    // Add pricing based on urgency
    if (data.timeline.urgency === 'asap') basePrice *= 1.5;
    else if (data.timeline.urgency === 'urgent') basePrice *= 1.3;
    
    const finalPrice = Math.round(basePrice);
    setEstimatedPrice(finalPrice);
    return finalPrice;
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Let's Create Your Dream EA
        </h3>
        <p className="text-blue-200 text-sm">
          Tell us about your trading vision
        </p>
      </div>

      {/* EA Name Input with Icon */}
      <div className="group">
        <label className="block text-sm font-semibold text-blue-200 mb-3 flex items-center">
          <Bot className="w-4 h-4 mr-2" />
          What should we call your EA? *
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.eaName}
            onChange={(e) => handleInputChange('eaName', e.target.value)}
            className="w-full px-4 py-4 border-2 border-blue-400/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-700/50 text-white placeholder-gray-400 transition-all duration-200 hover:border-blue-400/50"
            placeholder="e.g., My Profit Master EA"
            required
          />
          {formData.eaName && (
            <Check className="absolute right-4 top-4 w-5 h-5 text-green-400" />
          )}
        </div>
        <p className="mt-2 text-xs text-gray-400">Choose a memorable name for your trading bot</p>
      </div>

      {/* Trading Experience - Card Style Selection */}
      <div>
        <label className="block text-sm font-semibold text-blue-200 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Your Trading Experience *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'beginner', label: 'Beginner', subtitle: '0-1 years', icon: '🌱' },
            { value: 'intermediate', label: 'Intermediate', subtitle: '1-3 years', icon: '📈' },
            { value: 'advanced', label: 'Advanced', subtitle: '3-5 years', icon: '🚀' },
            { value: 'expert', label: 'Expert', subtitle: '5+ years', icon: '👑' }
          ].map((exp) => (
            <button
              key={exp.value}
              type="button"
              onClick={() => handleInputChange('tradingExperience', exp.value)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                formData.tradingExperience === exp.value
                  ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600 bg-gray-700/30 hover:border-blue-400/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="text-2xl mb-1">{exp.icon}</div>
              <div className="text-sm font-semibold text-white">{exp.label}</div>
              <div className="text-xs text-gray-400">{exp.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Description with Character Counter */}
      <div>
        <label className="block text-sm font-semibold text-blue-200 mb-3 flex items-center justify-between">
          <span className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Tell us about your trading goals *
          </span>
          <span className="text-xs text-gray-400">
            {formData.description.length}/500
          </span>
        </label>
        <div className="relative">
          <textarea
            value={formData.description}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                handleInputChange('description', e.target.value);
              }
            }}
            rows={4}
            className="w-full px-4 py-4 border-2 border-blue-400/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-700/50 text-white placeholder-gray-400 transition-all duration-200 hover:border-blue-400/50 resize-none"
            placeholder="I want to create an EA that trades EUR/USD using momentum strategies with moderate risk..."
            required
          />
        </div>
        <div className="mt-2 flex items-start space-x-2 text-xs text-blue-300 bg-blue-500/10 p-3 rounded-lg">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Be specific! The more details you provide, the better we can tailor your EA to your needs.</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Choose Your Strategy
        </h3>
        <p className="text-blue-200 text-sm">
          Select the trading approach that fits your style
        </p>
      </div>

      {/* EA Type Selection - Grid Cards */}
      <div>
        <label className="block text-sm font-semibold text-blue-200 mb-4 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          EA Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eaTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleInputChange('eaType', type.value)}
              className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                formData.eaType === type.value
                  ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600 bg-gray-700/30 hover:border-blue-400/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-bold text-white">{type.label}</div>
                {formData.eaType === type.value && (
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Selection - Pills */}
      <div>
        <label className="block text-sm font-semibold text-blue-200 mb-4 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Trading Strategy *
        </label>
        <div className="flex flex-wrap gap-2">
          {strategies.map((strategy) => (
            <button
              key={strategy.value}
              type="button"
              onClick={() => handleInputChange('strategy', strategy.value)}
              className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                formData.strategy === strategy.value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-700/50 text-gray-300 border-2 border-gray-600 hover:border-blue-400/50 hover:bg-gray-700'
              }`}
            >
              {formData.strategy === strategy.value && (
                <Check className="w-4 h-4 inline mr-1" />
              )}
              {strategy.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      {formData.eaType && formData.strategy && (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-2 border-green-500/30 rounded-xl p-4 flex items-start space-x-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Perfect Combination!</p>
            <p className="text-xs text-gray-300">
              Your {eaTypes.find(t => t.value === formData.eaType)?.label} with {strategies.find(s => s.value === formData.strategy)?.label} is a powerful setup.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Technical Setup
        </h3>
        <p className="text-blue-200 text-sm">
          Configure your EA's trading parameters
        </p>
      </div>

      {/* Indicators - Pill Selection */}
      <div>
        <label className="block text-sm font-semibold text-blue-200 mb-4 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Select Indicators * 
          <span className="ml-auto text-xs text-gray-400">
            {formData.indicators.length} selected
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {indicators.map(indicator => (
            <button
              key={indicator.value}
              type="button"
              onClick={() => handleArrayChange('indicators', indicator.value, !formData.indicators.includes(indicator.value))}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                formData.indicators.includes(indicator.value)
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gray-700/50 text-gray-300 border-2 border-gray-600 hover:border-green-400/50 hover:bg-gray-700'
              }`}
            >
              {formData.indicators.includes(indicator.value) && (
                <Check className="w-3 h-3 inline mr-1" />
              )}
              {indicator.label}
            </button>
          ))}
        </div>
        {formData.indicators.length === 0 && (
          <p className="mt-3 text-xs text-yellow-400 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Please select at least one indicator
          </p>
        )}
      </div>

      {/* Timeframes - Grid Selection */}
      <div>
        <label className="block text-sm font-semibold text-blue-200 mb-4 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Timeframes *
          <span className="ml-auto text-xs text-gray-400">
            {formData.timeframes.length} selected
          </span>
        </label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {timeframes.map(timeframe => (
            <button
              key={timeframe.value}
              type="button"
              onClick={() => handleArrayChange('timeframes', timeframe.value, !formData.timeframes.includes(timeframe.value))}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.timeframes.includes(timeframe.value)
                  ? 'border-teal-500 bg-teal-500/20 shadow-lg shadow-teal-500/20'
                  : 'border-gray-600 bg-gray-700/30 hover:border-teal-400/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="text-sm font-bold text-white text-center">{timeframe.label}</div>
              {formData.timeframes.includes(timeframe.value) && (
                <Check className="w-4 h-4 text-teal-400 mx-auto mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Level - Enhanced Cards */}
      <div>
        <label className="block text-sm font-semibold text-blue-200 mb-4 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          Risk Level *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskLevels.map((risk) => {
            const riskIcons = {
              conservative: '🛡️',
              moderate: '⚖️',
              aggressive: '🚀',
              custom: '⚙️'
            };
            return (
              <button
                key={risk.value}
                type="button"
                onClick={() => handleInputChange('riskLevel', risk.value)}
                className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.riskLevel === risk.value
                    ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                    : 'border-gray-600 bg-gray-700/30 hover:border-blue-400/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{riskIcons[risk.value]}</span>
                    <div className="text-sm font-bold text-white">{risk.label}</div>
                  </div>
                  {formData.riskLevel === risk.value && (
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <p className="text-xs text-gray-400">{risk.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Advanced Features
        </h3>
        
        {/* Statistical Arbitrage */}
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={formData.statArb.enabled}
              onChange={(e) => handleNestedInputChange('statArb', 'enabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <h4 className="ml-2 text-md font-medium text-gray-900 dark:text-gray-100">
              Statistical Arbitrage
            </h4>
          </div>
          {formData.statArb.enabled && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency Pairs
                </label>
                <input
                  type="text"
                  placeholder="e.g., EUR/USD, GBP/USD, AUD/USD"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.statArb.meanReversion}
                    onChange={(e) => handleNestedInputChange('statArb', 'meanReversion', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Mean Reversion</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.statArb.momentum}
                    onChange={(e) => handleNestedInputChange('statArb', 'momentum', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Momentum</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Quantitative */}
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={formData.quant.enabled}
              onChange={(e) => handleNestedInputChange('quant', 'enabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <h4 className="ml-2 text-md font-medium text-gray-900 dark:text-gray-100">
              Quantitative Analysis
            </h4>
          </div>
          {formData.quant.enabled && (
            <div className="ml-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Algorithms
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {quantAlgorithms.map(algo => (
                    <label key={algo.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.quant.algorithms.includes(algo.value)}
                        onChange={(e) => {
                          const algorithms = formData.quant.algorithms;
                          const newAlgorithms = e.target.checked 
                            ? [...algorithms, algo.value]
                            : algorithms.filter(a => a !== algo.value);
                          handleNestedInputChange('quant', 'algorithms', newAlgorithms);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {algo.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Feeds
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {dataFeeds.map(feed => (
                    <label key={feed.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.quant.dataFeeds.includes(feed.value)}
                        onChange={(e) => {
                          const feeds = formData.quant.dataFeeds;
                          const newFeeds = e.target.checked 
                            ? [...feeds, feed.value]
                            : feeds.filter(f => f !== feed.value);
                          handleNestedInputChange('quant', 'dataFeeds', newFeeds);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {feed.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* IDEA */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={formData.idea.enabled}
              onChange={(e) => handleNestedInputChange('idea', 'enabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <h4 className="ml-2 text-md font-medium text-gray-900 dark:text-gray-100">
              IDEA (Investment Decision Enhancement Algorithm)
            </h4>
          </div>
          {formData.idea.enabled && (
            <div className="ml-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.idea.sentiment}
                  onChange={(e) => handleNestedInputChange('idea', 'sentiment', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Sentiment Analysis</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.idea.news}
                  onChange={(e) => handleNestedInputChange('idea', 'news', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">News Analysis</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.idea.social}
                  onChange={(e) => handleNestedInputChange('idea', 'social', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Social Media</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.idea.macro}
                  onChange={(e) => handleNestedInputChange('idea', 'macro', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Macro Economics</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Timeline & Budget
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Timeline
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Urgency *
                </label>
                <select
                  value={formData.timeline.urgency}
                  onChange={(e) => handleNestedInputChange('timeline', 'urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  required
                >
                  <option value="">Select urgency</option>
                  <option value="asap">ASAP (1-2 weeks)</option>
                  <option value="urgent">Urgent (2-4 weeks)</option>
                  <option value="normal">Normal (1-2 months)</option>
                  <option value="flexible">Flexible (2-3 months)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Start Date
                </label>
                <input
                  type="date"
                  value={formData.timeline.startDate}
                  onChange={(e) => handleNestedInputChange('timeline', 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.timeline.deliveryDate}
                  onChange={(e) => handleNestedInputChange('timeline', 'deliveryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Budget
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Budget Range *
                </label>
                <select
                  value={formData.budget.range}
                  onChange={(e) => handleNestedInputChange('budget', 'range', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-400/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-700 text-white"
                  required
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                {formData.budget.range === 'custom' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Custom Budget Amount
                    </label>
                    <input
                      type="number"
                      placeholder="Enter your custom budget amount"
                      className="w-full px-3 py-2 border border-blue-400/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={formData.budget.currency}
                  onChange={(e) => handleNestedInputChange('budget', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="KES">KES</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Terms
                </label>
                <select
                  value={formData.budget.paymentTerms}
                  onChange={(e) => handleNestedInputChange('budget', 'paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">Select payment terms</option>
                  <option value="full-upfront">Full payment upfront</option>
                  <option value="50-50">50% upfront, 50% on delivery</option>
                  <option value="milestone">Milestone-based payments</option>
                  <option value="monthly">Monthly payments</option>
                  <option value="performance">Performance-based</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-blue-200 mb-2">
            Additional Budget Information
          </label>
          <textarea
            value={formData.budget.additional}
            onChange={(e) => handleNestedInputChange('budget', 'additional', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-blue-400/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            placeholder="Any additional budget considerations, special requirements, or constraints..."
          />
        </div>

        {/* Crypto Payment Option */}
        <div className="mt-6 p-4 border border-blue-500/30 rounded-lg bg-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white flex items-center">
              <Bitcoin className="w-5 h-5 mr-2 text-orange-500" />
              Crypto Payment Option
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowCryptoPayment(!showCryptoPayment);
                if (!showCryptoPayment) {
                  calculateEstimatedPrice(formData);
                }
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {showCryptoPayment ? 'Hide' : 'Show'} Crypto Payment
            </button>
          </div>
          
          {showCryptoPayment && (
            <div className="space-y-4">
              <div className="bg-gray-600/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Estimated Price:</span>
                  <span className="text-white font-semibold text-lg">
                    ${estimatedPrice || calculateEstimatedPrice(formData)}
                  </span>
                </div>
                <p className="text-sm text-blue-300">
                  Pay securely with Bitcoin, Ethereum, USDT, or USDC. Your payment will be confirmed automatically.
                </p>
              </div>
              
              <CryptoPayment
                amount={estimatedPrice || calculateEstimatedPrice(formData)}
                currency="USD"
                productType="custom_ea"
                productId={`custom-ea-${Date.now()}`}
                onPaymentSuccess={(data) => {
                  alert('Payment confirmed! Your custom EA request has been submitted and is now being processed.');
                  setShowCryptoPayment(false);
                }}
                onPaymentError={(error) => {
                  alert(`Payment error: ${error}`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Almost There!
        </h3>
        <p className="text-blue-200 text-sm">
          Let's get your contact details to finalize your EA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="group md:col-span-2">
          <label className="block text-sm font-semibold text-blue-200 mb-3 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.contact.name}
              onChange={(e) => handleNestedInputChange('contact', 'name', e.target.value)}
              className="w-full px-4 py-4 pl-12 border-2 border-blue-400/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-700/50 text-white placeholder-gray-400 transition-all duration-200 hover:border-blue-400/50"
              placeholder="John Doe"
              required
            />
            <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            {formData.contact.name && (
              <Check className="absolute right-4 top-4 w-5 h-5 text-green-400" />
            )}
          </div>
        </div>

        {/* Email */}
        <div className="group">
          <label className="block text-sm font-semibold text-blue-200 mb-3 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.contact.email}
              onChange={(e) => handleNestedInputChange('contact', 'email', e.target.value)}
              className="w-full px-4 py-4 pl-12 border-2 border-blue-400/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-700/50 text-white placeholder-gray-400 transition-all duration-200 hover:border-blue-400/50"
              placeholder="john@example.com"
              required
            />
            <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            {formData.contact.email && formData.contact.email.includes('@') && (
              <Check className="absolute right-4 top-4 w-5 h-5 text-green-400" />
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="group">
          <label className="block text-sm font-semibold text-blue-200 mb-3 flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.contact.phone}
              onChange={(e) => handleNestedInputChange('contact', 'phone', e.target.value)}
              className="w-full px-4 py-4 pl-12 border-2 border-blue-400/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-700/50 text-white placeholder-gray-400 transition-all duration-200 hover:border-blue-400/50"
              placeholder="+1 (555) 123-4567"
            />
            <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Company */}
        <div className="group">
          <label className="block text-sm font-semibold text-blue-200 mb-3 flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Company/Organization
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.contact.company}
              onChange={(e) => handleNestedInputChange('contact', 'company', e.target.value)}
              className="w-full px-4 py-4 pl-12 border-2 border-blue-400/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-700/50 text-white placeholder-gray-400 transition-all duration-200 hover:border-blue-400/50"
              placeholder="Your Company Name"
            />
            <Building className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Timezone */}
        <div className="group">
          <label className="block text-sm font-semibold text-blue-200 mb-3 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Timezone
          </label>
          <div className="relative">
            <select
              value={formData.contact.timezone}
              onChange={(e) => handleNestedInputChange('contact', 'timezone', e.target.value)}
              className="w-full px-4 py-4 pl-12 border-2 border-blue-400/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-700/50 text-white transition-all duration-200 hover:border-blue-400/50 appearance-none"
            >
              <option value="">Select timezone</option>
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time (EST)</option>
              <option value="PST">Pacific Time (PST)</option>
              <option value="GMT">Greenwich Mean Time (GMT)</option>
              <option value="EAT">East Africa Time (EAT)</option>
              <option value="CET">Central European Time (CET)</option>
              <option value="JST">Japan Standard Time (JST)</option>
            </select>
            <Globe className="absolute left-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-xl p-4 flex items-center space-x-3">
        <Shield className="w-6 h-6 text-blue-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white mb-1">🔒 Your information is secure</p>
          <p className="text-xs text-gray-300">
            We use industry-standard encryption to protect your data and will never share it with third parties.
          </p>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Basic Information', icon: Info },
    { number: 2, title: 'EA Type & Strategy', icon: Bot },
    { number: 3, title: 'Technical Preferences', icon: Settings },
    { number: 4, title: 'Advanced Features', icon: TrendingUp },
    { number: 5, title: 'Timeline & Budget', icon: DollarSign },
    { number: 6, title: 'Contact Information', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl border border-blue-500/30">
          {/* Header */}
          <div className="px-6 py-4 border-b border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Bot className="w-8 h-8 mr-3 text-blue-400" />
                  Create Custom EA
                </h1>
                <p className="text-blue-200 mt-1">
                  Specify your requirements for a custom Expert Advisor
                </p>
              </div>
              <div className="text-sm text-blue-300">
                Step {currentStep} of 6
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-blue-500/30">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive 
                        ? 'border-blue-400 bg-blue-500 text-white' 
                        : isCompleted 
                        ? 'border-green-400 bg-green-500 text-white'
                        : 'border-gray-500 text-gray-400'
                    }`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <div className={`text-sm font-medium ${
                        isActive 
                          ? 'text-blue-400' 
                          : isCompleted 
                          ? 'text-green-400'
                          : 'text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-400' : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-blue-500/30">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`group flex items-center px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  currentStep === 1
                    ? 'text-gray-500 cursor-not-allowed opacity-50'
                    : 'text-white bg-gray-700/50 hover:bg-gray-700 border-2 border-gray-600 hover:border-blue-400/50 hover:shadow-lg'
                }`}
              >
                <ArrowLeft className={`w-5 h-5 mr-2 transition-transform ${currentStep !== 1 ? 'group-hover:-translate-x-1' : ''}`} />
                Previous
              </button>

              <div className="flex items-center space-x-3">
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="group flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="group relative flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <Send className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">Submit Request</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Floating Chat Assistant */}
      <FloatingChatButton context="ea-creation" />
    </div>
  );
};

export default CreateEA;
