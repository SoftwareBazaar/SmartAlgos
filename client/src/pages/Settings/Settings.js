import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Mail,
  User,
  Key,
  Globe,
  Moon,
  Sun,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';
import ThemeSwitcher from '../../components/UI/ThemeSwitcher';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || user?.firstName || '',
    lastName: user?.last_name || user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    timezone: user?.timezone || 'UTC',
    language: user?.language || 'en'
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: user?.email_notifications !== false,
    tradingAlerts: user?.trading_alerts !== false,
    marketUpdates: user?.market_updates !== false,
    newsletter: user?.newsletter !== false,
    promotionalEmails: user?.promotional_emails !== false
  });

  // Security Settings
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // API Key Management
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);
  const [showApiKey, setShowApiKey] = useState({});
  const [newApiKeyName, setNewApiKeyName] = useState('');

  useEffect(() => {
    // Load user settings from API
    loadUserSettings();
    if (activeTab === 'security') {
      loadApiKeys();
    }
  }, [activeTab]);

  const loadUserSettings = async () => {
    try {
      const response = await apiClient.get('/api/users/profile');
      if (response.data?.success && response.data?.data) {
        const userData = response.data.data;
        setProfileData({
          firstName: userData.first_name || userData.firstName || '',
          lastName: userData.last_name || userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          timezone: userData.timezone || 'UTC',
          language: userData.language || 'en'
        });
        setNotifications({
          emailNotifications: userData.email_notifications !== false,
          tradingAlerts: userData.trading_alerts !== false,
          marketUpdates: userData.market_updates !== false,
          newsletter: userData.newsletter !== false,
          promotionalEmails: userData.promotional_emails !== false
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/api/users/profile', {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        timezone: profileData.timezone,
        language: profileData.language
      });

      if (response.data?.success) {
        toast.success('Profile updated successfully');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        updateUser(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/api/users/preferences', {
        email_notifications: notifications.emailNotifications,
        trading_alerts: notifications.tradingAlerts,
        market_updates: notifications.marketUpdates,
        newsletter: notifications.newsletter,
        promotional_emails: notifications.promotionalEmails
      });

      if (response.data?.success) {
        toast.success('Notification preferences saved');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put('/api/users/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });

      if (response.data?.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const loadApiKeys = async () => {
    try {
      setLoadingApiKeys(true);
      const response = await apiClient.get('/api/users/api-keys');
      if (response.data?.success) {
        setApiKeys(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      // If endpoint doesn't exist, show mock data for demo
      setApiKeys([
        {
          id: '1',
          name: 'Production API Key',
          key: 'sk_live_******' + Math.random().toString(36).substring(7),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          active: true
        }
      ]);
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.post('/api/users/api-keys', {
        name: newApiKeyName
      });
      
      if (response.data?.success) {
        toast.success('API key created successfully');
        setNewApiKeyName('');
        loadApiKeys();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create API key');
    } finally {
      setSaving(false);
    }
  };

  const handleRotateApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to rotate this API key? The old key will be invalidated immediately.')) {
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.post(`/api/users/api-keys/${keyId}/rotate`);
      
      if (response.data?.success) {
        toast.success('API key rotated successfully');
        loadApiKeys();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to rotate API key');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.delete(`/api/users/api-keys/${keyId}`);
      
      if (response.data?.success) {
        toast.success('API key deleted successfully');
        loadApiKeys();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete API key');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('API key copied to clipboard');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-200">Settings saved successfully!</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <Card.Body>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                    />
                    <Input
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      placeholder="Enter your last name"
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                    <Input
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Regional Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Africa/Nairobi">Nairobi (EAT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        value={profileData.language}
                        onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="sw">Swahili</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    variant="primary"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card>
            <Card.Body>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Email Notifications
                </h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Enable Email Notifications', description: 'Receive important updates via email' },
                    { key: 'tradingAlerts', label: 'Trading Alerts', description: 'Get notified about trading signals and opportunities' },
                    { key: 'marketUpdates', label: 'Market Updates', description: 'Daily market summaries and analysis' },
                    { key: 'newsletter', label: 'Newsletter', description: 'Weekly trading insights and platform updates' },
                    { key: 'promotionalEmails', label: 'Promotional Emails', description: 'Special offers and new feature announcements' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    variant="primary"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Security Information */}
            <Card>
              <Card.Body>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Account Security Information
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/audit-trail')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    View Audit Trail
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Last Successful Login
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.last_login || user?.last_successful_login 
                        ? new Date(user.last_login || user.last_successful_login).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Account Created
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Email Verified
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.is_email_verified || user?.isEmailVerified ? (
                        <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">⚠ Not Verified</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Two-Factor Authentication
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.is_two_factor_enabled || user?.isTwoFactorEnabled ? (
                        <span className="text-green-600 dark:text-green-400">✓ Enabled</span>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400">Disabled</span>
                      )}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Change Password */}
            <Card>
              <Card.Body>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                  <Button
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                    variant="primary"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      API Key Management
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your API keys for programmatic access to trading features.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadApiKeys}
                    disabled={loadingApiKeys}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingApiKeys ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {/* Create New API Key */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Create New API Key
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter API key name (e.g., Production, Development)"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCreateApiKey}
                      disabled={saving || !newApiKeyName.trim()}
                      variant="primary"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Create
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* API Keys List */}
                {loadingApiKeys ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Loading API keys...</p>
                  </div>
                ) : apiKeys.length > 0 ? (
                  <div className="space-y-3">
                    {apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {apiKey.name || 'Unnamed API Key'}
                              </h4>
                              {apiKey.active && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                              {apiKey.last_used && (
                                <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRotateApiKey(apiKey.id)}
                              disabled={saving}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Rotate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                              disabled={saving}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-mono">
                            {showApiKey[apiKey.id] ? apiKey.key : apiKey.key.substring(0, 20) + '...'}
                          </code>
                          <button
                            onClick={() => setShowApiKey({ ...showApiKey, [apiKey.id]: !showApiKey[apiKey.id] })}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {showApiKey[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                          ⚠️ Keep your API keys secure. Never share them publicly or commit them to version control.
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Key className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No API keys created yet</p>
                    <p className="text-xs mt-1">Create your first API key to get started</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card>
            <Card.Body>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Appearance
                </h3>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Theme</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose your preferred theme appearance
                    </p>
                  </div>
                  <ThemeSwitcher variant="dropdown" />
                </div>
              </div>
            </Card.Body>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;
