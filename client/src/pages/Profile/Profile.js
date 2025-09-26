import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Shield,
  Activity as ActivityIcon,
  RefreshCw,
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
  CreditCard,
  LogIn,
  AlertCircle,
  Lock,
  Key,
  Fingerprint,
  Clock
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const RISK_OPTIONS = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'aggressive', label: 'Aggressive' }
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' }
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'sw', label: 'Swahili' }
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'KES', label: 'KES' },
  { value: 'NGN', label: 'NGN' },
  { value: 'ZAR', label: 'ZAR' },
  { value: 'GHS', label: 'GHS' }
];

const DEFAULT_NOTIFICATIONS = {
  email: true,
  sms: false,
  push: true,
  desktop: true
};

const NOTIFICATION_LABELS = {
  email: {
    label: 'Email alerts',
    description: 'Receive trade summaries, billing receipts, and important security updates by email.'
  },
  sms: {
    label: 'SMS alerts',
    description: 'Send critical execution alerts straight to your phone.'
  },
  push: {
    label: 'Push notifications',
    description: 'Enable in-app push notifications across mobile and desktop clients.'
  },
  desktop: {
    label: 'Desktop notifications',
    description: 'Show native desktop notifications from the Electron application.'
  }
};

const ACTIVITY_META = {
  login: {
    icon: LogIn,
    label: 'Authentication',
    color: 'text-blue-600 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-900/40'
  },
  security: {
    icon: Shield,
    label: 'Security',
    color: 'text-purple-600 dark:text-purple-300',
    bg: 'bg-purple-100 dark:bg-purple-900/40'
  },
  subscription: {
    icon: CreditCard,
    label: 'Subscription',
    color: 'text-green-600 dark:text-green-300',
    bg: 'bg-green-100 dark:bg-green-900/40'
  }
};
const parsePreferredAssets = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const mapUserToProfile = (user) => ({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  phone: user?.phone || '',
  country: user?.country || '',
  city: user?.city || '',
  timezone: user?.timezone || '',
  tradingExperience: user?.trading_experience || user?.tradingExperience || 'beginner',
  riskTolerance: user?.risk_tolerance || user?.riskTolerance || 'moderate',
  preferredAssets: Array.isArray(user?.preferred_assets)
    ? user.preferred_assets.join(', ')
    : Array.isArray(user?.preferredAssets)
      ? user.preferredAssets.join(', ')
      : ''
});

const mapUserToPreferences = (user, fallbackTheme) => {
  const prefs = user?.preferences || {};
  const notifications = prefs.notifications || {};

  return {
    theme: prefs.theme || fallbackTheme || 'light',
    language: prefs.language || 'en',
    currency: prefs.currency || 'USD',
    notifications: {
      email: notifications.email ?? DEFAULT_NOTIFICATIONS.email,
      sms: notifications.sms ?? DEFAULT_NOTIFICATIONS.sms,
      push: notifications.push ?? DEFAULT_NOTIFICATIONS.push,
      desktop: notifications.desktop ?? DEFAULT_NOTIFICATIONS.desktop
    }
  };
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Not available';
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Not available';
    }

    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch (error) {
    return 'Not available';
  }
};

const formatStatus = (status) => {
  if (!status) {
    return 'Inactive';
  }

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusBadgeClasses = (status) => {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'active':
    case 'trial':
    case 'trialing':
    case 'grace_period':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
    case 'past_due':
    case 'past-due':
    case 'pastdue':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200';
    case 'cancelled':
    case 'canceled':
    case 'paused':
      return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    default:
      return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  }
};

