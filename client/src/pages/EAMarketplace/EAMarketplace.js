import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Star, 
  Search, 
  Filter,
  Settings,
  Eye,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  XCircle
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import EscrowIntegration from '../../components/EscrowIntegration';
import FloatingChatButton from '../../components/FloatingChatButton';
import { useAuth } from '../../contexts/AuthContext';
import { useEA } from '../../contexts/EAContext';
import apiClient from '../../lib/apiClient';

const EAMarketplace = () => {
  const navigate = useNavigate();
  const { eas, getEAsByCategory, searchEAs, refreshEAs } = useEA();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEA, setSelectedEA] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [subscribing, setSubscribing] = useState(false);
  const [useEscrow, setUseEscrow] = useState(true);
  const [escrowTransaction, setEscrowTransaction] = useState(null);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState(null);
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState(null);

  // EAs are now managed by the EA context

  // Fetch user subscriptions
  useEffect(() => {
    fetchUserSubscriptions();
  }, []);

  const fetchUserSubscriptions = async () => {
    try {
      const response = await apiClient.get('/api/subscriptions');
      setUserSubscriptions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  // Check if user has active subscription for an EA
  const hasActiveSubscription = (eaId) => {
    return userSubscriptions.some(sub => 
      sub.ea_id === eaId && 
      sub.status === 'active' && 
      new Date(sub.end_date) > new Date()
    );
  };

  // Check if user has any subscription (for testing purposes)
  const hasAnySubscription = (eaId) => {
    // For testing, show download button for all EAs
    // In production, this should check actual subscriptions
    return true; // Temporarily show download for all EAs
  };

  // Handle file download
  const handleDownloadFile = async (fileType) => {
    if (!downloadLinks || !downloadLinks[fileType]) {
      alert('Download link not available for this file type.');
      return;
    }

    try {
      console.log('Downloading file type:', fileType);
      console.log('Download URL:', downloadLinks[fileType]);
      
      // Open download link in new tab
      window.open(downloadLinks[fileType], '_blank');
      
      // Record the download
      if (currentSubscriptionId) {
        try {
          await apiClient.post(`/api/subscriptions/${currentSubscriptionId}/download`, {
            fileType: fileType
          });
          console.log('Download recorded successfully');
        } catch (recordError) {
          console.warn('Failed to record download:', recordError.message);
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to initiate download. Please try again.');
    }
  };

  const handleSubscribe = (ea) => {
    setSelectedEA(ea);
    setShowSubscriptionModal(true);
  };

  const handleDownload = async (ea) => {
    // Always require payment first - no direct downloads
    if (hasActiveSubscription(ea.id)) {
      // User has paid subscription, get download links and show modal
      try {
        const subscription = userSubscriptions.find(sub => 
          sub.ea_id === ea.id && 
          sub.status === 'active' && 
          new Date(sub.end_date) > new Date()
        );
        
        if (subscription) {
          const downloadResponse = await apiClient.get(`/api/subscriptions/${subscription.id}/files`);
          
          if (downloadResponse.data.success && downloadResponse.data.data.files) {
            setShowDownloadModal(true);
            setDownloadLinks(downloadResponse.data.data.files);
            setCurrentSubscriptionId(subscription.id);
          } else {
            alert('Download links not available. Please try again later.');
          }
        }
      } catch (error) {
        console.error('Error fetching download links:', error);
        alert('Failed to load download options. Please try again.');
      }
    } else {
      // User needs to pay first - show subscription modal
      setSelectedEA(ea);
      setShowSubscriptionModal(true);
    }
  };

  const handleSubscriptionSubmit = async () => {
    if (!selectedEA) return;
    
    try {
      setSubscribing(true);
      
      // Create actual subscription via API
      const subscriptionData = {
        eaId: selectedEA.id,
        subscriptionType: subscriptionType,
        paymentMethod: paymentMethod,
        paymentReference: `sub_${Date.now()}_${selectedEA.id}` // Generate a unique reference
      };
      
      console.log('Creating subscription with data:', subscriptionData);
      
      const response = await apiClient.post('/api/subscriptions', subscriptionData);
      
      if (response.data.success) {
        // Show success message with download options
        const subscriptionId = response.data.data.id;
        
        // Automatically trigger download modal after successful subscription
        try {
          const downloadResponse = await apiClient.get(`/api/subscriptions/${subscriptionId}/files`);
          
          if (downloadResponse.data.success && downloadResponse.data.data.files) {
            // Automatically show download modal with available files
            setShowDownloadModal(true);
            setDownloadLinks(downloadResponse.data.data.files);
            setCurrentSubscriptionId(subscriptionId);
            
            // Show success toast notification
            console.log('✅ Subscription successful! Download modal opened automatically.');
          } else {
            alert('Subscription created successfully, but download links are not available yet.');
          }
        } catch (downloadError) {
          console.error('Error fetching download links:', downloadError);
          alert('Subscription created successfully, but failed to get download links. Please contact support.');
        }
        
        setShowSubscriptionModal(false);
        setSelectedEA(null);
        
        // Refresh user subscriptions to update the UI
        await fetchUserSubscriptions();
      } else {
        alert('Failed to create subscription. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  // Use real EAs from context only - no mock fallback

  const categories = [
    { id: 'all', name: 'All EAs', count: eas?.length || 0 },
    { id: 'scalping', name: 'Scalping', count: eas?.filter(ea => ea.category === 'scalping').length || 0 },
    { id: 'trend', name: 'Trend', count: eas?.filter(ea => ea.category === 'trend').length || 0 },
    { id: 'news', name: 'News', count: eas?.filter(ea => ea.category === 'news').length || 0 },
    { id: 'grid', name: 'Grid', count: eas?.filter(ea => ea.category === 'grid').length || 0 },
    { id: 'arbitrage', name: 'Arbitrage', count: eas?.filter(ea => ea.category === 'arbitrage').length || 0 },
    { id: 'hedging', name: 'Hedging', count: eas?.filter(ea => ea.category === 'hedging').length || 0 },
    { id: 'institutional', name: 'Institutional', count: eas?.filter(ea => ea.category === 'Institutional').length || 0 },
  ];

  // Get EAs based on category and search
  const categoryEAs = getEAsByCategory(activeCategory);
  const filteredEAs = searchTerm ? searchEAs(searchTerm) : categoryEAs;

  const getCategoryColor = (category) => {
    const colors = {
      scalping: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      trend: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      news: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      grid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      arbitrage: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      hedging: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      institutional: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Discount Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <h3 className="text-lg font-bold">Running Discount - 20% OFF!</h3>
              <p className="text-sm opacity-90">All EA subscriptions are 20% off this month. Discount automatically applied at checkout.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">20%</div>
            <div className="text-sm opacity-90">OFF</div>
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              EA Marketplace
            </h1>
            <p className="mt-2 text-brand-200 font-medium">
              Discover and rent professional Expert Advisors
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={refreshEAs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              My EAs
            </Button>
            <Button 
              variant="primary"
              onClick={() => navigate('/create-ea')}
            >
              <Bot className="h-4 w-4 mr-2" />
              Create EA
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search EAs..."
                  leftIcon={<Search className="h-4 w-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
                  Filters
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Featured EAs */}
      {activeCategory === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-white tracking-wide mb-4">
            Featured EAs
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(eas || []).filter(ea => ea.isFeatured).map((ea, index) => (
              <motion.div
                key={ea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-600 rounded-t-lg flex items-center justify-center">
                      <Bot className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ea.category)}`}>
                        {ea.category}
                      </span>
                    </div>
                  </div>
                  
                  <Card.Body>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {ea.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {ea.creator}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-white">
                          {ea.rating}
                        </span>
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          ({ea.reviews})
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {ea.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {ea.winRate}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Return</p>
                        <p className="text-sm font-semibold text-success-600 dark:text-success-400">
                          +{ea.monthlyReturn}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <div className="text-4xl font-extrabold text-white drop-shadow-lg">
                          ${ea.price_weekly || 6.99}
                        </div>
                        <div className="text-xs font-medium text-brand-200 mt-1 tracking-wider">
                          per week • Start Today
                        </div>
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          LOW ENTRY
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {ea.isLive ? (
                          <div className="flex items-center text-success-600 dark:text-success-400">
                            <div className="w-2 h-2 bg-success-500 rounded-full mr-1"></div>
                            <span className="text-xs">Live</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                            <span className="text-xs">Offline</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="primary" 
                        fullWidth
                        onClick={() => handleSubscribe(ea)}
                      >
                        Subscribe
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/ea-marketplace/${ea.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {ea.documentation && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/src/pages/EAMarketplace/${ea.documentation}`, '_blank')}
                          title="View Documentation"
                        >
                          📄
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All EAs Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-white tracking-wide mb-3">
          {activeCategory === 'all' ? 'All EAs' : categories.find(c => c.id === activeCategory)?.name}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEAs.map((ea, index) => (
            <motion.div
              key={ea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card hover className="h-full">
                <div className="relative">
                  <div className="h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-t-lg flex items-center justify-center overflow-hidden">
                    {ea.image ? (
                      <img 
                        src={ea.image} 
                        alt={ea.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bot className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ea.category)}`}>
                      {ea.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ea.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {ea.status === 'active' ? 'Active' : ea.status ? ea.status.charAt(0).toUpperCase() + ea.status.slice(1) : 'Pending'}
                    </span>
                    {ea.is_verified && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                
                <Card.Body className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {ea.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        by {ea.creator_name || 'AlgoSmart'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {ea.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {ea.win_rate || 0}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Return</p>
                      <p className="text-sm font-semibold text-success-600 dark:text-success-400">
                        +{ea.monthly_return || 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="relative">
                      <div className="text-xl font-bold text-white">
                        ${ea.price_weekly || 6.99}
                      </div>
                      <div className="text-xs font-medium text-brand-200">
                        /week
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="ml-1 text-xs font-medium text-white">
                          {ea.average_rating || 0}
                        </span>
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          ({ea.total_reviews || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rental Timeline Options */}
                  <div className="mb-3">
                    <div className="flex space-x-1">
                      {['monthly', 'quarterly', 'yearly'].map((period) => (
                        <button
                          key={period}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            (ea.currentPeriod || 'monthly') === period
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    {hasAnySubscription(ea.id) ? (
                      <Button 
                        size="sm" 
                        variant="primary" 
                        fullWidth
                        onClick={() => handleDownload(ea)}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="primary" 
                        fullWidth
                        onClick={() => handleSubscribe(ea)}
                        className="text-xs"
                      >
                        Subscribe
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/ea-marketplace/${ea.id}`)}
                      className="px-2"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/edit-ea/${ea.id}`)}
                      title="Edit EA"
                      className="px-2"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* No Results */}
      {filteredEAs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No EAs found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedEA && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Subscribe to {selectedEA.name}
              </h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* EA Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Bot className="h-8 w-8 text-primary-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedEA.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by {selectedEA.creator || selectedEA.creatorName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose Your Plan
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { 
                      type: 'weekly', 
                      label: 'Weekly Access', 
                      price: parseFloat(selectedEA.price_weekly) || 6.99,
                      badge: 'Try it out',
                      savings: null
                    },
                    { 
                      type: 'monthly', 
                      label: 'Monthly Access', 
                      price: parseFloat(selectedEA.price_monthly) || 18.00,
                      badge: 'MOST POPULAR',
                      savings: null
                    },
                    { 
                      type: 'lifetime', 
                      label: 'Lifetime Access', 
                      price: parseFloat(selectedEA.price_yearly) || 97.00,
                      badge: 'BEST VALUE',
                      savings: 'Save $115 - Never pay again!'
                    }
                  ].map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setSubscriptionType(option.type)}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                        subscriptionType === option.type
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-lg scale-105'
                          : 'border-gray-200 bg-white hover:border-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-primary-500'
                      }`}
                    >
                      {option.badge && (
                        <div className={`absolute -top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                          option.type === 'lifetime' 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                            : 'bg-primary-500 text-white'
                        }`}>
                          {option.badge}
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{option.label}</div>
                          {option.savings && (
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {option.savings}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            ${option.price}
                          </div>
                          {option.type !== 'lifetime' && (
                            <div className="text-xs text-gray-500">
                              /{option.type === 'weekly' ? 'week' : 'month'}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'card', name: 'Credit Card', icon: CreditCard },
                    { id: 'bank_transfer', name: 'Bank Transfer', icon: CreditCard },
                    { id: 'mobile_money', name: 'Mobile Money', icon: CreditCard },
                    { id: 'crypto', name: 'Cryptocurrency', icon: Shield }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-3 rounded-lg border flex items-center space-x-3 transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <method.icon className="h-5 w-5" />
                      <span>{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Escrow Protection Toggle */}
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Escrow Protection
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useEscrow}
                      onChange={(e) => setUseEscrow(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {useEscrow 
                    ? "Your payment is held in escrow until you confirm the EA is working as expected."
                    : "Direct payment - no escrow protection. Payment goes directly to the seller."
                  }
                </p>
              </div>

              {/* Escrow Integration */}
              {useEscrow && selectedEA && (
                <EscrowIntegration
                  productType="ea_subscription"
                  productId={selectedEA.id}
                  productName={selectedEA.name}
                  productPrice={subscriptionType === 'weekly' ? (parseFloat(selectedEA.price_weekly) || 6.99) :
                                subscriptionType === 'monthly' ? (parseFloat(selectedEA.price_monthly) || 18.00) :
                                subscriptionType === 'lifetime' ? (parseFloat(selectedEA.price_yearly) || 97.00) :
                                (parseFloat(selectedEA.price_monthly) || 18.00)}
                  sellerEmail={selectedEA.creator || selectedEA.creatorName}
                  onTransactionCreated={(transaction) => {
                    setEscrowTransaction(transaction);
                    setSubscribing(false);
                  }}
                  onError={(error) => {
                    console.error('Escrow error:', error);
                    setSubscribing(false);
                  }}
                />
              )}

              {/* Total */}
              <div className="border-t dark:border-gray-600 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Product Price</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      ${subscriptionType === 'weekly' ? (parseFloat(selectedEA.price_weekly) || 6.99) :
                        subscriptionType === 'monthly' ? (parseFloat(selectedEA.price_monthly) || 18.00) :
                        subscriptionType === 'lifetime' ? (parseFloat(selectedEA.price_yearly) || 97.00) :
                        (parseFloat(selectedEA.price_monthly) || 18.00)}
                    </span>
                  </div>
                  {useEscrow && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Escrow Fee (0.89%)</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        ${((subscriptionType === 'weekly' ? (parseFloat(selectedEA.price_weekly) || 6.99) :
                            subscriptionType === 'monthly' ? (parseFloat(selectedEA.price_monthly) || 18.00) :
                            subscriptionType === 'lifetime' ? (parseFloat(selectedEA.price_yearly) || 97.00) :
                            (parseFloat(selectedEA.price_monthly) || 18.00)) * 0.0089).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {subscriptionType === 'lifetime' && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-800 dark:text-green-300 font-medium">
                        💎 One-time payment - Never pay again!
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Saves you $115 compared to 6 months of monthly payments
                      </div>
                    </div>
                  )}
                  <div className="border-t dark:border-gray-600 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ${useEscrow 
                          ? ((subscriptionType === 'weekly' ? (parseFloat(selectedEA.price_weekly) || 6.99) :
                              subscriptionType === 'monthly' ? (parseFloat(selectedEA.price_monthly) || 18.00) :
                              subscriptionType === 'lifetime' ? (parseFloat(selectedEA.price_yearly) || 97.00) :
                              (parseFloat(selectedEA.price_monthly) || 18.00)) * 1.0089).toFixed(2)
                          : (subscriptionType === 'weekly' ? (parseFloat(selectedEA.price_weekly) || 6.99) :
                              subscriptionType === 'monthly' ? (parseFloat(selectedEA.price_monthly) || 18.00) :
                              subscriptionType === 'lifetime' ? (parseFloat(selectedEA.price_yearly) || 97.00) :
                              (parseFloat(selectedEA.price_monthly) || 18.00))
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    setEscrowTransaction(null);
                    setUseEscrow(true);
                  }}
                >
                  Cancel
                </Button>
                {useEscrow && escrowTransaction ? (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => window.open(`/api/escrow/transactions/${escrowTransaction.id}`, '_blank')}
                  >
                    View Escrow Transaction
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={useEscrow ? () => {} : handleSubscriptionSubmit}
                    disabled={subscribing || (useEscrow && !escrowTransaction)}
                  >
                    {subscribing ? 'Processing...' : useEscrow ? 'Create Escrow Transaction' : 'Subscribe Now'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Download Files
                </h3>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your subscription is active! Download the files you need:
                </p>

                <div className="space-y-3">
                  {downloadLinks?.ea_file && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Download className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">EA File</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Expert Advisor (.ex4)</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleDownloadFile('ea_file')}
                      >
                        Download
                      </Button>
                    </div>
                  )}

                  {downloadLinks?.set_file && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Settings File</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Configuration (.set)</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleDownloadFile('set_file')}
                      >
                        Download
                      </Button>
                    </div>
                  )}

                  {downloadLinks?.manual && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Eye className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Manual</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">User Guide (.pdf)</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleDownloadFile('manual')}
                      >
                        Download
                      </Button>
                    </div>
                  )}

                  {downloadLinks?.screenshots && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Screenshots</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Performance Images</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleDownloadFile('screenshots')}
                      >
                        Download
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                  <Button
                    variant="outline"
                    onClick={() => setShowDownloadModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Floating Chat Assistant */}
      <FloatingChatButton context="general" />
    </div>
  );
};

export default EAMarketplace;
