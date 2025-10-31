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
import apiClient from '../../lib/apiClient';
import AISentimentIndicator from '../../components/News/AISentimentIndicator';
import NewsImpactExplainer from '../../components/News/NewsImpactExplainer';
import EconomicCalendarOverlay from '../../components/News/EconomicCalendarOverlay';
import NewsAlertSetup from '../../components/News/NewsAlertSetup';

// Demo fallback data - defined before component to ensure it's always available
const demoFallback = [
  {
    id: 'demo-1',
    title: 'Markets Hold Steady as Investors Weigh Inflation Outlook',
    description: 'Equities were little changed while currency markets saw modest moves ahead of data.',
    category: 'general',
    impact: 'medium',
    sentiment: 'neutral',
    source: 'Smart Algos Wire',
    published_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    title: 'USD Edges Higher on Rate Differentials; EUR Softens',
    description: 'Dollar strength persists amid policy divergence and resilient US data.',
    category: 'forex',
    impact: 'low',
    sentiment: 'positive',
    source: 'Smart Algos FX',
    published_at: new Date().toISOString()
  }
];

const EmptyState = () => (
  <Card className="mb-8">
    <div className="p-6 text-center">
      <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-700 dark:text-gray-300">No news found for the current filters. Try adjusting filters or refreshing.</p>
    </div>
  </Card>
);

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

  // Ensure we always have some data to display
  useEffect(() => {
    // If news is empty after initial load and not loading, set fallback
    if (!loading && news.length === 0 && selectedCategory === 'all' && selectedImpact === 'all' && selectedSentiment === 'all' && !searchTerm.trim()) {
      setNews(demoFallback);
    }
  }, [loading, news.length, selectedCategory, selectedImpact, selectedSentiment, searchTerm]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = { limit: 40 };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedImpact !== 'all') params.impact = selectedImpact;
      if (selectedSentiment !== 'all') params.sentiment = selectedSentiment;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await apiClient.get('/api/news', { params });
      const newsData = response.data?.data || [];
      
      // Fallback to demo data if API returns empty and no filters applied
      if (newsData.length === 0 && selectedCategory === 'all' && selectedImpact === 'all' && selectedSentiment === 'all' && !searchTerm.trim()) {
        console.warn('[News] API returned no results, using fallback data');
        setNews(demoFallback);
      } else if (newsData.length > 0) {
        setNews(newsData);
      } else {
        // Empty result with filters - show empty state
        setNews([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      // Use fallback on error if no filters - always show something
      if (selectedCategory === 'all' && selectedImpact === 'all' && selectedSentiment === 'all' && !searchTerm.trim()) {
        console.warn('[News] API error, using fallback data');
        setNews(demoFallback);
      } else {
        // With filters applied and error - show empty
        setNews([]);
      }
    } finally {
      // Always set loading to false
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await apiClient.get('/api/news/trending');
      const data = response.data?.data || {};
      setTrending(data.trending_symbols || []);
    } catch (error) {
      console.error('Error fetching trending:', error);
      setTrending([]);
    }
  };

  const filteredNews = news.filter(article => {
    if (!article) return false;
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesImpact = selectedImpact === 'all' || article.impact === selectedImpact;
    const matchesSentiment = selectedSentiment === 'all' || article.sentiment === selectedSentiment;
    const matchesSearch = searchTerm === '' || 
      (article.title && article.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesImpact && matchesSentiment && matchesSearch;
  });

  const EmptyState = () => (
    <Card className="mb-8">
      <div className="p-8 text-center">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No news found</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Try adjusting filters or search. If the feed is unavailable, it will retry when you refresh.</p>
        <Button variant="outline" onClick={fetchNews} className="inline-flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>
    </Card>
  );

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

  // Calculate market summary
  const marketSummary = React.useMemo(() => {
    const sentiments = news.map(n => n.sentiment).filter(Boolean);
    const bullish = sentiments.filter(s => s === 'positive' || s === 'bullish').length;
    const bearish = sentiments.filter(s => s === 'negative' || s === 'bearish').length;
    const marketBias = bullish > bearish ? 'Risk-On' : bearish > bullish ? 'Risk-Off' : 'Neutral';
    
    // Extract high-impact events from news
    const keyEvents = news
      .filter(n => n.impact === 'high' || n.category === 'monetary_policy')
      .slice(0, 5)
      .map(n => n.title.split(':')[0] || n.category);

    return {
      marketBias,
      keyEvents: keyEvents.length > 0 ? keyEvents : ['No major events today'],
      sentiment: bullish > bearish ? 'Bullish' : bearish > bullish ? 'Bearish' : 'Neutral'
    };
  }, [news]);

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
        {/* Market Summary Banner */}
        <MarketSummaryBanner
          marketBias={marketSummary.marketBias}
          keyEvents={marketSummary.keyEvents}
          sentiment={marketSummary.sentiment}
        />

        {/* Economic Calendar Overlay */}
        <EconomicCalendarOverlay
          date={new Date().toISOString().split('T')[0]}
          onEventClick={(event) => {
            console.log('Event clicked:', event);
            // Could open a modal or navigate to details
          }}
        />

        {/* Header with Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Newspaper className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Financial News & Analysis
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time market news with AI-powered insights, sentiment analysis, and impact explanations
              </p>
            </div>
            <NewsAlertSetup onSaveAlert={(alert) => {
              console.log('Alert saved:', alert);
              // TODO: Save alert to backend
            }} />
          </div>
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

        {/* News Grid or Empty State */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNews.map((article, index) => (
              <motion.div
                key={article.id || `article-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6 h-full flex flex-col">
                    {/* AI Sentiment Indicator */}
                    {article.ai_analysis && (
                      <AISentimentIndicator
                        sentiment={article.ai_analysis.sentiment || article.sentiment}
                        confidence={article.ai_analysis.confidence || 0.75}
                        explanation={article.ai_analysis.explanation}
                        source={article.source}
                      />
                    )}

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
                      {article.title || 'Untitled'}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                      {article.description || 'No description available.'}
                    </p>

                    {/* News Impact Explainer */}
                    <NewsImpactExplainer
                      newsItem={article}
                      marketImpact={article.ai_analysis?.marketImpact}
                    />

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                        {article.sentiment || 'neutral'}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded text-xs font-medium">
                        {article.category || 'general'}
                      </span>
                      {article.symbols && article.symbols.length > 0 && article.symbols.slice(0, 2).map((symbol) => (
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
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Recent'}
                      </div>
                      <div className="flex items-center gap-2">
                        {article.url && (
                          <Button variant="ghost" size="sm" onClick={() => window.open(article.url, '_blank')}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Source */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Source: {article.source || 'Unknown'}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState />
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
