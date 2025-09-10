import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Monitor, 
  Keyboard, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Info,
  TestTube,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const DesktopFeatures = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [desktopFeatures, setDesktopFeatures] = useState({
    notifications: false,
    systemTray: false,
    keyboardShortcuts: false,
    autoUpdater: false,
    windowManagement: false,
    desktopSettings: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [expandedSections, setExpandedSections] = useState({
    navigation: false,
    appControl: false,
    global: false
  });

  useEffect(() => {
    const electronCheck = window.electronAPI !== undefined;
    setIsElectron(electronCheck);

    if (electronCheck) {
      initializeDesktopFeatures();
    }
  }, []);

  const initializeDesktopFeatures = async () => {
    try {
      // Initialize notification manager
      if (window.NotificationManager) {
        await window.NotificationManager.initialize();
        setDesktopFeatures(prev => ({ ...prev, notifications: true }));
      }

      // Initialize system tray manager
      if (window.SystemTrayManager) {
        await window.SystemTrayManager.initialize();
        setDesktopFeatures(prev => ({ ...prev, systemTray: true }));
      }

      // Initialize keyboard shortcuts manager
      if (window.KeyboardShortcutsManager) {
        await window.KeyboardShortcutsManager.initialize();
        setDesktopFeatures(prev => ({ ...prev, keyboardShortcuts: true }));
      }

      // Set other features as active
      setDesktopFeatures(prev => ({
        ...prev,
        autoUpdater: true,
        windowManagement: true,
        desktopSettings: true
      }));

      console.log('Desktop features initialized successfully');
    } catch (error) {
      console.error('Failed to initialize desktop features:', error);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ open: false, message: '', severity: 'success' });
    }, 3000);
  };

  const testNotification = async () => {
    try {
      if (window.NotificationManager) {
        await window.NotificationManager.showPriceAlert('AAPL', 175.50, 175.00, 'above');
        showSnackbar('Price alert notification sent!', 'success');
      } else {
        showSnackbar('Desktop features not available', 'warning');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      showSnackbar('Failed to send notification', 'error');
    }
  };

  const testTradingSignal = async () => {
    try {
      if (window.NotificationManager) {
        await window.NotificationManager.showTradingSignal('AAPL', 'buy', 85, 175.50);
        showSnackbar('Trading signal notification sent!', 'success');
      } else {
        showSnackbar('Desktop features not available', 'warning');
      }
    } catch (error) {
      console.error('Failed to send trading signal:', error);
      showSnackbar('Failed to send trading signal', 'error');
    }
  };

  const testEAStatus = async () => {
    try {
      if (window.NotificationManager) {
        await window.NotificationManager.showEAStatusAlert('Gold Scalper EA', 'running', 'Made profit of $125');
        showSnackbar('EA status notification sent!', 'success');
      } else {
        showSnackbar('Desktop features not available', 'warning');
      }
    } catch (error) {
      console.error('Failed to send EA status:', error);
      showSnackbar('Failed to send EA status', 'error');
    }
  };

  const getFeatureStatus = (feature) => {
    return desktopFeatures[feature] ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isElectron) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              Desktop Features
            </h2>
          </div>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            These features are only available in the desktop application. Please run the desktop version to access:
          </p>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li className="flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Desktop Notifications
            </li>
            <li className="flex items-center">
              <Monitor className="w-4 h-4 mr-2" />
              System Tray Integration
            </li>
            <li className="flex items-center">
              <Keyboard className="w-4 h-4 mr-2" />
              Keyboard Shortcuts
            </li>
            <li className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Auto-Updater
            </li>
            <li className="flex items-center">
              <Monitor className="w-4 h-4 mr-2" />
              Desktop Widget
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🚀 Desktop Features
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enhanced desktop functionality for Smart Algos
        </p>
      </div>

      {/* Feature Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Feature Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Notifications:</span>
            </div>
            {getFeatureStatus('notifications')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">System Tray:</span>
            </div>
            {getFeatureStatus('systemTray')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Keyboard className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Keyboard Shortcuts:</span>
            </div>
            {getFeatureStatus('keyboardShortcuts')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-Updater:</span>
            </div>
            {getFeatureStatus('autoUpdater')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Window Management:</span>
            </div>
            {getFeatureStatus('windowManagement')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Desktop Settings:</span>
            </div>
            {getFeatureStatus('desktopSettings')}
          </div>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Test Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Test the desktop notification system with different types of alerts.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testNotification}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Price Alert
          </button>
          <button
            onClick={testTradingSignal}
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Trading Signal
          </button>
          <button
            onClick={testEAStatus}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test EA Status
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Keyboard Shortcuts
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Use these keyboard shortcuts for quick navigation and control.
        </p>
        
        {/* Navigation Shortcuts */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('navigation')}
            className="flex items-center justify-between w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">Navigation Shortcuts</span>
            {expandedSections.navigation ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          {expandedSections.navigation && (
            <div className="mt-2 space-y-2 pl-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Dashboard</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+1</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Markets</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+2</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">News & Analysis</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+3</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Portfolio</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+4</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">EA Marketplace</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+5</kbd>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">HFT Bots</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+6</kbd>
              </div>
            </div>
          )}
        </div>

        {/* App Control Shortcuts */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('appControl')}
            className="flex items-center justify-between w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">App Control Shortcuts</span>
            {expandedSections.appControl ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          {expandedSections.appControl && (
            <div className="mt-2 space-y-2 pl-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Reload</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+R</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Toggle Fullscreen</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">F11</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Dev Tools</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+Shift+I</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Close Window</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+W</kbd>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Minimize</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+M</kbd>
              </div>
            </div>
          )}
        </div>

        {/* Global Shortcuts */}
        <div>
          <button
            onClick={() => toggleSection('global')}
            className="flex items-center justify-between w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">Global Shortcuts</span>
            {expandedSections.global ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          {expandedSections.global && (
            <div className="mt-2 space-y-2 pl-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Window</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+Shift+A</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Toggle Notifications</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+Shift+N</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Toggle Dark Mode</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+Shift+D</kbd>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Check Updates</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded">Ctrl+Shift+U</kbd>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Features Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Desktop Features Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              🔔 Desktop Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get notified about price alerts, trading signals, EA status changes, and portfolio updates.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              📱 System Tray Integration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quick access to all features through the system tray with status indicators.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              ⌨️ Keyboard Shortcuts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Navigate quickly with global and local keyboard shortcuts for all features.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              🔄 Auto-Updater
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatic updates with progress indicators and rollback capability.
            </p>
          </div>
        </div>
      </div>

      {/* Snackbar for feedback */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          snackbar.severity === 'success' ? 'bg-green-500 text-white' :
          snackbar.severity === 'error' ? 'bg-red-500 text-white' :
          snackbar.severity === 'warning' ? 'bg-yellow-500 text-black' :
          'bg-blue-500 text-white'
        }`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default DesktopFeatures;