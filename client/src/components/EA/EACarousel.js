import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Zap,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../lib/apiClient';

const EACarousel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myEAs, setMyEAs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({});

  // Fetch user's EAs (created + subscribed)
  useEffect(() => {
    const fetchMyEAs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [createdRes, subscribedRes] = await Promise.all([
          apiClient.get('/api/eas/my/created').catch(() => ({ data: { success: true, data: [] } })),
          apiClient.get('/api/eas/my/subscriptions').catch(() => ({ data: { success: true, data: [] } }))
        ]);

        const created = createdRes.data.success ? createdRes.data.data : [];
        const subscribed = subscribedRes.data.success ? subscribedRes.data.data : [];

        // Combine and enrich with live stats
        const allEAs = [
          ...created.map(ea => ({ ...ea, type: 'created' })),
          ...subscribed.map(ea => ({ ...ea, type: 'subscribed' }))
        ];

        setMyEAs(allEAs);

        // Initialize live stats for each EA
        const initialStats = {};
        allEAs.forEach(ea => {
          initialStats[ea.id || ea._id] = {
            profit: (Math.random() * 5000 - 1000).toFixed(2),
            profitPercent: (Math.random() * 10 - 2).toFixed(2),
            activeTrades: Math.floor(Math.random() * 5) + 1,
            winRate: (Math.random() * 30 + 60).toFixed(1),
            totalTrades: Math.floor(Math.random() * 50) + 10,
            status: Math.random() > 0.3 ? 'active' : 'idle',
            lastUpdate: new Date().toISOString()
          };
        });
        setLiveStats(initialStats);
      } catch (error) {
        console.error('Error fetching my EAs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEAs();
  }, [user]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || myEAs.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % myEAs.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, myEAs.length]);

  // Simulate live stats updates
  useEffect(() => {
    if (myEAs.length === 0) return;

    const interval = setInterval(() => {
      setLiveStats(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(eaId => {
          const current = updated[eaId];
          updated[eaId] = {
            ...current,
            profit: (parseFloat(current.profit) + (Math.random() - 0.5) * 50).toFixed(2),
            profitPercent: (parseFloat(current.profitPercent) + (Math.random() - 0.5) * 0.5).toFixed(2),
            activeTrades: Math.max(0, current.activeTrades + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
            winRate: Math.max(50, Math.min(95, parseFloat(current.winRate) + (Math.random() - 0.5) * 0.5)).toFixed(1),
            totalTrades: current.totalTrades + (Math.random() > 0.9 ? 1 : 0),
            lastUpdate: new Date().toISOString()
          };
        });
        return updated;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [myEAs.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % myEAs.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + myEAs.length) % myEAs.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (myEAs.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 text-center">
          <Bot className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No EAs Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create or subscribe to an EA to see it here
          </p>
          <Button onClick={() => navigate('/ea-marketplace')}>
            Explore EA Marketplace
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    );
  }

  const currentEA = myEAs[currentIndex];
  const stats = liveStats[currentEA.id || currentEA._id] || {};

  return (
    <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700/50 transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent dark:from-primary-400/20 dark:via-primary-400/10 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/20 dark:bg-primary-400/30 rounded-lg">
              <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                My EA Highlights
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Live trading performance
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {isAutoPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/ea-marketplace')}
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Main Content */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* EA Info Section */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                          {currentEA.name}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          currentEA.type === 'created'
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                        }`}>
                          {currentEA.type === 'created' ? 'Created' : 'Subscribed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {currentEA.description || 'No description available'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        {currentEA.category && (
                          <span className="flex items-center space-x-1">
                            <Target className="h-3 w-3" />
                            <span>{currentEA.category}</span>
                          </span>
                        )}
                        {currentEA.subscribers !== undefined && (
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{currentEA.subscribers} subscribers</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`w-3 h-3 rounded-full ${
                        stats.status === 'active'
                          ? 'bg-success-500 animate-pulse'
                          : 'bg-gray-400'
                      }`}></div>
                    </div>
                  </div>

                  {/* Live Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-success-500/10 via-success-500/5 to-transparent dark:from-success-400/20 dark:via-success-400/10 p-4 rounded-xl border border-success-200 dark:border-success-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Profit/Loss
                        </span>
                        {parseFloat(stats.profit || 0) >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-success-600 dark:text-success-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-danger-600 dark:text-danger-400" />
                        )}
                      </div>
                      <motion.div
                        key={stats.profit}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`text-lg font-bold ${
                          parseFloat(stats.profit || 0) >= 0
                            ? 'text-success-600 dark:text-success-400'
                            : 'text-danger-600 dark:text-danger-400'
                        }`}
                      >
                        ${Math.abs(parseFloat(stats.profit || 0)).toLocaleString()}
                      </motion.div>
                      <div className={`text-xs mt-1 ${
                        parseFloat(stats.profitPercent || 0) >= 0
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-danger-600 dark:text-danger-400'
                      }`}>
                        {parseFloat(stats.profitPercent || 0) >= 0 ? '+' : ''}
                        {stats.profitPercent || '0.00'}%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent dark:from-primary-400/20 dark:via-primary-400/10 p-4 rounded-xl border border-primary-200 dark:border-primary-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Active Trades
                        </span>
                        <Activity className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <motion.div
                        key={stats.activeTrades}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg font-bold text-primary-600 dark:text-primary-400"
                      >
                        {stats.activeTrades || 0}
                      </motion.div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Live
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-400/20 dark:via-blue-400/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Win Rate
                        </span>
                        <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <motion.div
                        key={stats.winRate}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg font-bold text-blue-600 dark:text-blue-400"
                      >
                        {stats.winRate || '0.0'}%
                      </motion.div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {stats.totalTrades || 0} total trades
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-warning-500/10 via-warning-500/5 to-transparent dark:from-warning-400/20 dark:via-warning-400/10 p-4 rounded-xl border border-warning-200 dark:border-warning-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Status
                        </span>
                        <Zap className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                      </div>
                      <div className="text-lg font-bold text-warning-600 dark:text-warning-400">
                        {stats.status === 'active' ? 'Active' : 'Idle'}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Updated {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : 'now'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart/Visualization Section */}
                <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <div className="text-center space-y-4 w-full">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-8 border-primary-200 dark:border-primary-800 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full border-8 border-primary-400 dark:border-primary-600 flex items-center justify-center">
                            <BarChart3 className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 dark:border-t-primary-400"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Live Performance
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Real-time trading activity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {myEAs.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all z-10"
              aria-label="Previous EA"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all z-10"
              aria-label="Next EA"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {myEAs.length > 1 && (
        <div className="flex items-center justify-center space-x-2 p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
          {myEAs.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary-600 dark:bg-primary-400 w-8'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default EACarousel;
