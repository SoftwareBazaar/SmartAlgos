import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopWidget from './DesktopWidget';
import DesktopSettings from './DesktopSettings';

const DesktopIntegration = () => {
  const navigate = useNavigate();
  const [isElectron, setIsElectron] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [desktopFeatures, setDesktopFeatures] = useState({
    notifications: false,
    systemTray: false,
    keyboardShortcuts: false,
    autoUpdater: false
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

      // Set up navigation listener
      if (window.electronAPI) {
        window.electronAPI.onNavigateTo((event, path) => {
          navigate(path);
        });
      }

      console.log('Desktop features initialized successfully');
    } catch (error) {
      console.error('Failed to initialize desktop features:', error);
    }
  };

  const handleShowWidget = () => {
    setShowWidget(true);
  };

  const handleHideWidget = () => {
    setShowWidget(false);
  };

  const handleMinimizeWidget = () => {
    setShowWidget(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleHideSettings = () => {
    setShowSettings(false);
  };

  // Demo function to test notifications
  const testNotification = async () => {
    if (window.NotificationManager) {
      await window.NotificationManager.showPriceAlert('AAPL', 175.50, 175.00, 'above');
    }
  };

  // Demo function to test trading signal
  const testTradingSignal = async () => {
    if (window.NotificationManager) {
      await window.NotificationManager.showTradingSignal('AAPL', 'buy', 85, 175.50);
    }
  };

  if (!isElectron) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Desktop Features</h2>
        <p>These features are only available in the desktop application.</p>
        <p>Please run the desktop version to access:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Desktop Notifications</li>
          <li>System Tray Integration</li>
          <li>Keyboard Shortcuts</li>
          <li>Auto-Updater</li>
          <li>Desktop Widget</li>
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Desktop Features</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Feature Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <strong>Notifications:</strong> {desktopFeatures.notifications ? '✅ Active' : '❌ Inactive'}
          </div>
          <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <strong>System Tray:</strong> {desktopFeatures.systemTray ? '✅ Active' : '❌ Inactive'}
          </div>
          <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <strong>Keyboard Shortcuts:</strong> {desktopFeatures.keyboardShortcuts ? '✅ Active' : '❌ Inactive'}
          </div>
          <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <strong>Auto-Updater:</strong> {desktopFeatures.autoUpdater ? '✅ Active' : '❌ Inactive'}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleShowWidget}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Show Desktop Widget
          </button>
          
          <button 
            onClick={handleShowSettings}
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Desktop Settings
          </button>
          
          <button 
            onClick={testNotification}
            style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Test Price Alert
          </button>
          
          <button 
            onClick={testTradingSignal}
            style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Test Trading Signal
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Keyboard Shortcuts</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
          <div>
            <h4>Navigation</h4>
            <ul>
              <li><kbd>Ctrl+1</kbd> - Dashboard</li>
              <li><kbd>Ctrl+2</kbd> - Markets</li>
              <li><kbd>Ctrl+3</kbd> - News & Analysis</li>
              <li><kbd>Ctrl+4</kbd> - Portfolio</li>
              <li><kbd>Ctrl+5</kbd> - EA Marketplace</li>
              <li><kbd>Ctrl+6</kbd> - HFT Bots</li>
            </ul>
          </div>
          
          <div>
            <h4>App Control</h4>
            <ul>
              <li><kbd>Ctrl+R</kbd> - Reload</li>
              <li><kbd>F11</kbd> - Toggle Fullscreen</li>
              <li><kbd>Ctrl+Shift+I</kbd> - Dev Tools</li>
              <li><kbd>Ctrl+W</kbd> - Close Window</li>
              <li><kbd>Ctrl+M</kbd> - Minimize</li>
            </ul>
          </div>
          
          <div>
            <h4>Global Shortcuts</h4>
            <ul>
              <li><kbd>Ctrl+Shift+A</kbd> - Show Window</li>
              <li><kbd>Ctrl+Shift+N</kbd> - Toggle Notifications</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>System Tray</h3>
        <p>The system tray icon provides quick access to:</p>
        <ul>
          <li>Show/Hide the main window</li>
          <li>Quick navigation to different sections</li>
          <li>Portfolio and EA status</li>
          <li>App settings and controls</li>
        </ul>
        <p><em>Right-click the system tray icon to access the context menu.</em></p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Desktop Notifications</h3>
        <p>Get notified about:</p>
        <ul>
          <li>Price alerts when stocks hit target prices</li>
          <li>Trading signals from AI analysis</li>
          <li>EA and bot status changes</li>
          <li>Portfolio updates</li>
          <li>System updates</li>
        </ul>
      </div>

      {/* Desktop Widget */}
      {showWidget && (
        <DesktopWidget
          onClose={handleHideWidget}
          onMinimize={handleMinimizeWidget}
          onSettings={handleShowSettings}
        />
      )}

      {/* Desktop Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={handleHideSettings}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              ×
            </button>
            <DesktopSettings />
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopIntegration;