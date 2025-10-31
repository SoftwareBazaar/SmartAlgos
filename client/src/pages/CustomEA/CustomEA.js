import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Palette, 
  Clock, 
  DollarSign, 
  Upload, 
  MessageSquare, 
  CheckCircle,
  ArrowRight,
  Settings,
  TrendingUp,
  Shield,
  Zap,
  Target,
  BarChart3,
  Brain,
  Rocket,
  Star,
  Users,
  Award,
  FileText,
  Camera,
  Download
} from 'lucide-react';
import apiClient from '../../lib/apiClient';

const CustomEA = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Service Type
    serviceType: '', // 'new_ea', 'modify_ea', 'custom_indicator'
    
    // EA Details
    eaName: '',
    eaDescription: '',
    tradingStyle: '', // 'scalping', 'swing', 'hedging', 'arbitrage', 'grid', 'martingale'
    platform: '', // 'mt4', 'mt5', 'tradingview'
    
    // Technical Requirements
    timeframe: '',
    indicators: [],
    riskManagement: [],
    customFeatures: [],
    
    // Timeline & Budget
    timeline: '',
    budget: '',
    customBudget: '',
    urgency: '', // 'low', 'medium', 'high', 'urgent'
    
    // Additional Details
    experience: '',
    currentEA: null,
    requirements: '',
    files: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const tradingStyles = [
    { id: 'scalping', name: 'Scalping', icon: Zap, description: 'Quick trades with small profits', color: 'bg-green-500' },
    { id: 'swing', name: 'Swing Trading', icon: TrendingUp, description: 'Medium-term position trading', color: 'bg-blue-500' },
    { id: 'hedging', name: 'Hedging', icon: Shield, description: 'Risk reduction strategies', color: 'bg-purple-500' },
    { id: 'arbitrage', name: 'Arbitrage', icon: Target, description: 'Price difference exploitation', color: 'bg-orange-500' },
    { id: 'grid', name: 'Grid Trading', icon: BarChart3, description: 'Systematic grid-based trading', color: 'bg-pink-500' },
    { id: 'martingale', name: 'Martingale', icon: Brain, description: 'Progressive lot sizing', color: 'bg-red-500' }
  ];

  const platforms = [
    { id: 'mt4', name: 'MetaTrader 4', icon: '📊', description: 'Most popular platform' },
    { id: 'mt5', name: 'MetaTrader 5', icon: '📈', description: 'Advanced features' },
    { id: 'tradingview', name: 'TradingView', icon: '📉', description: 'Modern interface' }
  ];

  const timeframes = [
    'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN1'
  ];

  const indicators = [
    'Moving Averages', 'RSI', 'MACD', 'Bollinger Bands', 'Stochastic', 'CCI', 
    'Williams %R', 'ADX', 'Ichimoku', 'Fibonacci', 'Pivot Points', 'Custom Indicators'
  ];

  const riskManagement = [
    'Stop Loss', 'Take Profit', 'Trailing Stop', 'Position Sizing', 'Risk Percentage', 
    'Maximum Drawdown', 'Daily Loss Limit', 'News Filter'
  ];

  const customFeatures = [
    'Multi-Currency', 'Multi-Timeframe', 'News Trading', 'Breakout Detection', 
    'Pattern Recognition', 'AI Integration', 'Mobile Alerts', 'Email Notifications'
  ];

  const timelineOptions = [
    { value: '1-3 days', label: '1-3 Days', price: '+50%', color: 'text-red-600' },
    { value: '1 week', label: '1 Week', price: 'Standard', color: 'text-green-600' },
    { value: '2 weeks', label: '2 Weeks', price: '-10%', color: 'text-blue-600' },
    { value: '1 month', label: '1 Month', price: '-20%', color: 'text-purple-600' }
  ];

  const budgetRanges = [
    { min: 100, max: 500, label: '$100 - $500', description: 'Basic EA' },
    { min: 500, max: 1000, label: '$500 - $1,000', description: 'Standard EA' },
    { min: 1000, max: 2500, label: '$1,000 - $2,500', description: 'Advanced EA' },
    { min: 2500, max: 5000, label: '$2,500 - $5,000', description: 'Professional EA' },
    { min: 5000, max: 10000, label: '$5,000+', description: 'Enterprise EA' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const calculatePrice = () => {
    let basePrice = 500;
    
    // Trading style complexity
    const styleMultipliers = {
      'scalping': 1.5,
      'swing': 1.0,
      'hedging': 1.3,
      'arbitrage': 1.8,
      'grid': 1.2,
      'martingale': 1.1
    };
    
    basePrice *= styleMultipliers[formData.tradingStyle] || 1.0;
    
    // Feature complexity
    basePrice += formData.indicators.length * 50;
    basePrice += formData.customFeatures.length * 100;
    
    // Timeline adjustment
    const timelineMultipliers = {
      '1-3 days': 1.5,
      '1 week': 1.0,
      '2 weeks': 0.9,
      '1 month': 0.8
    };
    
    basePrice *= timelineMultipliers[formData.timeline] || 1.0;
    
    return Math.round(basePrice);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const requestData = {
        ...formData,
        estimatedPrice: calculatePrice(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const response = await apiClient.post('/api/custom-ea/request', requestData);
      
      if (response.data.success) {
        setSubmitted(true);
      } else {
        throw new Error(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting EA request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Request Submitted Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Your custom EA request has been received. Our team will review your requirements and get back to you within 24 hours with a detailed proposal.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <div className="space-y-2 text-blue-800">
              <p>• Our expert developers will analyze your requirements</p>
              <p>• You'll receive a detailed proposal with timeline and pricing</p>
              <p>• We'll schedule a consultation call to discuss specifics</p>
              <p>• Development begins once you approve the proposal</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
              setFormData({
                serviceType: '',
                eaName: '',
                eaDescription: '',
                tradingStyle: '',
                platform: '',
                timeframe: '',
                indicators: [],
                riskManagement: [],
                customFeatures: [],
                timeline: '',
                budget: '',
                customBudget: '',
                urgency: '',
                experience: '',
                currentEA: null,
                requirements: '',
                files: []
              });
            }}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Another Request
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-black dark:via-brand-900 dark:to-black">
      {/* Header */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-black dark:via-brand-900 dark:to-black border-b border-gray-200 dark:border-brand-800/70 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-primary-200">Custom EA Design Service</h1>
              <p className="text-gray-700 dark:text-brand-300 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Get a professional Expert Advisor built to your exact specifications</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-700 dark:text-brand-300">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-primary-400" />
                <span className="whitespace-nowrap">500+ EAs</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-700 dark:text-brand-300">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-primary-400" />
                <span className="whitespace-nowrap">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto scrollbar-thin scrollbar-thumb-brand-700 scrollbar-track-transparent hover:scrollbar-thumb-brand-600 scroll-smooth max-h-screen">
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8 sticky top-0 bg-white dark:bg-gradient-to-br dark:from-black dark:via-brand-900 dark:to-black pb-4 z-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-shrink-0">
                <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-brand-800 text-brand-400'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`w-8 sm:w-12 md:w-16 h-0.5 sm:h-1 mx-1 sm:mx-2 ${
                    step < currentStep ? 'bg-primary-500' : 'bg-brand-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="hidden sm:flex justify-between text-xs md:text-sm text-brand-300 mt-2">
            <span className="text-center flex-1">Service Type</span>
            <span className="text-center flex-1">Requirements</span>
            <span className="text-center flex-1">Technical</span>
            <span className="text-center flex-1">Timeline</span>
            <span className="text-center flex-1">Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-gradient-to-br from-brand-900 to-black rounded-lg sm:rounded-xl shadow-soft border border-brand-800/70 p-4 sm:p-6 md:p-8"
            >
              {/* Step 1: Service Type */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-primary-200 mb-4 sm:mb-6">Choose Your Service</h2>
                  
                  <div className="space-y-4">
                    <div className={`border-2 rounded-lg p-6 hover:border-primary-500 transition-all cursor-pointer ${
                      formData.serviceType === 'new_ea' 
                        ? 'border-primary-500 bg-primary-500/20 dark:bg-primary-500/10 shadow-lg shadow-primary-500/20' 
                        : 'border-brand-700 hover:border-brand-600 bg-brand-800/50 hover:bg-brand-800/70'
                    }`}
                         onClick={() => handleInputChange('serviceType', 'new_ea')}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.serviceType === 'new_ea' 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-200 dark:bg-brand-700 text-gray-700 dark:text-brand-300'
                        }`}>
                          <Rocket className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${
                            formData.serviceType === 'new_ea' 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-white'
                          }`}>New EA Development</h3>
                          <p className={`text-sm ${
                            formData.serviceType === 'new_ea' 
                              ? 'text-gray-700 dark:text-gray-200' 
                              : 'text-gray-700 dark:text-brand-300'
                          }`}>Create a custom Expert Advisor from scratch</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          formData.serviceType === 'new_ea' 
                            ? 'border-primary-500 bg-primary-500' 
                            : 'border-brand-600'
                        }`}>
                          {formData.serviceType === 'new_ea' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1" />}
                        </div>
                      </div>
                    </div>

                    <div className={`border-2 rounded-lg p-6 hover:border-primary-500 transition-all cursor-pointer ${
                      formData.serviceType === 'modify_ea' 
                        ? 'border-primary-500 bg-primary-500/20 dark:bg-primary-500/10 shadow-lg shadow-primary-500/20' 
                        : 'border-brand-700 hover:border-brand-600 bg-brand-800/50 hover:bg-brand-800/70'
                    }`}
                         onClick={() => handleInputChange('serviceType', 'modify_ea')}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.serviceType === 'modify_ea' 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-200 dark:bg-brand-700 text-gray-700 dark:text-brand-300'
                        }`}>
                          <Settings className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${
                            formData.serviceType === 'modify_ea' 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-white'
                          }`}>EA Modification</h3>
                          <p className={`text-sm ${
                            formData.serviceType === 'modify_ea' 
                              ? 'text-gray-700 dark:text-gray-200' 
                              : 'text-gray-700 dark:text-brand-300'
                          }`}>Improve or customize your existing EA</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          formData.serviceType === 'modify_ea' 
                            ? 'border-primary-500 bg-primary-500' 
                            : 'border-brand-600'
                        }`}>
                          {formData.serviceType === 'modify_ea' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1" />}
                        </div>
                      </div>
                    </div>

                    <div className={`border-2 rounded-lg p-6 hover:border-primary-500 transition-all cursor-pointer ${
                      formData.serviceType === 'custom_indicator' 
                        ? 'border-primary-500 bg-primary-500/20 dark:bg-primary-500/10 shadow-lg shadow-primary-500/20' 
                        : 'border-brand-700 hover:border-brand-600 bg-brand-800/50 hover:bg-brand-800/70'
                    }`}
                         onClick={() => handleInputChange('serviceType', 'custom_indicator')}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.serviceType === 'custom_indicator' 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-200 dark:bg-brand-700 text-gray-700 dark:text-brand-300'
                        }`}>
                          <BarChart3 className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${
                            formData.serviceType === 'custom_indicator' 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-white'
                          }`}>Custom Indicator</h3>
                          <p className={`text-sm ${
                            formData.serviceType === 'custom_indicator' 
                              ? 'text-gray-700 dark:text-gray-200' 
                              : 'text-gray-700 dark:text-brand-300'
                          }`}>Develop a custom trading indicator</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          formData.serviceType === 'custom_indicator' 
                            ? 'border-primary-500 bg-primary-500' 
                            : 'border-brand-600'
                        }`}>
                          {formData.serviceType === 'custom_indicator' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Requirements */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-primary-200 mb-4 sm:mb-6">EA Requirements</h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-brand-300 mb-2">
                        EA Name
                      </label>
                      <input
                        type="text"
                        value={formData.eaName}
                        onChange={(e) => handleInputChange('eaName', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-brand-800/50 border border-brand-700 text-primary-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="e.g., My Scalping EA Pro"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-brand-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.eaDescription}
                        onChange={(e) => handleInputChange('eaDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-brand-800/50 border border-brand-700 text-primary-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Describe what you want your EA to do..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white mb-3 sm:mb-4">
                        Trading Style
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {tradingStyles.map((style) => {
                          const Icon = style.icon;
                          return (
                            <div
                              key={style.id}
                              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                formData.tradingStyle === style.id
                                  ? 'border-primary-500 bg-primary-500/20 dark:bg-primary-500/10 shadow-lg shadow-primary-500/20'
                                  : 'border-brand-700 hover:border-brand-600 bg-brand-800/50 hover:bg-brand-800/70'
                              }`}
                              onClick={() => handleInputChange('tradingStyle', style.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.color}`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className={`font-semibold text-sm ${
                                    formData.tradingStyle === style.id ? 'text-gray-900' : 'text-white'
                                  }`}>{style.name}</h4>
                                  <p className={`text-xs ${
                                    formData.tradingStyle === style.id ? 'text-gray-700' : 'text-brand-300'
                                  }`}>{style.description}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-4">
                        Platform
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {platforms.map((platform) => (
                          <div
                            key={platform.id}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              formData.platform === platform.id
                                ? 'border-primary-500 bg-primary-500/20 dark:bg-primary-500/10 shadow-lg shadow-primary-500/20'
                                : 'border-brand-700 hover:border-brand-600 bg-brand-800/50 hover:bg-brand-800/70'
                            }`}
                            onClick={() => handleInputChange('platform', platform.id)}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">{platform.icon}</div>
                              <h4 className={`font-semibold text-sm ${
                                formData.platform === platform.id ? 'text-gray-900' : 'text-white'
                              }`}>{platform.name}</h4>
                              <p className={`text-xs ${
                                formData.platform === platform.id ? 'text-gray-900 dark:text-gray-200' : 'text-gray-700 dark:text-brand-300'
                              }`}>{platform.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Technical Details */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-primary-200 mb-4 sm:mb-6">Technical Requirements</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-primary-200 mb-2">
                        Preferred Timeframe
                      </label>
                      <select
                        value={formData.timeframe}
                        onChange={(e) => handleInputChange('timeframe', e.target.value)}
                        className="w-full px-4 py-3 bg-brand-800/50 border border-brand-700 text-primary-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select timeframe</option>
                        {timeframes.map((tf) => (
                          <option key={tf} value={tf}>{tf}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-white mb-4 border-b-2 border-primary-500 pb-2">
                        📊 Indicators to Include
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {indicators.map((indicator) => (
                          <label key={indicator} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-brand-800/50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.indicators.includes(indicator)}
                              onChange={() => handleArrayToggle('indicators', indicator)}
                              className="w-4 h-4 text-primary-500 border-brand-600 bg-brand-800 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-white font-medium">{indicator}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-white mb-4 border-b-2 border-primary-500 pb-2">
                        🛡️ Risk Management Features
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {riskManagement.map((feature) => (
                          <label key={feature} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-brand-800/50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.riskManagement.includes(feature)}
                              onChange={() => handleArrayToggle('riskManagement', feature)}
                              className="w-4 h-4 text-primary-500 border-brand-600 bg-brand-800 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-white font-medium">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-white mb-4 border-b-2 border-primary-500 pb-2">
                        ⚡ Custom Features
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {customFeatures.map((feature) => (
                          <label key={feature} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-brand-800/50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.customFeatures.includes(feature)}
                              onChange={() => handleArrayToggle('customFeatures', feature)}
                              className="w-4 h-4 text-primary-500 border-brand-600 bg-brand-800 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-white font-medium">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Timeline & Budget */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-primary-200 mb-4 sm:mb-6">Timeline & Budget</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-4">
                        Delivery Timeline
                      </label>
                      <div className="space-y-3">
                        {timelineOptions.map((option) => (
                          <div
                            key={option.value}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              formData.timeline === option.value
                                ? 'border-primary-500 bg-primary-500/20 dark:bg-primary-500/10 shadow-lg shadow-primary-500/20'
                                : 'border-brand-700 hover:border-brand-600 bg-brand-800/50 hover:bg-brand-800/70'
                            }`}
                            onClick={() => handleInputChange('timeline', option.value)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Clock className={`w-5 h-5 ${
                                  formData.timeline === option.value ? 'text-gray-900 dark:text-gray-200' : 'text-gray-700 dark:text-brand-300'
                                }`} />
                                <span className={`font-medium ${
                                  formData.timeline === option.value ? 'text-gray-900' : 'text-white'
                                }`}>{option.label}</span>
                              </div>
                              <span className={`font-semibold ${option.color}`}>{option.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-4">
                        Budget Range
                      </label>
                      <div className="space-y-3">
                        {budgetRanges.map((range) => (
                          <div
                            key={range.label}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              formData.budget === range.label
                                ? 'border-primary-500 bg-primary-500/20 dark:bg-primary-500/10 shadow-lg shadow-primary-500/20'
                                : 'border-brand-700 hover:border-brand-600 bg-brand-800/50 hover:bg-brand-800/70'
                            }`}
                            onClick={() => handleInputChange('budget', range.label)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className={`font-medium ${
                                  formData.budget === range.label ? 'text-gray-900' : 'text-white'
                                }`}>{range.label}</span>
                                <p className={`text-sm ${
                                  formData.budget === range.label ? 'text-gray-700' : 'text-brand-300'
                                }`}>{range.description}</p>
                              </div>
                              <DollarSign className={`w-5 h-5 ${
                                formData.budget === range.label ? 'text-gray-700' : 'text-brand-300'
                              }`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        💰 Custom Budget (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">$</span>
                        <input
                          type="number"
                          placeholder="Enter your custom budget amount"
                          value={formData.customBudget || ''}
                          onChange={(e) => handleInputChange('customBudget', e.target.value)}
                          className="w-full pl-8 pr-3 py-3 bg-brand-800 border border-brand-600 rounded-lg text-white placeholder-brand-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          min="100"
                          step="50"
                        />
                      </div>
                      <p className="text-xs text-brand-300 mt-1">
                        Leave empty to use the selected budget range above
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Experience Level
                      </label>
                      <select
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full px-4 py-3 bg-brand-800 border border-brand-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="" className="bg-brand-800 text-brand-300">Select your experience</option>
                        <option value="beginner" className="bg-brand-800 text-white">Beginner (New to trading)</option>
                        <option value="intermediate" className="bg-brand-800 text-white">Intermediate (Some trading experience)</option>
                        <option value="advanced" className="bg-brand-800 text-white">Advanced (Experienced trader)</option>
                        <option value="expert" className="bg-brand-800 text-white">Expert (Professional trader)</option>
                      </select>
                    </div>

                    {formData.serviceType === 'modify_ea' && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Upload Current EA File
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Drag and drop your EA file here, or click to browse
                          </p>
                          <input
                            type="file"
                            accept=".ex4,.ex5,.mq4,.mq5"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="ea-upload"
                          />
                          <label
                            htmlFor="ea-upload"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                          >
                            Choose File
                          </label>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Additional Requirements
                      </label>
                      <textarea
                        value={formData.requirements}
                        onChange={(e) => handleInputChange('requirements', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-brand-800 border border-brand-600 rounded-lg text-white placeholder-brand-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Any specific requirements, preferences, or questions..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-200 mb-4 sm:mb-6">Review Your Request</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-brand-800 rounded-lg p-6 border border-brand-700">
                      <h3 className="font-semibold text-lg mb-4 text-white">📋 Request Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-brand-300">Service:</span>
                          <span className="font-medium text-white">
                            {formData.serviceType === 'new_ea' && 'New EA Development'}
                            {formData.serviceType === 'modify_ea' && 'EA Modification'}
                            {formData.serviceType === 'custom_indicator' && 'Custom Indicator'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-300">EA Name:</span>
                          <span className="font-medium text-white">{formData.eaName || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-300">Trading Style:</span>
                          <span className="font-medium text-white">
                            {tradingStyles.find(s => s.id === formData.tradingStyle)?.name || 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-300">Platform:</span>
                          <span className="font-medium text-white">
                            {platforms.find(p => p.id === formData.platform)?.name || 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-300">Timeline:</span>
                          <span className="font-medium text-white">{formData.timeline || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-300">Budget:</span>
                          <span className="font-medium text-white">{formData.budget || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary-900 rounded-lg p-6 border border-primary-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-primary-200">💰 Estimated Price</h3>
                          <p className="text-primary-300">Based on your requirements</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary-200">
                            ${calculatePrice().toLocaleString()}
                          </div>
                          <p className="text-primary-300 text-sm">Final price will be confirmed</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary-500/20 dark:bg-primary-500/10 rounded-lg p-6 border border-primary-500/30">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-6 h-6 text-primary-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Quality Guarantee</h3>
                          <p className="text-gray-700 dark:text-gray-200 text-sm">
                            We guarantee the quality of our work. If you're not satisfied, we'll make it right.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-brand-700 rounded-lg text-brand-300 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-2 sm:order-1"
                >
                  Previous
                </button>
                
                {currentStep < 5 ? (
                  <button
                    onClick={nextStep}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center space-x-2 text-sm sm:text-base order-1 sm:order-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 sm:px-8 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Request</span>
                        <Rocket className="w-3 h-3 sm:w-4 sm:h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-brand-900 to-black rounded-lg sm:rounded-xl shadow-soft border border-brand-800/70 p-4 sm:p-6 sticky top-4 sm:top-8">
              <h3 className="text-base sm:text-lg font-semibold text-primary-200 mb-3 sm:mb-4">Why Choose Us?</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-primary-200">Expert Developers</h4>
                    <p className="text-xs sm:text-sm text-brand-300">10+ years experience in MQL programming</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-primary-200">Quality Guarantee</h4>
                    <p className="text-xs sm:text-sm text-brand-300">100% satisfaction or money back</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-primary-200">Fast Delivery</h4>
                    <p className="text-xs sm:text-sm text-brand-300">Most EAs delivered within 1 week</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-primary-200">24/7 Support</h4>
                    <p className="text-xs sm:text-sm text-brand-300">Ongoing support and maintenance</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-brand-800/70">
                <h4 className="text-sm sm:text-base font-medium text-primary-200 mb-2 sm:mb-3">Popular Services</h4>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-300">Scalping EA</span>
                    <span className="font-medium text-primary-400">$750</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-300">Swing Trading EA</span>
                    <span className="font-medium text-primary-400">$500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-300">Grid Trading EA</span>
                    <span className="font-medium text-primary-400">$600</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-300">Custom Indicator</span>
                    <span className="font-medium text-primary-400">$300</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomEA;
