const axios = require('axios');

class NewsService {
  constructor() {
    this.apiKey = process.env.MARKETAUX_API_KEY || 'demo';
    this.baseUrl = 'https://api.marketaux.com/v1/news/all';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get financial news with market impact analysis
   */
  async getFinancialNews(options = {}) {
    const {
      symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'AAPL', 'TSLA'],
      countries = ['US', 'GB', 'EU', 'JP'],
      limit = 20,
      offset = 0,
      published_after = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
      published_before = new Date().toISOString()
    } = options;

    const cacheKey = `news_${JSON.stringify({ symbols, countries, limit, offset })}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const params = {
        api_token: this.apiKey,
        symbols: symbols.join(','),
        countries: countries.join(','),
        limit,
        offset,
        published_after,
        published_before,
        language: 'en'
      };

      const response = await axios.get(this.baseUrl, { params });
      
      const processedNews = response.data.data.map(article => ({
        id: article.uuid,
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source,
        published_at: article.published_at,
        symbols: article.symbols || [],
        sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
        impact: this.calculateMarketImpact(article),
        category: this.categorizeNews(article),
        image_url: article.image_url,
        relevance_score: this.calculateRelevanceScore(article, symbols)
      }));

      const result = {
        success: true,
        data: processedNews.sort((a, b) => b.relevance_score - a.relevance_score),
        meta: {
          total: response.data.meta.found,
          returned: response.data.meta.returned,
          page: response.data.meta.page
        }
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error('News API Error:', error.message);
      
      // Return mock data if API fails
      return this.getMockNews();
    }
  }

  /**
   * Get news for specific symbol/pair
   */
  async getNewsForSymbol(symbol, limit = 10) {
    return this.getFinancialNews({
      symbols: [symbol],
      limit
    });
  }

  /**
   * Get trending news topics
   */
  async getTrendingNews() {
    const news = await this.getFinancialNews({ limit: 50 });
    
    // Group by symbols and count mentions
    const symbolMentions = {};
    news.data.forEach(article => {
      article.symbols.forEach(symbol => {
        symbolMentions[symbol] = (symbolMentions[symbol] || 0) + 1;
      });
    });

    // Get top trending symbols
    const trendingSymbols = Object.entries(symbolMentions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([symbol]) => symbol);

    return {
      success: true,
      data: {
        trending_symbols: trendingSymbols,
        top_news: news.data.slice(0, 10)
      }
    };
  }

  /**
   * Analyze sentiment of news text
   */
  analyzeSentiment(text) {
    const positiveWords = ['rise', 'gain', 'up', 'bullish', 'positive', 'growth', 'increase', 'profit', 'success'];
    const negativeWords = ['fall', 'drop', 'down', 'bearish', 'negative', 'decline', 'decrease', 'loss', 'failure'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Calculate market impact based on news content
   */
  calculateMarketImpact(article) {
    const highImpactKeywords = ['fed', 'interest rate', 'inflation', 'gdp', 'unemployment', 'crisis', 'war', 'election'];
    const mediumImpactKeywords = ['earnings', 'merger', 'acquisition', 'partnership', 'regulation'];
    
    const text = (article.title + ' ' + article.description).toLowerCase();
    
    if (highImpactKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    if (mediumImpactKeywords.some(keyword => text.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Categorize news by type
   */
  categorizeNews(article) {
    const text = (article.title + ' ' + article.description).toLowerCase();
    
    if (text.includes('earnings') || text.includes('revenue') || text.includes('profit')) {
      return 'earnings';
    }
    if (text.includes('fed') || text.includes('interest rate') || text.includes('monetary')) {
      return 'monetary_policy';
    }
    if (text.includes('inflation') || text.includes('cpi') || text.includes('pce')) {
      return 'inflation';
    }
    if (text.includes('forex') || text.includes('currency') || text.includes('exchange rate')) {
      return 'forex';
    }
    if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum')) {
      return 'crypto';
    }
    return 'general';
  }

  /**
   * Calculate relevance score for news
   */
  calculateRelevanceScore(article, targetSymbols) {
    let score = 0;
    
    // Base score for symbol match
    if (article.symbols && article.symbols.length > 0) {
      const matchingSymbols = article.symbols.filter(symbol => 
        targetSymbols.some(target => target.includes(symbol) || symbol.includes(target))
      );
      score += matchingSymbols.length * 10;
    }
    
    // Boost for high impact news
    const impact = this.calculateMarketImpact(article);
    if (impact === 'high') score += 20;
    else if (impact === 'medium') score += 10;
    
    // Boost for recent news
    const publishedAt = new Date(article.published_at);
    const hoursAgo = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 1) score += 15;
    else if (hoursAgo < 6) score += 10;
    else if (hoursAgo < 24) score += 5;
    
    return score;
  }

  /**
   * Get mock news data for development
   */
  getMockNews() {
    return {
      success: true,
      data: [
        {
          id: '1',
          title: 'Federal Reserve Holds Interest Rates Steady at 5.25%',
          description: 'The Federal Reserve maintained its benchmark interest rate unchanged, citing ongoing inflation concerns and economic uncertainty.',
          url: '#',
          source: 'Reuters',
          published_at: new Date().toISOString(),
          symbols: ['EURUSD', 'GBPUSD', 'USDJPY'],
          sentiment: 'neutral',
          impact: 'high',
          category: 'monetary_policy',
          image_url: null,
          relevance_score: 95
        },
        {
          id: '2',
          title: 'EUR/USD Rises on ECB Hawkish Comments',
          description: 'The Euro strengthened against the US Dollar following European Central Bank officials suggesting potential rate hikes.',
          url: '#',
          source: 'Bloomberg',
          published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          symbols: ['EURUSD'],
          sentiment: 'positive',
          impact: 'medium',
          category: 'forex',
          image_url: null,
          relevance_score: 85
        },
        {
          id: '3',
          title: 'Bitcoin Surges Past $45,000 on Institutional Adoption',
          description: 'Bitcoin reached new monthly highs as major corporations announce increased cryptocurrency holdings.',
          url: '#',
          source: 'CoinDesk',
          published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          symbols: ['BTCUSD'],
          sentiment: 'positive',
          impact: 'medium',
          category: 'crypto',
          image_url: null,
          relevance_score: 80
        },
        {
          id: '4',
          title: 'Apple Reports Strong Q4 Earnings, Stock Rises 3%',
          description: 'Apple Inc. exceeded analyst expectations with robust iPhone sales and services revenue growth.',
          url: '#',
          source: 'MarketWatch',
          published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          symbols: ['AAPL'],
          sentiment: 'positive',
          impact: 'medium',
          category: 'earnings',
          image_url: null,
          relevance_score: 75
        },
        {
          id: '5',
          title: 'US Inflation Data Shows Modest Increase in December',
          description: 'Consumer Price Index rose 0.2% month-over-month, slightly above expectations but showing signs of cooling.',
          url: '#',
          source: 'CNBC',
          published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          symbols: ['EURUSD', 'GBPUSD', 'USDJPY'],
          sentiment: 'neutral',
          impact: 'high',
          category: 'inflation',
          image_url: null,
          relevance_score: 90
        }
      ],
      meta: {
        total: 5,
        returned: 5,
        page: 1
      }
    };
  }
}

module.exports = new NewsService();
