class DesktopService {
  constructor() {
    this.isElectron = window.electronAPI !== undefined;
    this.platform = window.platform?.os || 'unknown';
    this.isDev = window.env?.isDev || false;
    
    this.setupEventListeners();
    this.initializeDesktopFeatures();
  }

  // Initialize desktop-specific features
  async initializeDesktopFeatures() {
    if (!this.isElectron) return;

    try {
      // Set up auto-updater listeners
      this.setupAutoUpdater();
      
      // Set up navigation listeners
      this.setupNavigation();
      
      // Initialize desktop notifications
      this.initializeNotifications();
      
      // Set up keyboard shortcuts
      this.setupKeyboardShortcuts();
      
      // Initialize desktop storage
      this.initializeStorage();
      
      console.log('Desktop features initialized successfully');
    } catch (error) {
      console.error('Failed to initialize desktop features:', error);
    }
  }

  // Set up event listeners
  setupEventListeners() {
    if (!this.isElectron) return;

    // Handle window focus/blur
    window.addEventListener('focus', () => {
      this.onWindowFocus();
    });

    window.addEventListener('blur', () => {
      this.onWindowBlur();
    });

    // Handle before unload
    window.addEventListener('beforeunload', (event) => {
      this.onBeforeUnload(event);
    });

    // Handle online/offline
    window.addEventListener('online', () => {
      this.onOnline();
    });

    window.addEventListener('offline', () => {
      this.onOffline();
    });
  }

  // Set up auto-updater
  setupAutoUpdater() {
    if (!this.isElectron) return;

    window.electronAPI.onUpdateAvailable((event, info) => {
      this.showUpdateNotification('Update Available', `Version ${info.version} is available. Downloading...`);
    });

    window.electronAPI.onUpdateDownloaded((event, info) => {
      this.showUpdateNotification('Update Ready', 'Update downloaded. Restart the app to apply the update.', [
        {
          text: 'Restart Now',
          action: () => {
            window.electronAPI.restartApp();
          }
        },
        {
          text: 'Later',
          action: () => {}
        }
      ]);
    });

    window.electronAPI.onDownloadProgress((event, progressObj) => {
      this.updateDownloadProgress(progressObj);
    });
  }

  // Set up navigation
  setupNavigation() {
    if (!this.isElectron) return;

    window.electronAPI.navigateTo((event, path) => {
      if (window.location.pathname !== path) {
        window.location.href = path;
      }
    });
  }

  // Initialize desktop notifications
  initializeNotifications() {
    if (!this.isElectron) return;

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  // Set up keyboard shortcuts
  setupKeyboardShortcuts() {
    if (!this.isElectron) return;

    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + R: Reload
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        window.location.reload();
      }

      // F11: Toggle fullscreen
      if (event.key === 'F11') {
        event.preventDefault();
        this.toggleFullscreen();
      }

      // Ctrl/Cmd + Shift + I: Toggle dev tools
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        this.toggleDevTools();
      }

