const axios = require('axios');

/**
 * GNews API Service
 * Provides breaking news and financial news
 * Free tier: 100 articles/day
 * Get key at: https://gnews.io/register
 */
class GNewsService {
  constructor() {
    this.apiKey = process.env.GNEWS_API_KEY;
    this.baseUrl = 'https://gnews.io/api/v4';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    if (!this.apiKey) {
      console.warn('[GNews] No API key configured. Get one at: https://gnews.io/register');
    }
  }

  /**
   * Get top financial/business news
   */
  async getFinancialNews(options = {}) {
    const {
      limit = 10,
      lang = 'en',
      country = 'us',
      query = 'stock market OR forex OR trading OR finance'
    } = options;

    const cacheKey = `financial_${limit}_${lang}_${country}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          lang,
          country,
          max: limit,
          apikey: this.apiKey,
          sortby: 'publishedAt' // Most recent first
        }
      });

      const articles = response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image: article.image,
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name,
          url: article.source.url
        }
      }));

      this.cache.set(cacheKey, {
        data: articles,
        timestamp: Date.now()
      });

      return articles;
    } catch (error) {
      console.error('[GNews] Error fetching financial news:', error.message);
      throw error;
    }
  }

  /**
   * Get breaking news (latest headlines)
   */
  async getBreakingNews(options = {}) {
    const {
      limit = 10,
      lang = 'en',
      country = 'us',
      category = 'business' // business, general, entertainment, etc.
    } = options;

    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          category,
          lang,
          country,
          max: limit,
          apikey: this.apiKey
        }
      });

      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image: article.image,
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name,
          url: article.source.url
        }
      }));
    } catch (error) {
      console.error('[GNews] Error fetching breaking news:', error.message);
      throw error;
    }
  }

  /**
   * Search news by specific query
   */
  async searchNews(query, options = {}) {
    const {
      limit = 10,
      lang = 'en',
      country = 'us',
      from = null, // Date from (YYYY-MM-DD)
      to = null     // Date to (YYYY-MM-DD)
    } = options;

    try {
      const params = {
        q: query,
        lang,
        country,
        max: limit,
        apikey: this.apiKey,
        sortby: 'publishedAt'
      };

      if (from) params.from = from;
      if (to) params.to = to;

      const response = await axios.get(`${this.baseUrl}/search`, {
        params
      });

      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image: article.image,
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name,
          url: article.source.url
        }
      }));
    } catch (error) {
      console.error('[GNews] Error searching news:', error.message);
      throw error;
    }
  }

  /**
   * Get news about specific stocks/companies
   */
  async getStockNews(symbols = [], limit = 10) {
    const query = symbols.join(' OR ');
    
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          lang: 'en',
          max: limit,
          apikey: this.apiKey,
          sortby: 'publishedAt'
        }
      });

      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image: article.image,
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name,
          url: article.source.url
        },
        relatedSymbols: symbols.filter(symbol => 
          article.title.includes(symbol) || 
          article.description?.includes(symbol)
        )
      }));
    } catch (error) {
      console.error('[GNews] Error fetching stock news:', error.message);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: 'test',
          max: 1,
          apikey: this.apiKey
        }
      });

      return {
        status: 'ok',
        message: 'GNews API is working',
        apiKeyValid: response.data && response.data.articles
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

module.exports = new GNewsService();

