const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { auth, requireSubscription, updateActivity } = require('../middleware/auth');
const databaseService = require('../services/databaseService');
const marketDataService = require('../services/marketDataService');
const aiSignalService = require('../services/aiSignalService');
const technicalIndicators = require('technicalindicators');
const router = express.Router();

// @route   GET /api/analysis/technical/:symbol
// @desc    Get technical analysis for a symbol
// @access  Private
router.get('/technical/:symbol', [
  auth, 
  requireSubscription('basic'), 
  updateActivity,
  query('period').optional().isIn(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']).withMessage('Invalid period'),
  query('indicators').optional().isString().withMessage('Indicators must be a comma-separated string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symbol } = req.params;
    const { period = '1d', indicators = 'sma,ema,rsi,macd,bollinger' } = req.query;
    
    // Get historical data
    const historicalData = await marketDataService.getHistoricalData(symbol, period, 100);
    
    if (!historicalData || historicalData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Historical data not available for this symbol'
      });
    }

    // Calculate technical indicators
    const analysis = await calculateTechnicalIndicators(historicalData, indicators.split(','));
    
    // Get current price and trend analysis
    const currentPrice = await marketDataService.getCurrentPrice(symbol);
    const trendAnalysis = analyzeTrend(historicalData);
    const supportResistance = calculateSupportResistance(historicalData);
    
    res.json({
      success: true,
      data: {
        symbol,
        period,
        currentPrice,
        trend: trendAnalysis,
        supportResistance,
        indicators: analysis,
        recommendation: generateTechnicalRecommendation(analysis, trendAnalysis),
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Technical analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform technical analysis'
    });
  }
});

// @route   GET /api/analysis/fundamental/:symbol
// @desc    Get fundamental analysis for a symbol
// @access  Private
router.get('/fundamental/:symbol', [
  auth, 
  requireSubscription('professional'), 
  updateActivity
], async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Get company fundamentals
    const fundamentals = await marketDataService.getFundamentals(symbol);
    const financials = await marketDataService.getFinancials(symbol);
    const earnings = await marketDataService.getEarnings(symbol);
    
    if (!fundamentals) {
      return res.status(404).json({
        success: false,
        message: 'Fundamental data not available for this symbol'
      });
    }

    // Calculate fundamental ratios and scores
    const analysis = calculateFundamentalAnalysis(fundamentals, financials, earnings);
    
    res.json({
      success: true,
      data: {
        symbol,
        company: fundamentals.company,
        sector: fundamentals.sector,
        industry: fundamentals.industry,
        marketCap: fundamentals.marketCap,
        ratios: analysis.ratios,
        scores: analysis.scores,
        recommendation: analysis.recommendation,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Fundamental analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform fundamental analysis'
    });
  }
});

// @route   GET /api/analysis/sentiment/:symbol
// @desc    Get sentiment analysis for a symbol
// @access  Private
router.get('/sentiment/:symbol', [
  auth, 
  requireSubscription('basic'), 
  updateActivity
], async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Get news sentiment
    const newsSentiment = await aiSignalService.getNewsSentiment(symbol);
    
    // Get social media sentiment (mock for now)
    const socialSentiment = await aiSignalService.getSocialSentiment(symbol);
    
    // Aggregate sentiment score
    const overallSentiment = calculateOverallSentiment(newsSentiment, socialSentiment);
    
    res.json({
      success: true,
      data: {
        symbol,
        overall: overallSentiment,
        news: newsSentiment,
        social: socialSentiment,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform sentiment analysis'
    });
  }
});

