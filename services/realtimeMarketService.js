const EventEmitter = require('events');
const marketDataService = require('./marketDataService');
const alphaVantageService = require('./alphaVantageService');
const nseService = require('./nseService');

class RealtimeMarketService extends EventEmitter {
  constructor() {
    super();
    this.subscriptions = new Map(); // symbol -> Set of subscribers
    this.priceCache = new Map(); // symbol -> latest price data
    this.intervals = new Map(); // symbol -> interval ID
    this.isRunning = false;
    
    // Configuration
    this.updateInterval = 5000; // 5 seconds for demo (in production, use WebSocket feeds)
    this.maxSubscriptions = 100;
    
    this.startService();
  }

  startService() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Real-time market data service started');
    
    // Start heartbeat to check active subscriptions
    this.heartbeatInterval = setInterval(() => {
      this.checkSubscriptions();
    }, 30000); // Check every 30 seconds
  }

  stopService() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // Clear all intervals
    for (const [symbol, intervalId] of this.intervals) {
      clearInterval(intervalId);
    }
    this.intervals.clear();
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    console.log('Real-time market data service stopped');
  }

  subscribe(symbol, subscriberId) {
    if (this.subscriptions.size >= this.maxSubscriptions) {
      throw new Error('Maximum subscriptions reached');
    }

    const normalizedSymbol = symbol.toUpperCase();
    
    if (!this.subscriptions.has(normalizedSymbol)) {
      this.subscriptions.set(normalizedSymbol, new Set());
    }
    
    this.subscriptions.get(normalizedSymbol).add(subscriberId);
    
    // Start streaming for this symbol if it's the first subscriber
    if (this.subscriptions.get(normalizedSymbol).size === 1) {
      this.startStreaming(normalizedSymbol);
    }
    
    // Send current cached data if available
    if (this.priceCache.has(normalizedSymbol)) {
      this.emit('price_update', {
        symbol: normalizedSymbol,
        subscriberId,
        data: this.priceCache.get(normalizedSymbol)
      });
    }
    
    console.log(`Subscribed ${subscriberId} to ${normalizedSymbol}`);
    return true;
  }

  unsubscribe(symbol, subscriberId) {
    const normalizedSymbol = symbol.toUpperCase();
    
    if (!this.subscriptions.has(normalizedSymbol)) {
      return false;
    }
    
    const subscribers = this.subscriptions.get(normalizedSymbol);
    subscribers.delete(subscriberId);
    
    // If no more subscribers, stop streaming for this symbol
    if (subscribers.size === 0) {
      this.stopStreaming(normalizedSymbol);
      this.subscriptions.delete(normalizedSymbol);
      this.priceCache.delete(normalizedSymbol);
    }
    
    console.log(`Unsubscribed ${subscriberId} from ${normalizedSymbol}`);
    return true;
  }

  unsubscribeAll(subscriberId) {
    let unsubscribed = 0;
    
    for (const [symbol, subscribers] of this.subscriptions) {
      if (subscribers.has(subscriberId)) {
        this.unsubscribe(symbol, subscriberId);
        unsubscribed++;
      }
    }
    
    return unsubscribed;
  }

  async startStreaming(symbol) {
    if (this.intervals.has(symbol)) {
      return; // Already streaming
    }

    console.log(`Starting real-time streaming for ${symbol}`);
    
    // Initial fetch
    await this.fetchAndBroadcast(symbol);
    
    // Set up periodic updates
    const intervalId = setInterval(async () => {
      try {
        await this.fetchAndBroadcast(symbol);
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        
        // Emit error event
        this.emit('error', {
          symbol,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }, this.updateInterval);
    
    this.intervals.set(symbol, intervalId);
  }

  stopStreaming(symbol) {
    if (!this.intervals.has(symbol)) {
      return;
    }

    clearInterval(this.intervals.get(symbol));
    this.intervals.delete(symbol);
    
    console.log(`Stopped streaming for ${symbol}`);
  }

  async fetchAndBroadcast(symbol) {
    try {
      // Determine data source based on symbol
      let priceData;
      
      if (this.isUSStock(symbol)) {
        priceData = await this.fetchUSStockData(symbol);
      } else if (this.isNSEStock(symbol)) {
        priceData = await this.fetchNSEData(symbol);
      } else if (this.isCrypto(symbol)) {
        priceData = await this.fetchCryptoData(symbol);
      } else if (this.isForex(symbol)) {
        priceData = await this.fetchForexData(symbol);
      } else {
        // Default to US stock
        priceData = await this.fetchUSStockData(symbol);
      }
      
      if (priceData) {
        // Cache the data
        this.priceCache.set(symbol, priceData);
        
        // Broadcast to all subscribers
        const subscribers = this.subscriptions.get(symbol);
        if (subscribers) {
          for (const subscriberId of subscribers) {
            this.emit('price_update', {
              symbol,
              subscriberId,
              data: priceData
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw error;
    }
  }

  async fetchUSStockData(symbol) {
    try {
      const quote = await alphaVantageService.getQuote(symbol);
      
      if (!quote) {
        throw new Error('No quote data received');
      }
      
      const previousClose = parseFloat(quote['08. previous close'] || 0);
      const currentPrice = parseFloat(quote['05. price'] || 0);
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
      
      return {
        symbol,
        market: 'US',
        price: currentPrice,
        change,
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: parseInt(quote['06. volume'] || 0),
        high: parseFloat(quote['03. high'] || 0),
        low: parseFloat(quote['04. low'] || 0),
        open: parseFloat(quote['02. open'] || 0),
        previousClose,
        timestamp: new Date().toISOString(),
        source: 'alpha_vantage'
      };
    } catch (error) {
      console.error(`Error fetching US stock data for ${symbol}:`, error);
      throw error;
    }
  }

  async fetchNSEData(symbol) {
    try {
      const quote = await nseService.getQuote(symbol);
      
      if (!quote) {
        throw new Error('No NSE quote data received');
      }
      
      return {
        symbol,
        market: 'NSE',
        price: quote.lastPrice || 0,
        change: quote.change || 0,
        changePercent: quote.pChange || 0,
        volume: quote.totalTradedVolume || 0,
        high: quote.dayHigh || 0,
        low: quote.dayLow || 0,
        open: quote.open || 0,
        previousClose: quote.previousClose || 0,
        timestamp: new Date().toISOString(),
        source: 'nse'
      };
    } catch (error) {
      console.error(`Error fetching NSE data for ${symbol}:`, error);
      throw error;
    }
  }

  async fetchCryptoData(symbol) {
    try {
      // For crypto, we'll use a mock implementation
      // In production, integrate with Binance, Coinbase, etc.
      const mockData = this.generateMockCryptoData(symbol);
      
      return {
        symbol,
        market: 'CRYPTO',
        price: mockData.price,
        change: mockData.change,
        changePercent: mockData.changePercent,
        volume: mockData.volume,
        high: mockData.high,
        low: mockData.low,
        open: mockData.open,
        previousClose: mockData.previousClose,
        timestamp: new Date().toISOString(),
        source: 'mock_crypto'
      };
    } catch (error) {
      console.error(`Error fetching crypto data for ${symbol}:`, error);
      throw error;
    }
  }

  async fetchForexData(symbol) {
    try {
      const quote = await alphaVantageService.getForexQuote(symbol);
      
      if (!quote) {
        throw new Error('No forex quote data received');
      }
      
      return {
        symbol,
        market: 'FOREX',
        price: parseFloat(quote['5. Exchange Rate'] || 0),
        change: 0, // Alpha Vantage doesn't provide change for forex
        changePercent: 0,
        volume: 0,
        high: 0,
        low: 0,
        open: 0,
        previousClose: 0,
        timestamp: quote['6. Last Refreshed'] || new Date().toISOString(),
        source: 'alpha_vantage'
      };
    } catch (error) {
      console.error(`Error fetching forex data for ${symbol}:`, error);
      throw error;
    }
  }

  generateMockCryptoData(symbol) {
    // Generate realistic mock data for crypto
    const basePrice = this.getCryptoBasePrice(symbol);
    const volatility = 0.02; // 2% volatility
    
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const currentPrice = basePrice * (1 + randomChange);
    const previousClose = basePrice;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      price: parseFloat(currentPrice.toFixed(8)),
      change: parseFloat(change.toFixed(8)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
      high: parseFloat((currentPrice * 1.01).toFixed(8)),
      low: parseFloat((currentPrice * 0.99).toFixed(8)),
      open: parseFloat((basePrice * 1.001).toFixed(8)),
      previousClose: parseFloat(previousClose.toFixed(8))
    };
  }

  getCryptoBasePrice(symbol) {
    const basePrices = {
      'BTCUSD': 45000,
      'ETHUSD': 3000,
      'ADAUSD': 1.2,
      'SOLUSD': 100,
      'DOTUSD': 25,
      'LINKUSD': 15,
      'UNIUSD': 8,
      'LTCUSD': 150,
      'BCHUSD': 300,
      'XLMUSD': 0.3
    };
    
    return basePrices[symbol.toUpperCase()] || 1.0;
  }

  isUSStock(symbol) {
    // Simple heuristic - US stocks are typically 1-5 characters
    return /^[A-Z]{1,5}$/.test(symbol);
  }

  isNSEStock(symbol) {
    // NSE stocks often end with .NS or are in a known NSE list
    return symbol.endsWith('.NS') || this.isKnownNSESymbol(symbol);
  }

  isKnownNSESymbol(symbol) {
    const nseSymbols = [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR',
      'ICICIBANK', 'KOTAKBANK', 'SBIN', 'BHARTIARTL', 'ITC'
    ];
    return nseSymbols.includes(symbol.toUpperCase());
  }

  isCrypto(symbol) {
    return symbol.includes('USD') || symbol.includes('BTC') || symbol.includes('ETH');
  }

  isForex(symbol) {
    const forexPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'];
    return forexPairs.some(pair => symbol.toUpperCase().includes(pair));
  }

  checkSubscriptions() {
    // Clean up inactive subscriptions and log status
    console.log(`Active subscriptions: ${this.subscriptions.size}`);
    console.log(`Active streams: ${this.intervals.size}`);
    
    // Emit status event
    this.emit('service_status', {
      subscriptions: this.subscriptions.size,
      activeStreams: this.intervals.size,
      cachedSymbols: this.priceCache.size,
      timestamp: new Date().toISOString()
    });
  }

  getSubscriptionCount(symbol = null) {
    if (symbol) {
      const normalizedSymbol = symbol.toUpperCase();
      return this.subscriptions.get(normalizedSymbol)?.size || 0;
    }
    
    return Array.from(this.subscriptions.values())
      .reduce((total, subscribers) => total + subscribers.size, 0);
  }

  getActiveSymbols() {
    return Array.from(this.subscriptions.keys());
  }

  getCachedPrice(symbol) {
    return this.priceCache.get(symbol.toUpperCase());
  }

  getServiceStats() {
    return {
      isRunning: this.isRunning,
      totalSubscriptions: this.getSubscriptionCount(),
      activeSymbols: this.getActiveSymbols().length,
      cachedPrices: this.priceCache.size,
      updateInterval: this.updateInterval,
      maxSubscriptions: this.maxSubscriptions,
      uptime: process.uptime()
    };
  }
}

// Create singleton instance
const realtimeMarketService = new RealtimeMarketService();

// Graceful shutdown
process.on('SIGTERM', () => {
  realtimeMarketService.stopService();
});

process.on('SIGINT', () => {
  realtimeMarketService.stopService();
});

module.exports = realtimeMarketService;
