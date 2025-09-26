import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Download,
  Settings,
  Bell,
  Shield,
  Star,
  Bot,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Pause,
  Play,
  RefreshCw
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../lib/apiClient';

const Subscription = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/subscriptions');
      setSubscriptions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    
    try {
      await apiClient.put(`/api/subscriptions/${subscriptionId}/cancel`);
      alert('Subscription cancelled successfully');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleDownloadFile = async (subscriptionId, fileType) => {
    try {
      await apiClient.post(`/api/subscriptions/${subscriptionId}/download`, {
        fileType
      });
      alert('Download recorded successfully');
    } catch (error) {
      console.error('Error recording download:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900',
      pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900',
      cancelled: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900',
      expired: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
      suspended: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: CheckCircle,
      pending: Clock,
      cancelled: XCircle,
      expired: XCircle,
      suspended: AlertCircle
    };
    return icons[status] || Clock;
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (activeTab === 'active') return sub.status === 'active';
    if (activeTab === 'all') return true;
    return sub.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              My Subscriptions
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your EA subscriptions and billing
            </p>
          </div>
          <Button variant="primary" onClick={fetchSubscriptions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'active', name: 'Active', count: subscriptions.filter(s => s.status === 'active').length },
            { id: 'pending', name: 'Pending', count: subscriptions.filter(s => s.status === 'pending').length },
            { id: 'cancelled', name: 'Cancelled', count: subscriptions.filter(s => s.status === 'cancelled').length },
            { id: 'all', name: 'All', count: subscriptions.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Subscriptions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Loading subscriptions...</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No subscriptions found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'active' 
                ? 'You don\'t have any active subscriptions yet.'
                : `You don't have any ${activeTab} subscriptions.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => {
              const StatusIcon = getStatusIcon(subscription.status);
              return (
                <Card key={subscription._id} hover>
                  <Card.Body>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                          <Bot className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {subscription.ea?.name || 'Unknown EA'}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {subscription.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {subscription.subscriptionType} subscription • 
                            {subscription.ea?.creatorName || 'Unknown Creator'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
                            <span>Expires: {new Date(subscription.endDate).toLocaleDateString()}</span>
                            <span>Price: ${subscription.price}/{subscription.subscriptionType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {subscription.status === 'active' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadFile(subscription._id, 'ea_file')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCancelSubscription(subscription._id)}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {subscription.performanceMetrics && subscription.status === 'active' && (
                      <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Trades</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {subscription.performanceMetrics.totalTrades}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {subscription.performanceMetrics.winRate.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Profit</p>
                            <p className="text-sm font-semibold text-success-600 dark:text-success-400">
                              ${subscription.performanceMetrics.totalProfit.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Max Drawdown</p>
                            <p className="text-sm font-semibold text-danger-600 dark:text-danger-400">
                              {subscription.performanceMetrics.maxDrawdown.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Escrow Status */}
                    {subscription.escrowStatus && (
                      <div className="mt-3 pt-3 border-t dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Escrow Status: 
                          </span>
                          <span className={`text-sm font-medium ${
                            subscription.escrowStatus === 'active' 
                              ? 'text-blue-600 dark:text-blue-400'
                              : subscription.escrowStatus === 'released'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {subscription.escrowStatus}
                          </span>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {subscriptions.filter(s => s.status === 'active').length}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ${subscriptions
                      .filter(s => s.status === 'active')
                      .reduce((sum, s) => sum + (s.subscriptionType === 'monthly' ? s.price : s.price / 4), 0)
                      .toFixed(2)
                    }
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {subscriptions.reduce((sum, s) => sum + (s.downloadedFiles?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Subscription;