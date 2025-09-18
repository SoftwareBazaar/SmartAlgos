import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// import { useWebSocket } from '../../contexts/WebSocketContext';
import axios from 'axios';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Plus,
  ArrowLeft
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Payments = () => {
  const { user } = useAuth();
  // const { socket } = useWebSocket();
  const socket = null; // Temporary fallback
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([
    // Sample subscriptions for testing
    {
      id: 'SUB_001',
      name: 'Gold Scalper Pro EA',
      type: 'EA Subscription',
      subscriptionType: 'monthly',
      price: 299,
      currency: 'USD',
      status: 'active',
      startDate: new Date(Date.now() - 86400000).toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      productId: 'EA_001',
      productType: 'ea'
    },
    {
      id: 'SUB_002',
      name: 'Multi Indicator EA',
      type: 'EA Subscription',
      subscriptionType: 'quarterly',
      price: 237,
      currency: 'USD',
      status: 'active',
      startDate: new Date(Date.now() - 172800000).toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      productId: 'EA_002',
      productType: 'ea'
    },
    {
      id: 'SUB_003',
      name: 'HFT Bot Rental',
      type: 'HFT Bot Rental',
      subscriptionType: 'monthly',
      price: 199,
      currency: 'USD',
      status: 'active',
      startDate: new Date(Date.now() - 432000000).toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: false,
      productId: 'HFT_001',
      productType: 'hft'
    }
  ]);
  const [paymentHistory, setPaymentHistory] = useState([
    // Sample transactions for testing
    {
      id: 'TXN_001',
      description: 'Gold Scalper Pro EA - Monthly Subscription',
      amount: 299,
      currency: 'USD',
      status: 'success',
      method: 'card',
      reference: 'PAY_001_1234567890_abc123',
      date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      fees: 8.97,
      netAmount: 290.03
    },
    {
      id: 'TXN_002',
      description: 'Multi Indicator EA - Quarterly Subscription',
      amount: 237,
      currency: 'USD',
      status: 'success',
      method: 'bank_transfer',
      reference: 'PAY_002_1234567890_def456',
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      fees: 7.11,
      netAmount: 229.89
    },
    {
      id: 'TXN_003',
      description: 'Trend Master EA - Yearly Subscription',
      amount: 490,
      currency: 'USD',
      status: 'pending',
      method: 'mobile_money',
      reference: 'PAY_003_1234567890_ghi789',
      date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      fees: 14.70,
      netAmount: 475.30
    },
    {
      id: 'TXN_004',
      description: 'News Trader Bot - Weekly Subscription',
      amount: 25,
      currency: 'USD',
      status: 'failed',
      method: 'crypto',
      reference: 'PAY_004_1234567890_jkl012',
      date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      fees: 0,
      netAmount: 0
    },
    {
      id: 'TXN_005',
      description: 'HFT Bot Rental - Monthly',
      amount: 199,
      currency: 'USD',
      status: 'success',
      method: 'card',
      reference: 'PAY_005_1234567890_mno345',
      date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      fees: 5.97,
      netAmount: 193.03
    }
  ]);
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    currency: 'NGN',
    email: user?.email || '',
    description: '',
    authorization_code: '',
    paymentMethod: 'initialize' // 'initialize', 'charge_authorization', 'initialize_paused'
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  useEffect(() => {
    fetchData();
    
    // Check for payment callback
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const status = urlParams.get('status');
    
    if (reference && status) {
      handlePaymentCallback(reference, status);
    }
  }, []);

  const handlePaymentCallback = async (reference, status) => {
    if (status === 'success') {
      try {
        // Verify the payment
        const verifyResponse = await axios.post('/api/payments/verify', {
          reference: reference
        });

        if (verifyResponse.data.success) {
          // Check if there's a pending subscription
          const pendingSubscription = localStorage.getItem('pendingSubscription');
          if (pendingSubscription) {
            const subscriptionData = JSON.parse(pendingSubscription);
            
            // Create the subscription
            const subscriptionResponse = await axios.post('/api/payments/subscriptions/create', subscriptionData);
            
            if (subscriptionResponse.data.success) {
              showNotification('Payment successful! Your subscription has been activated.', 'success');
              localStorage.removeItem('pendingSubscription');
              await fetchData();
            }
          } else {
            showNotification('Payment successful!', 'success');
            await fetchData();
          }
        } else {
          showNotification('Payment verification failed. Please contact support.', 'error');
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        showNotification('Error processing payment. Please contact support.', 'error');
      }
    } else {
      showNotification('Payment was not successful. Please try again.', 'error');
    }
    
    // Clean up URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subscriptionsRes, paymentHistoryRes, invoicesRes, plansRes] = await Promise.all([
        axios.get('/api/payments/subscriptions'),
        axios.get('/api/payments/history'),
        axios.get('/api/payments/invoices'),
        axios.get('/api/payments/plans')
      ]);

      setSubscriptions(subscriptionsRes.data.data || []);
      setPaymentHistory(paymentHistoryRes.data.data || []);
      setInvoices(invoicesRes.data.data || []);
      setPlans(plansRes.data.data || []);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePayment = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/payments/initialize';
      let payload = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        email: paymentData.email,
        description: paymentData.description,
        metadata: {
          userId: user._id,
          subscriptionType: selectedPlan?.type
        }
      };

      // Handle different payment methods
      if (paymentData.paymentMethod === 'charge_authorization') {
        endpoint = '/api/payments/charge-authorization';
        payload = {
          ...payload,
          authorization_code: paymentData.authorization_code
        };
      } else if (paymentData.paymentMethod === 'initialize_paused') {
        endpoint = '/api/payments/initialize-paused';
      }

      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        if (paymentData.paymentMethod === 'charge_authorization') {
          // For charge authorization, show success message
          showNotification('Payment charged successfully!', 'success');
          setShowPaymentModal(false);
          await fetchData();
        } else {
          // For initialize and initialize_paused, redirect to Paystack payment page
          showNotification('Redirecting to payment page...', 'info');
          window.location.href = response.data.data.authorization_url;
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      showNotification('Payment failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (planType, productId, productType) => {
    setLoading(true);
    try {
      // First, initialize the payment with Paystack
      const paymentResponse = await axios.post('/api/payments/initialize', {
        amount: getPlanPrice(planType),
        currency: 'NGN',
        email: user?.email || '',
        description: `${planType} Plan Subscription`,
        metadata: {
          userId: user._id,
          subscriptionType: planType,
          productId: productId,
          productType: productType
        }
      });

      if (paymentResponse.data.success) {
        // Store subscription data for after payment
        localStorage.setItem('pendingSubscription', JSON.stringify({
          subscriptionType: planType,
          productId,
          productType,
          interval: 'monthly',
          paymentMethod: 'paystack'
        }));

        // Redirect to Paystack payment page
        window.location.href = paymentResponse.data.data.authorization_url;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      showNotification('Failed to initialize payment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPlanPrice = (planType) => {
    const prices = {
      'BASIC': 2900,    // 29 NGN
      'PROFESSIONAL': 7900,  // 79 NGN
      'ENTERPRISE': 15000    // 150 NGN
    };
    return prices[planType] || 2900;
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;

    setLoading(true);
    try {
      const response = await axios.post(`/api/payments/subscriptions/${subscriptionId}/cancel`, {
        reason: 'User request'
      });

      if (response.data.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await axios.get(`/api/payments/invoices/${invoiceId}/download`);
      if (response.data.success) {
        window.open(response.data.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'succeeded':
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const formatCurrency = (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="ml-2 text-white hover:text-gray-200"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments & Billing</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your subscriptions and payment methods</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              setPaymentData(prev => ({ ...prev, amount: 299, description: 'Gold Scalper Pro EA - Monthly Subscription' }));
              setShowPaymentModal(true);
            }}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Test Payment
          </Button>
          <Button
            onClick={async () => {
              try {
                showNotification('Testing Paystack integration...', 'info');
                const response = await axios.post('/api/payments/initialize', {
                  amount: 299,
                  currency: 'USD',
                  email: user?.email || 'test@example.com',
                  description: 'Test EA Subscription',
                  metadata: {
                    test: true,
                    productType: 'ea',
                    productId: 'EA_TEST_001'
                  }
                });
                
                if (response.data.success) {
                  showNotification('Paystack integration working! Check console for details.', 'success');
                  console.log('Paystack Test Response:', response.data);
                } else {
                  showNotification('Paystack test failed. Check console for details.', 'error');
                }
              } catch (error) {
                console.error('Paystack test error:', error);
                showNotification('Paystack test failed: ' + (error.response?.data?.message || error.message), 'error');
              }
            }}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Paystack
          </Button>
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: DollarSign },
            { id: 'subscriptions', label: 'Subscriptions', icon: Calendar },
            { id: 'history', label: 'Payment History', icon: CreditCard },
            { id: 'invoices', label: 'Invoices', icon: Download },
            { id: 'plans', label: 'Plans', icon: CheckCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {subscriptions.filter(s => s.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(
                      paymentHistory
                        .filter(p => p.status === 'succeeded')
                        .reduce((sum, p) => sum + p.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {paymentHistory.filter(p => p.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {invoices.length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Subscriptions</h2>
            <Button
              onClick={() => setActiveTab('plans')}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Subscription
            </Button>
          </div>

          {subscriptions.length === 0 ? (
            <Card>
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No subscriptions</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You don't have any active subscriptions yet.
                </p>
                <Button onClick={() => setActiveTab('plans')}>
                  Browse Plans
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6">
              {subscriptions.map((subscription) => (
                <Card key={subscription._id}>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subscription.subscriptionType} Plan
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {subscription.product?.name || 'Platform Subscription'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {formatCurrency(subscription.price, subscription.currency)} / {subscription.interval}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                        {subscription.status === 'active' && (
                          <Button
                            onClick={() => handleCancelSubscription(subscription._id)}
                            variant="outline"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {formatDate(subscription.startDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {formatDate(subscription.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h2>
          
          {paymentHistory.length === 0 ? (
            <Card>
              <div className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payment history</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your payment history will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {payment.description}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.created)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {payment.receiptUrl && (
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              View Receipt
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices</h2>
          
          {invoices.length === 0 ? (
            <Card>
              <div className="p-8 text-center">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your invoices will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {invoice.number}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {invoice.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        <Button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Paid Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {invoice.paidDate ? formatDate(invoice.paidDate) : 'Not paid'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Plans</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.type} className="relative">
                <div className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(plan.price, plan.currency)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/{plan.interval}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {plan.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => handleCreateSubscription(plan.type, null, 'platform')}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Complete Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="initialize">Initialize Payment</option>
                  <option value="charge_authorization">Charge Authorization</option>
                  <option value="initialize_paused">Initialize with Pause</option>
                </select>
              </div>

              {paymentData.paymentMethod === 'charge_authorization' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Authorization Code
                  </label>
                  <input
                    type="text"
                    value={paymentData.authorization_code}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, authorization_code: e.target.value }))}
                    placeholder="AUTH_xxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  disabled={paymentData.paymentMethod === 'charge_authorization'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={paymentData.currency}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="GHS">GHS</option>
                  <option value="ZAR">ZAR</option>
                  <option value="KES">KES</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={paymentData.description}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleInitializePayment}
                className="flex-1"
                disabled={loading || (paymentData.paymentMethod === 'charge_authorization' && !paymentData.authorization_code)}
              >
                {loading ? <LoadingSpinner size="sm" /> : 
                  paymentData.paymentMethod === 'charge_authorization' ? 'Charge Now' : 'Pay Now'}
              </Button>
              <Button
                onClick={() => setShowPaymentModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
