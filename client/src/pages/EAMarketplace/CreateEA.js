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
  Send
} from 'lucide-react';

const CreateEA = () => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('EA Creation Request:', formData);
    // Here you would typically send the data to your backend
    alert('EA creation request submitted successfully!');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              EA Name *
            </label>
            <input
              type="text"
              value={formData.eaName}
              onChange={(e) => handleInputChange('eaName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              placeholder="Enter your EA name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trading Experience *
            </label>
            <select
              value={formData.tradingExperience}
              onChange={(e) => handleInputChange('tradingExperience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="">Select experience level</option>
              <option value="beginner">Beginner (0-1 years)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3-5 years)</option>
              <option value="expert">Expert (5+ years)</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            placeholder="Describe your trading goals and requirements..."
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          EA Type & Strategy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              EA Type *
            </label>
            <select
              value={formData.eaType}
              onChange={(e) => handleInputChange('eaType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="">Select EA type</option>
              {eaTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {formData.eaType && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {eaTypes.find(t => t.value === formData.eaType)?.description}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trading Strategy *
            </label>
            <select
              value={formData.strategy}
              onChange={(e) => handleInputChange('strategy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="">Select strategy</option>
              {strategies.map(strategy => (
                <option key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Technical Preferences
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Indicators *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {indicators.map(indicator => (
              <label key={indicator.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.indicators.includes(indicator.value)}
                  onChange={(e) => handleArrayChange('indicators', indicator.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {indicator.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Timeframes *
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {timeframes.map(timeframe => (
              <label key={timeframe.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.timeframes.includes(timeframe.value)}
                  onChange={(e) => handleArrayChange('timeframes', timeframe.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {timeframe.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Risk Level *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskLevels.map(risk => (
              <label key={risk.value} className="flex items-start p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="riskLevel"
                  value={risk.value}
                  checked={formData.riskLevel === risk.value}
                  onChange={(e) => handleInputChange('riskLevel', e.target.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {risk.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {risk.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Range *
                </label>
                <select
                  value={formData.budget.range}
                  onChange={(e) => handleNestedInputChange('budget', 'range', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  required
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Budget Information
          </label>
          <textarea
            value={formData.budget.additional}
            onChange={(e) => handleNestedInputChange('budget', 'additional', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            placeholder="Any additional budget considerations, special requirements, or constraints..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.contact.name}
              onChange={(e) => handleNestedInputChange('contact', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.contact.email}
              onChange={(e) => handleNestedInputChange('contact', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.contact.phone}
              onChange={(e) => handleNestedInputChange('contact', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company/Organization
            </label>
            <input
              type="text"
              value={formData.contact.company}
              onChange={(e) => handleNestedInputChange('contact', 'company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={formData.contact.timezone}
              onChange={(e) => handleNestedInputChange('contact', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
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
          </div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-brand-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-gray-200 dark:border-secondary-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <Bot className="w-8 h-8 mr-3 text-primary-500" />
                  Create Custom EA
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Specify your requirements for a custom Expert Advisor
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep} of 6
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive 
                        ? 'border-primary-500 bg-primary-500 text-white' 
                        : isCompleted 
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <div className={`text-sm font-medium ${
                        isActive 
                          ? 'text-primary-500 dark:text-primary-400' 
                          : isCompleted 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
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
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex items-center space-x-3">
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEA;
