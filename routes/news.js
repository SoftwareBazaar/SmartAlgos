const express = require('express');
const { query, body, validationResult } = require('express-validator');
const newsService = require('../services/newsService');
const databaseService = require('../services/databaseService');
const aiSignalService = require('../services/aiSignalService');
const { auth, requireSubscription, updateActivity } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/news
// @desc    Get financial news with filtering
// @access  Private
router.get('/', [
  auth,
  updateActivity,
  query('symbols').optional().isString().withMessage('Symbols must be a string'),
  query('countries').optional().isString().withMessage('Countries must be a string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  query('category').optional().isIn(['earnings', 'monetary_policy', 'inflation', 'forex', 'crypto', 'general']),
  query('impact').optional().isIn(['high', 'medium', 'low']),
  query('sentiment').optional().isIn(['positive', 'negative', 'neutral'])
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

    const {
      symbols,
      countries,
      limit = 20,
      offset = 0,
      category,
      impact,
      sentiment
    } = req.query;

    const options = {
      symbols: symbols ? symbols.split(',') : undefined,
      countries: countries ? countries.split(',') : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const result = await newsService.getFinancialNews(options);

    // Apply additional filters
    let filteredNews = result.data;
    
    if (category) {
      filteredNews = filteredNews.filter(article => article.category === category);
    }
    
    if (impact) {
      filteredNews = filteredNews.filter(article => article.impact === impact);
    }
    
    if (sentiment) {
      filteredNews = filteredNews.filter(article => article.sentiment === sentiment);
    }

    res.json({
      success: true,
      data: filteredNews,
      meta: {
        ...result.meta,
        filtered_count: filteredNews.length
      }
    });

  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/news/trending
// @desc    Get trending news topics
// @access  Private
router.get('/trending', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const result = await newsService.getTrendingNews();
    res.json(result);
  } catch (error) {
    console.error('Get trending news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/news/symbol/:symbol
// @desc    Get news for specific symbol
// @access  Private
router.get('/symbol/:symbol', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 10 } = req.query;

    const result = await newsService.getNewsForSymbol(symbol, parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Get symbol news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/news/categories
// @desc    Get available news categories
// @access  Private
router.get('/categories', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const categories = [
      { id: 'earnings', name: 'Earnings', description: 'Corporate earnings and financial results' },
      { id: 'monetary_policy', name: 'Monetary Policy', description: 'Central bank decisions and policy changes' },
      { id: 'inflation', name: 'Inflation', description: 'Inflation data and economic indicators' },
      { id: 'forex', name: 'Forex', description: 'Currency market news and analysis' },
      { id: 'crypto', name: 'Cryptocurrency', description: 'Digital currency market updates' },
      { id: 'general', name: 'General', description: 'General market and economic news' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/news/sentiment-analysis
// @desc    Get news sentiment analysis for market
// @access  Private
router.get('/sentiment-analysis', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('symbols').optional().isString().withMessage('Symbols must be a string'),
  query('period').optional().isIn(['1h', '4h', '1d', '3d', '1w']).withMessage('Invalid period'),
  query('source').optional().isString().withMessage('Source must be a string')
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

    const { symbols, period = '1d', source } = req.query;
    const symbolList = symbols ? symbols.split(',') : ['SPY', 'QQQ', 'AAPL', 'MSFT', 'TSLA'];

    const sentimentAnalysis = await newsService.getSentimentAnalysis({
      symbols: symbolList,
      period,
      source
    });

    res.json({
      success: true,
      data: sentimentAnalysis
    });

  } catch (error) {
    console.error('Get sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sentiment analysis'
    });
  }
});

// @route   GET /api/news/market-movers
// @desc    Get news about biggest market movers
// @access  Private
router.get('/market-movers', [
  auth,
  updateActivity,
  query('type').optional().isIn(['gainers', 'losers', 'volume']).withMessage('Invalid type'),
  query('market').optional().isIn(['US', 'NSE', 'crypto']).withMessage('Invalid market')
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

    const { type = 'gainers', market = 'US' } = req.query;

    const marketMovers = await newsService.getMarketMoversNews({
      type,
      market,
      limit: 20
    });

    res.json({
      success: true,
      data: marketMovers
    });

  } catch (error) {
    console.error('Get market movers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get market movers news'
    });
  }
});

// @route   GET /api/news/earnings-calendar
// @desc    Get earnings calendar with related news
// @access  Private
router.get('/earnings-calendar', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('date').optional().isISO8601().withMessage('Date must be in ISO format'),
  query('period').optional().isIn(['today', 'tomorrow', 'this_week', 'next_week']).withMessage('Invalid period')
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

    const { date, period = 'today' } = req.query;

    const earningsCalendar = await newsService.getEarningsCalendar({
      date,
      period
    });

    res.json({
      success: true,
      data: earningsCalendar
    });

  } catch (error) {
    console.error('Get earnings calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get earnings calendar'
    });
  }
});

// @route   GET /api/news/economic-events
// @desc    Get economic events and related news
// @access  Private
router.get('/economic-events', [
  auth,
  updateActivity,
  query('country').optional().isString().withMessage('Country must be a string'),
  query('importance').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid importance'),
  query('from_date').optional().isISO8601().withMessage('From date must be in ISO format'),
  query('to_date').optional().isISO8601().withMessage('To date must be in ISO format')
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

    const { country, importance, from_date, to_date } = req.query;

    const economicEvents = await newsService.getEconomicEvents({
      country,
      importance,
      fromDate: from_date,
      toDate: to_date
    });

    res.json({
      success: true,
      data: economicEvents
    });

  } catch (error) {
    console.error('Get economic events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get economic events'
    });
  }
});

