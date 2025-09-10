import axios from 'react-native-axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { showMessage } from 'react-native-flash-message';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://api.smartalgos.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Add auth token
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add device info
      const deviceInfo = await AsyncStorage.getItem('deviceInfo');
      if (deviceInfo) {
        config.headers['X-Device-Info'] = deviceInfo;
      }

      // Add timestamp
      config.headers['X-Timestamp'] = Date.now().toString();

      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);

    // Handle network errors
    if (!error.response) {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        showMessage({
          message: 'No Internet Connection',
          description: 'Please check your internet connection and try again.',
          type: 'danger',
        });
      } else {
        showMessage({
          message: 'Connection Error',
          description: 'Unable to connect to server. Please try again.',
          type: 'danger',
        });
      }
      return Promise.reject(error);
    }

    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 401:
        // Unauthorized - clear auth data and redirect to login
        await AsyncStorage.multiRemove(['authToken', 'userData']);
        showMessage({
          message: 'Session Expired',
          description: 'Please log in again to continue.',
          type: 'warning',
        });
        break;
      case 403:
        showMessage({
          message: 'Access Denied',
          description: 'You do not have permission to perform this action.',
          type: 'danger',
        });
        break;
      case 404:
        showMessage({
          message: 'Not Found',
          description: 'The requested resource was not found.',
          type: 'warning',
        });
        break;
      case 429:
        showMessage({
          message: 'Rate Limited',
          description: 'Too many requests. Please wait a moment and try again.',
          type: 'warning',
        });
        break;
      case 500:
        showMessage({
          message: 'Server Error',
          description: 'Something went wrong on our end. Please try again later.',
          type: 'danger',
        });
        break;
      default:
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
        showMessage({
          message: 'Error',
          description: errorMessage,
          type: 'danger',
        });
    }

    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Authentication endpoints
  async login(email, password, deviceInfo) {
    return apiClient.post('/auth/login', { email, password, deviceInfo });
  }

  async register(userData) {
    return apiClient.post('/auth/register', userData);
  }

  async logout() {
    return apiClient.post('/auth/logout');
  }

  async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, newPassword) {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  }

  async changePassword(currentPassword, newPassword) {
    return apiClient.put('/auth/change-password', { currentPassword, newPassword });
  }

  async verifyToken() {
    return apiClient.get('/auth/verify');
  }

  // User endpoints
  async getProfile() {
    return apiClient.get('/users/profile');
  }

  async updateProfile(profileData) {
    return apiClient.put('/users/profile', profileData);
  }

  async uploadAvatar(imageData) {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageData.uri,
      type: imageData.type,
      name: imageData.fileName || 'avatar.jpg',
    });
    
    return apiClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Market data endpoints
  async getMarketOverview(market = 'all') {
    return apiClient.get(`/markets/overview?market=${market}`);
  }

  async getMarketData(symbol, market = 'US') {
    return apiClient.get(`/markets/quote/${symbol}?market=${market}`);
  }

  async getHistoricalData(symbol, period = '1D', market = 'US') {
    return apiClient.get(`/markets/historical/${symbol}?period=${period}&market=${market}`);
  }

  async getMarketStatus(market = 'all') {
    return apiClient.get(`/markets/status?market=${market}`);
  }

  async subscribeToSymbol(symbol, market = 'US') {
    return apiClient.post('/markets/subscribe', { symbol, market });
  }

  async unsubscribeFromSymbol(symbol, market = 'US') {
    return apiClient.post('/markets/unsubscribe', { symbol, market });
  }

  // Signals endpoints
  async getSignals(filters = {}) {
    return apiClient.get('/signals', { params: filters });
  }

  async getSignalById(signalId) {
    return apiClient.get(`/signals/${signalId}`);
  }

  async createSignal(signalData) {
    return apiClient.post('/signals', signalData);
  }

  async updateSignal(signalId, signalData) {
    return apiClient.put(`/signals/${signalId}`, signalData);
  }

  async deleteSignal(signalId) {
    return apiClient.delete(`/signals/${signalId}`);
  }

  async generateAISignal(market, symbol, timeframe) {
    return apiClient.post('/signals/ai/generate', { market, symbol, timeframe });
  }

  // EA Marketplace endpoints
  async getEAs(filters = {}) {
    return apiClient.get('/eas', { params: filters });
  }

  async getEAById(eaId) {
    return apiClient.get(`/eas/${eaId}`);
  }

  async createEA(eaData) {
    return apiClient.post('/eas', eaData);
  }

  async updateEA(eaId, eaData) {
    return apiClient.put(`/eas/${eaId}`, eaData);
  }

  async deleteEA(eaId) {
    return apiClient.delete(`/eas/${eaId}`);
  }

  async subscribeToEA(eaId, subscriptionData) {
    return apiClient.post(`/eas/${eaId}/subscribe`, subscriptionData);
  }

  async unsubscribeFromEA(eaId) {
    return apiClient.post(`/eas/${eaId}/unsubscribe`);
  }

  // HFT Bots endpoints
  async getHFTBots(filters = {}) {
    return apiClient.get('/hft', { params: filters });
  }

  async getHFTBotById(hftId) {
    return apiClient.get(`/hft/${hftId}`);
  }

  async createHFTBot(hftData) {
    return apiClient.post('/hft', hftData);
  }

  async updateHFTBot(hftId, hftData) {
    return apiClient.put(`/hft/${hftId}`, hftData);
  }

  async deleteHFTBot(hftId) {
    return apiClient.delete(`/hft/${hftId}`);
  }

  async rentHFTBot(hftId, rentalData) {
    return apiClient.post(`/hft/${hftId}/rent`, rentalData);
  }

  async stopHFTBotRental(hftId) {
    return apiClient.post(`/hft/${hftId}/stop`);
  }

  // Portfolio endpoints
  async getPortfolio() {
    return apiClient.get('/portfolio');
  }

  async getPortfolioSummary() {
    return apiClient.get('/portfolio/summary');
  }

  async getPortfolioHistory(period = '1M') {
    return apiClient.get(`/portfolio/history?period=${period}`);
  }

  async addToPortfolio(assetData) {
    return apiClient.post('/portfolio/assets', assetData);
  }

  async updatePortfolioAsset(assetId, assetData) {
    return apiClient.put(`/portfolio/assets/${assetId}`, assetData);
  }

  async removeFromPortfolio(assetId) {
    return apiClient.delete(`/portfolio/assets/${assetId}`);
  }

  // Payments endpoints
  async initializePayment(paymentData) {
    return apiClient.post('/payments/initialize', paymentData);
  }

  async verifyPayment(reference) {
    return apiClient.post('/payments/verify', { reference });
  }

  async getSubscriptions(filters = {}) {
    return apiClient.get('/payments/subscriptions', { params: filters });
  }

  async createSubscription(subscriptionData) {
    return apiClient.post('/payments/subscriptions/create', subscriptionData);
  }

  async cancelSubscription(subscriptionId, reason) {
    return apiClient.post(`/payments/subscriptions/${subscriptionId}/cancel`, { reason });
  }

  async getPaymentHistory(filters = {}) {
    return apiClient.get('/payments/history', { params: filters });
  }

  async getInvoices(filters = {}) {
    return apiClient.get('/payments/invoices', { params: filters });
  }

  async downloadInvoice(invoiceId) {
    return apiClient.get(`/payments/invoices/${invoiceId}/download`);
  }

  async processRefund(refundData) {
    return apiClient.post('/payments/refund', refundData);
  }

  // Analysis endpoints
  async getAnalysisData(filters = {}) {
    return apiClient.get('/analysis', { params: filters });
  }

  async getTechnicalAnalysis(symbol, timeframe, market = 'US') {
    return apiClient.get(`/analysis/technical/${symbol}?timeframe=${timeframe}&market=${market}`);
  }

  async getFundamentalAnalysis(symbol, market = 'US') {
    return apiClient.get(`/analysis/fundamental/${symbol}?market=${market}`);
  }

  async getMarketAnalysis(market = 'US') {
    return apiClient.get(`/analysis/market/${market}`);
  }

  // Notifications endpoints
  async getNotifications(filters = {}) {
    return apiClient.get('/notifications', { params: filters });
  }

  async markNotificationAsRead(notificationId) {
    return apiClient.put(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead() {
    return apiClient.put('/notifications/read-all');
  }

  async deleteNotification(notificationId) {
    return apiClient.delete(`/notifications/${notificationId}`);
  }

  async updateNotificationSettings(settings) {
    return apiClient.put('/notifications/settings', settings);
  }

  // Settings endpoints
  async getSettings() {
    return apiClient.get('/settings');
  }

  async updateSettings(settings) {
    return apiClient.put('/settings', settings);
  }

  async updateNotificationPreferences(preferences) {
    return apiClient.put('/settings/notifications', preferences);
  }

  async updateSecuritySettings(settings) {
    return apiClient.put('/settings/security', settings);
  }

  // File upload endpoints
  async uploadFile(fileData, type = 'document') {
    const formData = new FormData();
    formData.append('file', {
      uri: fileData.uri,
      type: fileData.type,
      name: fileData.fileName || 'file',
    });
    formData.append('type', type);

    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Health check
  async healthCheck() {
    return apiClient.get('/health');
  }
}

// Create singleton instance
const apiService = new ApiService();

export { apiClient, apiService };
export default apiService;
