import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  TrendingUp, 
  Clock, 
  ExternalLink, 
  Filter, 
  Search,
  Calendar,
  Tag,
  Eye,
  Share2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const News = () => {
  const [news, setNews] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedNews, setBookmarkedNews] = useState(new Set());

  const categories = [
    { id: 'all', name: 'All News', icon: Newspaper },
    { id: 'earnings', name: 'Earnings', icon: TrendingUp },
    { id: 'monetary_policy', name: 'Monetary Policy', icon: Globe },
    { id: 'inflation', name: 'Inflation', icon: AlertCircle },
    { id: 'forex', name: 'Forex', icon: TrendingUp },
    { id: 'crypto', name: 'Crypto', icon: Globe },
    { id: 'general', name: 'General', icon: Newspaper }
  ];

  const impactLevels = [
    { id: 'all', name: 'All Impact', color: 'gray' },
    { id: 'high', name: 'High Impact', color: 'red' },
    { id: 'medium', name: 'Medium Impact', color: 'yellow' },
    { id: 'low', name: 'Low Impact', color: 'green' }
  ];

  const sentiments = [
    { id: 'all', name: 'All Sentiment', color: 'gray' },
    { id: 'positive', name: 'Positive', color: 'green' },
    { id: 'negative', name: 'Negative', color: 'red' },
    { id: 'neutral', name: 'Neutral', color: 'blue' }
  ];

  useEffect(() => {
    fetchNews();
    fetchTrending();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      setTimeout(() => {
        setNews([
          {
            id: '1',
            title: 'Federal Reserve Holds Interest Rates Steady at 5.25%',
            description: 'The Federal Reserve maintained its benchmark interest rate unchanged, citing ongoing inflation concerns and economic uncertainty. This decision comes as the central bank continues to monitor economic indicators.',
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
            description: 'The Euro strengthened against the US Dollar following European Central Bank officials suggesting potential rate hikes in the coming months.',
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
            description: 'Bitcoin reached new monthly highs as major corporations announce increased cryptocurrency holdings and adoption strategies.',
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
            description: 'Apple Inc. exceeded analyst expectations with robust iPhone sales and services revenue growth in the fourth quarter.',
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
            description: 'Consumer Price Index rose 0.2% month-over-month, slightly above expectations but showing signs of cooling inflation.',
            url: '#',
            source: 'CNBC',
            published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            symbols: ['EURUSD', 'GBPUSD', 'USDJPY'],
            sentiment: 'neutral',
            impact: 'high',
            category: 'inflation',
            image_url: null,
            relevance_score: 90
          },
          {
            id: '6',
            title: 'Bank of England Signals Potential Rate Cut',
            description: 'The Bank of England hinted at possible interest rate reductions as economic growth slows and inflation pressures ease.',
            url: '#',
            source: 'Financial Times',
            published_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
            symbols: ['GBPUSD'],
            sentiment: 'negative',
            impact: 'high',
            category: 'monetary_policy',
            image_url: null,
            relevance_score: 88
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching news:', error);
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      // Mock trending data
      setTrending(['EURUSD', 'GBPUSD', 'BTCUSD', 'AAPL', 'TSLA']);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  const filteredNews = news.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesImpact = selectedImpact === 'all' || article.impact === selectedImpact;
    const matchesSentiment = selectedSentiment === 'all' || article.sentiment === selectedSentiment;
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesImpact && matchesSentiment && matchesSearch;
  });

  const toggleBookmark = (newsId) => {
    const newBookmarked = new Set(bookmarkedNews);
    if (newBookmarked.has(newsId)) {
      newBookmarked.delete(newsId);
    } else {
      newBookmarked.add(newsId);
    }
    setBookmarkedNews(newBookmarked);
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'neutral': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Financial News & Analysis
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest market news, economic indicators, and their impact on trading opportunities.
          </p>
        </div>

        {/* Trending Symbols */}
        {trending.length > 0 && (
          <Card className="mb-8">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Trending Now
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map((symbol) => (
                  <span
                    key={symbol}
                    className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {/* Refresh */}
              <Button
                variant="outline"
                onClick={fetchNews}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Impact Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Impact Level
                    </label>
                    <select
                      value={selectedImpact}
                      onChange={(e) => setSelectedImpact(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {impactLevels.map((impact) => (
                        <option key={impact.id} value={impact.id}>
                          {impact.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sentiment Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sentiment
                    </label>
                    <select
                      value={selectedSentiment}
                      onChange={(e) => setSelectedSentiment(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {sentiments.map((sentiment) => (
                        <option key={sentiment.id} value={sentiment.id}>
                          {sentiment.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNews.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <div className="p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(article.sentiment)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(article.impact)}`}>
                        {article.impact} impact
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(article.id)}
                      className={bookmarkedNews.has(article.id) ? 'text-yellow-500' : 'text-gray-400'}
                    >
                      <Bookmark className={`h-4 w-4 ${bookmarkedNews.has(article.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                    {article.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                      {article.sentiment}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded text-xs font-medium">
                      {article.category}
                    </span>
                    {article.symbols.slice(0, 2).map((symbol) => (
                      <span
                        key={symbol}
                        className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      {new Date(article.published_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Source */}
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Source: {article.source}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredNews.length === 0 && (
          <Card>
            <div className="p-12 text-center">
              <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No news found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search terms to find relevant news.
              </p>
            </div>
          </Card>
        )}

        {/* Telegram Integration */}
        <Card className="mt-8">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Get Real-time Trading Signals
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Join our Telegram channel for instant trading signals and market analysis
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Telegram Channel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default News;
