const databaseService = require('./databaseService');
const axios = require('axios');

class AISignalService {
  constructor() {
    this.activeJobs = new Map();
    this.signalCache = new Map();
    this.marketDataCache = new Map();
  }

  /**
   * Initialize the AI Signal Service
   */
  async initialize() {
    console.log('🤖 Initializing AI Signal Service...');
    
    try {
      // Load active AI models
      const activeModels = await AIModel.getActiveModels();
      console.log(`📊 Loaded ${activeModels.length} active AI models`);
      
      // Load active signal jobs
      const activeJobs = await AISignalJob.getActiveJobs();
      console.log(`⚡ Loaded ${activeJobs.length} active signal jobs`);
      
      // Start job schedulers
      for (const job of activeJobs) {
        await this.startJob(job);
      }
      
      console.log('✅ AI Signal Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI Signal Service:', error);
      throw error;
    }
  }

  /**
   * Start a signal generation job
   */
  async startJob(job) {
    try {
      console.log(`🚀 Starting job: ${job.name} (${job.jobId})`);
      
      // Add to active jobs
      this.activeJobs.set(job.jobId, job);
      
      // Start the job
      await job.start();
      
      // Schedule the job based on its configuration
      if (job.schedule.type === 'realtime') {
        await this.scheduleRealtimeJob(job);
      } else if (job.schedule.type === 'scheduled') {
        await this.scheduleCronJob(job);
      } else if (job.schedule.type === 'continuous') {
        await this.scheduleContinuousJob(job);
      }
      
      console.log(`✅ Job started: ${job.name}`);
    } catch (error) {
      console.error(`❌ Failed to start job ${job.name}:`, error);
      await job.fail({
        type: 'system-error',
        message: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Stop a signal generation job
   */
  async stopJob(jobId) {
    try {
      const job = this.activeJobs.get(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }
      
      console.log(`🛑 Stopping job: ${job.name}`);
      
      // Remove from active jobs
      this.activeJobs.delete(jobId);
      
      // Update job status
      job.status = 'cancelled';
      await job.save();
      
      console.log(`✅ Job stopped: ${job.name}`);
    } catch (error) {
      console.error(`❌ Failed to stop job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Generate signals for a specific job
   */
  async generateSignals(job) {
    const startTime = Date.now();
    let signalsGenerated = 0;
    
    try {
      console.log(`🔄 Generating signals for job: ${job.name}`);
      
      // Get AI model
      const aiModel = await AIModel.findById(job.aiModel);
      if (!aiModel) {
        throw new Error(`AI model not found: ${job.aiModel}`);
      }
      
      // Get market data for configured assets
      const marketData = await this.getMarketData(job.configuration);
      
      // Generate signals for each asset
      for (const assetData of marketData) {
        try {
          const signals = await this.generateSignalsForAsset(assetData, aiModel, job);
          signalsGenerated += signals.length;
        } catch (error) {
          console.error(`Error generating signals for ${assetData.symbol}:`, error);
          await job.fail({
            type: 'model-error',
            message: `Failed to generate signals for ${assetData.symbol}: ${error.message}`,
            context: {
              symbol: assetData.symbol,
              market: assetData.market
            }
          });
        }
      }
      
      // Complete the job
      const duration = Date.now() - startTime;
      await job.complete(duration, signalsGenerated);
      
      console.log(`✅ Generated ${signalsGenerated} signals for job: ${job.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to generate signals for job ${job.name}:`, error);
      await job.fail({
        type: 'system-error',
        message: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Generate signals for a specific asset
   */
  async generateSignalsForAsset(assetData, aiModel, job) {
    const signals = [];
    
    try {
      // Prepare input data for AI model
      const inputData = await this.prepareInputData(assetData, job.configuration);
      
      // Get AI prediction
      const prediction = await this.getAIPrediction(aiModel, inputData);
      
      // Validate prediction confidence
      if (prediction.confidence < job.configuration.minConfidence) {
        console.log(`Low confidence prediction for ${assetData.symbol}: ${prediction.confidence}%`);
        return signals;
      }
      
      // Create trading signal
      const signal = await this.createTradingSignal(assetData, prediction, aiModel, job);
      signals.push(signal);
      
      // Update job results
      await this.updateJobResults(job, signal);
      
    } catch (error) {
      console.error(`Error generating signal for ${assetData.symbol}:`, error);
      throw error;
    }
    
    return signals;
  }

  /**
   * Prepare input data for AI model
   */
  async prepareInputData(assetData, configuration) {
    const inputData = {
      symbol: assetData.symbol,
      market: assetData.market,
      currentPrice: assetData.price,
      volume: assetData.volume,
      timestamp: new Date()
    };
    
    // Add technical indicators
    inputData.technicalIndicators = await this.calculateTechnicalIndicators(assetData);
    
    // Add market context
    inputData.marketContext = await this.getMarketContext(assetData.market);
    
    // Add fundamental data (for stocks)
    if (assetData.type === 'stock') {
      inputData.fundamentalData = await this.getFundamentalData(assetData.symbol);
    }
    
    // Add sentiment data
    inputData.sentimentData = await this.getSentimentData(assetData.symbol);
    
    return inputData;
  }

  /**
   * Get AI prediction from model
   */
  async getAIPrediction(aiModel, inputData) {
    try {
      // In a real implementation, this would call the AI model API
      // For now, we'll simulate the prediction
      const prediction = await this.simulateAIPrediction(inputData);
      
      // Record prediction usage
      await aiModel.recordPrediction(prediction.confidence);
      
      return prediction;
    } catch (error) {
      console.error('Error getting AI prediction:', error);
      throw error;
    }
  }

  /**
   * Simulate AI prediction (replace with actual AI model call)
   */
  async simulateAIPrediction(inputData) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate random but realistic prediction
    const confidence = Math.random() * 40 + 60; // 60-100% confidence
    const signalTypes = ['buy', 'sell', 'hold', 'strong-buy', 'strong-sell'];
    const signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
    
    const prediction = {
      signalType,
      confidence: Math.round(confidence),
      targetPrice: inputData.currentPrice * (1 + (Math.random() - 0.5) * 0.1),
      stopLoss: inputData.currentPrice * (1 - Math.random() * 0.05),
      technicalScore: Math.random() * 100,
      fundamentalScore: Math.random() * 100,
      momentumScore: Math.random() * 100,
      volatilityScore: Math.random() * 100,
      sentiment: ['very-bullish', 'bullish', 'neutral', 'bearish', 'very-bearish'][Math.floor(Math.random() * 5)]
    };
    
    return prediction;
  }

  /**
   * Create trading signal from AI prediction
   */
  async createTradingSignal(assetData, prediction, aiModel, job) {
    const signalData = {
      name: `AI Signal - ${assetData.symbol}`,
      asset: {
        symbol: assetData.symbol,
        name: assetData.name,
        type: assetData.type,
        exchange: assetData.exchange,
        market: assetData.market
      },
      signalType: prediction.signalType,
      action: this.getActionFromSignalType(prediction.signalType),
      currentPrice: assetData.price,
      targetPrice: prediction.targetPrice,
      stopLoss: prediction.stopLoss,
      riskLevel: this.calculateRiskLevel(prediction.confidence),
      positionSize: this.calculatePositionSize(prediction.confidence, assetData.price),
      riskRewardRatio: this.calculateRiskRewardRatio(assetData.price, prediction.targetPrice, prediction.stopLoss),
      aiAnalysis: {
        confidence: prediction.confidence,
        sentiment: prediction.sentiment,
        technicalScore: prediction.technicalScore,
        fundamentalScore: prediction.fundamentalScore,
        momentumScore: prediction.momentumScore,
        volatilityScore: prediction.volatilityScore
      },
      timeframe: job.configuration.timeframes[0] || '1h',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      aiModel: {
        version: aiModel.version,
        algorithm: aiModel.modelType,
        accuracy: aiModel.performance.accuracy
      },
      source: 'ai-generated',
      subscriptionTier: 'professional',
      category: this.getCategoryFromTimeframe(job.configuration.timeframes[0] || '1h'),
      tags: ['ai-generated', aiModel.modelType, assetData.type]
    };
    
    const signal = new TradingSignal(signalData);
    await signal.save();
    
    return signal;
  }

  /**
   * Get market data for configured assets
   */
  async getMarketData(configuration) {
    const marketData = [];
    
    // In a real implementation, this would fetch from market data APIs
    // For now, we'll simulate market data
    for (const symbol of configuration.symbols || ['AAPL', 'GOOGL', 'MSFT']) {
      const assetData = {
        symbol,
        name: this.getAssetName(symbol),
        type: 'stock',
        exchange: 'NASDAQ',
        market: 'US',
        price: Math.random() * 1000 + 50,
        volume: Math.random() * 1000000 + 100000,
        timestamp: new Date()
      };
      
      marketData.push(assetData);
    }
    
    return marketData;
  }

  /**
   * Calculate technical indicators
   */
  async calculateTechnicalIndicators(assetData) {
    // In a real implementation, this would calculate actual technical indicators
    return {
      rsi: {
        value: Math.random() * 100,
        signal: Math.random() > 0.5 ? 'overbought' : 'oversold'
      },
      macd: {
        value: (Math.random() - 0.5) * 10,
        signal: Math.random() > 0.5 ? 'bullish' : 'bearish'
      },
      movingAverages: {
        sma20: assetData.price * (1 + (Math.random() - 0.5) * 0.05),
        sma50: assetData.price * (1 + (Math.random() - 0.5) * 0.05),
        sma200: assetData.price * (1 + (Math.random() - 0.5) * 0.05)
      },
      bollingerBands: {
        upper: assetData.price * 1.02,
        middle: assetData.price,
        lower: assetData.price * 0.98,
        position: Math.random() > 0.5 ? 'above' : 'below'
      }
    };
  }

  /**
   * Get market context
   */
  async getMarketContext(market) {
    return {
      marketTrend: ['bull', 'bear', 'sideways'][Math.floor(Math.random() * 3)],
      sectorPerformance: ['outperforming', 'performing', 'underperforming'][Math.floor(Math.random() * 3)],
      volatility: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      volume: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)]
    };
  }

  /**
   * Get fundamental data for stocks
   */
  async getFundamentalData(symbol) {
    return {
      peRatio: Math.random() * 50 + 10,
      pbRatio: Math.random() * 5 + 1,
      debtToEquity: Math.random() * 2,
      roe: Math.random() * 30 + 5,
      marketCap: Math.random() * 1000000000000 + 1000000000
    };
  }

  /**
   * Get sentiment data
   */
  async getSentimentData(symbol) {
    return {
      newsSentiment: Math.random() * 2 - 1, // -1 to 1
      socialSentiment: Math.random() * 2 - 1,
      analystSentiment: Math.random() * 2 - 1
    };
  }

  /**
   * Helper methods
   */
  getActionFromSignalType(signalType) {
    const actionMap = {
      'buy': 'enter-long',
      'sell': 'enter-short',
      'hold': 'hold-position',
      'strong-buy': 'enter-long',
      'strong-sell': 'enter-short'
    };
    return actionMap[signalType] || 'hold-position';
  }

  calculateRiskLevel(confidence) {
    if (confidence >= 90) return 'low';
    if (confidence >= 75) return 'medium';
    if (confidence >= 60) return 'high';
    return 'very-high';
  }

  calculatePositionSize(confidence, price) {
    const baseSize = 1000; // Base position size
    const confidenceMultiplier = confidence / 100;
    return Math.round(baseSize * confidenceMultiplier / price);
  }

  calculateRiskRewardRatio(currentPrice, targetPrice, stopLoss) {
    const profit = Math.abs(targetPrice - currentPrice);
    const risk = Math.abs(currentPrice - stopLoss);
    return risk > 0 ? profit / risk : 0;
  }

  getCategoryFromTimeframe(timeframe) {
    const categoryMap = {
      '1m': 'scalping',
      '5m': 'scalping',
      '15m': 'day-trading',
      '30m': 'day-trading',
      '1h': 'swing',
      '4h': 'swing',
      '1d': 'position',
      '1w': 'long-term',
      '1M': 'long-term'
    };
    return categoryMap[timeframe] || 'swing';
  }

  getAssetName(symbol) {
    const nameMap = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'TSLA': 'Tesla Inc.',
      'AMZN': 'Amazon.com Inc.'
    };
    return nameMap[symbol] || `${symbol} Corporation`;
  }

  /**
   * Update job results
   */
  async updateJobResults(job, signal) {
    job.results.totalSignalsGenerated += 1;
    job.results.signalsGeneratedToday += 1;
    job.results.lastSignalGenerated = new Date();
    
    // Update signal distribution
    job.results.signalDistribution[signal.signalType] += 1;
    
    // Update asset distribution
    job.results.assetDistribution[signal.asset.type] += 1;
    
    // Update average confidence
    const totalConfidence = job.results.averageConfidence * (job.results.totalSignalsGenerated - 1) + signal.aiAnalysis.confidence;
    job.results.averageConfidence = totalConfidence / job.results.totalSignalsGenerated;
    
    await job.save();
  }

  /**
   * Schedule realtime job
   */
  async scheduleRealtimeJob(job) {
    const interval = this.getIntervalFromFrequency(job.schedule.frequency);
    
    const intervalId = setInterval(async () => {
      if (job.status === 'running' && job.schedule.isActive) {
        await this.generateSignals(job);
      }
    }, interval);
    
    this.activeJobs.set(job.jobId, { ...job, intervalId });
  }

  /**
   * Schedule continuous job
   */
  async scheduleContinuousJob(job) {
    // Run immediately and then schedule
    await this.generateSignals(job);
    await this.scheduleRealtimeJob(job);
  }

  /**
   * Get interval from frequency
   */
  getIntervalFromFrequency(frequency) {
    const intervals = {
      'every-minute': 60 * 1000,
      'every-5-minutes': 5 * 60 * 1000,
      'every-15-minutes': 15 * 60 * 1000,
      'every-30-minutes': 30 * 60 * 1000,
      'hourly': 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000
    };
    return intervals[frequency] || 15 * 60 * 1000; // Default to 15 minutes
  }

  /**
   * Get service statistics
   */
  async getStatistics() {
    const activeJobs = this.activeJobs.size;
    const totalSignals = await TradingSignal.countDocuments({ source: 'ai-generated' });
    const activeSignals = await TradingSignal.countDocuments({ 
      source: 'ai-generated', 
      status: 'active' 
    });
    
    return {
      activeJobs,
      totalSignals,
      activeSignals,
      uptime: process.uptime()
    };
  }
}

module.exports = new AISignalService();
