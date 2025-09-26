const databaseService = require('./databaseService');

const DEFAULT_SUBSCRIPTION = {
  type: 'free',
  status: 'inactive',
  isActive: false,
  startDate: null,
  endDate: null,
  autoRenew: false
};

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'trial', 'grace_period']);

function toISODate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeSubscription(record = {}) {
  if (!record) {
    return { ...DEFAULT_SUBSCRIPTION };
  }

  const status = (record.subscription_status || record.status || '').toLowerCase();

  return {
    type: record.subscription_type || record.type || DEFAULT_SUBSCRIPTION.type,
    status: status || DEFAULT_SUBSCRIPTION.status,
    isActive: ACTIVE_STATUSES.has(status),
    startDate: toISODate(record.subscription_start_date || record.start_date || record.startDate),
    endDate: toISODate(record.subscription_end_date || record.end_date || record.endDate),
    autoRenew: Boolean(record.subscription_auto_renew ?? record.auto_renew ?? DEFAULT_SUBSCRIPTION.autoRenew),
    planId: record.subscription_plan_id || record.plan_id || null,
    currency: record.subscription_currency || record.currency || 'USD'
  };
}

function normalizeUser(rawUser) {
  if (!rawUser) {
    return null;
  }

  const subscription = normalizeSubscription(rawUser);

  return {
    _id: rawUser.id,
    id: rawUser.id,
    userId: rawUser.id,
    email: rawUser.email,
    firstName: rawUser.first_name || rawUser.firstname || rawUser.firstName || '',
    lastName: rawUser.last_name || rawUser.lastname || rawUser.lastName || '',
    phone: rawUser.phone || null,
    country: rawUser.country || null,
    city: rawUser.city || null,
    timezone: rawUser.timezone || null,
    role: rawUser.role || 'user',
    isActive: rawUser.is_active !== false,
    is_active: rawUser.is_active !== false,
    isEmailVerified: Boolean(rawUser.is_email_verified),
    is_email_verified: Boolean(rawUser.is_email_verified),
    isPhoneVerified: Boolean(rawUser.is_phone_verified),
    is_phone_verified: Boolean(rawUser.is_phone_verified),
    isKycVerified: Boolean(rawUser.is_kyc_verified),
    is_kyc_verified: Boolean(rawUser.is_kyc_verified),
    isTwoFactorEnabled: Boolean(rawUser.is_two_factor_enabled),
    subscription,
    subscription_type: rawUser.subscription_type,
    subscription_status: rawUser.subscription_status,
    lock_until: rawUser.lock_until || rawUser.lockUntil || null,
    lockUntil: rawUser.lock_until || rawUser.lockUntil || null,
    trading_experience: rawUser.trading_experience || 'beginner',
    risk_tolerance: rawUser.risk_tolerance || 'moderate',
    preferred_assets: rawUser.preferred_assets || [],
    preferences: rawUser.preferences || {},
    portfolio: rawUser.portfolio || {},
    last_login: toISODate(rawUser.last_login),
    last_activity: toISODate(rawUser.last_activity),
    created_at: toISODate(rawUser.created_at),
    updated_at: toISODate(rawUser.updated_at),
    metadata: rawUser.metadata || {},
    raw: rawUser
  };
}

async function updateLastActivity(userId, context = {}) {
  if (!userId) {
    return;
  }

  const updates = {
    last_activity: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (context.ip) {
    updates.last_activity_ip = context.ip;
  }

  if (context.userAgent) {
    updates.last_activity_agent = context.userAgent;
  }

  try {
    await databaseService.updateUser(userId, updates);
  } catch (error) {
    console.error('Failed to update user activity:', error.message);
  }
}

module.exports = {
  normalizeUser,
  updateLastActivity,
  DEFAULT_SUBSCRIPTION
};