      // Ctrl/Cmd + Shift + A: Show window
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        this.showWindow();
      }
    });
  }

  // Initialize desktop storage
  async initializeStorage() {
    if (!this.isElectron) return;

    try {
      // Load desktop settings
      const settings = await this.getDesktopSettings();
      this.applyDesktopSettings(settings);
    } catch (error) {
      console.error('Failed to initialize desktop storage:', error);
    }
  }

  // Get desktop settings
  async getDesktopSettings() {
    if (!this.isElectron) return {};

    try {
      const settings = {
        alwaysOnTop: await window.electronAPI.getStoreValue('alwaysOnTop'),
        minimizeToTray: await window.electronAPI.getStoreValue('minimizeToTray'),
        theme: await window.electronAPI.getStoreValue('theme'),
        notifications: await window.electronAPI.getStoreValue('notifications'),
        soundEnabled: await window.electronAPI.getStoreValue('soundEnabled')
      };
      
      return settings;
    } catch (error) {
      console.error('Failed to get desktop settings:', error);
      return {};
    }
  }

  // Apply desktop settings
  applyDesktopSettings(settings) {
    // Apply theme
    if (settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }

    // Apply other settings as needed
    console.log('Desktop settings applied:', settings);
  }

  // Update desktop settings
  async updateDesktopSettings(settings) {
    if (!this.isElectron) return;

    try {
      for (const [key, value] of Object.entries(settings)) {
        await window.electronAPI.setStoreValue(key, value);
      }
      
      this.applyDesktopSettings(settings);
      return { success: true };
    } catch (error) {
      console.error('Failed to update desktop settings:', error);
      return { success: false, error: error.message };
    }
  }

  // Show update notification
  showUpdateNotification(title, message, actions = []) {
    if (!this.isElectron) return;

    const options = {
      type: 'info',
      title: title,
      message: message,
      detail: 'Smart Algos Desktop',
      buttons: actions.map(action => action.text)
    };

    window.electronAPI.showMessageBox(options).then((result) => {
      if (result.response >= 0 && actions[result.response]) {
        actions[result.response].action();
      }
    });
  }

  // Update download progress
  updateDownloadProgress(progressObj) {
    // You can implement a progress bar UI here
    console.log(`Download progress: ${progressObj.percent}%`);
  }

  // Window event handlers
  onWindowFocus() {
    console.log('Window focused');
    // Handle window focus
  }

  onWindowBlur() {
    console.log('Window blurred');
    // Handle window blur
  }

  onBeforeUnload(event) {
    // Handle before unload
    console.log('Window closing');
  }

  onOnline() {
    console.log('App is online');
    // Handle online status
  }

  onOffline() {
    console.log('App is offline');
    // Handle offline status
  }

  // Desktop-specific methods
  async minimizeToTray() {
    if (!this.isElectron) return;

    try {
      await window.electronAPI.minimizeToTray();
      return { success: true };
    } catch (error) {
      console.error('Failed to minimize to tray:', error);
      return { success: false, error: error.message };
    }
  }

  async showWindow() {
    if (!this.isElectron) return;

    try {
      await window.electronAPI.showWindow();
      return { success: true };
    } catch (error) {
      console.error('Failed to show window:', error);
      return { success: false, error: error.message };
    }
  }

  async toggleFullscreen() {
    if (!this.isElectron) return;

    try {
      // This would need to be implemented in the main process
      console.log('Toggle fullscreen requested');
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
      return { success: false, error: error.message };
    }
  }

  async toggleDevTools() {
    if (!this.isElectron) return;

    try {
      // This would need to be implemented in the main process
      console.log('Toggle dev tools requested');
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle dev tools:', error);
      return { success: false, error: error.message };
    }
  }

  async downloadFile(url, filename) {
    if (!this.isElectron) return;

    try {
      const result = await window.electronAPI.downloadFile(url, {
        filename: filename,
        directory: 'Downloads'
      });
      
      return result;
    } catch (error) {
      console.error('Failed to download file:', error);
      return { success: false, error: error.message };
    }
  }

  async showSaveDialog(options) {
    if (!this.isElectron) return;

    try {
      const result = await window.electronAPI.showSaveDialog(options);
      return result;
    } catch (error) {
      console.error('Failed to show save dialog:', error);
      return { success: false, error: error.message };
    }
  }

  async showOpenDialog(options) {
    if (!this.isElectron) return;

    try {
      const result = await window.electronAPI.showOpenDialog(options);
      return result;
    } catch (error) {
      console.error('Failed to show open dialog:', error);
      return { success: false, error: error.message };
    }
  }

  async showMessageBox(options) {
    if (!this.isElectron) return;

    try {
      const result = await window.electronAPI.showMessageBox(options);
      return result;
    } catch (error) {
      console.error('Failed to show message box:', error);
      return { success: false, error: error.message };
    }
  }

  // Get app version
  async getAppVersion() {
    if (!this.isElectron) return '1.0.0';

    try {
      const version = await window.electronAPI.getAppVersion();
      return version;
    } catch (error) {
      console.error('Failed to get app version:', error);
      return '1.0.0';
    }
  }

  // Check if running in Electron
  isElectronApp() {
    return this.isElectron;
  }

  // Get platform information
  getPlatformInfo() {
    return {
      os: this.platform,
      isElectron: this.isElectron,
      isDev: this.isDev
    };
  }

  // Cleanup
  cleanup() {
    if (!this.isElectron) return;

    try {
      window.electronAPI.removeAllListeners('navigate-to');
      window.electronAPI.removeAllListeners('update-available');
      window.electronAPI.removeAllListeners('update-downloaded');
      window.electronAPI.removeAllListeners('download-progress');
    } catch (error) {
      console.error('Failed to cleanup desktop service:', error);
    }
  }
}

// Create singleton instance
const desktopService = new DesktopService();

// Export for use in the app
window.desktopService = desktopService;

export default desktopService;