const getActivityMeta = (type) => {
  const normalized = (type || '').toLowerCase();
  const meta = ACTIVITY_META[normalized];

  if (meta) {
    return meta;
  }

  return {
    icon: ActivityIcon,
    label: 'Activity',
    color: 'text-primary-600 dark:text-primary-300',
    bg: 'bg-primary-100 dark:bg-primary-900/40'
  };
};
const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();

  const [profileData, setProfileData] = useState(mapUserToProfile(user));
  const [preferences, setPreferences] = useState(mapUserToPreferences(user, theme));
  const [activity, setActivity] = useState([]);
  const [profileDirty, setProfileDirty] = useState(false);
  const [preferencesDirty, setPreferencesDirty] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loadingProfileData, setLoadingProfileData] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const subscriptionSummary = useMemo(() => {
    const subscription = user?.subscription || {};
    const plan = subscription.type ? subscription.type.replace(/_/g, ' ') : 'Free Member';

    return {
      label: plan.charAt(0).toUpperCase() + plan.slice(1),
      status: subscription.status || 'inactive',
      isActive: Boolean(subscription.isActive),
      endDate: subscription.endDate || null
    };
  }, [user]);

  const riskLabel = useMemo(() => {
    const option = RISK_OPTIONS.find((item) => item.value === profileData.riskTolerance);
    return option ? option.label : 'Moderate';
  }, [profileData.riskTolerance]);

  const experienceLabel = useMemo(() => {
    const option = EXPERIENCE_OPTIONS.find((item) => item.value === profileData.tradingExperience);
    return option ? option.label : 'Beginner';
  }, [profileData.tradingExperience]);

  const preferredAssetsList = useMemo(
    () => parsePreferredAssets(profileData.preferredAssets),
    [profileData.preferredAssets]
  );
  const fetchProfile = useCallback(async (withToast = false) => {
    setLoadingProfileData(true);
    try {
      const response = await apiClient.get('/api/users/profile');
      const payload = response?.data?.data;

      if (payload) {
        setProfileData(mapUserToProfile(payload));
        setPreferences(mapUserToPreferences(payload, theme));
        setProfileDirty(false);
        setPreferencesDirty(false);

        if (withToast) {
          toast.success('Profile refreshed');
        }
      }
    } catch (error) {
      console.error('Failed to load profile', error);
      if (withToast) {
        toast.error(error?.response?.data?.message || 'Failed to refresh profile');
      }
    } finally {
      setLoadingProfileData(false);
    }
  }, [theme]);

  const fetchActivity = useCallback(async () => {
    setLoadingActivity(true);
    try {
      const response = await apiClient.get('/api/users/activity', {
        params: { limit: 6 }
      });

      if (Array.isArray(response?.data?.data)) {
        setActivity(response.data.data);
      } else {
        setActivity([]);
      }
    } catch (error) {
      console.error('Failed to load activity', error);
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, [fetchProfile, fetchActivity]);

  useEffect(() => {
    if (user && !profileDirty) {
      setProfileData(mapUserToProfile(user));
    }

    if (user && !preferencesDirty) {
      setPreferences(mapUserToPreferences(user, theme));
    }
  }, [user, theme, profileDirty, preferencesDirty]);

  const handleProfileInputChange = (field) => (event) => {
    setProfileDirty(true);
    setProfileData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const payload = {
        ...profileData,
        preferredAssets: parsePreferredAssets(profileData.preferredAssets)
      };

      const result = await updateProfile(payload);
      if (result?.success) {
        setProfileDirty(false);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePreferencesChange = (field, value) => {
    setPreferencesDirty(true);
    setPreferences((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationToggle = (channel) => {
    setPreferencesDirty(true);
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [channel]: !prev.notifications[channel]
      }
    }));
  };

  const handlePreferencesSubmit = async (event) => {
    event.preventDefault();
    setSavingPreferences(true);

    try {
      await apiClient.put('/api/users/preferences', {
        theme: preferences.theme,
        language: preferences.language,
        currency: preferences.currency,
        notifications: preferences.notifications
      });

      setTheme(preferences.theme);
      setPreferencesDirty(false);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Failed to update preferences', error);
      toast.error(error?.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSavingPreferences(false);
    }
  };
  const handlePasswordFieldChange = (field) => (event) => {
    const value = event.target.value;
    setPasswordErrors((prev) => ({
      ...prev,
      [field]: undefined,
      form: undefined
    }));
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordErrors({});

    if (!passwordForm.currentPassword) {
      setPasswordErrors({ currentPassword: 'Current password is required' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordErrors({ newPassword: 'New password must be at least 8 characters' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setPasswordSaving(true);
    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result?.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else if (result?.error) {
        setPasswordErrors({ form: result.error });
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleRefreshProfile = async () => {
    await Promise.all([fetchProfile(true), fetchActivity()]);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your personal information, trading preferences, and account security controls.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={handleRefreshProfile}
              loading={loadingProfileData}
            >
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <Card className="h-full">
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/60">
                <User className="h-6 w-6 text-primary-600 dark:text-primary-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user?.firstName || user?.lastName
                    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                    : user?.email || 'Your profile'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClasses(subscriptionSummary.status)}`}
                  >
                    {formatStatus(subscriptionSummary.status)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {subscriptionSummary.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-500" />
                <span>Member since {formatDateTime(user?.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary-500" />
                <span>Last login {formatDateTime(user?.last_login)}</span>
              </div>
              {subscriptionSummary.endDate && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary-500" />
                  <span>Renewal on {formatDateTime(subscriptionSummary.endDate)}</span>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        <Card className="h-full">
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                <Target className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Risk profile
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {riskLabel}
                </p>
                {preferredAssetsList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {preferredAssetsList.map((asset) => (
                      <span
                        key={asset}
                        className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="h-full">
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Trading experience
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{experienceLabel}</p>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Tune recommendations across dashboards, marketplaces, and alerts based on your profile.
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <Card.Header>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Personal information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update the details that appear across portfolio, payments, and support workflows.
                  </p>
                </div>
                {profileDirty && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/60 dark:text-amber-200">
                    Unsaved changes
                  </span>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <form className="space-y-6" onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="First name"
                    value={profileData.firstName}
                    onChange={handleProfileInputChange('firstName')}
                    placeholder="Jane"
                    leftIcon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Last name"
                    value={profileData.lastName}
                    onChange={handleProfileInputChange('lastName')}
                    placeholder="Doe"
                    leftIcon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Email"
                    value={user?.email || ''}
                    disabled
                    leftIcon={<Mail className="h-4 w-4" />}
                    helperText="Email changes are handled by support for security reasons."
                  />
                  <Input
                    label="Phone"
                    value={profileData.phone}
                    onChange={handleProfileInputChange('phone')}
                    placeholder="+1 555 0100 123"
                    leftIcon={<Phone className="h-4 w-4" />}
                    type="tel"
                  />
                  <Input
                    label="Country"
                    value={profileData.country}
                    onChange={handleProfileInputChange('country')}
                    placeholder="Kenya"
                    leftIcon={<Globe className="h-4 w-4" />}
                  />
                  <Input
                    label="City"
                    value={profileData.city}
                    onChange={handleProfileInputChange('city')}
                    placeholder="Nairobi"
                    leftIcon={<MapPin className="h-4 w-4" />}
                  />
                  <Input
                    label="Timezone"
                    value={profileData.timezone}
                    onChange={handleProfileInputChange('timezone')}
                    placeholder="GMT+3"
                    leftIcon={<Clock className="h-4 w-4" />}
                  />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trading experience
                    </label>
                    <select
                      className="input"
                      value={profileData.tradingExperience}
                      onChange={handleProfileInputChange('tradingExperience')}
                    >
                      {EXPERIENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Risk tolerance
                    </label>
                    <select
                      className="input"
                      value={profileData.riskTolerance}
                      onChange={handleProfileInputChange('riskTolerance')}
                    >
                      {RISK_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Preferred assets
                    </label>
                    <textarea
                      className="input h-24 resize-none"
                      value={profileData.preferredAssets}
                      onChange={handleProfileInputChange('preferredAssets')}
                      placeholder="EURUSD, BTCUSDT, NAS100..."
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Use comma separated symbols to personalise analytics and watchlists.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<CheckCircle className="h-4 w-4" />}
                    loading={savingProfile}
                    disabled={!profileDirty && !savingProfile}
                  >
                    Save changes
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Preferences
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Align notifications, localisation, and theming with the way you operate.
                  </p>
                </div>
                {preferencesDirty && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/60 dark:text-amber-200">
                    Unsaved changes
                  </span>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <form className="space-y-6" onSubmit={handlePreferencesSubmit}>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Theme
                  </h4>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {THEME_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                          preferences.theme === option.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-200'
                            : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{option.label}</span>
                        <input
                          type="radio"
                          name="theme"
                          value={option.value}
                          checked={preferences.theme === option.value}
                          onChange={() => handlePreferencesChange('theme', option.value)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Language
                    </label>
                    <select
                      className="input"
                      value={preferences.language}
                      onChange={(event) => handlePreferencesChange('language', event.target.value)}
                    >
                      {LANGUAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Default currency
                    </label>
                    <select
                      className="input"
                      value={preferences.currency}
                      onChange={(event) => handlePreferencesChange('currency', event.target.value)}
                    >
                      {CURRENCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Notification channels
                  </h4>
                  <div className="mt-3 space-y-3">
                    {Object.entries(preferences.notifications).map(([key, enabled]) => {
                      const config = NOTIFICATION_LABELS[key] || { label: key, description: '' };
                      return (
                        <label
                          key={key}
                          className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {config.label}
                            </p>
                            {config.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {config.description}
                              </p>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={enabled}
                            onChange={() => handleNotificationToggle(key)}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<CheckCircle className="h-4 w-4" />}
                    loading={savingPreferences}
                    disabled={!preferencesDirty && !savingPreferences}
                  >
                    Save preferences
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Account security
              </h3>
            </Card.Header>
            <Card.Body className="space-y-4">
              {passwordErrors.form && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800/60 dark:bg-red-900/30 dark:text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>{passwordErrors.form}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                <Input
                  label="Current password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFieldChange('currentPassword')}
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={passwordErrors.currentPassword}
                />
                <Input
                  label="New password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFieldChange('newPassword')}
                  leftIcon={<Key className="h-4 w-4" />}
                  error={passwordErrors.newPassword}
                  helperText="Minimum 8 characters with letters and numbers."
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFieldChange('confirmPassword')}
                  leftIcon={<Key className="h-4 w-4" />}
                  error={passwordErrors.confirmPassword}
                />

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<CheckCircle className="h-4 w-4" />}
                    loading={passwordSaving}
                    disabled={passwordSaving}
                  >
                    Update password
                  </Button>
                </div>
              </form>

              <div className="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                      <Fingerprint className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Two-factor authentication
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.isTwoFactorEnabled
                          ? 'Two-factor authentication is active on your account.'
                          : 'Add an extra verification step when logging in from new devices.'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      user?.isTwoFactorEnabled
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {user?.isTwoFactorEnabled ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Enabled
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        Disabled
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent activity
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={fetchActivity}
                  disabled={loadingActivity}
                >
                  Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loadingActivity ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner />
                </div>
              ) : activity.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No recent activity recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((item) => {
                    const meta = getActivityMeta(item.type);
                    const Icon = meta.icon;
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-3 dark:border-gray-700"
                      >
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                          <Icon className={`h-5 w-5 ${meta.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.description || meta.label}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDateTime(item.timestamp)}
                            </span>
                          </div>
                          {item.metadata && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {Object.entries(item.metadata)
                                .map(([key, value]) => {
                                  if (value && typeof value === 'object') {
                                    try {
                                      return `${key}: ${JSON.stringify(value)}`;
                                    } catch (err) {
                                      return `${key}: [data]`;
                                    }
                                  }
                                  return `${key}: ${value}`;
                                })
                                .join(' | ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
