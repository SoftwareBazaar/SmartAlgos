const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { auth, requireSubscription, updateActivity } = require('../middleware/auth');
const router = express.Router();

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

module.exports = router;
