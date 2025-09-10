class NotificationManager {
  constructor() {
    this.isElectron = window.electronAPI !== undefined;
    this.notifications = new Map();
    this.settings = {
      enabled: true,
      sound: true,
      priceAlerts: true,
      tradingSignals: true,
      newsAlerts: true,
      systemUpdates: true
    };
    
    this.initialize();
  }

  async initialize() {
    if (!this.isElectron) return;

    try {
      // Request notification permission
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Load settings from electron store
      const savedSettings = await window.electronAPI.getStoreValue('notificationSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings };
      }

      console.log('NotificationManager initialized');
    } catch (error) {
      console.error('Failed to initialize NotificationManager:', error);
    }
  }

  // Show desktop notification
  async showNotification(title, body, options = {}) {
    if (!this.isElectron || !this.settings.enabled) return;

    const defaultOptions = {
      icon: '/build/icon.png',
      badge: '/build/icon.png',
      tag: 'smart-algos',
      requireInteraction: false,
      silent: !this.settings.sound,
      ...options
    };

    try {
      // Create notification
      const notification = new Notification(title, defaultOptions);
      
      // Store notification reference
      const id = Date.now().toString();
      this.notifications.set(id, notification);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        notification.close();
        this.notifications.delete(id);
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.electronAPI.focusWindow();
        notification.close();
        this.notifications.delete(id);
      };

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Price alert notification
  async showPriceAlert(symbol, currentPrice, targetPrice, direction) {
    if (!this.settings.priceAlerts) return;

    const title = `💰 Price Alert: ${symbol}`;
    const body = `${symbol} ${direction === 'above' ? 'rose above' : 'fell below'} ${targetPrice}. Current: ${currentPrice}`;
    
    return this.showNotification(title, body, {
      tag: `price-alert-${symbol}`,
      requireInteraction: true,
      icon: direction === 'above' ? '/build/icon-up.png' : '/build/icon-down.png'
    });
  }

  // Trading signal notification
  async showTradingSignal(symbol, signal, confidence, price) {
    if (!this.settings.tradingSignals) return;

    const title = `📊 Trading Signal: ${symbol}`;
    const body = `${signal.toUpperCase()} signal (${confidence}% confidence) at ${price}`;
    
    return this.showNotification(title, body, {
      tag: `trading-signal-${symbol}`,
      requireInteraction: true,
      icon: signal === 'buy' ? '/build/icon-buy.png' : '/build/icon-sell.png'
    });
  }

  // News alert notification
  async showNewsAlert(headline, source) {
    if (!this.settings.newsAlerts) return;

    const title = `📰 Market News`;
    const body = `${headline} - ${source}`;
    
    return this.showNotification(title, body, {
      tag: 'news-alert',
      requireInteraction: false
    });
  }

  // System update notification
  async showUpdateNotification(version, isAvailable = true) {
    if (!this.settings.systemUpdates) return;

    const title = isAvailable ? `🔄 Update Available` : `✅ Update Complete`;
    const body = isAvailable 
      ? `Smart Algos v${version} is available for download`
      : `Smart Algos has been updated to v${version}`;
    
    return this.showNotification(title, body, {
      tag: 'system-update',
      requireInteraction: isAvailable
    });
  }

  // Portfolio alert notification
  async showPortfolioAlert(type, message, value) {
    const title = `💼 Portfolio Alert`;
    const body = `${type}: ${message} (${value})`;
    
    return this.showNotification(title, body, {
      tag: 'portfolio-alert',
      requireInteraction: true
    });
  }

  // EA/Bot status notification
  async showEAStatusAlert(eaName, status, message) {
    const title = `🤖 EA Status: ${eaName}`;
    const body = `${status}: ${message}`;
    
    return this.showNotification(title, body, {
      tag: `ea-status-${eaName}`,
      requireInteraction: true
    });
  }

  // Update notification settings
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    if (this.isElectron) {
      await window.electronAPI.setStoreValue('notificationSettings', this.settings);
    }
  }

  // Get current settings
  getSettings() {
    return { ...this.settings };
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notifications.forEach(notification => {
      notification.close();
    });
    this.notifications.clear();
  }

  // Test notification
  async testNotification() {
    return this.showNotification(
      '🔔 Test Notification',
      'Smart Algos notifications are working correctly!',
      { requireInteraction: true }
    );
  }
}

// Export for use in React components
window.NotificationManager = new NotificationManager();
