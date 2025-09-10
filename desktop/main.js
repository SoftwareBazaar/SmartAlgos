const { app, BrowserWindow, Menu, shell, ipcMain, dialog, nativeImage, Tray, globalShortcut } = require('electron');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const log = require('electron-log');
const windowStateKeeper = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const localShortcut = require('electron-localshortcut');
const { download } = require('electron-dl');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === '1';

// Disable hardware acceleration to avoid GPU issues
app.disableHardwareAcceleration();

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Configure auto-updater
autoUpdater.logger = log;
autoUpdater.checkForUpdatesAndNotify();

// Initialize store
const store = new Store({
  defaults: {
    windowBounds: {
      width: 1200,
      height: 800,
      x: undefined,
      y: undefined
    },
    alwaysOnTop: false,
    minimizeToTray: true,
    startMinimized: false,
    autoStart: false,
    theme: 'light',
    notifications: true,
    soundEnabled: true,
    autoUpdate: true
  }
});

let mainWindow;
let tray;
let isQuitting = false;

// App configuration
const APP_CONFIG = {
  name: 'Smart Algos',
  version: app.getVersion(),
  isDev: isDev,
  url: isDev ? `http://localhost:3000` : `file://${path.join(__dirname, '../client/build/index.html')}`,
  icon: path.join(__dirname, 'build/icon.png'),
  trayIcon: path.join(__dirname, 'build/tray-icon.png')
};

// Create main window
function createMainWindow() {
  // Load window state
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800
  });

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: APP_CONFIG.icon,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
      allowRunningInsecureContent: isDev
    }
  });

  // Hardware acceleration is disabled at app startup

  // Let windowStateKeeper manage the window
  mainWindowState.manage(mainWindow);

  // Load the app
  mainWindow.loadURL(APP_CONFIG.url);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (!store.get('startMinimized')) {
      mainWindow.show();
    }
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('close', (event) => {
    if (!isQuitting && store.get('minimizeToTray')) {
      event.preventDefault();
      mainWindow.hide();
      
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
    }
  });

  // Handle window closed (actually quitting)
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle navigation
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== new URL(APP_CONFIG.url).origin) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Context menu
  contextMenu({
    window: mainWindow,
    prepend: (defaultActions, params, browserWindow) => [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          browserWindow.reload();
        }
      },
      {
        label: 'Force Reload',
        accelerator: 'CmdOrCtrl+Shift+R',
        click: () => {
          browserWindow.webContents.reloadIgnoringCache();
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
        click: () => {
          browserWindow.webContents.toggleDevTools();
        }
      }
    ]
  });

  // Local shortcuts
  localShortcut.register(mainWindow, 'CmdOrCtrl+R', () => {
    mainWindow.reload();
  });

  localShortcut.register(mainWindow, 'CmdOrCtrl+Shift+R', () => {
    mainWindow.webContents.reloadIgnoringCache();
  });

  localShortcut.register(mainWindow, 'F11', () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  localShortcut.register(mainWindow, 'CmdOrCtrl+Shift+I', () => {
    mainWindow.webContents.toggleDevTools();
  });

  return mainWindow;
}

// Create system tray
function createTray() {
  const trayIcon = nativeImage.createFromPath(APP_CONFIG.trayIcon);
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Smart Algos',
      click: () => {
        showWindow();
      }
    },
    {
      label: 'Dashboard',
      click: () => {
        showWindow();
        mainWindow.webContents.send('navigate-to', '/dashboard');
      }
    },
    {
      label: 'Markets',
      click: () => {
        showWindow();
        mainWindow.webContents.send('navigate-to', '/markets');
      }
    },
    {
      label: 'Signals',
      click: () => {
        showWindow();
        mainWindow.webContents.send('navigate-to', '/signals');
      }
    },
    { type: 'separator' },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: store.get('alwaysOnTop'),
      click: (menuItem) => {
        const checked = menuItem.checked;
        store.set('alwaysOnTop', checked);
        mainWindow.setAlwaysOnTop(checked);
      }
    },
    {
      label: 'Minimize to Tray',
      type: 'checkbox',
      checked: store.get('minimizeToTray'),
      click: (menuItem) => {
        store.set('minimizeToTray', menuItem.checked);
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Smart Algos Trading Platform');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    showWindow();
  });

  tray.on('click', () => {
    if (process.platform === 'darwin') {
      showWindow();
    }
  });
}

