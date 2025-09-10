const express = require('express');
const { query, validationResult } = require('express-validator');
const newsService = require('../services/newsService');
const { auth, updateActivity } = require('../middleware/auth');
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

module.exports = router;
