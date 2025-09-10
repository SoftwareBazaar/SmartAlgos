class KeyboardShortcutsManager {
  constructor() {
    this.isElectron = window.electronAPI !== undefined;
    this.shortcuts = new Map();
    this.globalShortcuts = new Map();
    this.isEnabled = true;
    
    this.initialize();
  }

  async initialize() {
    if (!this.isElectron) return;

    try {
      // Set up default shortcuts
      this.setupDefaultShortcuts();
      
      // Register global shortcuts
      this.registerGlobalShortcuts();
      
      // Set up local shortcuts
      this.setupLocalShortcuts();
      
      console.log('KeyboardShortcutsManager initialized');
    } catch (error) {
      console.error('Failed to initialize KeyboardShortcutsManager:', error);
    }
  }

  setupDefaultShortcuts() {
    // Global shortcuts (work even when app is not focused)
    this.globalShortcuts.set('CommandOrControl+Shift+A', {
      action: 'showWindow',
      description: 'Show Smart Algos window',
      global: true
    });

    this.globalShortcuts.set('CommandOrControl+Shift+N', {
      action: 'toggleNotifications',
      description: 'Toggle notifications',
      global: true
    });

    // Local shortcuts (work only when app is focused)
    this.shortcuts.set('CommandOrControl+1', {
      action: 'navigateTo',
      params: ['/dashboard'],
      description: 'Go to Dashboard'
    });

    this.shortcuts.set('CommandOrControl+2', {
      action: 'navigateTo',
      params: ['/markets'],
      description: 'Go to Markets'
    });

    this.shortcuts.set('CommandOrControl+3', {
      action: 'navigateTo',
      params: ['/news'],
      description: 'Go to News & Analysis'
    });

    this.shortcuts.set('CommandOrControl+4', {
      action: 'navigateTo',
      params: ['/portfolio'],
      description: 'Go to Portfolio'
    });

    this.shortcuts.set('CommandOrControl+5', {
      action: 'navigateTo',
      params: ['/ea-marketplace'],
      description: 'Go to EA Marketplace'
    });

    this.shortcuts.set('CommandOrControl+6', {
      action: 'navigateTo',
      params: ['/hft-bots'],
      description: 'Go to HFT Bots'
    });

    this.shortcuts.set('CommandOrControl+7', {
      action: 'navigateTo',
      params: ['/payments'],
      description: 'Go to Payments'
    });

    this.shortcuts.set('CommandOrControl+8', {
      action: 'navigateTo',
      params: ['/settings'],
      description: 'Go to Settings'
    });

    // App control shortcuts
    this.shortcuts.set('CommandOrControl+R', {
      action: 'reload',
      description: 'Reload app'
    });

    this.shortcuts.set('CommandOrControl+Shift+R', {
      action: 'forceReload',
      description: 'Force reload app'
    });

    this.shortcuts.set('F11', {
      action: 'toggleFullscreen',
      description: 'Toggle fullscreen'
    });

    this.shortcuts.set('CommandOrControl+Shift+I', {
      action: 'toggleDevTools',
      description: 'Toggle developer tools'
    });

    this.shortcuts.set('CommandOrControl+W', {
      action: 'closeWindow',
      description: 'Close window'
    });

    this.shortcuts.set('CommandOrControl+M', {
      action: 'minimizeWindow',
      description: 'Minimize window'
    });

    // Trading shortcuts
    this.shortcuts.set('CommandOrControl+Shift+B', {
      action: 'quickBuy',
      description: 'Quick buy (if on market page)'
    });

    this.shortcuts.set('CommandOrControl+Shift+S', {
      action: 'quickSell',
      description: 'Quick sell (if on market page)'
    });

    this.shortcuts.set('CommandOrControl+Shift+E', {
      action: 'toggleEA',
      description: 'Toggle EA (if on EA page)'
    });

    // Utility shortcuts
    this.shortcuts.set('CommandOrControl+Shift+D', {
      action: 'toggleDarkMode',
      description: 'Toggle dark mode'
    });

    this.shortcuts.set('CommandOrControl+Shift+T', {
      action: 'toggleAlwaysOnTop',
      description: 'Toggle always on top'
    });

    this.shortcuts.set('CommandOrControl+Shift+U', {
      action: 'checkUpdates',
      description: 'Check for updates'
    });
  }

  async registerGlobalShortcuts() {
    if (!this.isElectron) return;

    try {
      for (const [accelerator, config] of this.globalShortcuts) {
        if (config.global) {
          await window.electronAPI.registerGlobalShortcut(accelerator, config.action);
        }
      }
    } catch (error) {
      console.error('Failed to register global shortcuts:', error);
    }
  }

  setupLocalShortcuts() {
    if (!this.isElectron) return;

    // Set up event listeners for local shortcuts
    document.addEventListener('keydown', (event) => {
      if (!this.isEnabled) return;

      const accelerator = this.getAcceleratorString(event);
      const shortcut = this.shortcuts.get(accelerator);

      if (shortcut) {
        event.preventDefault();
        this.executeShortcut(shortcut);
      }
    });
  }

  getAcceleratorString(event) {
    const parts = [];
    
    if (event.ctrlKey || event.metaKey) {
      parts.push('CommandOrControl');
    }
    
    if (event.shiftKey) {
      parts.push('Shift');
    }
    
    if (event.altKey) {
      parts.push('Alt');
    }
    
    if (event.key && event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt' && event.key !== 'Meta') {
      parts.push(event.key.toUpperCase());
    }
    
    return parts.join('+');
  }

  async executeShortcut(shortcut) {
    try {
      switch (shortcut.action) {
        case 'navigateTo':
          if (shortcut.params && shortcut.params[0]) {
            window.electronAPI.navigateTo(shortcut.params[0]);
          }
          break;

        case 'reload':
          window.electronAPI.reload();
          break;

        case 'forceReload':
          window.electronAPI.forceReload();
          break;

        case 'toggleFullscreen':
          window.electronAPI.toggleFullscreen();
          break;

        case 'toggleDevTools':
          window.electronAPI.toggleDevTools();
          break;

        case 'closeWindow':
          window.electronAPI.closeWindow();
          break;

        case 'minimizeWindow':
          window.electronAPI.minimizeWindow();
          break;

        case 'showWindow':
          window.electronAPI.showWindow();
          break;

        case 'toggleNotifications':
          this.toggleNotifications();
          break;

        case 'quickBuy':
          this.quickBuy();
          break;

        case 'quickSell':
          this.quickSell();
          break;

        case 'toggleEA':
          this.toggleEA();
          break;

        case 'toggleDarkMode':
          this.toggleDarkMode();
          break;

        case 'toggleAlwaysOnTop':
          window.electronAPI.toggleAlwaysOnTop();
          break;

        case 'checkUpdates':
          window.electronAPI.checkForUpdates();
          break;

        default:
          console.log(`Shortcut action not implemented: ${shortcut.action}`);
      }
    } catch (error) {
      console.error('Failed to execute shortcut:', error);
    }
  }

  // Custom action implementations
  toggleNotifications() {
    if (window.NotificationManager) {
      const settings = window.NotificationManager.getSettings();
      window.NotificationManager.updateSettings({
        enabled: !settings.enabled
      });
    }
  }

  quickBuy() {
    // This would trigger a quick buy action if on a market page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/markets')) {
      // Trigger buy action
      console.log('Quick buy triggered');
    }
  }

  quickSell() {
    // This would trigger a quick sell action if on a market page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/markets')) {
      // Trigger sell action
      console.log('Quick sell triggered');
    }
  }

  toggleEA() {
    // This would toggle EA if on an EA page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/ea-marketplace')) {
      // Trigger EA toggle
      console.log('EA toggle triggered');
    }
  }

  toggleDarkMode() {
    // This would toggle dark mode
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save theme preference
    if (window.electronAPI) {
      window.electronAPI.setStoreValue('theme', newTheme);
    }
  }

  // Add custom shortcut
  addShortcut(accelerator, action, params = [], description = '') {
    this.shortcuts.set(accelerator, {
      action,
      params,
      description
    });
  }

  // Remove shortcut
  removeShortcut(accelerator) {
    this.shortcuts.delete(accelerator);
  }

  // Get all shortcuts
  getAllShortcuts() {
    const allShortcuts = new Map();
    
    // Add global shortcuts
    for (const [key, value] of this.globalShortcuts) {
      allShortcuts.set(key, { ...value, type: 'global' });
    }
    
    // Add local shortcuts
    for (const [key, value] of this.shortcuts) {
      allShortcuts.set(key, { ...value, type: 'local' });
    }
    
    return allShortcuts;
  }

  // Enable/disable shortcuts
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Get shortcut help
  getShortcutHelp() {
    const help = [];
    
    for (const [accelerator, config] of this.getAllShortcuts()) {
      help.push({
        key: accelerator,
        description: config.description,
        type: config.type
      });
    }
    
    return help.sort((a, b) => a.description.localeCompare(b.description));
  }
}

// Export for use in React components
window.KeyboardShortcutsManager = new KeyboardShortcutsManager();