// @route   POST /api/news/watchlist
// @desc    Add symbols to news watchlist
// @access  Private
router.post('/watchlist', [
  auth,
  updateActivity,
  body('symbols').isArray().withMessage('Symbols must be an array'),
  body('symbols.*').isString().withMessage('Each symbol must be a string'),
  body('alertTypes').optional().isArray().withMessage('Alert types must be an array')
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

    const { symbols, alertTypes = ['earnings', 'news', 'price_alert'] } = req.body;
    const userId = req.user.id;

    // Save watchlist to database
    const watchlist = await databaseService.createNewsWatchlist({
      user_id: userId,
      symbols,
      alert_types: alertTypes,
      is_active: true,
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      data: watchlist,
      message: 'Watchlist created successfully'
    });

  } catch (error) {
    console.error('Create watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create watchlist'
    });
  }
});

// @route   GET /api/news/watchlist
// @desc    Get user's news watchlist
// @access  Private
router.get('/watchlist', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const userId = req.user.id;

    const watchlists = await databaseService.getUserNewsWatchlists(userId);

    res.json({
      success: true,
      data: watchlists
    });

  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get watchlist'
    });
  }
});

// @route   GET /api/news/alerts
// @desc    Get news alerts for user's watchlist
// @access  Private
router.get('/alerts', [
  auth,
  updateActivity,
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('unread_only').optional().isBoolean().withMessage('Unread only must be boolean')
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

    const userId = req.user.id;
    const { limit = 20, unread_only = false } = req.query;

    const alerts = await databaseService.getNewsAlerts({
      user_id: userId,
      limit: parseInt(limit),
      unread_only: unread_only === 'true'
    });

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Get news alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get news alerts'
    });
  }
});

// @route   POST /api/news/alerts/:id/read
// @desc    Mark news alert as read
// @access  Private
router.post('/alerts/:id/read', [
  auth,
  updateActivity
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await databaseService.markNewsAlertAsRead(id, userId);

    res.json({
      success: true,
      message: 'Alert marked as read'
    });

  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read'
    });
  }
});

// @route   GET /api/news/search
// @desc    Search news articles
// @access  Private
router.get('/search', [
  auth,
  updateActivity,
  query('q').isLength({ min: 1 }).withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['relevance', 'date', 'popularity']).withMessage('Invalid sort option'),
  query('date_from').optional().isISO8601().withMessage('Date from must be in ISO format'),
  query('date_to').optional().isISO8601().withMessage('Date to must be in ISO format')
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

    const { q, limit = 20, sort = 'relevance', date_from, date_to } = req.query;

    const searchResults = await newsService.searchNews({
      query: q,
      limit: parseInt(limit),
      sort,
      dateFrom: date_from,
      dateTo: date_to
    });

    res.json({
      success: true,
      data: searchResults
    });

  } catch (error) {
    console.error('Search news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search news'
    });
  }
});

// @route   GET /api/news/summary/:id
// @desc    Get AI-generated summary of news article
// @access  Private
router.get('/summary/:id', [
  auth,
  requireSubscription('professional'),
  updateActivity
], async (req, res) => {
  try {
    const { id } = req.params;

    // Get the article first
    const article = await newsService.getArticleById(id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Generate AI summary
    const summary = await aiSignalService.generateNewsSummary(article);

    res.json({
      success: true,
      data: {
        article_id: id,
        title: article.title,
        summary: summary.text,
        key_points: summary.keyPoints,
        sentiment: summary.sentiment,
        market_impact: summary.marketImpact,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get news summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate news summary'
    });
  }
});

// @route   GET /api/news/analytics
// @desc    Get news analytics and insights
// @access  Private
router.get('/analytics', [
  auth,
  requireSubscription('professional'),
  updateActivity,
  query('period').optional().isIn(['1d', '3d', '1w', '1m']).withMessage('Invalid period'),
  query('symbols').optional().isString().withMessage('Symbols must be a string')
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

    const { period = '1w', symbols } = req.query;
    const symbolList = symbols ? symbols.split(',') : null;

    const analytics = await newsService.getNewsAnalytics({
      period,
      symbols: symbolList
    });

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get news analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get news analytics'
    });
  }
});

module.exports = router;
