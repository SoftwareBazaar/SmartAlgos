import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  Box,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Update as UpdateIcon,
  Minimize as MinimizeIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  TestTube as TestIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const DesktopSettings = () => {
  const [settings, setSettings] = useState({
    // Notification settings
    notifications: {
      enabled: true,
      sound: true,
      priceAlerts: true,
      tradingSignals: true,
      newsAlerts: true,
      systemUpdates: true
    },
    // Window settings
    window: {
      alwaysOnTop: false,
      minimizeToTray: true,
      startMinimized: false,
      autoStart: false
    },
    // Update settings
    updates: {
      autoUpdate: true,
      checkInterval: 24, // hours
      betaUpdates: false
    },
    // Performance settings
    performance: {
      hardwareAcceleration: false,
      lowPowerMode: false,
      backgroundSync: true
    }
  });

  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const electronCheck = window.electronAPI !== undefined;
    setIsElectron(electronCheck);

    if (electronCheck) {
      loadSettings();
      getAppVersion();
    }
  }, []);

  const loadSettings = async () => {
    try {
      const desktopSettings = await window.electronAPI.getStoreValue('desktopSettings');
      if (desktopSettings) {
        setSettings(prev => ({ ...prev, ...desktopSettings }));
      }
    } catch (error) {
      console.error('Failed to load desktop settings:', error);
    }
  };

  const getAppVersion = async () => {
    try {
      const version = await window.electronAPI.getAppVersion();
      setAppVersion(version);
    } catch (error) {
      console.error('Failed to get app version:', error);
    }
  };

  const saveSettings = async () => {
    try {
      if (isElectron) {
        await window.electronAPI.setStoreValue('desktopSettings', settings);
        showSnackbar('Settings saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showSnackbar('Failed to save settings', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const testNotification = async () => {
    try {
      if (window.NotificationManager) {
        await window.NotificationManager.testNotification();
        showSnackbar('Test notification sent!', 'success');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      showSnackbar('Failed to send test notification', 'error');
    }
  };

  const checkForUpdates = async () => {
    try {
      setUpdateStatus('checking');
      await window.electronAPI.checkForUpdates();
      setUpdateStatus('idle');
      showSnackbar('Update check completed', 'info');
    } catch (error) {
      console.error('Failed to check for updates:', error);
      setUpdateStatus('error');
      showSnackbar('Failed to check for updates', 'error');
    }
  };

  const resetToDefaults = () => {
    setSettings({
      notifications: {
        enabled: true,
        sound: true,
        priceAlerts: true,
        tradingSignals: true,
        newsAlerts: true,
        systemUpdates: true
      },
      window: {
        alwaysOnTop: false,
        minimizeToTray: true,
        startMinimized: false,
        autoStart: false
      },
      updates: {
        autoUpdate: true,
        checkInterval: 24,
        betaUpdates: false
      },
      performance: {
        hardwareAcceleration: false,
        lowPowerMode: false,
        backgroundSync: true
      }
    });
    showSnackbar('Settings reset to defaults', 'info');
  };

  if (!isElectron) {
    return (
      <Alert severity="warning">
        Desktop settings are only available in the desktop application.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Desktop Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <NotificationsIcon sx={{ mr: 1 }} />
                  Notifications
                </Box>
              }
              action={
                <Button
                  startIcon={<TestIcon />}
                  onClick={testNotification}
                  size="small"
                >
                  Test
                </Button>
              }
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.enabled}
                    onChange={(e) => handleSettingChange('notifications', 'enabled', e.target.checked)}
                  />
                }
                label="Enable Notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.sound}
                    onChange={(e) => handleSettingChange('notifications', 'sound', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Sound Alerts"
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Alert Types:
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.priceAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'priceAlerts', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Price Alerts"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.tradingSignals}
                    onChange={(e) => handleSettingChange('notifications', 'tradingSignals', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Trading Signals"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.newsAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'newsAlerts', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="News Alerts"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.systemUpdates}
                    onChange={(e) => handleSettingChange('notifications', 'systemUpdates', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="System Updates"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Window Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <FullscreenIcon sx={{ mr: 1 }} />
                  Window Behavior
                </Box>
              }
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.window.alwaysOnTop}
                    onChange={(e) => handleSettingChange('window', 'alwaysOnTop', e.target.checked)}
                  />
                }
                label="Always on Top"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.window.minimizeToTray}
                    onChange={(e) => handleSettingChange('window', 'minimizeToTray', e.target.checked)}
                  />
                }
                label="Minimize to Tray"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.window.startMinimized}
                    onChange={(e) => handleSettingChange('window', 'startMinimized', e.target.checked)}
                  />
                }
                label="Start Minimized"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.window.autoStart}
                    onChange={(e) => handleSettingChange('window', 'autoStart', e.target.checked)}
                  />
                }
                label="Start with Windows"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Update Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <UpdateIcon sx={{ mr: 1 }} />
                  Updates
                </Box>
              }
              action={
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={checkForUpdates}
                  disabled={updateStatus === 'checking'}
                  size="small"
                >
                  {updateStatus === 'checking' ? 'Checking...' : 'Check Now'}
                </Button>
              }
            />
            <CardContent>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Current Version: <Chip label={appVersion} size="small" />
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.updates.autoUpdate}
                    onChange={(e) => handleSettingChange('updates', 'autoUpdate', e.target.checked)}
                  />
                }
                label="Automatic Updates"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.updates.betaUpdates}
                    onChange={(e) => handleSettingChange('updates', 'betaUpdates', e.target.checked)}
                  />
                }
                label="Beta Updates"
              />

              <Box mt={2}>
                <Typography variant="body2" gutterBottom>
                  Check Interval: {settings.updates.checkInterval} hours
                </Typography>
                <Slider
                  value={settings.updates.checkInterval}
                  onChange={(e, value) => handleSettingChange('updates', 'checkInterval', value)}
                  min={1}
                  max={168}
                  step={1}
                  marks={[
                    { value: 1, label: '1h' },
                    { value: 24, label: '24h' },
                    { value: 168, label: '1w' }
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Performance"
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.performance.hardwareAcceleration}
                    onChange={(e) => handleSettingChange('performance', 'hardwareAcceleration', e.target.checked)}
                  />
                }
                label="Hardware Acceleration"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.performance.lowPowerMode}
                    onChange={(e) => handleSettingChange('performance', 'lowPowerMode', e.target.checked)}
                  />
                }
                label="Low Power Mode"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.performance.backgroundSync}
                    onChange={(e) => handleSettingChange('performance', 'backgroundSync', e.target.checked)}
                  />
                }
                label="Background Sync"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={resetToDefaults}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={saveSettings}
        >
          Save Settings
        </Button>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DesktopSettings;
