const express = require('express');
const router = express.Router();
const economicCalendarService = require('../services/economicCalendarService');
const fmpService = require('../services/fmpService');
const gnewsService = require('../services/gnewsService');

// @route   GET /api/economic-calendar/status
// @desc    Check API keys status (for debugging)
// @access  Public
router.get('/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      apis: {}
    };

    // Check FMP API Key
    status.apis.fmp = {
      key_configured: !!process.env.FMP_API_KEY,
      key_preview: process.env.FMP_API_KEY 
        ? `${process.env.FMP_API_KEY.substring(0, 8)}...${process.env.FMP_API_KEY.substring(process.env.FMP_API_KEY.length - 4)}`
        : 'NOT SET',
      status: 'unknown'
    };

    // Check GNews API Key
    status.apis.gnews = {
      key_configured: !!process.env.GNEWS_API_KEY,
      key_preview: process.env.GNEWS_API_KEY 
        ? `${process.env.GNEWS_API_KEY.substring(0, 8)}...${process.env.GNEWS_API_KEY.substring(process.env.GNEWS_API_KEY.length - 4)}`
        : 'NOT SET',
      status: 'unknown'
    };

    // Check Alpha Vantage API Key
    status.apis.alpha_vantage = {
      key_configured: !!process.env.ALPHA_VANTAGE_API_KEY && process.env.ALPHA_VANTAGE_API_KEY !== 'demo',
      key_preview: process.env.ALPHA_VANTAGE_API_KEY 
        ? `${process.env.ALPHA_VANTAGE_API_KEY.substring(0, 8)}...`
        : 'NOT SET',
      status: 'unknown'
    };

    // Test GNews API (quick health check)
    try {
      const gnewsHealth = await gnewsService.healthCheck();
      status.apis.gnews.status = gnewsHealth.status;
      status.apis.gnews.working = gnewsHealth.apiKeyValid;
    } catch (error) {
      status.apis.gnews.status = 'error';
      status.apis.gnews.error = error.message;
    }

    // Test FMP API (try to get a quote)
    try {
      const quote = await fmpService.getStockQuote('AAPL');
      status.apis.fmp.status = quote ? 'ok' : 'error';
      status.apis.fmp.working = !!quote;
      if (quote) {
        status.apis.fmp.sample = `AAPL: $${quote.price}`;
      }
    } catch (error) {
      status.apis.fmp.status = 'error';
      status.apis.fmp.error = error.message;
    }

    // Overall status
    const allWorking = 
      status.apis.fmp.working && 
      status.apis.gnews.working;

    res.json({
      success: true,
      overall_status: allWorking ? 'all_systems_operational' : 'some_apis_not_working',
      ...status,
      help: {
        message: allWorking 
          ? '✅ All APIs are working correctly!' 
          : '⚠️ Some APIs need configuration. Add missing keys in Railway Variables.',
        fmp_signup: 'https://financialmodelingprep.com/developer/docs/',
        gnews_signup: 'https://gnews.io/register'
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check API status',
      error: error.message
    });
  }
});

// @route   GET /api/economic-calendar/today
// @desc    Get today's economic events
// @access  Public
router.get('/today', async (req, res) => {
  try {
    const events = await economicCalendarService.getTodayEvents();
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get today events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s events'
    });
  }
});

// @route   GET /api/economic-calendar/tomorrow
// @desc    Get tomorrow's economic events
// @access  Public
router.get('/tomorrow', async (req, res) => {
  try {
    const events = await economicCalendarService.getTomorrowEvents();
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get tomorrow events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tomorrow\'s events'
    });
  }
});

// @route   GET /api/economic-calendar/week
// @desc    Get this week's economic events
// @access  Public
router.get('/week', async (req, res) => {
  try {
    const events = await economicCalendarService.getWeekEvents();
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get week events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch week\'s events'
    });
  }
});

// @route   GET /api/economic-calendar/high-impact
// @desc    Get high-impact events only
// @access  Public
router.get('/high-impact', async (req, res) => {
  try {
    const { from, to } = req.query;
    const events = await economicCalendarService.getHighImpactEvents(from, to);
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get high-impact events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch high-impact events'
    });
  }
});

// @route   GET /api/economic-calendar/country/:country
// @desc    Get events by country
// @access  Public
router.get('/country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { from, to } = req.query;
    const events = await economicCalendarService.getEventsByCountry(country, from, to);
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get country events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch country events'
    });
  }
});

// @route   GET /api/economic-calendar/currency/:currency
// @desc    Get events by currency (for Forex traders)
// @access  Public
router.get('/currency/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const { from, to } = req.query;
    const events = await economicCalendarService.getEventsByCurrency(currency, from, to);
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get currency events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency events'
    });
  }
});

// @route   GET /api/economic-calendar/earnings
// @desc    Get upcoming earnings
// @access  Public
router.get('/earnings', async (req, res) => {
  try {
    const { symbols, days = 7 } = req.query;
    const symbolArray = symbols ? symbols.split(',') : [];
    const earnings = await economicCalendarService.getUpcomingEarnings(symbolArray, parseInt(days));
    
    res.json({
      success: true,
      data: earnings
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings calendar'
    });
  }
});

// @route   GET /api/economic-calendar/summary
// @desc    Get market-moving events summary
// @access  Public
router.get('/summary', async (req, res) => {
  try {
    const summary = await economicCalendarService.getMarketMovingSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events summary'
    });
  }
});

// @route   GET /api/economic-calendar/news
// @desc    Get market news (aggregated from multiple sources)
// @access  Public
router.get('/news', async (req, res) => {
  try {
    const { symbols, limit = 20, source = 'all' } = req.query;
    const tickerArray = symbols ? symbols.split(',') : [];
    
    let news = [];
    
    // Try GNews first (real-time breaking news)
    if (source === 'all' || source === 'gnews') {
      try {
        const gnewsArticles = await gnewsService.getFinancialNews({
          limit: parseInt(limit)
        });
        news = news.concat(gnewsArticles.map(article => ({
          ...article,
          source_api: 'GNews'
        })));
      } catch (gnewsError) {
        console.log('[News] GNews failed:', gnewsError.message);
      }
    }
    
    // Add FMP news
    if (source === 'all' || source === 'fmp') {
      try {
        const fmpNews = await fmpService.getMarketNews({
          tickers: tickerArray,
          limit: parseInt(limit)
        });
        news = news.concat(fmpNews.map(article => ({
          ...article,
          source_api: 'FMP'
        })));
      } catch (fmpError) {
        console.log('[News] FMP failed:', fmpError.message);
      }
    }
    
    // Sort by date and limit
    news = news
      .sort((a, b) => new Date(b.publishedAt || b.publishedDate) - new Date(a.publishedAt || a.publishedDate))
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: news,
      total: news.length
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market news'
    });
  }
});

// @route   GET /api/economic-calendar/breaking
// @desc    Get breaking business news
// @access  Public
router.get('/breaking', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const news = await gnewsService.getBreakingNews({
      limit: parseInt(limit),
      category: 'business'
    });
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get breaking news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breaking news'
    });
  }
});

// @route   GET /api/economic-calendar/stock-news/:symbols
// @desc    Get news for specific stocks
// @access  Public
router.get('/stock-news/:symbols', async (req, res) => {
  try {
    const { symbols } = req.params;
    const { limit = 10 } = req.query;
    const symbolArray = symbols.split(',');
    
    const news = await gnewsService.getStockNews(symbolArray, parseInt(limit));
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get stock news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock news'
    });
  }
});

module.exports = router;

