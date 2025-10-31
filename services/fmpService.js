const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Financial Modeling Prep API Service
 * Provides real-time market data, news, and economic calendar
 * Free tier: 250 requests/day
 * Docs: https://financialmodelingprep.com/developer/docs/
 */
class FMPService {
  constructor() {
    this.apiKey = process.env.FMP_API_KEY || 'demo';
    this.baseUrl = 'https://financialmodelingprep.com/api/v3';
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds for real-time feel
  }

  /**
   * Get real-time stock quote
   */
  async getStockQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(`${this.baseUrl}/quote/${symbol}`, {
        params: { apikey: this.apiKey }
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No data returned');
      }

      const quote = response.data[0];
      const stockData = {
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changesPercentage,
        volume: quote.volume,
        dayHigh: quote.dayHigh,
        dayLow: quote.dayLow,
        open: quote.open,
        previousClose: quote.previousClose,
        marketCap: quote.marketCap,
        eps: quote.eps,
        pe: quote.pe,
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        data: stockData,
        timestamp: Date.now()
      });

      return stockData;
    } catch (error) {
      logger.throttle(`fmp-quote-${symbol}`, 'error', `[FMP] Error fetching quote for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get multiple stock quotes at once (batch)
   */
  async getBatchQuotes(symbols) {
    const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
    
    try {
      const response = await axios.get(`${this.baseUrl}/quote/${symbolString}`, {
        params: { apikey: this.apiKey }
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No data returned');
      }

      return response.data.map(quote => ({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changesPercentage,
        volume: quote.volume,
        dayHigh: quote.dayHigh,
        dayLow: quote.dayLow,
        open: quote.open,
        previousClose: quote.previousClose,
        marketCap: quote.marketCap,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      logger.throttle('fmp-batch-quotes', 'error', '[FMP] Error fetching batch quotes:', error.message);
      throw error;
    }
  }

  /**
   * Get forex rates (real-time)
   */
  async getForexRates(pairs = ['EURUSD', 'GBPUSD', 'USDJPY']) {
    try {
      const response = await axios.get(`${this.baseUrl}/fx`, {
        params: { apikey: this.apiKey }
      });

      const requestedPairs = response.data.filter(pair => 
        pairs.includes(pair.ticker)
      );

      return requestedPairs.map(pair => ({
        symbol: pair.ticker,
        bid: pair.bid,
        ask: pair.ask,
        price: (pair.bid + pair.ask) / 2,
        change: pair.changes,
        changePercent: pair.changesPercentage,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      logger.throttle('fmp-forex', 'error', '[FMP] Error fetching forex rates:', error.message);
      throw error;
    }
  }

  /**
   * Get cryptocurrency prices
   */
  async getCryptoPrices(symbols = ['BTCUSD', 'ETHUSD']) {
    try {
      const response = await axios.get(`${this.baseUrl}/quotes/crypto`, {
        params: { apikey: this.apiKey }
      });

      const requestedCrypto = response.data.filter(crypto => 
        symbols.includes(crypto.symbol)
      );

      return requestedCrypto.map(crypto => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.price,
        change: crypto.change,
        changePercent: crypto.changesPercentage,
        marketCap: crypto.marketCap,
        volume: crypto.volume,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      logger.throttle('fmp-crypto', 'error', '[FMP] Error fetching crypto prices:', error.message);
      throw error;
    }
  }

  /**
   * Get economic calendar (UPCOMING EVENTS!)
   * This is what you need for tomorrow's market-moving news
   */
  async getEconomicCalendar(fromDate = null, toDate = null) {
    try {
      const params = { apikey: this.apiKey };
      
      if (fromDate) {
        params.from = fromDate; // Format: YYYY-MM-DD
      }
      if (toDate) {
        params.to = toDate;
      }

      const response = await axios.get(`${this.baseUrl}/economic_calendar`, {
        params
      });

      return response.data.map(event => ({
        date: event.date,
        time: event.time || 'All Day',
        country: event.country,
        event: event.event,
        currency: event.currency,
        previous: event.previous,
        estimate: event.estimate,
        actual: event.actual,
        impact: event.impact, // LOW, MEDIUM, HIGH
        changePercentage: event.changePercentage,
        isHighImpact: event.impact === 'HIGH'
      }));
    } catch (error) {
      console.error('[FMP] Error fetching economic calendar:', error.message);
      throw error;
    }
  }

  /**
   * Get upcoming earnings (company earnings reports)
   */
  async getEarningsCalendar(fromDate = null, toDate = null) {
    try {
      const params = { apikey: this.apiKey };
      
      if (fromDate) {
        params.from = fromDate;
      }
      if (toDate) {
        params.to = toDate;
      }

      const response = await axios.get(`${this.baseUrl}/earning_calendar`, {
        params
      });

      return response.data.map(earning => ({
        date: earning.date,
        symbol: earning.symbol,
        eps: earning.eps,
        epsEstimated: earning.epsEstimated,
        revenue: earning.revenue,
        revenueEstimated: earning.revenueEstimated,
        time: earning.time,
        fiscalDateEnding: earning.fiscalDateEnding
      }));
    } catch (error) {
      console.error('[FMP] Error fetching earnings calendar:', error.message);
      throw error;
    }
  }

  /**
   * Get market news
   */
  async getMarketNews(options = {}) {
    // Check if API key is available and valid
    if (!this.apiKey || this.apiKey === 'demo' || this.apiKey === 'your_fmp_key_here' || this.apiKey.includes('your_')) {
      logger.warn('[FMP] API key not configured or invalid');
      throw new Error('FMP API key not configured');
    }
    const { tickers = [], limit = 50, page = 0 } = options;
    
    try {
      const params = {
        apikey: this.apiKey,
        limit,
        page
      };

      if (tickers.length > 0) {
        params.tickers = tickers.join(',');
      }

      const response = await axios.get(`${this.baseUrl}/stock_news`, {
        params,
        timeout: 10000 // 10 second timeout
      });

      // Check if response has data
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        logger.warn('[FMP] No news articles returned from API');
        return [];
      }

      logger.info(`[FMP] Successfully fetched ${response.data.length} news articles`);

      return response.data.map(article => ({
        publishedDate: article.publishedDate,
        title: article.title,
        image: article.image,
        site: article.site,
        text: article.text,
        url: article.url,
        symbol: article.symbol
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      logger.error(`[FMP] Error fetching market news: ${errorMsg}`);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logger.error('[FMP] Invalid API key - check your FMP_API_KEY');
      } else if (error.response?.status === 429) {
        logger.error('[FMP] Rate limit exceeded - free tier: 250 requests/day');
      }
      throw error;
    }
  }

  /**
   * Get stock market movers (gainers/losers)
   */
  async getMarketMovers(type = 'gainers') {
    try {
      const endpoint = type === 'gainers' ? 'gainers' : 'losers';
      const response = await axios.get(`${this.baseUrl}/stock_market/${endpoint}`, {
        params: { apikey: this.apiKey }
      });

      return response.data.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changesPercentage
      }));
    } catch (error) {
      console.error(`[FMP] Error fetching ${type}:`, error.message);
      throw error;
    }
  }

  /**
   * Health check - verify API key is working
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/quote/AAPL`, {
        params: { apikey: this.apiKey }
      });

      return {
        status: 'ok',
        message: 'FMP API is working',
        apiKeyValid: response.data && response.data.length > 0,
        rateLimit: response.headers['x-ratelimit-remaining']
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        apiKeyValid: false
      };
    }
  }
}

module.exports = new FMPService();

