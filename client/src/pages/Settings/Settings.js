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

  useEffect(() => {
    // Load user settings from API
    loadUserSettings();
  }, []);

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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  API Key Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Manage your API keys for programmatic access to trading features.
                </p>
                <Button variant="outline" onClick={() => navigate('/settings?tab=api-keys')}>
                  <Key className="w-4 h-4 mr-2" />
                  Manage API Keys
                </Button>
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
                      Switch between light and dark mode
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
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
