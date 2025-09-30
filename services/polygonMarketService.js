const axios = require('axios');

class PolygonMarketService {
  constructor() {
    this.apiKey = process.env.POLYGON_API_KEY || null;
    this.baseUrl = process.env.POLYGON_API_BASE_URL || 'https://api.polygon.io';
    this.requestTimeout = Number(process.env.POLYGON_API_TIMEOUT || 8000);
    this.cache = new Map();
    this.defaultTtl = {
      movers: 15000,
      snapshot: 10000,
      indices: 20000,
      aggregates: 5 * 60 * 1000,
      quote: 10000,
      news: 60 * 1000,
    };

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: this.requestTimeout,
    });
  }

  ensureApiKey() {
    if (!this.apiKey) {
      const error = new Error('POLYGON_API_KEY is not configured');
      error.code = 'POLYGON_API_KEY_MISSING';
      throw error;
    }
  }

  buildCacheKey(prefix, params) {
    const paramString = params ? JSON.stringify(params) : '';
    return `${prefix}:${paramString}`;
  }

  getCachedData(cacheKey, ttl) {
    if (!cacheKey) {
      return null;
    }

    const cached = this.cache.get(cacheKey);
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    this.cache.delete(cacheKey);
    return null;
  }

  setCachedData(cacheKey, data, ttl) {
    if (!cacheKey) {
      return;
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  async request(path, params = {}, cacheKey = null, ttl = this.defaultTtl.snapshot) {
    this.ensureApiKey();

    const cached = this.getCachedData(cacheKey, ttl);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.http.get(path, {
        params: {
          ...params,
          apiKey: this.apiKey,
        },
      });

      if (response.data && response.data.status === 'ERROR') {
        const error = new Error(response.data.error || 'Polygon API error');
        error.code = response.data.error || 'POLYGON_API_ERROR';
        throw error;
      }

      const payload = response.data;
      if (cacheKey) {
        this.setCachedData(cacheKey, payload, ttl);
      }

      return payload;
    } catch (error) {
      error.message = `Polygon API request failed (${path}): ${error.message}`;
      throw error;
    }
  }

  async getLastTrade(ticker) {
    const cacheKey = this.buildCacheKey('last_trades', { ticker });
    try {
      const payload = await this.request(
        `/v2/last/trade/${ticker}`,
        {},
        cacheKey,
        this.defaultTtl.quote,
      );

      const trade = payload?.results || payload?.last || payload?.trade;
      if (!trade) {
        return null;
      }

      return {
        price: trade.p ?? trade.price ?? null,
        size: trade.s ?? trade.size ?? null,
        exchange: trade.x ?? trade.exchange ?? null,
        timestamp: trade.t ?? trade.timestamp ?? null,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPreviousClose(ticker) {
    const cacheKey = this.buildCacheKey('prev_close', { ticker });
    const payload = await this.request(
      `/v2/aggs/ticker/${ticker}/prev`,
      {},
      cacheKey,
      this.defaultTtl.quote,
    );

    const result = Array.isArray(payload?.results) ? payload.results[0] : null;
    if (!result) {
      return null;
    }

    return {
      close: result.c ?? null,
      open: result.o ?? null,
      high: result.h ?? null,
      low: result.l ?? null,
      volume: result.v ?? null,
      vw: result.vw ?? null,
      timestamp: result.t ?? null,
    };
  }

  async getQuote(ticker) {
    const cacheKey = this.buildCacheKey('quotes', { ticker });
    const cached = this.getCachedData(cacheKey, this.defaultTtl.quote);
    if (cached) {
      return cached;
    }

    const [lastTradeResult, prevCloseResult] = await Promise.allSettled([
      this.getLastTrade(ticker),
      this.getPreviousClose(ticker),
    ]);

    const lastTrade = lastTradeResult.status === 'fulfilled' ? lastTradeResult.value : null;
    const prevClose = prevCloseResult.status === 'fulfilled' ? prevCloseResult.value : null;

    if (!lastTrade && !prevClose) {
      return null;
    }

    const price = lastTrade?.price ?? prevClose?.close ?? null;
    const previousClose = prevClose?.close ?? null;
    let change = null;
    let changePercent = null;

    if (price !== null && previousClose !== null) {
      change = Number((price - previousClose).toFixed(2));
      changePercent = Number(((change / previousClose) * 100).toFixed(2));
    }

    const quote = {
      symbol: ticker,
      price,
      change,
      changePercent,
      volume: prevClose?.volume ?? null,
      high: prevClose?.high ?? null,
      low: prevClose?.low ?? null,
      open: prevClose?.open ?? null,
      previousClose,
      timestamp: lastTrade?.timestamp || prevClose?.timestamp || Date.now(),
    };

    this.setCachedData(cacheKey, quote, this.defaultTtl.quote);
    return quote;
  }

  async getTopMovers(type = 'gainers', options = {}) {
    const limit = Number(options.limit || 10);
    const path = `/v2/snapshot/locale/us/markets/stocks/${type}`;
    const cacheKey = this.buildCacheKey(`movers:${type}`, { limit });
    const ttl = this.defaultTtl.movers;

    const response = await this.request(path, { limit }, cacheKey, ttl);
    const results = Array.isArray(response?.tickers) ? response.tickers : [];

    return results.slice(0, limit).map((item) => this.normalizeSnapshotResult(item));
  }

  async getMostActive(options = {}) {
    return this.getTopMovers('mostactive', options);
  }

  async getTopGainers(options = {}) {
    return this.getTopMovers('gainers', options);
  }

  async getTopLosers(options = {}) {
    return this.getTopMovers('losers', options);
  }

  normalizeSnapshotResult(result) {
    if (!result) {
      return null;
    }

    return {
      ticker: result.ticker,
      name: result.name,
      market: result.market || 'stocks',
      locale: result.locale || 'us',
      price: result.lastQuote?.P ?? result.min?.o ?? null,
      change: result.todaysChange ?? null,
      changePercent: result.todaysChangePerc ?? null,
      volume: result.day?.v ?? null,
      high: result.day?.h ?? null,
      low: result.day?.l ?? null,
      open: result.day?.o ?? null,
      previousClose: result.prevDay?.c ?? null,
      updated: result.updated ?? null,
    };
  }

  async getBulkSnapshots(tickers = []) {
    if (!Array.isArray(tickers) || tickers.length === 0) {
      throw new Error('Tickers array is required for bulk snapshots');
    }

    const limitedTickers = tickers.slice(0, 50);
    const tickerParam = limitedTickers.join(',');
    const path = `/v2/snapshot/locale/us/markets/stocks/tickers`;
    const cacheKey = this.buildCacheKey('snapshot_bulk', { tickerParam });

    const response = await this.request(path, { tickers: tickerParam }, cacheKey, this.defaultTtl.snapshot);
    const results = Array.isArray(response?.tickers) ? response.tickers : [];

    return results.map((item) => this.normalizeSnapshotResult(item));
  }

  async getIndicesSnapshot() {
    try {
      const tickers = ['SPY', 'QQQ', 'DIA', 'IWM'];
      const quotes = await Promise.all(tickers.map((ticker) => this.getQuote(ticker)));
      return quotes
        .filter(Boolean)
        .map((quote, index) => ({
          symbol: tickers[index],
          name: tickers[index],
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          previousClose: quote.previousClose,
        }));
    } catch (error) {
      throw error;
    }
  }

  async getAggregates({ ticker, multiplier = 1, timespan = 'day', from, to, limit = 120 }) {
    if (!ticker) {
      throw new Error('Ticker is required for aggregates');
    }

    const path = `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`;
    const cacheKey = this.buildCacheKey('aggregates', { ticker, multiplier, timespan, from, to, limit });
    const ttl = this.defaultTtl.aggregates;

    const response = await this.request(path, { limit }, cacheKey, ttl);
    return Array.isArray(response?.results) ? response.results : [];
  }

  async getNews({ tickers, limit = 20, order = 'desc' }) {
    const params = {
      limit: Math.min(Math.max(limit, 1), 50),
      order,
    };

    if (Array.isArray(tickers) && tickers.length > 0) {
      params.ticker = tickers.join(',');
    }

    const path = `/v2/reference/news`;
    const cacheKey = this.buildCacheKey('news', params);
    const ttl = this.defaultTtl.news;

    const response = await this.request(path, params, cacheKey, ttl);
    return Array.isArray(response?.results) ? response.results : [];
  }
}

module.exports = new PolygonMarketService();