// @route   POST /api/analysis/custom
// @desc    Run custom analysis with user-defined parameters
// @access  Private
router.post('/custom', [
  auth,
  requireSubscription('professional'),
  updateActivity,
  body('symbols').isArray().withMessage('Symbols must be an array'),
  body('analysisType').isIn(['technical', 'fundamental', 'sentiment', 'combined']).withMessage('Invalid analysis type'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symbols, analysisType, parameters = {} } = req.body;
    
    const results = [];
    
    for (const symbol of symbols) {
      let analysis;
      
      switch (analysisType) {
        case 'technical':
          analysis = await performTechnicalAnalysis(symbol, parameters);
          break;
        case 'fundamental':
          analysis = await performFundamentalAnalysis(symbol, parameters);
          break;
        case 'sentiment':
          analysis = await performSentimentAnalysis(symbol, parameters);
          break;
        case 'combined':
          analysis = await performCombinedAnalysis(symbol, parameters);
          break;
      }
      
      results.push({
        symbol,
        analysis,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: {
        analysisType,
        results,
        summary: generateAnalysisSummary(results)
      }
    });

  } catch (error) {
    console.error('Custom analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform custom analysis'
    });
  }
});

// @route   GET /api/analysis/portfolio
// @desc    Get portfolio analysis
// @access  Private
router.get('/portfolio', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    // Mock portfolio analysis data
    const portfolioAnalysis = {
      overview: {
        totalValue: 125000,
        totalCost: 100000,
        totalReturn: 25000,
        totalReturnPercent: 25.0,
        dayChange: 1250,
        dayChangePercent: 1.01,
        allTimeHigh: 130000,
        allTimeLow: 95000
      },
      allocation: {
        stocks: {
          value: 75000,
          percentage: 60.0,
          return: 15000,
          returnPercent: 25.0
        },
        forex: {
          value: 25000,
          percentage: 20.0,
          return: 5000,
          returnPercent: 25.0
        },
        crypto: {
          value: 15000,
          percentage: 12.0,
          return: 3000,
          returnPercent: 25.0
        },
        commodities: {
          value: 10000,
          percentage: 8.0,
          return: 2000,
          returnPercent: 25.0
        }
      },
      performance: {
        oneDay: 1.01,
        oneWeek: 2.5,
        oneMonth: 8.2,
        threeMonths: 15.6,
        sixMonths: 22.3,
        oneYear: 25.0,
        ytd: 18.7
      },
      risk: {
        sharpeRatio: 1.45,
        sortinoRatio: 1.78,
        maxDrawdown: -8.5,
        volatility: 12.3,
        beta: 0.95,
        var95: -2.1,
        var99: -3.8
      },
      topPerformers: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          value: 15000,
          return: 3000,
          returnPercent: 25.0
        },
        {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          value: 12000,
          return: 2400,
          returnPercent: 25.0
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          value: 10000,
          return: 2000,
          returnPercent: 25.0
        }
      ],
      worstPerformers: [
        {
          symbol: 'META',
          name: 'Meta Platforms Inc.',
          value: 8000,
          return: -800,
          returnPercent: -9.1
        },
        {
          symbol: 'NFLX',
          name: 'Netflix Inc.',
          value: 6000,
          return: -600,
          returnPercent: -9.1
        }
      ]
    };

    res.json({
      success: true,
      data: portfolioAnalysis
    });

  } catch (error) {
    console.error('Get portfolio analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/analysis/stock/:symbol
// @desc    Get detailed stock analysis
// @access  Private
router.get('/stock/:symbol', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('market').optional().isIn(['US', 'NSE'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symbol } = req.params;
    const { market = 'US' } = req.query;

    // Mock detailed stock analysis
    const stockAnalysis = {
      symbol: symbol,
      name: `${symbol} Corporation`,
      market: market,
      currentPrice: 150.25,
      change: 2.35,
      changePercent: 1.58,
      volume: 2500000,
      marketCap: 2500000000,
      pe: 18.5,
      pb: 2.1,
      dividendYield: 2.3,
      eps: 8.12,
      revenue: 50000000000,
      revenueGrowth: 12.5,
      profitMargin: 15.8,
      roe: 18.2,
      roa: 12.5,
      debtToEquity: 0.45,
      currentRatio: 2.1,
      quickRatio: 1.8,
      technicalAnalysis: {
        trend: 'bullish',
        support: 145.50,
        resistance: 155.00,
        rsi: 65.2,
        macd: {
          macd: 1.25,
          signal: 1.15,
          histogram: 0.10
        },
        movingAverages: {
          sma20: 148.50,
          sma50: 145.20,
          sma200: 140.80,
          ema12: 149.80,
          ema26: 147.20
        },
        bollingerBands: {
          upper: 155.20,
          middle: 148.50,
          lower: 141.80,
          position: 'middle'
        }
      },
      fundamentalAnalysis: {
        score: 78,
        rating: 'buy',
        factors: {
          valuation: 75,
          growth: 82,
          profitability: 85,
          financialHealth: 70,
          momentum: 80
        },
        analystRecommendations: {
          strongBuy: 8,
          buy: 12,
          hold: 5,
          sell: 1,
          strongSell: 0,
          averageTarget: 165.50
        }
      },
      aiAnalysis: {
        sentiment: 'bullish',
        confidence: 78,
        keyFactors: [
          'Strong earnings growth',
          'Positive industry outlook',
          'Solid balance sheet',
          'Innovation pipeline'
        ],
        risks: [
          'Market volatility',
          'Competition pressure',
          'Regulatory changes'
        ]
      },
      news: [
        {
          title: 'Company reports strong Q3 earnings',
          summary: 'Revenue up 15% year-over-year',
          sentiment: 'positive',
          published: new Date('2023-11-15T10:00:00Z')
        },
        {
          title: 'New product launch announced',
          summary: 'Innovative solution expected to drive growth',
          sentiment: 'positive',
          published: new Date('2023-11-10T14:30:00Z')
        }
      ]
    };

    res.json({
      success: true,
      data: stockAnalysis
    });

  } catch (error) {
    console.error('Get stock analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/analysis/compare
// @desc    Compare multiple assets
// @access  Private
router.post('/compare', [
  auth,
  requireSubscription('basic'),
  body('symbols')
    .isArray({ min: 2, max: 10 })
    .withMessage('Must provide 2-10 symbols to compare'),
  body('symbols.*')
    .isLength({ min: 1, max: 10 })
    .withMessage('Each symbol must be 1-10 characters'),
  body('market')
    .optional()
    .isIn(['US', 'NSE'])
    .withMessage('Invalid market')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symbols, market = 'US' } = req.body;

    // Mock comparison data
    const comparison = symbols.map((symbol, index) => ({
      symbol: symbol,
      name: `${symbol} Corporation`,
      market: market,
      currentPrice: 100 + (index * 25),
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 5000000),
      marketCap: Math.floor(Math.random() * 10000000000),
      pe: 15 + Math.random() * 20,
      pb: 1 + Math.random() * 3,
      dividendYield: Math.random() * 5,
      eps: 5 + Math.random() * 10,
      revenue: Math.floor(Math.random() * 100000000000),
      revenueGrowth: (Math.random() - 0.5) * 30,
      profitMargin: 5 + Math.random() * 20,
      roe: 10 + Math.random() * 20,
      technicalScore: 50 + Math.random() * 50,
      fundamentalScore: 50 + Math.random() * 50,
      aiScore: 50 + Math.random() * 50,
      overallScore: 50 + Math.random() * 50,
      recommendation: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'][Math.floor(Math.random() * 5)]
    }));

    res.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Compare assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/analysis/sector
// @desc    Get sector analysis
// @access  Private
router.get('/sector', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('sector').optional().isLength({ min: 1, max: 50 }),
  query('market').optional().isIn(['US', 'NSE'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sector, market = 'US' } = req.query;

    // Mock sector analysis
    const sectorAnalysis = {
      sector: sector || 'Technology',
      market: market,
      overview: {
        totalMarketCap: 15000000000000,
        averageReturn: 12.5,
        volatility: 18.2,
        pe: 22.5,
        pb: 3.2
      },
      performance: {
        oneDay: 1.2,
        oneWeek: 3.5,
        oneMonth: 8.8,
        threeMonths: 18.2,
        sixMonths: 25.6,
        oneYear: 35.2,
        ytd: 28.9
      },
      topPerformers: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          return: 25.5,
          marketCap: 3000000000000
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          return: 22.8,
          marketCap: 2800000000000
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          return: 20.1,
          marketCap: 1800000000000
        }
      ],
      trends: {
        growth: 'positive',
        momentum: 'strong',
        sentiment: 'bullish',
        keyDrivers: [
          'AI and machine learning adoption',
          'Cloud computing growth',
          'Digital transformation'
        ]
      },
      risks: [
        'Regulatory scrutiny',
        'Competition intensity',
        'Market saturation'
      ],
      outlook: {
        shortTerm: 'bullish',
        mediumTerm: 'bullish',
        longTerm: 'bullish',
        confidence: 78
      }
    };

    res.json({
      success: true,
      data: sectorAnalysis
    });

  } catch (error) {
    console.error('Get sector analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/analysis/market-sentiment
// @desc    Get market sentiment analysis
// @access  Private
router.get('/market-sentiment', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    // Mock market sentiment analysis
    const marketSentiment = {
      overall: {
        sentiment: 'bullish',
        score: 65,
        confidence: 78,
        trend: 'improving'
      },
      indicators: {
        fearGreedIndex: 65,
        vix: 18.5,
        putCallRatio: 0.85,
        advanceDeclineRatio: 1.25,
        newHighsNewLows: 1.15
      },
      byAsset: {
        stocks: {
          sentiment: 'bullish',
          score: 68,
          keyFactors: ['Strong earnings', 'Economic growth']
        },
        forex: {
          sentiment: 'neutral',
          score: 52,
          keyFactors: ['Central bank policies', 'Economic data']
        },
        crypto: {
          sentiment: 'bullish',
          score: 72,
          keyFactors: ['Institutional adoption', 'Regulatory clarity']
        },
        commodities: {
          sentiment: 'bearish',
          score: 42,
          keyFactors: ['Supply concerns', 'Demand weakness']
        }
      },
      news: {
        positive: 65,
        neutral: 25,
        negative: 10,
        total: 1000
      },
      social: {
        twitter: {
          sentiment: 'bullish',
          mentions: 15000,
          engagement: 45000
        },
        reddit: {
          sentiment: 'bullish',
          mentions: 8500,
          engagement: 25000
        }
      },
      analyst: {
        upgrades: 45,
        downgrades: 25,
        initiations: 15,
        targetChanges: 35
      }
    };

    res.json({
      success: true,
      data: marketSentiment
    });

  } catch (error) {
    console.error('Get market sentiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/analysis/economic-calendar
// @desc    Get economic calendar
// @access  Private
router.get('/economic-calendar', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Mock economic calendar data
    const economicEvents = [
      {
        id: 'evt_001',
        title: 'Federal Reserve Interest Rate Decision',
        country: 'US',
        importance: 'high',
        date: new Date('2023-12-13T14:00:00Z'),
        previous: '5.25%',
        forecast: '5.50%',
        actual: null,
        impact: 'high',
        description: 'Federal Open Market Committee meeting'
      },
      {
        id: 'evt_002',
        title: 'Non-Farm Payrolls',
        country: 'US',
        importance: 'high',
        date: new Date('2023-12-08T13:30:00Z'),
        previous: '150K',
        forecast: '180K',
        actual: '175K',
        impact: 'high',
        description: 'Change in number of employed people'
      },
      {
        id: 'evt_003',
        title: 'CPI (Consumer Price Index)',
        country: 'US',
        importance: 'high',
        date: new Date('2023-12-12T13:30:00Z'),
        previous: '3.2%',
        forecast: '3.1%',
        actual: null,
        impact: 'high',
        description: 'Year-over-year inflation rate'
      },
      {
        id: 'evt_004',
        title: 'GDP Growth Rate',
        country: 'US',
        importance: 'medium',
        date: new Date('2023-12-21T13:30:00Z'),
        previous: '2.1%',
        forecast: '2.3%',
        actual: null,
        impact: 'medium',
        description: 'Quarterly GDP growth rate'
      }
    ];

    res.json({
      success: true,
      data: economicEvents
    });

  } catch (error) {
    console.error('Get economic calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper functions for analysis calculations
async function calculateTechnicalIndicators(historicalData, indicators) {
  const prices = historicalData.map(d => parseFloat(d.close));
  const highs = historicalData.map(d => parseFloat(d.high));
  const lows = historicalData.map(d => parseFloat(d.low));
  const volumes = historicalData.map(d => parseFloat(d.volume || 0));
  
  const analysis = {};
  
  for (const indicator of indicators) {
    switch (indicator.toLowerCase()) {
      case 'sma':
        analysis.sma = {
          sma20: technicalIndicators.SMA.calculate({ period: 20, values: prices }),
          sma50: technicalIndicators.SMA.calculate({ period: 50, values: prices }),
          sma200: technicalIndicators.SMA.calculate({ period: 200, values: prices })
        };
        break;
        
      case 'ema':
        analysis.ema = {
          ema12: technicalIndicators.EMA.calculate({ period: 12, values: prices }),
          ema26: technicalIndicators.EMA.calculate({ period: 26, values: prices })
        };
        break;
        
      case 'rsi':
        analysis.rsi = technicalIndicators.RSI.calculate({ period: 14, values: prices });
        break;
        
      case 'macd':
        analysis.macd = technicalIndicators.MACD.calculate({
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          values: prices
        });
        break;
        
      case 'bollinger':
        analysis.bollinger = technicalIndicators.BollingerBands.calculate({
          period: 20,
          stdDev: 2,
          values: prices
        });
        break;
        
      case 'stochastic':
        analysis.stochastic = technicalIndicators.Stochastic.calculate({
          high: highs,
          low: lows,
          close: prices,
          period: 14,
          signalPeriod: 3
        });
        break;
        
      case 'atr':
        analysis.atr = technicalIndicators.ATR.calculate({
          high: highs,
          low: lows,
          close: prices,
          period: 14
        });
        break;
    }
  }
  
  return analysis;
}

function analyzeTrend(historicalData) {
  const prices = historicalData.map(d => parseFloat(d.close));
  const recent = prices.slice(-20);
  const older = prices.slice(-40, -20);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const trendDirection = recentAvg > olderAvg ? 'bullish' : 'bearish';
  const trendStrength = Math.abs((recentAvg - olderAvg) / olderAvg) * 100;
  
  return {
    direction: trendDirection,
    strength: trendStrength > 5 ? 'strong' : trendStrength > 2 ? 'moderate' : 'weak',
    percentage: trendStrength
  };
}

function calculateSupportResistance(historicalData) {
  const prices = historicalData.map(d => ({
    high: parseFloat(d.high),
    low: parseFloat(d.low),
    close: parseFloat(d.close)
  }));
  
  // Simple pivot point calculation
  const recent = prices.slice(-20);
  const highs = recent.map(p => p.high).sort((a, b) => b - a);
  const lows = recent.map(p => p.low).sort((a, b) => a - b);
  
  return {
    resistance: [highs[0], highs[1], highs[2]].filter(Boolean),
    support: [lows[0], lows[1], lows[2]].filter(Boolean)
  };
}

function generateTechnicalRecommendation(analysis, trend) {
  let score = 0;
  let signals = [];
  
  // RSI analysis
  if (analysis.rsi && analysis.rsi.length > 0) {
    const currentRSI = analysis.rsi[analysis.rsi.length - 1];
    if (currentRSI > 70) {
      score -= 2;
      signals.push('RSI indicates overbought conditions');
    } else if (currentRSI < 30) {
      score += 2;
      signals.push('RSI indicates oversold conditions');
    }
  }
  
  // MACD analysis
  if (analysis.macd && analysis.macd.length > 0) {
    const currentMACD = analysis.macd[analysis.macd.length - 1];
    if (currentMACD.MACD > currentMACD.signal) {
      score += 1;
      signals.push('MACD shows bullish momentum');
    } else {
      score -= 1;
      signals.push('MACD shows bearish momentum');
    }
  }
  
  // Trend analysis
  if (trend.direction === 'bullish') {
    score += trend.strength === 'strong' ? 2 : 1;
    signals.push(`${trend.strength} bullish trend`);
  } else {
    score -= trend.strength === 'strong' ? 2 : 1;
    signals.push(`${trend.strength} bearish trend`);
  }
  
  let recommendation;
  if (score >= 3) recommendation = 'strong_buy';
  else if (score >= 1) recommendation = 'buy';
  else if (score <= -3) recommendation = 'strong_sell';
  else if (score <= -1) recommendation = 'sell';
  else recommendation = 'hold';
  
  return {
    action: recommendation,
    score,
    confidence: Math.min(Math.abs(score) * 20, 100),
    signals
  };
}

function calculateFundamentalAnalysis(fundamentals, financials, earnings) {
  const ratios = {
    pe: fundamentals.peRatio || 0,
    pb: fundamentals.pbRatio || 0,
    roe: fundamentals.roe || 0,
    roa: fundamentals.roa || 0,
    debtToEquity: fundamentals.debtToEquity || 0,
    currentRatio: fundamentals.currentRatio || 0,
    quickRatio: fundamentals.quickRatio || 0,
    grossMargin: fundamentals.grossMargin || 0,
    operatingMargin: fundamentals.operatingMargin || 0,
    netMargin: fundamentals.netMargin || 0
  };
  
  // Calculate scores based on ratios
  const scores = {
    valuation: calculateValuationScore(ratios),
    profitability: calculateProfitabilityScore(ratios),
    liquidity: calculateLiquidityScore(ratios),
    leverage: calculateLeverageScore(ratios)
  };
  
  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / 4;
  
  let recommendation;
  if (overallScore >= 80) recommendation = 'strong_buy';
  else if (overallScore >= 60) recommendation = 'buy';
  else if (overallScore <= 20) recommendation = 'strong_sell';
  else if (overallScore <= 40) recommendation = 'sell';
  else recommendation = 'hold';
  
  return {
    ratios,
    scores,
    recommendation,
    overallScore,
    strengths: getStrengths(scores),
    weaknesses: getWeaknesses(scores)
  };
}

function calculateValuationScore(ratios) {
  let score = 50; // Base score
  
  // PE ratio analysis
  if (ratios.pe > 0 && ratios.pe < 15) score += 20;
  else if (ratios.pe >= 15 && ratios.pe < 25) score += 10;
  else if (ratios.pe >= 25) score -= 10;
  
  // PB ratio analysis
  if (ratios.pb > 0 && ratios.pb < 1) score += 15;
  else if (ratios.pb >= 1 && ratios.pb < 3) score += 5;
  else if (ratios.pb >= 3) score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

function calculateProfitabilityScore(ratios) {
  let score = 50;
  
  if (ratios.roe > 15) score += 20;
  else if (ratios.roe > 10) score += 10;
  else if (ratios.roe < 5) score -= 10;
  
  if (ratios.roa > 10) score += 15;
  else if (ratios.roa > 5) score += 5;
  else if (ratios.roa < 2) score -= 10;
  
  if (ratios.netMargin > 15) score += 15;
  else if (ratios.netMargin > 10) score += 5;
  else if (ratios.netMargin < 5) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function calculateLiquidityScore(ratios) {
  let score = 50;
  
  if (ratios.currentRatio > 2) score += 20;
  else if (ratios.currentRatio > 1.5) score += 10;
  else if (ratios.currentRatio < 1) score -= 20;
  
  if (ratios.quickRatio > 1) score += 15;
  else if (ratios.quickRatio > 0.5) score += 5;
  else score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function calculateLeverageScore(ratios) {
  let score = 50;
  
  if (ratios.debtToEquity < 0.3) score += 20;
  else if (ratios.debtToEquity < 0.6) score += 10;
  else if (ratios.debtToEquity > 1) score -= 20;
  
  return Math.max(0, Math.min(100, score));
}

function getStrengths(scores) {
  const strengths = [];
  if (scores.valuation >= 70) strengths.push('Attractive valuation');
  if (scores.profitability >= 70) strengths.push('Strong profitability');
  if (scores.liquidity >= 70) strengths.push('Good liquidity');
  if (scores.leverage >= 70) strengths.push('Conservative leverage');
  return strengths;
}

function getWeaknesses(scores) {
  const weaknesses = [];
  if (scores.valuation <= 30) weaknesses.push('Expensive valuation');
  if (scores.profitability <= 30) weaknesses.push('Weak profitability');
  if (scores.liquidity <= 30) weaknesses.push('Liquidity concerns');
  if (scores.leverage <= 30) weaknesses.push('High leverage');
  return weaknesses;
}

function calculateOverallSentiment(newsSentiment, socialSentiment) {
  const newsWeight = 0.6;
  const socialWeight = 0.4;
  
  const overall = (newsSentiment.score * newsWeight) + (socialSentiment.score * socialWeight);
  
  let sentiment;
  if (overall >= 70) sentiment = 'very_bullish';
  else if (overall >= 55) sentiment = 'bullish';
  else if (overall >= 45) sentiment = 'neutral';
  else if (overall >= 30) sentiment = 'bearish';
  else sentiment = 'very_bearish';
  
  return {
    sentiment,
    score: Math.round(overall),
    confidence: Math.round((newsSentiment.confidence + socialSentiment.confidence) / 2)
  };
}

async function performTechnicalAnalysis(symbol, parameters) {
  const period = parameters.period || '1d';
  const indicators = parameters.indicators || ['sma', 'ema', 'rsi', 'macd'];
  
  const historicalData = await marketDataService.getHistoricalData(symbol, period, 100);
  const analysis = await calculateTechnicalIndicators(historicalData, indicators);
  const trend = analyzeTrend(historicalData);
  const recommendation = generateTechnicalRecommendation(analysis, trend);
  
  return {
    type: 'technical',
    indicators: analysis,
    trend,
    recommendation
  };
}

async function performFundamentalAnalysis(symbol, parameters) {
  const fundamentals = await marketDataService.getFundamentals(symbol);
  const financials = await marketDataService.getFinancials(symbol);
  const earnings = await marketDataService.getEarnings(symbol);
  
  const analysis = calculateFundamentalAnalysis(fundamentals, financials, earnings);
  
  return {
    type: 'fundamental',
    ...analysis
  };
}

async function performSentimentAnalysis(symbol, parameters) {
  const newsSentiment = await aiSignalService.getNewsSentiment(symbol);
  const socialSentiment = await aiSignalService.getSocialSentiment(symbol);
  const overall = calculateOverallSentiment(newsSentiment, socialSentiment);
  
  return {
    type: 'sentiment',
    overall,
    news: newsSentiment,
    social: socialSentiment
  };
}

async function performCombinedAnalysis(symbol, parameters) {
  const technical = await performTechnicalAnalysis(symbol, parameters);
  const fundamental = await performFundamentalAnalysis(symbol, parameters);
  const sentiment = await performSentimentAnalysis(symbol, parameters);
  
  // Combine scores with weights
  const weights = { technical: 0.4, fundamental: 0.4, sentiment: 0.2 };
  
  const combinedScore = 
    (technical.recommendation.score * weights.technical) +
    (fundamental.overallScore * weights.fundamental) +
    (sentiment.overall.score * weights.sentiment);
  
  let recommendation;
  if (combinedScore >= 70) recommendation = 'strong_buy';
  else if (combinedScore >= 55) recommendation = 'buy';
  else if (combinedScore <= 30) recommendation = 'strong_sell';
  else if (combinedScore <= 45) recommendation = 'sell';
  else recommendation = 'hold';
  
  return {
    type: 'combined',
    technical,
    fundamental,
    sentiment,
    overall: {
      score: Math.round(combinedScore),
      recommendation,
      confidence: Math.round((technical.recommendation.confidence + fundamental.overallScore + sentiment.overall.confidence) / 3)
    }
  };
}

function generateAnalysisSummary(results) {
  const recommendations = results.map(r => r.analysis.recommendation || r.analysis.overall?.recommendation);
  const scores = results.map(r => r.analysis.score || r.analysis.overall?.score || 50);
  
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  const recCounts = recommendations.reduce((acc, rec) => {
    acc[rec] = (acc[rec] || 0) + 1;
    return acc;
  }, {});
  
  const topRecommendation = Object.entries(recCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'hold';
  
  return {
    averageScore: Math.round(avgScore),
    topRecommendation,
    recommendationBreakdown: recCounts,
    totalAnalyzed: results.length
  };
}

module.exports = router;
