import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Monitor, 
  Keyboard, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Info,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

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
    try {
      const electronCheck = window.electronAPI !== undefined;
      setIsElectron(electronCheck);

      if (electronCheck) {
        initializeDesktopFeatures();
      }
    } catch (error) {
      console.error('Error in DesktopFeatures initialization:', error);
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

  const showSnackbar = (message, severity = 'success') => {
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
        showSnackbar('Desktop features not available in web version', 'info');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      showSnackbar('Failed to send notification', 'error');
    }
  };

  const getFeatureStatus = (feature) => {
    return desktopFeatures[feature] ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Desktop Features
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isElectron 
            ? 'Enhanced desktop application features are available' 
            : 'Desktop features are only available in the desktop application'}
        </p>
      </div>

      {/* Desktop App Status */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isElectron ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Monitor className={`w-6 h-6 ${
                  isElectron ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {isElectron ? 'Desktop App Active' : 'Web Version'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isElectron 
                    ? 'You are using the desktop application with full features' 
                    : 'Download the desktop app for enhanced features'}
                </p>
              </div>
            </div>
            {!isElectron && (
              <Button variant="primary">
                <Download className="w-4 h-4 mr-2" />
                Download Desktop App
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Feature Status */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Feature Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Notifications</span>
              </div>
              {getFeatureStatus('notifications')}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">System Tray</span>
              </div>
              {getFeatureStatus('systemTray')}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Keyboard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Keyboard Shortcuts</span>
              </div>
              {getFeatureStatus('keyboardShortcuts')}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Auto-Updater</span>
              </div>
              {getFeatureStatus('autoUpdater')}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Window Management</span>
              </div>
              {getFeatureStatus('windowManagement')}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Desktop Settings</span>
              </div>
              {getFeatureStatus('desktopSettings')}
            </div>
          </div>
        </div>
      </Card>

      {/* Test Notifications */}
      {isElectron && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Test Notifications
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Test the desktop notification system with a sample alert.
            </p>
            <Button variant="primary" onClick={testNotification}>
              <Bell className="w-4 h-4 mr-2" />
              Test Notification
            </Button>
          </div>
        </Card>
      )}

      {/* Available Features */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Available Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                🔔 Desktop Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified about price alerts, trading signals, EA status changes, and portfolio updates.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                📱 System Tray Integration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick access to all features through the system tray with status indicators.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                ⌨️ Keyboard Shortcuts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Navigate quickly with global and local keyboard shortcuts for all features.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                🔄 Auto-Updater
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic updates with progress indicators and rollback capability.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Snackbar for feedback */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          snackbar.severity === 'success' ? 'bg-green-500 text-white' :
          snackbar.severity === 'error' ? 'bg-red-500 text-white' :
          snackbar.severity === 'info' ? 'bg-blue-500 text-white' :
          'bg-yellow-500 text-black'
        }`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default DesktopFeatures;
