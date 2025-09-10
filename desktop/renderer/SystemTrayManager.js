class SystemTrayManager {
  constructor() {
    this.isElectron = window.electronAPI !== undefined;
    this.trayMenu = null;
    this.status = {
      connected: true,
      activeEAs: 0,
      activeBots: 0,
      portfolioValue: 0,
      lastUpdate: new Date()
    };
    
    this.initialize();
  }

  async initialize() {
    if (!this.isElectron) return;

    try {
      // Set up tray event listeners
      this.setupTrayListeners();
      
      // Start status updates
      this.startStatusUpdates();
      
      console.log('SystemTrayManager initialized');
    } catch (error) {
      console.error('Failed to initialize SystemTrayManager:', error);
    }
  }

  setupTrayListeners() {
    if (!this.isElectron) return;

    // Listen for tray events from main process
    window.electronAPI.onTrayClick(() => {
      this.handleTrayClick();
    });

    window.electronAPI.onTrayDoubleClick(() => {
      this.handleTrayDoubleClick();
    });

    window.electronAPI.onTrayRightClick(() => {
      this.handleTrayRightClick();
    });
  }

  handleTrayClick() {
    // Single click - show/hide window
    if (window.electronAPI) {
      window.electronAPI.toggleWindow();
    }
  }

  handleTrayDoubleClick() {
    // Double click - show window and focus
    if (window.electronAPI) {
      window.electronAPI.showWindow();
      window.electronAPI.focusWindow();
    }
  }

  handleTrayRightClick() {
    // Right click - show context menu
    this.showTrayContextMenu();
  }

  async showTrayContextMenu() {
    if (!this.isElectron) return;

    const menuItems = [
      {
        label: 'Smart Algos',
        enabled: false,
        type: 'normal'
      },
      {
        type: 'separator'
      },
      {
        label: 'Show Window',
        click: () => {
          window.electronAPI.showWindow();
          window.electronAPI.focusWindow();
        }
      },
      {
        label: 'Hide Window',
        click: () => {
          window.electronAPI.hideWindow();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quick Actions',
        submenu: [
          {
            label: '📊 View Markets',
            click: () => {
              window.electronAPI.showWindow();
              window.electronAPI.navigateTo('/markets');
            }
          },
          {
            label: '💼 Portfolio',
            click: () => {
              window.electronAPI.showWindow();
              window.electronAPI.navigateTo('/portfolio');
            }
          },
          {
            label: '🤖 EA Marketplace',
            click: () => {
              window.electronAPI.showWindow();
              window.electronAPI.navigateTo('/ea-marketplace');
            }
          },
          {
            label: '⚡ HFT Bots',
            click: () => {
              window.electronAPI.showWindow();
              window.electronAPI.navigateTo('/hft-bots');
            }
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: 'Status',
        submenu: [
          {
            label: `Connection: ${this.status.connected ? '🟢 Connected' : '🔴 Disconnected'}`,
            enabled: false
          },
          {
            label: `Active EAs: ${this.status.activeEAs}`,
            enabled: false
          },
          {
            label: `Active Bots: ${this.status.activeBots}`,
            enabled: false
          },
          {
            label: `Portfolio: $${this.status.portfolioValue.toLocaleString()}`,
            enabled: false
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: 'Settings',
        click: () => {
          window.electronAPI.showWindow();
          window.electronAPI.navigateTo('/settings');
        }
      },
      {
        label: 'About',
        click: () => {
          window.electronAPI.showAbout();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => {
          window.electronAPI.quitApp();
        }
      }
    ];

    try {
      await window.electronAPI.setTrayContextMenu(menuItems);
    } catch (error) {
      console.error('Failed to set tray context menu:', error);
    }
  }

  async updateTrayStatus(newStatus) {
    this.status = { ...this.status, ...newStatus };
    
    if (!this.isElectron) return;

    try {
      // Update tray tooltip
      const tooltip = this.generateTooltip();
      await window.electronAPI.setTrayTooltip(tooltip);

      // Update tray icon based on status
      const iconPath = this.getStatusIcon();
      await window.electronAPI.setTrayIcon(iconPath);

      // Refresh context menu
      await this.showTrayContextMenu();
    } catch (error) {
      console.error('Failed to update tray status:', error);
    }
  }

  generateTooltip() {
    const statusText = this.status.connected ? 'Connected' : 'Disconnected';
    const lastUpdate = this.status.lastUpdate.toLocaleTimeString();
    
    return `Smart Algos - ${statusText}
Portfolio: $${this.status.portfolioValue.toLocaleString()}
Active EAs: ${this.status.activeEAs}
Active Bots: ${this.status.activeBots}
Last Update: ${lastUpdate}`;
  }

  getStatusIcon() {
    // Return different icons based on status
    if (!this.status.connected) {
      return '/build/tray-icon-offline.png';
    } else if (this.status.activeEAs > 0 || this.status.activeBots > 0) {
      return '/build/tray-icon-active.png';
    } else {
      return '/build/tray-icon.png';
    }
  }

  startStatusUpdates() {
    // Update status every 30 seconds
    setInterval(() => {
      this.updateStatusFromApp();
    }, 30000);

    // Initial update
    this.updateStatusFromApp();
  }

  async updateStatusFromApp() {
    try {
      // Get current status from the app
      const appStatus = await this.getAppStatus();
      await this.updateTrayStatus(appStatus);
    } catch (error) {
      console.error('Failed to update status from app:', error);
    }
  }

  async getAppStatus() {
    // This would typically fetch data from your app's state
    // For now, we'll return mock data
    return {
      connected: true,
      activeEAs: 2, // This would come from your EA management system
      activeBots: 1, // This would come from your HFT bot system
      portfolioValue: 125000, // This would come from your portfolio system
      lastUpdate: new Date()
    };
  }

  // Show notification from tray
  async showTrayNotification(title, body, options = {}) {
    if (!this.isElectron) return;

    try {
      await window.electronAPI.showNotification(title, body, options);
    } catch (error) {
      console.error('Failed to show tray notification:', error);
    }
  }

  // Set tray icon
  async setTrayIcon(iconPath) {
    if (!this.isElectron) return;

    try {
      await window.electronAPI.setTrayIcon(iconPath);
    } catch (error) {
      console.error('Failed to set tray icon:', error);
    }
  }

  // Set tray tooltip
  async setTrayTooltip(tooltip) {
    if (!this.isElectron) return;

    try {
      await window.electronAPI.setTrayTooltip(tooltip);
    } catch (error) {
      console.error('Failed to set tray tooltip:', error);
    }
  }

  // Destroy tray manager
  destroy() {
    // Clean up any intervals or listeners
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
    }
  }
}

// Export for use in React components
window.SystemTrayManager = new SystemTrayManager();
