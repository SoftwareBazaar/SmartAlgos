const axios = require('axios');

class NSEService {
  constructor() {
    this.baseUrl = 'https://www.nse.co.ke';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get NSE market overview
   */
  async getMarketOverview() {
    const cacheKey = 'nse_overview';
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // For now, return comprehensive mock data for NSE
      const overview = this.getMockNSEData();
      
      this.cache.set(cacheKey, {
        data: overview,
        timestamp: Date.now()
      });

      return overview;
    } catch (error) {
      console.error('NSE API Error:', error.message);
      return this.getMockNSEData();
    }
  }

  /**
   * Get specific NSE stock quote
   */
  async getStockQuote(symbol) {
    const cacheKey = `nse_stock_${symbol}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Mock data for specific stock
      const stockData = this.getMockStockData(symbol);
      
      this.cache.set(cacheKey, {
        data: stockData,
        timestamp: Date.now()
      });

      return stockData;
    } catch (error) {
      console.error('NSE Stock API Error:', error.message);
      return this.getMockStockData(symbol);
    }
  }

  /**
   * Get NSE indices
   */
  async getIndices() {
    return {
      success: true,
      data: [
        {
          symbol: 'NSE20',
          name: 'NSE 20 Share Index',
          price: 1850.45,
          change: 12.30,
          changePercent: 0.67,
          volume: '2.1M'
        },
        {
          symbol: 'NSE25',
          name: 'NSE 25 Share Index',
          price: 3420.80,
          change: -8.50,
          changePercent: -0.25,
          volume: '1.8M'
        },
        {
          symbol: 'NSEASI',
          name: 'NSE All Share Index',
          price: 125.67,
          change: 0.45,
          changePercent: 0.36,
          volume: '3.2M'
        }
      ]
    };
  }

  /**
   * Get comprehensive mock NSE data
   */
  getMockNSEData() {
    return {
      success: true,
      data: {
        marketStatus: 'open',
        lastUpdated: new Date().toISOString(),
        indices: [
          {
            symbol: 'NSE20',
            name: 'NSE 20 Share Index',
            price: 1850.45,
            change: 12.30,
            changePercent: 0.67,
            volume: '2.1M'
          },
          {
            symbol: 'NSE25',
            name: 'NSE 25 Share Index',
            price: 3420.80,
            change: -8.50,
            changePercent: -0.25,
            volume: '1.8M'
          },
          {
            symbol: 'NSEASI',
            name: 'NSE All Share Index',
            price: 125.67,
            change: 0.45,
            changePercent: 0.36,
            volume: '3.2M'
          }
        ],
        gainers: [
          {
            symbol: 'SCOM',
            name: 'Safaricom PLC',
            price: 18.50,
            change: 0.85,
            changePercent: 4.82,
            volume: '45.2M',
            marketCap: '742.5B KES'
          },
          {
            symbol: 'EQTY',
            name: 'Equity Group Holdings',
            price: 42.30,
            change: 1.20,
            changePercent: 2.92,
            volume: '12.8M',
            marketCap: '158.2B KES'
          },
          {
            symbol: 'KCB',
            name: 'Kenya Commercial Bank',
            price: 28.75,
            change: 0.65,
            changePercent: 2.31,
            volume: '8.9M',
            marketCap: '89.4B KES'
          }
        ],
        losers: [
          {
            symbol: 'BAT',
            name: 'British American Tobacco',
            price: 185.00,
            change: -8.50,
            changePercent: -4.39,
            volume: '1.2M',
            marketCap: '37.0B KES'
          },
          {
            symbol: 'EABL',
            name: 'East African Breweries',
            price: 125.50,
            change: -3.25,
            changePercent: -2.52,
            volume: '2.8M',
            marketCap: '47.3B KES'
          }
        ],
        mostActive: [
          {
            symbol: 'SCOM',
            name: 'Safaricom PLC',
            price: 18.50,
            change: 0.85,
            changePercent: 4.82,
            volume: '45.2M',
            value: '836.2M KES'
          },
          {
            symbol: 'EQTY',
            name: 'Equity Group Holdings',
            price: 42.30,
            change: 1.20,
            changePercent: 2.92,
            volume: '12.8M',
            value: '541.4M KES'
          },
          {
            symbol: 'KCB',
            name: 'Kenya Commercial Bank',
            price: 28.75,
            change: 0.65,
            changePercent: 2.31,
            volume: '8.9M',
            value: '255.9M KES'
          }
        ],
        stocks: this.getAllNSEStocks()
      }
    };
  }

  /**
   * Get all NSE stocks
   */
  getAllNSEStocks() {
    return [
      // Banking Sector
      {
        symbol: 'EQTY',
        name: 'Equity Group Holdings Limited',
        price: 42.30,
        change: 1.20,
        changePercent: 2.92,
        volume: '12.8M',
        sector: 'Banking',
        marketCap: '158.2B KES',
        pe: 4.2,
        dividend: 2.50
      },
      {
        symbol: 'KCB',
        name: 'Kenya Commercial Bank Group',
        price: 28.75,
        change: 0.65,
        changePercent: 2.31,
        volume: '8.9M',
        sector: 'Banking',
        marketCap: '89.4B KES',
        pe: 3.8,
        dividend: 1.80
      },
      {
        symbol: 'COOP',
        name: 'Co-operative Bank of Kenya',
        price: 12.45,
        change: -0.15,
        changePercent: -1.19,
        volume: '5.2M',
        sector: 'Banking',
        marketCap: '74.7B KES',
        pe: 3.2,
        dividend: 1.20
      },
      {
        symbol: 'ABSA',
        name: 'Absa Bank Kenya PLC',
        price: 8.90,
        change: 0.20,
        changePercent: 2.30,
        volume: '3.8M',
        sector: 'Banking',
        marketCap: '26.7B KES',
        pe: 4.1,
        dividend: 0.85
      },
      {
        symbol: 'NCBA',
        name: 'NCBA Group PLC',
        price: 22.10,
        change: -0.30,
        changePercent: -1.34,
        volume: '2.1M',
        sector: 'Banking',
        marketCap: '33.2B KES',
        pe: 3.9,
        dividend: 1.50
      },

      // Telecommunications
      {
        symbol: 'SCOM',
        name: 'Safaricom PLC',
        price: 18.50,
        change: 0.85,
        changePercent: 4.82,
        volume: '45.2M',
        sector: 'Telecommunications',
        marketCap: '742.5B KES',
        pe: 12.5,
        dividend: 1.10
      },
      {
        symbol: 'TELKOM',
        name: 'Telkom Kenya Limited',
        price: 2.15,
        change: 0.05,
        changePercent: 2.38,
        volume: '1.8M',
        sector: 'Telecommunications',
        marketCap: '8.6B KES',
        pe: 8.2,
        dividend: 0.20
      },

      // Manufacturing & Consumer Goods
      {
        symbol: 'EABL',
        name: 'East African Breweries Limited',
        price: 125.50,
        change: -3.25,
        changePercent: -2.52,
        volume: '2.8M',
        sector: 'Manufacturing',
        marketCap: '47.3B KES',
        pe: 15.8,
        dividend: 8.50
      },
      {
        symbol: 'BAT',
        name: 'British American Tobacco Kenya',
        price: 185.00,
        change: -8.50,
        changePercent: -4.39,
        volume: '1.2M',
        sector: 'Manufacturing',
        marketCap: '37.0B KES',
        pe: 6.2,
        dividend: 25.00
      },
      {
        symbol: 'UNGA',
        name: 'Unga Group Limited',
        price: 15.80,
        change: 0.40,
        changePercent: 2.60,
        volume: '0.8M',
        sector: 'Manufacturing',
        marketCap: '3.2B KES',
        pe: 4.5,
        dividend: 1.20
      },

      // Insurance
      {
        symbol: 'JUBILEE',
        name: 'Jubilee Holdings Limited',
        price: 185.00,
        change: 2.50,
        changePercent: 1.37,
        volume: '0.5M',
        sector: 'Insurance',
        marketCap: '18.5B KES',
        pe: 5.8,
        dividend: 12.00
      },
      {
        symbol: 'CIC',
        name: 'CIC Insurance Group',
        price: 2.85,
        change: -0.05,
        changePercent: -1.72,
        volume: '0.3M',
        sector: 'Insurance',
        marketCap: '2.9B KES',
        pe: 3.2,
        dividend: 0.15
      },

      // Energy & Utilities
      {
        symbol: 'KENGEN',
        name: 'Kenya Electricity Generating Company',
        price: 3.25,
        change: 0.10,
        changePercent: 3.17,
        volume: '4.2M',
        sector: 'Energy',
        marketCap: '20.8B KES',
        pe: 4.8,
        dividend: 0.25
      },
      {
        symbol: 'KPLC',
        name: 'Kenya Power and Lighting Company',
        price: 1.85,
        change: -0.05,
        changePercent: -2.63,
        volume: '2.1M',
        sector: 'Utilities',
        marketCap: '7.4B KES',
        pe: 2.1,
        dividend: 0.10
      },

      // Agriculture
      {
        symbol: 'KAPCHORUA',
        name: 'Kapchorua Tea Company',
        price: 45.00,
        change: 1.50,
        changePercent: 3.45,
        volume: '0.2M',
        sector: 'Agriculture',
        marketCap: '1.8B KES',
        pe: 6.5,
        dividend: 3.00
      },
      {
        symbol: 'KUKU',
        name: 'Kuku Foods Limited',
        price: 12.50,
        change: 0.25,
        changePercent: 2.04,
        volume: '0.1M',
        sector: 'Agriculture',
        marketCap: '0.6B KES',
        pe: 4.2,
        dividend: 0.80
      },

      // Real Estate & Construction
      {
        symbol: 'STANLIB',
        name: 'STANLIB Fahari I-REIT',
        price: 8.50,
        change: 0.15,
        changePercent: 1.80,
        volume: '0.3M',
        sector: 'Real Estate',
        marketCap: '2.1B KES',
        pe: 5.2,
        dividend: 0.65
      },
      {
        symbol: 'BAMBURI',
        name: 'Bamburi Cement Limited',
        price: 35.20,
        change: -0.80,
        changePercent: -2.22,
        volume: '0.4M',
        sector: 'Construction',
        marketCap: '7.0B KES',
        pe: 8.5,
        dividend: 2.50
      },

      // Investment & Finance
      {
        symbol: 'ICDC',
        name: 'Industrial and Commercial Development Corporation',
        price: 2.10,
        change: 0.05,
        changePercent: 2.44,
        volume: '0.2M',
        sector: 'Investment',
        marketCap: '1.3B KES',
        pe: 3.8,
        dividend: 0.15
      },
      {
        symbol: 'NMG',
        name: 'Nation Media Group',
        price: 18.50,
        change: -0.30,
        changePercent: -1.59,
        volume: '0.1M',
        sector: 'Media',
        marketCap: '3.7B KES',
        pe: 4.2,
        dividend: 1.20
      }
    ];
  }

  /**
   * Get mock data for specific stock
   */
  getMockStockData(symbol) {
    const allStocks = this.getAllNSEStocks();
    const stock = allStocks.find(s => s.symbol === symbol);
    
    if (!stock) {
      return {
        success: false,
        message: 'Stock not found'
      };
    }

    return {
      success: true,
      data: {
        ...stock,
        // Add detailed information
        description: this.getStockDescription(symbol),
        financials: this.getStockFinancials(symbol),
        priceHistory: this.getPriceHistory(symbol),
        news: this.getStockNews(symbol),
        technicalIndicators: this.getTechnicalIndicators(symbol)
      }
    };
  }

  /**
   * Get stock description
   */
  getStockDescription(symbol) {
    const descriptions = {
      'SCOM': 'Safaricom PLC is Kenya\'s leading telecommunications company, providing mobile, fixed-line, and internet services. The company is also a major player in mobile money through M-Pesa.',
      'EQTY': 'Equity Group Holdings Limited is one of East Africa\'s leading financial services groups, offering banking, insurance, and investment services across the region.',
      'KCB': 'Kenya Commercial Bank Group is one of Kenya\'s largest banks, providing comprehensive banking and financial services to individuals and businesses.',
      'EABL': 'East African Breweries Limited is the leading alcoholic beverages company in East Africa, producing and distributing beer, spirits, and other alcoholic drinks.',
      'BAT': 'British American Tobacco Kenya is a leading tobacco company in Kenya, manufacturing and distributing cigarettes and other tobacco products.'
    };
    
    return descriptions[symbol] || 'Leading company in its sector with strong market position and growth potential.';
  }

  /**
   * Get stock financials
   */
  getStockFinancials(symbol) {
    return {
      revenue: Math.floor(Math.random() * 100) + 50 + 'B KES',
      profit: Math.floor(Math.random() * 20) + 5 + 'B KES',
      assets: Math.floor(Math.random() * 200) + 100 + 'B KES',
      debt: Math.floor(Math.random() * 50) + 10 + 'B KES',
      equity: Math.floor(Math.random() * 100) + 50 + 'B KES'
    };
  }

  /**
   * Get price history
   */
  getPriceHistory(symbol) {
    const basePrice = Math.random() * 100 + 10;
    const history = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: basePrice + (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
    
    return history;
  }

  /**
   * Get stock news
   */
  getStockNews(symbol) {
    return [
      {
        id: 1,
        title: `${symbol} Reports Strong Quarterly Earnings`,
        summary: 'The company exceeded analyst expectations with robust revenue growth.',
        impact: 'positive',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'Business Daily'
      },
      {
        id: 2,
        title: `Market Analysis: ${symbol} Shows Bullish Trend`,
        summary: 'Technical indicators suggest continued upward momentum.',
        impact: 'positive',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: 'NSE News'
      }
    ];
  }

  /**
   * Get technical indicators
   */
  getTechnicalIndicators(symbol) {
    return {
      rsi: Math.floor(Math.random() * 40) + 30,
      macd: (Math.random() - 0.5) * 2,
      movingAverage20: Math.random() * 100 + 10,
      movingAverage50: Math.random() * 100 + 10,
      support: Math.random() * 50 + 5,
      resistance: Math.random() * 50 + 55
    };
  }
}

module.exports = new NSEService();
