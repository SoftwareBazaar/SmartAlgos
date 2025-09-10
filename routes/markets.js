const express = require('express');
const { query, validationResult } = require('express-validator');
const axios = require('axios');
const { auth, requireSubscription, updateActivity } = require('../middleware/auth');
const { broadcastMarketData } = require('../websocket/handlers');
const marketDataService = require('../services/marketDataService');
const router = express.Router();

// Market data cache (in production, use Redis)
const marketDataCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Helper function to get cached data or fetch new data
const getCachedData = async (key, fetchFunction, ttl = CACHE_DURATION) => {
  const cached = marketDataCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fetchFunction();
  marketDataCache.set(key, {
    data,
    timestamp: Date.now()
  });

  return data;
};

// @route   GET /api/markets/overview
// @desc    Get comprehensive market overview data
// @access  Private
router.get('/overview', [auth, updateActivity], async (req, res) => {
  try {
    const { market } = req.query;
    
    let marketOverview;
    
    if (market === 'US') {
      marketOverview = await marketDataService.getUSMarketOverview();
    } else if (market === 'NSE') {
      marketOverview = await marketDataService.getNSEMarketOverview();
    } else {
      // Get all markets overview
      const [usOverview, nseOverview, forexOverview, cryptoOverview, commodityOverview] = await Promise.allSettled([
        marketDataService.getUSMarketOverview(),
        marketDataService.getNSEMarketOverview(),
        marketDataService.getForexOverview(),
        marketDataService.getCryptoOverview(),
        marketDataService.getCommodityOverview()
      ]);

      marketOverview = {
        us: usOverview.status === 'fulfilled' ? usOverview.value : null,
        nse: nseOverview.status === 'fulfilled' ? nseOverview.value : null,
        forex: forexOverview.status === 'fulfilled' ? forexOverview.value : null,
        crypto: cryptoOverview.status === 'fulfilled' ? cryptoOverview.value : null,
        commodities: commodityOverview.status === 'fulfilled' ? commodityOverview.value : null,
        timestamp: new Date()
      };
    }

    res.json({
      success: true,
      data: marketOverview
    });

  } catch (error) {
    console.error('Get market overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/stocks
// @desc    Get stock market data
// @access  Private
router.get('/stocks', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('symbol').optional().isLength({ min: 1, max: 10 }),
  query('market').optional().isIn(['US', 'NSE']),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { symbol, market = 'US', limit = 50 } = req.query;

    let stockData;
    
    if (symbol) {
      // Get specific stock quote
      if (market === 'US') {
        stockData = await marketDataService.getUSStockQuote(symbol);
      } else if (market === 'NSE') {
        stockData = await marketDataService.getNSEStockQuote(symbol);
      }
    } else {
      // Get market overview data
      if (market === 'US') {
        const overview = await marketDataService.getUSMarketOverview();
        stockData = {
          gainers: overview?.gainers || [],
          losers: overview?.losers || [],
          mostActive: overview?.mostActive || [],
          indices: overview?.indices || []
        };
      } else if (market === 'NSE') {
        const overview = await marketDataService.getNSEMarketOverview();
        stockData = {
          gainers: overview?.gainers || [],
          losers: overview?.losers || [],
          mostActive: overview?.mostActive || [],
          indices: overview?.indices || []
        };
      }
    }

    res.json({
      success: true,
      data: stockData
    });

  } catch (error) {
    console.error('Get stocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/forex
// @desc    Get forex market data
// @access  Private
router.get('/forex', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('pair').optional().isLength({ min: 6, max: 7 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { pair, limit = 20 } = req.query;

    const forexData = await marketDataService.getForexOverview();
    
    let filteredData = forexData;
    if (pair) {
      filteredData = forexData?.filter(data => data.pair === pair) || [];
    }
    if (limit) {
      filteredData = filteredData?.slice(0, limit) || [];
    }

    res.json({
      success: true,
      data: filteredData
    });

  } catch (error) {
    console.error('Get forex error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/crypto
// @desc    Get cryptocurrency market data
// @access  Private
router.get('/crypto', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('symbol').optional().isLength({ min: 3, max: 10 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { symbol, limit = 50 } = req.query;

    const cryptoData = await marketDataService.getCryptoOverview();
    
    let filteredData = cryptoData;
    if (symbol) {
      filteredData = cryptoData?.filter(data => data.symbol === symbol.toUpperCase()) || [];
    }
    if (limit) {
      filteredData = filteredData?.slice(0, limit) || [];
    }

    res.json({
      success: true,
      data: filteredData
    });

  } catch (error) {
    console.error('Get crypto error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/commodities
// @desc    Get commodity market data
// @access  Private
router.get('/commodities', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('symbol').optional().isLength({ min: 1, max: 10 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { symbol, limit = 20 } = req.query;

    const commodityData = await marketDataService.getCommodityOverview();
    
    let filteredData = commodityData;
    if (symbol) {
      filteredData = commodityData?.filter(data => data.symbol === symbol.toUpperCase()) || [];
    }
    if (limit) {
      filteredData = filteredData?.slice(0, limit) || [];
    }

    res.json({
      success: true,
      data: filteredData
    });

  } catch (error) {
    console.error('Get commodities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/quote/:symbol
// @desc    Get real-time quote for specific symbol
// @access  Private
router.get('/quote/:symbol', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const { symbol } = req.params;
    const { market = 'US' } = req.query;

    let quote;
    
    if (market === 'US') {
      quote = await marketDataService.getUSStockQuote(symbol);
    } else if (market === 'NSE') {
      quote = await marketDataService.getNSEStockQuote(symbol);
    } else if (market === 'crypto') {
      const cryptoData = await marketDataService.getCryptoOverview();
      quote = cryptoData?.find(data => data.symbol === symbol.toUpperCase());
    } else if (market === 'forex') {
      const forexData = await marketDataService.getForexOverview();
      quote = forexData?.find(data => data.pair === symbol.toUpperCase());
    }

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Symbol not found'
      });
    }

    // Broadcast real-time data via WebSocket
    broadcastMarketData(req.io, {
      symbol: quote.symbol,
      market: market,
      price: quote.price,
      change: quote.change,
      volume: quote.volume,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/historical/:symbol
// @desc    Get historical data for symbol
// @access  Private
router.get('/historical/:symbol', [
  auth,
  requireSubscription('basic'),
  updateActivity,
  query('interval').optional().isIn(['1m', '5m', '15m', '30m', '1h', '4h', '1d']),
  query('period').optional().isIn(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']),
  query('market').optional().isIn(['US', 'NSE', 'crypto', 'forex'])
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
    const { interval = '1d', period = '1mo', market = 'US' } = req.query;

    let historicalData;
    
    if (market === 'US') {
      historicalData = await marketDataService.getUSHistoricalData(symbol, interval, period);
    } else if (market === 'NSE') {
      historicalData = await marketDataService.getNSEHistoricalData(symbol, interval, period);
    } else {
      // For crypto and forex, return mock data
      historicalData = await marketDataService.getUSHistoricalData(symbol, interval, period);
    }

    res.json({
      success: true,
      data: historicalData
    });

  } catch (error) {
    console.error('Get historical data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/screener
// @desc    Stock screener with filters
// @access  Private
router.get('/screener', [
  auth,
  requireSubscription('professional'),
  updateActivity,
  query('market').optional().isIn(['US', 'NSE']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('minVolume').optional().isInt({ min: 0 }),
  query('minMarketCap').optional().isInt({ min: 0 }),
  query('sector').optional().isLength({ min: 1, max: 50 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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
      market = 'US',
      minPrice,
      maxPrice,
      minVolume,
      minMarketCap,
      sector,
      limit = 50
    } = req.query;

    let screenerResults;
    
    if (market === 'US') {
      screenerResults = await marketDataService.getUSScreener({
        minPrice,
        maxPrice,
        minVolume,
        minMarketCap,
        sector,
        limit
      });
    } else if (market === 'NSE') {
      screenerResults = await marketDataService.getNSEScreener({
        minPrice,
        maxPrice,
        minVolume,
        minMarketCap,
        sector,
        limit
      });
    }

    res.json({
      success: true,
      data: screenerResults
    });

  } catch (error) {
    console.error('Get screener error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== NEW MARKET DATA ENDPOINTS ====================

// @route   GET /api/markets/status
// @desc    Get market status for all supported markets
// @access  Private
router.get('/status', [auth, updateActivity], async (req, res) => {
  try {
    const { market } = req.query;
    
    let marketStatus;
    
    if (market === 'US') {
      marketStatus = marketDataService.getUSMarketStatus();
    } else if (market === 'NSE') {
      marketStatus = marketDataService.getNSEMarketStatus();
    } else {
      // Get all market statuses
      marketStatus = {
        us: marketDataService.getUSMarketStatus(),
        nse: marketDataService.getNSEMarketStatus(),
        timestamp: new Date()
      };
    }

    res.json({
      success: true,
      data: marketStatus
    });

  } catch (error) {
    console.error('Get market status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/markets/subscribe
// @desc    Subscribe to real-time market data updates
// @access  Private
router.post('/subscribe', [
  auth,
  requireSubscription('basic'),
  updateActivity
], async (req, res) => {
  try {
    const { symbol, market } = req.body;
    
    if (!symbol || !market) {
      return res.status(400).json({
        success: false,
        message: 'Symbol and market are required'
      });
    }

    // Subscribe to real-time updates
    marketDataService.subscribeToSymbol(symbol, market, (data) => {
      // Broadcast to WebSocket clients
      broadcastMarketData(req.io, {
        symbol: data.symbol,
        market: market,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        timestamp: data.timestamp
      });
    });

    res.json({
      success: true,
      message: `Subscribed to ${symbol} on ${market} market`
    });

  } catch (error) {
    console.error('Subscribe to market data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/markets/unsubscribe
// @desc    Unsubscribe from real-time market data updates
// @access  Private
router.post('/unsubscribe', [
  auth,
  requireSubscription('basic'),
  updateActivity
], async (req, res) => {
  try {
    const { symbol, market } = req.body;
    
    if (!symbol || !market) {
      return res.status(400).json({
        success: false,
        message: 'Symbol and market are required'
      });
    }

    // Unsubscribe from real-time updates
    marketDataService.unsubscribeFromSymbol(symbol, market);

    res.json({
      success: true,
      message: `Unsubscribed from ${symbol} on ${market} market`
    });

  } catch (error) {
    console.error('Unsubscribe from market data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/sectors
// @desc    Get available sectors for screening
// @access  Private
router.get('/sectors', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const { market = 'US' } = req.query;
    
    let sectors;
    
    if (market === 'US') {
      sectors = [
        'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 
        'Industrial', 'Materials', 'Utilities', 'Real Estate', 'Communication'
      ];
    } else if (market === 'NSE') {
      sectors = [
        'Banking', 'Insurance', 'Telecommunications', 'Energy', 
        'Manufacturing', 'Agriculture', 'Real Estate', 'Transportation'
      ];
    }

    res.json({
      success: true,
      data: sectors
    });

  } catch (error) {
    console.error('Get sectors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/indices
// @desc    Get market indices data
// @access  Private
router.get('/indices', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const { market = 'US' } = req.query;
    
    let indices;
    
    if (market === 'US') {
      const usOverview = await marketDataService.getUSMarketOverview();
      indices = usOverview?.indices || [];
    } else if (market === 'NSE') {
      const nseOverview = await marketDataService.getNSEMarketOverview();
      indices = nseOverview?.indices || [];
    } else {
      // Get all indices
      const [usOverview, nseOverview] = await Promise.allSettled([
        marketDataService.getUSMarketOverview(),
        marketDataService.getNSEMarketOverview()
      ]);
      
      indices = {
        us: usOverview.status === 'fulfilled' ? usOverview.value?.indices : [],
        nse: nseOverview.status === 'fulfilled' ? nseOverview.value?.indices : []
      };
    }

    res.json({
      success: true,
      data: indices
    });

  } catch (error) {
    console.error('Get indices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/markets/trending
// @desc    Get trending stocks and assets
// @access  Private
router.get('/trending', [auth, requireSubscription('basic'), updateActivity], async (req, res) => {
  try {
    const { market = 'US', type = 'all' } = req.query;
    
    let trendingData;
    
    if (market === 'US') {
      const usOverview = await marketDataService.getUSMarketOverview();
      trendingData = {
        gainers: usOverview?.gainers || [],
        losers: usOverview?.losers || [],
        mostActive: usOverview?.mostActive || []
      };
    } else if (market === 'NSE') {
      const nseOverview = await marketDataService.getNSEMarketOverview();
      trendingData = {
        gainers: nseOverview?.gainers || [],
        losers: nseOverview?.losers || [],
        mostActive: nseOverview?.mostActive || []
      };
    } else {
      // Get all trending data
      const [usOverview, nseOverview, cryptoOverview] = await Promise.allSettled([
        marketDataService.getUSMarketOverview(),
        marketDataService.getNSEMarketOverview(),
        marketDataService.getCryptoOverview()
      ]);
      
      trendingData = {
        us: {
          gainers: usOverview.status === 'fulfilled' ? usOverview.value?.gainers : [],
          losers: usOverview.status === 'fulfilled' ? usOverview.value?.losers : [],
          mostActive: usOverview.status === 'fulfilled' ? usOverview.value?.mostActive : []
        },
        nse: {
          gainers: nseOverview.status === 'fulfilled' ? nseOverview.value?.gainers : [],
          losers: nseOverview.status === 'fulfilled' ? nseOverview.value?.losers : [],
          mostActive: nseOverview.status === 'fulfilled' ? nseOverview.value?.mostActive : []
        },
        crypto: cryptoOverview.status === 'fulfilled' ? cryptoOverview.value : []
      };
    }

    res.json({
      success: true,
      data: trendingData
    });

  } catch (error) {
    console.error('Get trending data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper functions for fetching market data (legacy - kept for backward compatibility)
async function fetchUSIndices() {
  try {
    const response = await axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/indices?apikey=${process.env.POLYGON_API_KEY}`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching US indices:', error);
    return null;
  }
}

async function fetchForexRates() {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`);
    return response.data.rates;
  } catch (error) {
    console.error('Error fetching forex rates:', error);
    return null;
  }
}

async function fetchCryptoPrices() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1');
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return null;
  }
}

async function fetchCommodityPrices() {
  try {
    // Mock commodity data - in production, use real commodity API
    return [
      { symbol: 'GOLD', price: 1950.50, change: 12.30, changePercent: 0.63 },
      { symbol: 'SILVER', price: 24.85, change: -0.15, changePercent: -0.60 },
      { symbol: 'OIL', price: 78.20, change: 1.45, changePercent: 1.89 },
      { symbol: 'COPPER', price: 3.85, change: 0.05, changePercent: 1.32 }
    ];
  } catch (error) {
    console.error('Error fetching commodity prices:', error);
    return null;
  }
}

async function fetchUSStocks(symbol, limit) {
  try {
    if (symbol) {
      const response = await axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apikey=${process.env.POLYGON_API_KEY}`);
      return [response.data.results];
    } else {
      const response = await axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?apikey=${process.env.POLYGON_API_KEY}&limit=${limit}`);
      return response.data.results;
    }
  } catch (error) {
    console.error('Error fetching US stocks:', error);
    return null;
  }
}

async function fetchNSEStocks(symbol, limit) {
  try {
    // Mock NSE data - in production, use real NSE API
    const mockNSEStocks = [
      { symbol: 'SBI', name: 'State Bank of India', price: 580.50, change: 5.20, changePercent: 0.90 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3450.75, change: -25.30, changePercent: -0.73 },
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2450.80, change: 15.60, changePercent: 0.64 }
    ];

    if (symbol) {
      return mockNSEStocks.filter(stock => stock.symbol === symbol);
    }
    return mockNSEStocks.slice(0, limit);
  } catch (error) {
    console.error('Error fetching NSE stocks:', error);
    return null;
  }
}

async function fetchForexData(pair, limit) {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`);
    const rates = response.data.rates;
    
    const majorPairs = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
    const forexData = majorPairs.map(currency => ({
      pair: `${currency}USD`,
      rate: rates[currency],
      change: Math.random() * 0.02 - 0.01, // Mock change
      changePercent: Math.random() * 2 - 1 // Mock change percent
    }));

    if (pair) {
      return forexData.filter(data => data.pair === pair);
    }
    return forexData.slice(0, limit);
  } catch (error) {
    console.error('Error fetching forex data:', error);
    return null;
  }
}

async function fetchCryptoData(symbol, limit) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`);
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return null;
  }
}

async function fetchCommodityData(symbol, limit) {
  try {
    // Mock commodity data
    const commodities = [
      { symbol: 'GOLD', name: 'Gold', price: 1950.50, change: 12.30, changePercent: 0.63 },
      { symbol: 'SILVER', name: 'Silver', price: 24.85, change: -0.15, changePercent: -0.60 },
      { symbol: 'OIL', name: 'Crude Oil', price: 78.20, change: 1.45, changePercent: 1.89 },
      { symbol: 'COPPER', name: 'Copper', price: 3.85, change: 0.05, changePercent: 1.32 },
      { symbol: 'WHEAT', name: 'Wheat', price: 6.45, change: -0.12, changePercent: -1.83 }
    ];

    if (symbol) {
      return commodities.filter(commodity => commodity.symbol === symbol);
    }
    return commodities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching commodity data:', error);
    return null;
  }
}

async function fetchUSStockQuote(symbol) {
  try {
    const response = await axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apikey=${process.env.POLYGON_API_KEY}`);
    const data = response.data.results;
    return {
      symbol: data.ticker,
      price: data.day?.c || 0,
      change: data.todaysChange || 0,
      changePercent: data.todaysChangePerc || 0,
      volume: data.day?.v || 0,
      high: data.day?.h || 0,
      low: data.day?.l || 0,
      open: data.day?.o || 0,
      previousClose: data.prevDay?.c || 0
    };
  } catch (error) {
    console.error('Error fetching US stock quote:', error);
    return null;
  }
}

async function fetchNSEStockQuote(symbol) {
  try {
    // Mock NSE quote - in production, use real NSE API
    return {
      symbol: symbol,
      price: Math.random() * 1000 + 100,
      change: Math.random() * 20 - 10,
      changePercent: Math.random() * 4 - 2,
      volume: Math.floor(Math.random() * 1000000),
      high: Math.random() * 1000 + 100,
      low: Math.random() * 1000 + 100,
      open: Math.random() * 1000 + 100,
      previousClose: Math.random() * 1000 + 100
    };
  } catch (error) {
    console.error('Error fetching NSE stock quote:', error);
    return null;
  }
}

async function fetchCryptoQuote(symbol) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`);
    const data = response.data[symbol];
    return {
      symbol: symbol.toUpperCase(),
      price: data.usd,
      change: data.usd_24h_change,
      changePercent: data.usd_24h_change,
      volume: 0, // Would need additional API call
      high: 0, // Would need additional API call
      low: 0, // Would need additional API call
      open: 0, // Would need additional API call
      previousClose: 0 // Would need additional API call
    };
  } catch (error) {
    console.error('Error fetching crypto quote:', error);
    return null;
  }
}

async function fetchForexQuote(pair) {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`);
    const rates = response.data.rates;
    const currency = pair.replace('USD', '');
    return {
      symbol: pair,
      price: rates[currency],
      change: Math.random() * 0.02 - 0.01,
      changePercent: Math.random() * 2 - 1,
      volume: 0,
      high: rates[currency] * 1.01,
      low: rates[currency] * 0.99,
      open: rates[currency],
      previousClose: rates[currency]
    };
  } catch (error) {
    console.error('Error fetching forex quote:', error);
    return null;
  }
}

async function fetchUSHistoricalData(symbol, interval, period) {
  try {
    // Mock historical data - in production, use real API
    const data = [];
    const now = new Date();
    const periods = {
      '1d': 1,
      '5d': 5,
      '1mo': 30,
      '3mo': 90,
      '6mo': 180,
      '1y': 365,
      '2y': 730,
      '5y': 1825,
      '10y': 3650,
      'ytd': 300,
      'max': 3650
    };

    const days = periods[period] || 30;
    const basePrice = 100;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const price = basePrice + Math.sin(i * 0.1) * 10 + Math.random() * 5;
      data.push({
        date: date.toISOString(),
        open: price,
        high: price + Math.random() * 2,
        low: price - Math.random() * 2,
        close: price + (Math.random() - 0.5) * 1,
        volume: Math.floor(Math.random() * 1000000)
      });
    }

    return data;
  } catch (error) {
    console.error('Error fetching US historical data:', error);
    return null;
  }
}

async function fetchNSEHistoricalData(symbol, interval, period) {
  try {
    // Mock NSE historical data
    return await fetchUSHistoricalData(symbol, interval, period);
  } catch (error) {
    console.error('Error fetching NSE historical data:', error);
    return null;
  }
}

async function fetchCryptoHistoricalData(symbol, interval, period) {
  try {
    // Mock crypto historical data
    return await fetchUSHistoricalData(symbol, interval, period);
  } catch (error) {
    console.error('Error fetching crypto historical data:', error);
    return null;
  }
}

async function fetchUSScreener(filters) {
  try {
    // Mock screener data - in production, use real screener API
    const stocks = [];
    for (let i = 0; i < (filters.limit || 50); i++) {
      stocks.push({
        symbol: `STOCK${i + 1}`,
        name: `Stock ${i + 1}`,
        price: Math.random() * 100 + 10,
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 10 - 5,
        volume: Math.floor(Math.random() * 1000000),
        marketCap: Math.floor(Math.random() * 1000000000),
        sector: ['Technology', 'Healthcare', 'Finance', 'Energy'][Math.floor(Math.random() * 4)]
      });
    }

    return stocks;
  } catch (error) {
    console.error('Error fetching US screener:', error);
    return null;
  }
}

async function fetchNSEScreener(filters) {
  try {
    // Mock NSE screener data
    return await fetchUSScreener(filters);
  } catch (error) {
    console.error('Error fetching NSE screener:', error);
    return null;
  }
}

module.exports = router;
