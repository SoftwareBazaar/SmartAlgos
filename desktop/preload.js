const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Store operations
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  
  // Dialog operations
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // File operations
  downloadFile: (url, options) => ipcRenderer.invoke('download-file', url, options),
  
  // Window operations
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  showWindow: () => ipcRenderer.invoke('show-window'),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  focusWindow: () => ipcRenderer.invoke('focus-window'),
  toggleWindow: () => ipcRenderer.invoke('toggle-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  reload: () => ipcRenderer.invoke('reload'),
  forceReload: () => ipcRenderer.invoke('force-reload'),
  toggleDevTools: () => ipcRenderer.invoke('toggle-dev-tools'),
  
  // Navigation
  navigateTo: (path) => ipcRenderer.invoke('navigate-to', path),
  onNavigateTo: (callback) => {
    ipcRenderer.on('navigate-to', callback);
  },
  
  // Notifications
  showNotification: (title, body, options) => ipcRenderer.invoke('show-notification', title, body, options),
  
  // System Tray
  setTrayContextMenu: (menuItems) => ipcRenderer.invoke('set-tray-context-menu', menuItems),
  setTrayTooltip: (tooltip) => ipcRenderer.invoke('set-tray-tooltip', tooltip),
  setTrayIcon: (iconPath) => ipcRenderer.invoke('set-tray-icon', iconPath),
  onTrayClick: (callback) => {
    ipcRenderer.on('tray-click', callback);
  },
  onTrayDoubleClick: (callback) => {
    ipcRenderer.on('tray-double-click', callback);
  },
  onTrayRightClick: (callback) => {
    ipcRenderer.on('tray-right-click', callback);
  },
  
  // Keyboard Shortcuts
  registerGlobalShortcut: (accelerator, action) => ipcRenderer.invoke('register-global-shortcut', accelerator, action),
  unregisterGlobalShortcut: (accelerator) => ipcRenderer.invoke('unregister-global-shortcut', accelerator),
  
  // Updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  
  // App Control
  showAbout: () => ipcRenderer.invoke('show-about'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Auto-updater events
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
  },
  
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
  },
  
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', callback);
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Expose platform information
contextBridge.exposeInMainWorld('platform', {
  os: process.platform,
  arch: process.arch,
  version: process.version,
  isElectron: true
});

// Expose environment information
contextBridge.exposeInMainWorld('env', {
  isDev: process.env.ELECTRON_IS_DEV === '1',
  nodeEnv: process.env.NODE_ENV
});

// Security: Remove node integration
delete window.require;
delete window.exports;
delete window.module;
