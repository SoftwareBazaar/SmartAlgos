import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationSettings = {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      marketAlerts: true,
      signalAlerts: true,
      portfolioAlerts: true,
      priceAlerts: true,
      newsAlerts: false,
    };
  }

  // Initialize push notifications
  async initialize() {
    try {
      if (this.isInitialized) {
        return { success: true };
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Notification permissions not granted',
        };
      }

      // Configure push notifications
      PushNotification.configure({
        // Called when token is generated
        onRegister: async (token) => {
          console.log('FCM Token:', token);
          await this.saveToken(token.token);
          await this.sendTokenToServer(token.token);
        },

        // Called when a remote or local notification is opened or received
        onNotification: (notification) => {
          console.log('Notification received:', notification);
          this.handleNotification(notification);
        },

        // Called when the user taps on a notification
        onAction: (notification) => {
          console.log('Notification action:', notification);
          this.handleNotificationAction(notification);
        },

        // Called when the user fails to register for remote notifications
        onRegistrationError: (err) => {
          console.error('Notification registration error:', err);
        },

        // IOS only: Called when the user taps on a notification
        onRemoteNotification: (notification) => {
          console.log('Remote notification:', notification);
          this.handleNotification(notification);
        },

        // Should the initial notification be popped automatically
        popInitialNotification: true,

        // Request permissions on init
        requestPermissions: Platform.OS === 'ios',
      });

      // Create notification channels for Android
      if (Platform.OS === 'android') {
        this.createNotificationChannels();
      }

      // Load notification settings
      await this.loadNotificationSettings();

      this.isInitialized = true;

      return { success: true };
    } catch (error) {
      console.error('Notification initialization error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'Smart Algos needs permission to send you notifications about market updates, signals, and important alerts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        // iOS permissions are handled by PushNotification.configure
        return true;
      }

      return false;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  // Create notification channels for Android
  createNotificationChannels() {
    const channels = [
      {
        channelId: 'market-alerts',
        channelName: 'Market Alerts',
        channelDescription: 'Notifications about market movements and price changes',
        importance: 4,
        vibrate: true,
      },
      {
        channelId: 'signal-alerts',
        channelName: 'Trading Signals',
        channelDescription: 'Notifications about new trading signals and recommendations',
        importance: 5,
        vibrate: true,
      },
      {
        channelId: 'portfolio-alerts',
        channelName: 'Portfolio Updates',
        channelDescription: 'Notifications about portfolio performance and changes',
        importance: 3,
        vibrate: false,
      },
      {
        channelId: 'general',
        channelName: 'General',
        channelDescription: 'General app notifications',
        importance: 3,
        vibrate: false,
      },
    ];

    channels.forEach(channel => {
      PushNotification.createChannel(
        {
          channelId: channel.channelId,
          channelName: channel.channelName,
          channelDescription: channel.channelDescription,
          playSound: true,
          soundName: 'default',
          importance: channel.importance,
          vibrate: channel.vibrate,
        },
        (created) => console.log(`Channel ${channel.channelId} created:`, created)
      );
    });
  }

  // Save FCM token locally
  async saveToken(token) {
    try {
      await AsyncStorage.setItem('fcmToken', token);
    } catch (error) {
      console.error('Save token error:', error);
    }
  }

  // Send token to server
  async sendTokenToServer(token) {
    try {
      await apiService.updateNotificationSettings({
        fcmToken: token,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Send token to server error:', error);
    }
  }

  // Handle incoming notification
  handleNotification(notification) {
    const { userInteraction, data, message, title } = notification;

    // If user tapped the notification
    if (userInteraction) {
      this.handleNotificationTap(data);
    }

    // Show local notification if needed
    if (Platform.OS === 'android' && !userInteraction) {
      this.showLocalNotification({
        title: title || 'Smart Algos',
        message: message || 'You have a new notification',
        data: data,
      });
    }
  }

  // Handle notification tap
  handleNotificationTap(data) {
    if (!data) return;

    const { type, id, screen, params } = data;

    // Navigate based on notification type
    switch (type) {
      case 'signal':
        // Navigate to signals screen
        break;
      case 'market':
        // Navigate to markets screen
        break;
      case 'portfolio':
        // Navigate to portfolio screen
        break;
      case 'ea':
        // Navigate to EA details
        break;
      case 'hft':
        // Navigate to HFT details
        break;
      default:
        // Navigate to notifications screen
        break;
    }
  }

  // Handle notification action
  handleNotificationAction(notification) {
    const { action, data } = notification;

    switch (action) {
      case 'view':
        this.handleNotificationTap(data);
        break;
      case 'dismiss':
        // Dismiss notification
        break;
      default:
        break;
    }
  }

  // Show local notification
  showLocalNotification(notification) {
    const {
      title = 'Smart Algos',
      message,
      data = {},
      channelId = 'general',
    } = notification;

    PushNotification.localNotification({
      channelId,
      title,
      message,
      data,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
    });
  }

  // Schedule local notification
  scheduleLocalNotification(notification, date) {
    const {
      title = 'Smart Algos',
      message,
      data = {},
      channelId = 'general',
    } = notification;

    PushNotification.localNotificationSchedule({
      channelId,
      title,
      message,
      data,
      date,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
    });
  }

  // Cancel all notifications
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Cancel specific notification
  cancelNotification(id) {
    PushNotification.cancelLocalNotifications({ id });
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(settings) };
      }
      return this.notificationSettings;
    } catch (error) {
      console.error('Get notification settings error:', error);
      return this.notificationSettings;
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      this.notificationSettings = { ...this.notificationSettings, ...settings };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
      
      // Send to server
      await apiService.updateNotificationSettings(this.notificationSettings);
      
      return { success: true };
    } catch (error) {
      console.error('Update notification settings error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load notification settings
  async loadNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(settings) };
      }
    } catch (error) {
      console.error('Load notification settings error:', error);
    }
  }

  // Send market alert
  async sendMarketAlert(alert) {
    if (!this.notificationSettings.marketAlerts) return;

    const { symbol, price, change, changePercent, type } = alert;
    
    this.showLocalNotification({
      title: 'Market Alert',
      message: `${symbol} ${type === 'up' ? 'increased' : 'decreased'} by ${changePercent.toFixed(2)}% to $${price}`,
      data: {
        type: 'market',
        symbol,
        price,
        change,
        changePercent,
      },
      channelId: 'market-alerts',
    });
  }

  // Send signal alert
  async sendSignalAlert(signal) {
    if (!this.notificationSettings.signalAlerts) return;

    const { symbol, action, price, confidence, timeframe } = signal;
    
    this.showLocalNotification({
      title: 'New Trading Signal',
      message: `${action} signal for ${symbol} at $${price} (${confidence}% confidence)`,
      data: {
        type: 'signal',
        signalId: signal._id,
        symbol,
        action,
        price,
        confidence,
        timeframe,
      },
      channelId: 'signal-alerts',
    });
  }

  // Send portfolio alert
  async sendPortfolioAlert(alert) {
    if (!this.notificationSettings.portfolioAlerts) return;

    const { type, message, value, change } = alert;
    
    this.showLocalNotification({
      title: 'Portfolio Update',
      message: message,
      data: {
        type: 'portfolio',
        alertType: type,
        value,
        change,
      },
      channelId: 'portfolio-alerts',
    });
  }

  // Send price alert
  async sendPriceAlert(alert) {
    if (!this.notificationSettings.priceAlerts) return;

    const { symbol, price, targetPrice, condition } = alert;
    
    this.showLocalNotification({
      title: 'Price Alert',
      message: `${symbol} reached $${price} (${condition} $${targetPrice})`,
      data: {
        type: 'price',
        symbol,
        price,
        targetPrice,
        condition,
      },
      channelId: 'market-alerts',
    });
  }

  // Test notification
  async sendTestNotification() {
    this.showLocalNotification({
      title: 'Test Notification',
      message: 'This is a test notification from Smart Algos',
      data: {
        type: 'test',
      },
      channelId: 'general',
    });
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    try {
      const settings = await this.getNotificationSettings();
      return settings.pushNotifications;
    } catch (error) {
      console.error('Check notifications enabled error:', error);
      return false;
    }
  }

  // Enable/disable notifications
  async setNotificationsEnabled(enabled) {
    try {
      await this.updateNotificationSettings({ pushNotifications: enabled });
      return { success: true };
    } catch (error) {
      console.error('Set notifications enabled error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export functions for easy use
export const initializePushNotifications = () => notificationService.initialize();
export const showLocalNotification = (notification) => notificationService.showLocalNotification(notification);
export const scheduleLocalNotification = (notification, date) => notificationService.scheduleLocalNotification(notification, date);
export const cancelAllNotifications = () => notificationService.cancelAllNotifications();
export const cancelNotification = (id) => notificationService.cancelNotification(id);
export const getNotificationSettings = () => notificationService.getNotificationSettings();
export const updateNotificationSettings = (settings) => notificationService.updateNotificationSettings(settings);
export const sendMarketAlert = (alert) => notificationService.sendMarketAlert(alert);
export const sendSignalAlert = (signal) => notificationService.sendSignalAlert(signal);
export const sendPortfolioAlert = (alert) => notificationService.sendPortfolioAlert(alert);
export const sendPriceAlert = (alert) => notificationService.sendPriceAlert(alert);
export const sendTestNotification = () => notificationService.sendTestNotification();
export const areNotificationsEnabled = () => notificationService.areNotificationsEnabled();
export const setNotificationsEnabled = (enabled) => notificationService.setNotificationsEnabled(enabled);

export default notificationService;
