/**
 * Simple Markets API - Direct Polygon/Massive Integration
 * Bypasses complex services for direct API calls
 */

const express = require('express');
const axios = require('axios');
const { auth, updateActivity } = require('../middleware/auth');
const router = express.Router();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Cache
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// @route   GET /api/simple-markets/overview
// @desc    Get simple market overview with direct API calls
// @access  Private
router.get('/overview', [auth, updateActivity], async (req, res) => {
  try {
    const cached = getCached('market_overview');
    if (cached) {
      return res.json({ success: true, data: cached, source: 'cache' });
    }

    const overview = [];

    // Get S&P 500 (SPY ETF)
    try {
      const spyResponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/SPY/prev`, {
        params: { apiKey: POLYGON_API_KEY },
        timeout: 5000
      });
      
      if (spyResponse.data && spyResponse.data.results && spyResponse.data.results[0]) {
        const spy = spyResponse.data.results[0];
        const change = spy.c - spy.o;
        const changePercent = (change / spy.o) * 100;
        
        overview.push({
          symbol: 'S&P 500',
          value: spy.c.toFixed(2),
          change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
          changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
          trend: change >= 0 ? 'up' : 'down'
        });
      }
    } catch (error) {
      console.error('[Simple Markets] SPY error:', error.message);
    }

    // Get NASDAQ (QQQ ETF)
    try {
      const qqqResponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/QQQ/prev`, {
        params: { apiKey: POLYGON_API_KEY },
        timeout: 5000
      });
      
      if (qqqResponse.data && qqqResponse.data.results && qqqResponse.data.results[0]) {
        const qqq = qqqResponse.data.results[0];
        const change = qqq.c - qqq.o;
        const changePercent = (change / qqq.o) * 100;
        
        overview.push({
          symbol: 'NASDAQ',
          value: qqq.c.toFixed(2),
          change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
          changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
          trend: change >= 0 ? 'up' : 'down'
        });
      }
    } catch (error) {
      console.error('[Simple Markets] QQQ error:', error.message);
    }

    // Get DOW (DIA ETF)
    try {
      const diaResponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/DIA/prev`, {
        params: { apiKey: POLYGON_API_KEY },
        timeout: 5000
      });
      
      if (diaResponse.data && diaResponse.data.results && diaResponse.data.results[0]) {
        const dia = diaResponse.data.results[0];
        const change = dia.c - dia.o;
        const changePercent = (change / dia.o) * 100;
        
        overview.push({
          symbol: 'DOW',
          value: dia.c.toFixed(2),
          change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
          changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
          trend: change >= 0 ? 'up' : 'down'
        });
      }
    } catch (error) {
      console.error('[Simple Markets] DIA error:', error.message);
    }

    // Get BTC from CoinGecko (free, no API key needed)
    try {
      const btcResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd',
          include_24hr_change: 'true'
        },
        timeout: 5000
      });
      
      if (btcResponse.data && btcResponse.data.bitcoin) {
        const btc = btcResponse.data.bitcoin;
        const price = btc.usd;
        const changePercent = btc.usd_24h_change || 0;
        const change = (price * changePercent) / 100;
        
        overview.push({
          symbol: 'BTC/USD',
          value: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
          changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
          trend: changePercent >= 0 ? 'up' : 'down'
        });
      }
    } catch (error) {
      console.error('[Simple Markets] BTC error:', error.message);
    }

    if (overview.length > 0) {
      setCache('market_overview', overview);
      console.log(`[Simple Markets] ✅ Fetched ${overview.length} market indices`);
    }

    res.json({
      success: true,
      data: overview,
      source: 'api',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('[Simple Markets] Overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data',
      error: error.message
    });
  }
});

// @route   GET /api/simple-markets/quote/:symbol
// @desc    Get quote for a specific symbol
// @access  Private
router.get('/quote/:symbol', [auth, updateActivity], async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const cached = getCached(`quote_${symbol}`);
    if (cached) {
      return res.json({ success: true, data: cached, source: 'cache' });
    }

    const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev`, {
      params: { apiKey: POLYGON_API_KEY },
      timeout: 5000
    });

    if (response.data && response.data.results && response.data.results[0]) {
      const data = response.data.results[0];
      const change = data.c - data.o;
      const changePercent = (change / data.o) * 100;

      const quote = {
        symbol: symbol,
        price: data.c,
        open: data.o,
        high: data.h,
        low: data.l,
        close: data.c,
        volume: data.v,
        change: change,
        changePercent: changePercent,
        timestamp: data.t
      };

      setCache(`quote_${symbol}`, quote);

      return res.json({
        success: true,
        data: quote,
        source: 'api'
      });
    }

    res.status(404).json({
      success: false,
      message: 'No data found for symbol'
    });

  } catch (error) {
    console.error(`[Simple Markets] Quote error for ${req.params.symbol}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote',
      error: error.message
    });
  }
});

module.exports = router;