// Show window
function showWindow() {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  }
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            createMainWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (mainWindow) {
              mainWindow.close();
            }
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/dashboard');
          }
        },
        {
          label: 'Markets',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/markets');
          }
        },
        {
          label: 'Signals',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/signals');
          }
        },
        {
          label: 'Portfolio',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/portfolio');
          }
        },
        {
          label: 'EA Marketplace',
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/ea-marketplace');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: store.get('alwaysOnTop'),
          click: (menuItem) => {
            const checked = menuItem.checked;
            store.set('alwaysOnTop', checked);
            mainWindow.setAlwaysOnTop(checked);
          }
        },
        {
          label: 'Minimize to Tray',
          type: 'checkbox',
          checked: store.get('minimizeToTray'),
          click: (menuItem) => {
            store.set('minimizeToTray', menuItem.checked);
          }
        },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Smart Algos',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Smart Algos',
              message: 'Smart Algos Trading Platform',
              detail: `Version ${APP_CONFIG.version}\n\nYour Gateway to Intelligent Trading\n\n© 2024 Smart Algos Team`
            });
          }
        },
        {
          label: 'Check for Updates',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/smartalgos/smart-algos-desktop/issues');
          }
        },
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://docs.smartalgos.com');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[5].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return APP_CONFIG.version;
});

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('download-file', async (event, url, options) => {
  try {
    const result = await download(mainWindow, url, options);
    return { success: true, path: result.getSavePath() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
    if (process.platform === 'darwin') {
      app.dock.hide();
    }
  }
});

ipcMain.handle('show-window', () => {
  showWindow();
});

// Desktop feature IPC handlers
ipcMain.handle('show-notification', async (event, title, body, options = {}) => {
  if (mainWindow) {
    const notification = new Notification(title, {
      body,
      icon: APP_CONFIG.icon,
      ...options
    });
    notification.show();
    return notification;
  }
});

ipcMain.handle('set-tray-context-menu', async (event, menuItems) => {
  if (tray) {
    const contextMenu = Menu.buildFromTemplate(menuItems);
    tray.setContextMenu(contextMenu);
  }
});

ipcMain.handle('set-tray-tooltip', async (event, tooltip) => {
  if (tray) {
    tray.setToolTip(tooltip);
  }
});

ipcMain.handle('set-tray-icon', async (event, iconPath) => {
  if (tray) {
    const icon = nativeImage.createFromPath(iconPath);
    tray.setImage(icon);
  }
});

ipcMain.handle('register-global-shortcut', async (event, accelerator, action) => {
  try {
    globalShortcut.register(accelerator, () => {
      // Handle global shortcut action
      switch (action) {
        case 'showWindow':
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
          break;
        case 'toggleNotifications':
          // Toggle notifications
          break;
        default:
          console.log(`Global shortcut action not implemented: ${action}`);
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to register global shortcut:', error);
    return false;
  }
});

ipcMain.handle('unregister-global-shortcut', async (event, accelerator) => {
  try {
    globalShortcut.unregister(accelerator);
    return true;
  } catch (error) {
    console.error('Failed to unregister global shortcut:', error);
    return false;
  }
});

ipcMain.handle('toggle-window', () => {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }
});

ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('focus-window', () => {
  if (mainWindow) {
    mainWindow.focus();
  }
});

ipcMain.handle('navigate-to', (event, path) => {
  if (mainWindow) {
    mainWindow.webContents.send('navigate-to', path);
  }
});

ipcMain.handle('reload', () => {
  if (mainWindow) {
    mainWindow.reload();
  }
});

ipcMain.handle('force-reload', () => {
  if (mainWindow) {
    mainWindow.webContents.reloadIgnoringCache();
  }
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.handle('toggle-dev-tools', () => {
  if (mainWindow) {
    mainWindow.webContents.toggleDevTools();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('toggle-always-on-top', () => {
  if (mainWindow) {
    const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isAlwaysOnTop);
    return !isAlwaysOnTop;
  }
});

ipcMain.handle('check-for-updates', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.handle('show-about', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About Smart Algos',
    message: 'Smart Algos Trading Platform',
    detail: `Version ${APP_CONFIG.version}\n\nYour Gateway to Intelligent Trading\n\n© 2024 Smart Algos Team`
  });
});

ipcMain.handle('quit-app', () => {
  app.quit();
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available.');
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.');
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
  
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded');
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

// App event handlers
app.whenReady().then(() => {
  createMainWindow();
  createTray();
  createMenu();

  // Register global shortcuts
  globalShortcut.register('CmdOrCtrl+Shift+A', () => {
    showWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else {
      showWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors in development
if (isDev) {
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith('https://localhost') || url.startsWith('https://127.0.0.1')) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  });
}

// Export for testing
module.exports = { createMainWindow, createTray, showWindow };
