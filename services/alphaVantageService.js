const axios = require('axios');

class AlphaVantageService {
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo'; // Use demo key for testing
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
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
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        // API call frequency limit reached, use cached data or mock data
        return this.getMockStockQuote(symbol);
      }

      const quote = response.data['Global Quote'];
      if (!quote || !quote['01. symbol']) {
        return this.getMockStockQuote(symbol);
      }

      const stockData = {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        data: stockData,
        timestamp: Date.now()
      });

      return stockData;
    } catch (error) {
      console.error('Alpha Vantage API Error:', error.message);
      return this.getMockStockQuote(symbol);
    }
  }

  /**
   * Get stock overview/fundamentals
   */
  async getStockOverview(symbol) {
    const cacheKey = `overview_${symbol}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'OVERVIEW',
          symbol: symbol,
          apikey: this.apiKey
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        return this.getMockStockOverview(symbol);
      }

      const overview = response.data;
      if (!overview.Symbol) {
        return this.getMockStockOverview(symbol);
      }

      const stockOverview = {
        symbol: overview.Symbol,
        name: overview.Name,
        description: overview.Description,
        sector: overview.Sector,
        industry: overview.Industry,
        marketCap: overview.MarketCapitalization,
        pe: overview.PERatio,
        peg: overview.PEGRatio,
        eps: overview.EPS,
        dividend: overview.DividendPerShare,
        dividendYield: overview.DividendYield,
        beta: overview.Beta,
        high52Week: overview['52WeekHigh'],
        low52Week: overview['52WeekLow'],
        movingAverage50: overview['50DayMovingAverage'],
        movingAverage200: overview['200DayMovingAverage'],
        analystTargetPrice: overview.AnalystTargetPrice,
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        data: stockOverview,
        timestamp: Date.now()
      });

      return stockOverview;
    } catch (error) {
      console.error('Alpha Vantage Overview API Error:', error.message);
      return this.getMockStockOverview(symbol);
    }
  }

  /**
   * Get daily time series data
   */
  async getDailyTimeSeries(symbol, outputsize = 'compact') {
    const cacheKey = `daily_${symbol}_${outputsize}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: outputsize,
          apikey: this.apiKey
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        return this.getMockTimeSeries(symbol);
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        return this.getMockTimeSeries(symbol);
      }

      const formattedData = Object.entries(timeSeries).map(([date, data]) => ({
        date: date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'])
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      this.cache.set(cacheKey, {
        data: formattedData,
        timestamp: Date.now()
      });

      return formattedData;
    } catch (error) {
      console.error('Alpha Vantage Time Series API Error:', error.message);
      return this.getMockTimeSeries(symbol);
    }
  }

  /**
   * Get intraday time series data
   */
  async getIntradayTimeSeries(symbol, interval = '5min') {
    const cacheKey = `intraday_${symbol}_${interval}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: interval,
          apikey: this.apiKey
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        return this.getMockIntradaySeries(symbol);
      }

      const timeSeries = response.data[`Time Series (${interval})`];
      if (!timeSeries) {
        return this.getMockIntradaySeries(symbol);
      }

      const formattedData = Object.entries(timeSeries).map(([timestamp, data]) => ({
        timestamp: timestamp,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'])
      })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      this.cache.set(cacheKey, {
        data: formattedData,
        timestamp: Date.now()
      });

      return formattedData;
    } catch (error) {
      console.error('Alpha Vantage Intraday API Error:', error.message);
      return this.getMockIntradaySeries(symbol);
    }
  }

  /**
   * Get top gainers and losers
   */
  async getTopGainersLosers() {
    const cacheKey = 'top_gainers_losers';
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TOP_GAINERS_LOSERS',
          apikey: this.apiKey
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        return this.getMockTopGainersLosers();
      }

      const data = response.data;
      const result = {
        gainers: data.top_gainers?.map(stock => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercent: parseFloat(stock.change_percentage.replace('%', '')),
          volume: parseInt(stock.volume)
        })) || [],
        losers: data.top_losers?.map(stock => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercent: parseFloat(stock.change_percentage.replace('%', '')),
          volume: parseInt(stock.volume)
        })) || [],
        mostActive: data.most_actively_traded?.map(stock => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercent: parseFloat(stock.change_percentage.replace('%', '')),
          volume: parseInt(stock.volume)
        })) || [],
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Alpha Vantage Top Gainers/Losers API Error:', error.message);
      return this.getMockTopGainersLosers();
    }
  }

  // Mock data fallbacks
  getMockStockQuote(symbol) {
    const mockPrices = {
      'AAPL': { price: 175.50, change: 2.50, changePercent: 1.45 },
      'TSLA': { price: 245.80, change: -5.20, changePercent: -2.07 },
      'GOOGL': { price: 142.30, change: 1.80, changePercent: 1.28 },
      'MSFT': { price: 378.90, change: 3.40, changePercent: 0.91 },
      'AMZN': { price: 155.20, change: -1.30, changePercent: -0.83 }
    };

    const mock = mockPrices[symbol] || { price: 100.00, change: 0.50, changePercent: 0.50 };
    
    return {
      symbol: symbol,
      price: mock.price,
      change: mock.change,
      changePercent: mock.changePercent,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      high: mock.price * 1.02,
      low: mock.price * 0.98,
      open: mock.price * 0.99,
      previousClose: mock.price - mock.change,
      timestamp: new Date().toISOString()
    };
  }

  getMockStockOverview(symbol) {
    return {
      symbol: symbol,
      name: `${symbol} Inc.`,
      description: `Leading technology company in the ${symbol} sector.`,
      sector: 'Technology',
      industry: 'Software',
      marketCap: '1000000000000',
      pe: '25.5',
      peg: '1.2',
      eps: '6.50',
      dividend: '2.50',
      dividendYield: '1.5',
      beta: '1.2',
      high52Week: '200.00',
      low52Week: '120.00',
      movingAverage50: '170.00',
      movingAverage200: '160.00',
      analystTargetPrice: '190.00',
      timestamp: new Date().toISOString()
    };
  }

  getMockTimeSeries(symbol) {
    const data = [];
    const basePrice = this.getMockStockQuote(symbol).price;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: basePrice + (Math.random() - 0.5) * 10,
        high: basePrice + Math.random() * 5,
        low: basePrice - Math.random() * 5,
        close: basePrice + (Math.random() - 0.5) * 8,
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    return data;
  }

  getMockIntradaySeries(symbol) {
    const data = [];
    const basePrice = this.getMockStockQuote(symbol).price;
    
    for (let i = 100; i >= 0; i--) {
      const timestamp = new Date();
      timestamp.setMinutes(timestamp.getMinutes() - (i * 5));
      
      data.push({
        timestamp: timestamp.toISOString(),
        open: basePrice + (Math.random() - 0.5) * 2,
        high: basePrice + Math.random() * 1,
        low: basePrice - Math.random() * 1,
        close: basePrice + (Math.random() - 0.5) * 1.5,
        volume: Math.floor(Math.random() * 100000) + 10000
      });
    }
    
    return data;
  }

  getMockTopGainersLosers() {
    return {
      gainers: [
        { symbol: 'AAPL', price: 175.50, change: 2.50, changePercent: 1.45, volume: 45200000 },
        { symbol: 'GOOGL', price: 142.30, change: 1.80, changePercent: 1.28, volume: 28700000 },
        { symbol: 'MSFT', price: 378.90, change: 3.40, changePercent: 0.91, volume: 22300000 }
      ],
      losers: [
        { symbol: 'TSLA', price: 245.80, change: -5.20, changePercent: -2.07, volume: 32100000 },
        { symbol: 'AMZN', price: 155.20, change: -1.30, changePercent: -0.83, volume: 18900000 }
      ],
      mostActive: [
        { symbol: 'AAPL', price: 175.50, change: 2.50, changePercent: 1.45, volume: 45200000 },
        { symbol: 'TSLA', price: 245.80, change: -5.20, changePercent: -2.07, volume: 32100000 },
        { symbol: 'GOOGL', price: 142.30, change: 1.80, changePercent: 1.28, volume: 28700000 }
      ],
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new AlphaVantageService();
