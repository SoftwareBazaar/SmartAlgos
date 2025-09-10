const axios = require('axios');
const EventEmitter = require('events');
const nseService = require('./nseService');
const alphaVantageService = require('./alphaVantageService');

class MarketDataService extends EventEmitter {
  constructor() {
    super();
    this.cache = new Map();
    this.subscriptions = new Map();
    this.realTimeConnections = new Map();
    this.cacheDuration = {
      quotes: 10000,      // 10 seconds
      overview: 30000,    // 30 seconds
      historical: 300000, // 5 minutes
      screener: 60000     // 1 minute
    };
    
    // Start real-time data updates
    this.startRealTimeUpdates();
  }

  // ==================== CACHE MANAGEMENT ====================

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data, ttl = 30000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // ==================== NSE MARKET DATA ====================

  async getNSEMarketOverview() {
    const cacheKey = 'nse_market_overview';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const nseData = await nseService.getMarketOverview();
      this.setCachedData(cacheKey, nseData.data, this.cacheDuration.overview);
      return nseData.data;
    } catch (error) {
      console.error('Error fetching NSE market overview:', error);
      return this.getMockNSEData();
    }
  }

  async getNSEStockQuote(symbol) {
    const cacheKey = `nse_stock_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const stockData = await nseService.getStockQuote(symbol);
      this.setCachedData(cacheKey, stockData.data, this.cacheDuration.quotes);
      return stockData.data;
    } catch (error) {
      console.error(`Error fetching NSE stock ${symbol}:`, error);
      return null;
    }
  }

  async getNSEIndices() {
    const cacheKey = 'nse_indices';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const indicesData = await nseService.getIndices();
      this.setCachedData(cacheKey, indicesData.data, this.cacheDuration.overview);
      return indicesData.data;
    } catch (error) {
      console.error('Error fetching NSE indices:', error);
      return [];
    }
  }

  getMockNSEData() {
    return {
      marketStatus: 'open',
      lastUpdated: new Date().toISOString(),
      indices: [
        { symbol: 'NSE20', name: 'NSE 20 Share Index', price: 1850.45, change: 12.30, changePercent: 0.67 },
        { symbol: 'NSE25', name: 'NSE 25 Share Index', price: 3420.80, change: -8.50, changePercent: -0.25 },
        { symbol: 'NSEASI', name: 'NSE All Share Index', price: 125.67, change: 0.45, changePercent: 0.36 }
      ],
      gainers: [
        { symbol: 'SCOM', name: 'Safaricom PLC', price: 18.50, change: 0.85, changePercent: 4.82 },
        { symbol: 'EQTY', name: 'Equity Group Holdings', price: 42.30, change: 1.20, changePercent: 2.92 },
        { symbol: 'KCB', name: 'Kenya Commercial Bank', price: 28.75, change: 0.65, changePercent: 2.31 }
      ],
      losers: [
        { symbol: 'BAT', name: 'British American Tobacco', price: 185.00, change: -8.50, changePercent: -4.39 },
        { symbol: 'EABL', name: 'East African Breweries', price: 125.50, change: -3.25, changePercent: -2.52 }
      ],
      mostActive: [
        { symbol: 'SCOM', name: 'Safaricom PLC', price: 18.50, change: 0.85, changePercent: 4.82, volume: '45.2M' },
        { symbol: 'EQTY', name: 'Equity Group Holdings', price: 42.30, change: 1.20, changePercent: 2.92, volume: '12.8M' },
        { symbol: 'KCB', name: 'Kenya Commercial Bank', price: 28.75, change: 0.65, changePercent: 2.31, volume: '8.9M' }
      ]
    };
  }

  // ==================== ALPHA VANTAGE INTEGRATION ====================

  async getAlphaVantageStockQuote(symbol) {
    const cacheKey = `alpha_quote_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const stockData = await alphaVantageService.getStockQuote(symbol);
      this.setCachedData(cacheKey, stockData, this.cacheDuration.quotes);
      return stockData;
    } catch (error) {
      console.error(`Error fetching Alpha Vantage stock ${symbol}:`, error);
      return null;
    }
  }

  async getAlphaVantageStockOverview(symbol) {
    const cacheKey = `alpha_overview_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const overviewData = await alphaVantageService.getStockOverview(symbol);
      this.setCachedData(cacheKey, overviewData, this.cacheDuration.overview);
      return overviewData;
    } catch (error) {
      console.error(`Error fetching Alpha Vantage overview ${symbol}:`, error);
      return null;
    }
  }

  async getAlphaVantageTimeSeries(symbol, timeframe = 'daily') {
    const cacheKey = `alpha_timeseries_${symbol}_${timeframe}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      let timeSeriesData;
      if (timeframe === 'daily') {
        timeSeriesData = await alphaVantageService.getDailyTimeSeries(symbol);
      } else {
        timeSeriesData = await alphaVantageService.getIntradayTimeSeries(symbol, timeframe);
      }
      
      this.setCachedData(cacheKey, timeSeriesData, this.cacheDuration.historical);
      return timeSeriesData;
    } catch (error) {
      console.error(`Error fetching Alpha Vantage time series ${symbol}:`, error);
      return [];
    }
  }

  async getAlphaVantageTopGainersLosers() {
    const cacheKey = 'alpha_top_gainers_losers';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const topData = await alphaVantageService.getTopGainersLosers();
      this.setCachedData(cacheKey, topData, this.cacheDuration.overview);
      return topData;
    } catch (error) {
      console.error('Error fetching Alpha Vantage top gainers/losers:', error);
      return this.getMockUSData();
    }
  }

  // ==================== US MARKET DATA ====================

  async getUSMarketOverview() {
    const cacheKey = 'us_market_overview';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Try Alpha Vantage first for real data
      const alphaData = await this.getAlphaVantageTopGainersLosers();
      
      if (alphaData && alphaData.gainers && alphaData.gainers.length > 0) {
        const overview = {
          indices: await this.fetchUSIndices(),
          gainers: alphaData.gainers,
          losers: alphaData.losers,
          mostActive: alphaData.mostActive,
          marketStatus: this.getUSMarketStatus(),
          timestamp: new Date(alphaData.timestamp || new Date())
        };

        this.setCachedData(cacheKey, overview, this.cacheDuration.overview);
        return overview;
      }

      // Fallback to mock data if Alpha Vantage fails
      const [indices, gainers, losers, mostActive] = await Promise.allSettled([
        this.fetchUSIndices(),
        this.fetchUSGainers(),
        this.fetchUSLosers(),
        this.fetchUSMostActive()
      ]);

      const overview = {
        indices: indices.status === 'fulfilled' ? indices.value : null,
        gainers: gainers.status === 'fulfilled' ? gainers.value : null,
        losers: losers.status === 'fulfilled' ? losers.value : null,
        mostActive: mostActive.status === 'fulfilled' ? mostActive.value : null,
        marketStatus: this.getUSMarketStatus(),
        timestamp: new Date()
      };

      this.setCachedData(cacheKey, overview, this.cacheDuration.overview);
      return overview;
    } catch (error) {
      console.error('Error fetching US market overview:', error);
      return null;
    }
  }

  async fetchUSIndices() {
    try {
      // Using Alpha Vantage for indices
      const response = await axios.get(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
      
      // Mock data for demonstration
      return [
        {
          symbol: 'SPX',
          name: 'S&P 500',
          price: 4567.89,
          change: 23.45,
          changePercent: 0.52,
          volume: 0
        },
        {
          symbol: 'DJI',
          name: 'Dow Jones',
          price: 34567.89,
          change: 123.45,
          changePercent: 0.36,
          volume: 0
        },
        {
          symbol: 'IXIC',
          name: 'NASDAQ',
          price: 14567.89,
          change: 89.23,
          changePercent: 0.62,
          volume: 0
        }
      ];
    } catch (error) {
      console.error('Error fetching US indices:', error);
      return null;
    }
  }

  async fetchUSGainers() {
    try {
      // Mock data - in production, use real API
      return Array.from({ length: 10 }, (_, i) => ({
        symbol: `GAIN${i + 1}`,
        name: `Gainer Stock ${i + 1}`,
        price: Math.random() * 100 + 50,
        change: Math.random() * 10 + 1,
        changePercent: Math.random() * 5 + 1,
        volume: Math.floor(Math.random() * 1000000)
      }));
    } catch (error) {
      console.error('Error fetching US gainers:', error);
      return null;
    }
  }

  async fetchUSLosers() {
    try {
      // Mock data - in production, use real API
      return Array.from({ length: 10 }, (_, i) => ({
        symbol: `LOSS${i + 1}`,
        name: `Loser Stock ${i + 1}`,
        price: Math.random() * 100 + 50,
        change: -(Math.random() * 10 + 1),
        changePercent: -(Math.random() * 5 + 1),
        volume: Math.floor(Math.random() * 1000000)
      }));
    } catch (error) {
      console.error('Error fetching US losers:', error);
      return null;
    }
  }

  async fetchUSMostActive() {
    try {
      // Mock data - in production, use real API
      return Array.from({ length: 10 }, (_, i) => ({
        symbol: `ACTIVE${i + 1}`,
        name: `Active Stock ${i + 1}`,
        price: Math.random() * 100 + 50,
        change: Math.random() * 20 - 10,
        changePercent: Math.random() * 10 - 5,
        volume: Math.floor(Math.random() * 5000000) + 1000000
      }));
    } catch (error) {
      console.error('Error fetching US most active:', error);
      return null;
    }
  }

  async getUSStockQuote(symbol) {
    const cacheKey = `us_quote_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Using Alpha Vantage for real-time quotes
      const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
      
      if (response.data['Global Quote']) {
        const quote = response.data['Global Quote'];
        const stockQuote = {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          open: parseFloat(quote['02. open']),
          previousClose: parseFloat(quote['08. previous close']),
          timestamp: new Date()
        };

        this.setCachedData(cacheKey, stockQuote, this.cacheDuration.quotes);
        return stockQuote;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching US stock quote:', error);
      return null;
    }
  }

  async getUSHistoricalData(symbol, interval = '1d', period = '1mo') {
    const cacheKey = `us_historical_${symbol}_${interval}_${period}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Using Alpha Vantage for historical data
      const functionMap = {
        '1d': 'TIME_SERIES_DAILY',
        '1h': 'TIME_SERIES_INTRADAY',
        '5m': 'TIME_SERIES_INTRADAY'
      };

      const functionName = functionMap[interval] || 'TIME_SERIES_DAILY';
      const response = await axios.get(`https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);

      if (response.data['Time Series (Daily)'] || response.data['Time Series (5min)']) {
        const timeSeries = response.data['Time Series (Daily)'] || response.data['Time Series (5min)'];
        const historicalData = Object.entries(timeSeries).map(([date, data]) => ({
          date,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume'])
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        this.setCachedData(cacheKey, historicalData, this.cacheDuration.historical);
        return historicalData;
      }

      return null;
    } catch (error) {
      console.error('Error fetching US historical data:', error);
      return null;
    }
  }

  // ==================== KENYAN MARKET DATA ====================

  async getNSEMarketOverview() {
    const cacheKey = 'nse_market_overview';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [indices, gainers, losers, mostActive] = await Promise.allSettled([
        this.fetchNSEIndices(),
        this.fetchNSEGainers(),
        this.fetchNSELosers(),
        this.fetchNSEMostActive()
      ]);

      const overview = {
        indices: indices.status === 'fulfilled' ? indices.value : null,
        gainers: gainers.status === 'fulfilled' ? gainers.value : null,
        losers: losers.status === 'fulfilled' ? losers.value : null,
        mostActive: mostActive.status === 'fulfilled' ? mostActive.value : null,
        marketStatus: this.getNSEMarketStatus(),
        timestamp: new Date()
      };

      this.setCachedData(cacheKey, overview, this.cacheDuration.overview);
      return overview;
    } catch (error) {
      console.error('Error fetching NSE market overview:', error);
      return null;
    }
  }

  async fetchNSEIndices() {
    try {
      // Mock NSE indices data - in production, use real NSE API
      return [
        {
          symbol: 'NSE20',
          name: 'NSE 20 Share Index',
          price: 1856.78,
          change: 12.45,
          changePercent: 0.67,
          volume: 0
        },
        {
          symbol: 'NSE25',
          name: 'NSE 25 Share Index',
          price: 3456.78,
          change: -8.23,
          changePercent: -0.24,
          volume: 0
        },
        {
          symbol: 'NSEASI',
          name: 'NSE All Share Index',
          price: 145.67,
          change: 2.34,
          changePercent: 1.63,
          volume: 0
        }
      ];
    } catch (error) {
      console.error('Error fetching NSE indices:', error);
      return null;
    }
  }

  async fetchNSEGainers() {
    try {
      // Mock NSE gainers data
      const nseStocks = [
        'SBI', 'KCB', 'EQUITY', 'COOP', 'ABSA', 'NCBA', 'DIAMOND', 'STANBIC', 'I&M', 'HF'
      ];
      
      return nseStocks.slice(0, 10).map(symbol => ({
        symbol,
        name: `${symbol} Bank`,
        price: Math.random() * 100 + 20,
        change: Math.random() * 5 + 0.5,
        changePercent: Math.random() * 3 + 0.5,
        volume: Math.floor(Math.random() * 500000)
      }));
    } catch (error) {
      console.error('Error fetching NSE gainers:', error);
      return null;
    }
  }

  async fetchNSELosers() {
    try {
      // Mock NSE losers data
      const nseStocks = [
        'SAFARICOM', 'KENGEN', 'EABL', 'BRITAM', 'JUBILEE', 'CIC', 'LIBERTY', 'UAP', 'SANLAM', 'BRITAM'
      ];
      
      return nseStocks.slice(0, 10).map(symbol => ({
        symbol,
        name: symbol,
        price: Math.random() * 200 + 50,
        change: -(Math.random() * 5 + 0.5),
        changePercent: -(Math.random() * 3 + 0.5),
        volume: Math.floor(Math.random() * 500000)
      }));
    } catch (error) {
      console.error('Error fetching NSE losers:', error);
      return null;
    }
  }

  async fetchNSEMostActive() {
    try {
      // Mock NSE most active data
      const nseStocks = [
        'SAFARICOM', 'KCB', 'EQUITY', 'SBI', 'COOP', 'ABSA', 'NCBA', 'DIAMOND', 'STANBIC', 'I&M'
      ];
      
      return nseStocks.slice(0, 10).map(symbol => ({
        symbol,
        name: symbol,
        price: Math.random() * 150 + 30,
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 6 - 3,
        volume: Math.floor(Math.random() * 2000000) + 500000
      }));
    } catch (error) {
      console.error('Error fetching NSE most active:', error);
      return null;
    }
  }

  async getNSEStockQuote(symbol) {
    const cacheKey = `nse_quote_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Mock NSE quote - in production, use real NSE API
      const quote = {
        symbol: symbol,
        price: Math.random() * 200 + 50,
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 6 - 3,
        volume: Math.floor(Math.random() * 1000000),
        high: Math.random() * 200 + 50,
        low: Math.random() * 200 + 50,
        open: Math.random() * 200 + 50,
        previousClose: Math.random() * 200 + 50,
        timestamp: new Date()
      };

      this.setCachedData(cacheKey, quote, this.cacheDuration.quotes);
      return quote;
    } catch (error) {
      console.error('Error fetching NSE stock quote:', error);
      return null;
    }
  }

  async getNSEHistoricalData(symbol, interval = '1d', period = '1mo') {
    const cacheKey = `nse_historical_${symbol}_${interval}_${period}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Mock NSE historical data
      const data = [];
      const now = new Date();
      const periods = {
        '1d': 1, '5d': 5, '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365
      };
      const days = periods[period] || 30;
      const basePrice = Math.random() * 100 + 50;

      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const price = basePrice + Math.sin(i * 0.1) * 5 + Math.random() * 3;
        data.push({
          date: date.toISOString(),
          open: price,
          high: price + Math.random() * 2,
          low: price - Math.random() * 2,
          close: price + (Math.random() - 0.5) * 1,
          volume: Math.floor(Math.random() * 500000)
        });
      }

      this.setCachedData(cacheKey, data, this.cacheDuration.historical);
      return data;
    } catch (error) {
      console.error('Error fetching NSE historical data:', error);
      return null;
    }
  }

  // ==================== FOREX DATA ====================

  async getForexOverview() {
    const cacheKey = 'forex_overview';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`);
      const rates = response.data.rates;
      
      const majorPairs = [
        { pair: 'EURUSD', base: 'EUR', quote: 'USD' },
        { pair: 'GBPUSD', base: 'GBP', quote: 'USD' },
        { pair: 'USDJPY', base: 'USD', quote: 'JPY' },
        { pair: 'AUDUSD', base: 'AUD', quote: 'USD' },
        { pair: 'USDCAD', base: 'USD', quote: 'CAD' },
        { pair: 'USDCHF', base: 'USD', quote: 'CHF' },
        { pair: 'NZDUSD', base: 'NZD', quote: 'USD' }
      ];

      const forexData = majorPairs.map(({ pair, base, quote }) => {
        let rate;
        if (base === 'USD') {
          rate = 1 / rates[quote];
        } else {
          rate = rates[base];
        }
        
        return {
          pair,
          rate,
          change: Math.random() * 0.02 - 0.01,
          changePercent: Math.random() * 2 - 1,
          timestamp: new Date()
        };
      });

      this.setCachedData(cacheKey, forexData, this.cacheDuration.overview);
      return forexData;
    } catch (error) {
      console.error('Error fetching forex overview:', error);
      return null;
    }
  }

  // ==================== CRYPTO DATA ====================

  async getCryptoOverview() {
    const cacheKey = 'crypto_overview';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1');
      
      const cryptoData = response.data.map(coin => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        volume: coin.total_volume,
        marketCap: coin.market_cap,
        timestamp: new Date()
      }));

      this.setCachedData(cacheKey, cryptoData, this.cacheDuration.overview);
      return cryptoData;
    } catch (error) {
      console.error('Error fetching crypto overview:', error);
      return null;
    }
  }

  // ==================== COMMODITY DATA ====================

  async getCommodityOverview() {
    const cacheKey = 'commodity_overview';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Mock commodity data - in production, use real commodity API
      const commodities = [
        { symbol: 'GOLD', name: 'Gold', price: 1950.50, change: 12.30, changePercent: 0.63 },
        { symbol: 'SILVER', name: 'Silver', price: 24.85, change: -0.15, changePercent: -0.60 },
        { symbol: 'OIL', name: 'Crude Oil', price: 78.20, change: 1.45, changePercent: 1.89 },
        { symbol: 'COPPER', name: 'Copper', price: 3.85, change: 0.05, changePercent: 1.32 },
        { symbol: 'WHEAT', name: 'Wheat', price: 6.45, change: -0.12, changePercent: -1.83 },
        { symbol: 'CORN', name: 'Corn', price: 5.23, change: 0.08, changePercent: 1.55 }
      ];

      this.setCachedData(cacheKey, commodities, this.cacheDuration.overview);
      return commodities;
    } catch (error) {
      console.error('Error fetching commodity overview:', error);
      return null;
    }
  }

  // ==================== MARKET STATUS ====================

  getUSMarketStatus() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Market is closed on weekends
    if (day === 0 || day === 6) {
      return { status: 'closed', message: 'Market closed (Weekend)' };
    }
    
    // Market hours: 9:30 AM - 4:00 PM ET (simplified)
    const marketOpen = 9.5; // 9:30 AM
    const marketClose = 16; // 4:00 PM
    const currentTime = hour + minute / 60;
    
    if (currentTime >= marketOpen && currentTime <= marketClose) {
      return { status: 'open', message: 'Market is open' };
    } else if (currentTime < marketOpen) {
      return { status: 'pre-market', message: 'Pre-market hours' };
    } else {
      return { status: 'after-hours', message: 'After-hours trading' };
    }
  }

  getNSEMarketStatus() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // NSE is closed on weekends
    if (day === 0 || day === 6) {
      return { status: 'closed', message: 'Market closed (Weekend)' };
    }
    
    // NSE hours: 9:00 AM - 3:00 PM EAT (simplified)
    const marketOpen = 9; // 9:00 AM
    const marketClose = 15; // 3:00 PM
    const currentTime = hour + minute / 60;
    
    if (currentTime >= marketOpen && currentTime <= marketClose) {
      return { status: 'open', message: 'Market is open' };
    } else if (currentTime < marketOpen) {
      return { status: 'pre-market', message: 'Pre-market hours' };
    } else {
      return { status: 'after-hours', message: 'After-hours trading' };
    }
  }

  // ==================== REAL-TIME UPDATES ====================

  startRealTimeUpdates() {
    // Update market data every 30 seconds
    setInterval(async () => {
      try {
        await this.updateRealTimeData();
      } catch (error) {
        console.error('Error in real-time updates:', error);
      }
    }, 30000);
  }

  async updateRealTimeData() {
    // Update cached data for active subscriptions
    for (const [symbol, subscription] of this.subscriptions) {
      try {
        let updatedData = null;
        
        if (subscription.market === 'US') {
          updatedData = await this.getUSStockQuote(symbol);
        } else if (subscription.market === 'NSE') {
          updatedData = await this.getNSEStockQuote(symbol);
        }
        
        if (updatedData) {
          this.emit('dataUpdate', {
            symbol,
            market: subscription.market,
            data: updatedData,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`Error updating real-time data for ${symbol}:`, error);
      }
    }
  }

  subscribeToSymbol(symbol, market, callback) {
    const key = `${symbol}_${market}`;
    this.subscriptions.set(key, { symbol, market, callback });
    
    // Emit current data immediately
    this.getQuote(symbol, market).then(data => {
      if (data) {
        callback(data);
      }
    });
  }

  unsubscribeFromSymbol(symbol, market) {
    const key = `${symbol}_${market}`;
    this.subscriptions.delete(key);
  }

  async getQuote(symbol, market) {
    if (market === 'US') {
      return await this.getUSStockQuote(symbol);
    } else if (market === 'NSE') {
      return await this.getNSEStockQuote(symbol);
    }
    return null;
  }

  // ==================== SCREENER FUNCTIONS ====================

  async getUSScreener(filters = {}) {
    const cacheKey = `us_screener_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Mock screener data - in production, use real screener API
      const stocks = [];
      const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial'];
      
      for (let i = 0; i < (filters.limit || 50); i++) {
        const price = Math.random() * 200 + 10;
        const change = Math.random() * 20 - 10;
        
        stocks.push({
          symbol: `STOCK${i + 1}`,
          name: `Stock ${i + 1} Inc.`,
          price: price,
          change: change,
          changePercent: (change / price) * 100,
          volume: Math.floor(Math.random() * 5000000),
          marketCap: Math.floor(Math.random() * 10000000000),
          sector: sectors[Math.floor(Math.random() * sectors.length)],
          pe: Math.random() * 30 + 5,
          eps: Math.random() * 5 + 0.5
        });
      }

      // Apply filters
      let filteredStocks = stocks;
      
      if (filters.minPrice) {
        filteredStocks = filteredStocks.filter(stock => stock.price >= filters.minPrice);
      }
      if (filters.maxPrice) {
        filteredStocks = filteredStocks.filter(stock => stock.price <= filters.maxPrice);
      }
      if (filters.minVolume) {
        filteredStocks = filteredStocks.filter(stock => stock.volume >= filters.minVolume);
      }
      if (filters.sector) {
        filteredStocks = filteredStocks.filter(stock => stock.sector === filters.sector);
      }

      this.setCachedData(cacheKey, filteredStocks, this.cacheDuration.screener);
      return filteredStocks;
    } catch (error) {
      console.error('Error fetching US screener:', error);
      return null;
    }
  }

  async getNSEScreener(filters = {}) {
    const cacheKey = `nse_screener_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Mock NSE screener data
      const stocks = [];
      const sectors = ['Banking', 'Insurance', 'Telecommunications', 'Energy', 'Manufacturing', 'Agriculture'];
      const nseSymbols = ['SBI', 'KCB', 'EQUITY', 'COOP', 'ABSA', 'NCBA', 'DIAMOND', 'STANBIC', 'I&M', 'HF', 'SAFARICOM', 'KENGEN', 'EABL', 'BRITAM', 'JUBILEE'];
      
      for (let i = 0; i < (filters.limit || 50); i++) {
        const symbol = nseSymbols[i % nseSymbols.length] + (i > nseSymbols.length - 1 ? Math.floor(i / nseSymbols.length) : '');
        const price = Math.random() * 100 + 20;
        const change = Math.random() * 10 - 5;
        
        stocks.push({
          symbol: symbol,
          name: `${symbol} Limited`,
          price: price,
          change: change,
          changePercent: (change / price) * 100,
          volume: Math.floor(Math.random() * 2000000),
          marketCap: Math.floor(Math.random() * 5000000000),
          sector: sectors[Math.floor(Math.random() * sectors.length)],
          pe: Math.random() * 25 + 3,
          eps: Math.random() * 3 + 0.2
        });
      }

      // Apply filters
      let filteredStocks = stocks;
      
      if (filters.minPrice) {
        filteredStocks = filteredStocks.filter(stock => stock.price >= filters.minPrice);
      }
      if (filters.maxPrice) {
        filteredStocks = filteredStocks.filter(stock => stock.price <= filters.maxPrice);
      }
      if (filters.minVolume) {
        filteredStocks = filteredStocks.filter(stock => stock.volume >= filters.minVolume);
      }
      if (filters.sector) {
        filteredStocks = filteredStocks.filter(stock => stock.sector === filters.sector);
      }

      this.setCachedData(cacheKey, filteredStocks, this.cacheDuration.screener);
      return filteredStocks;
    } catch (error) {
      console.error('Error fetching NSE screener:', error);
      return null;
    }
  }
}

// Create singleton instance
const marketDataService = new MarketDataService();

module.exports = marketDataService;
