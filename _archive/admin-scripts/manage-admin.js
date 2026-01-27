#!/usr/bin/env node

const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const sanitizeSupabaseKey = (value) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  const placeholderHints = ['your-', 'your_', 'change', 'replace', 'example', 'dummy'];
  const looksPlaceholder = trimmed.length < 40 || placeholderHints.some((hint) => lower.includes(hint));

  return looksPlaceholder ? null : trimmed;
};

async function upsertAdmin({ email, password }) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = sanitizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const anonKey = sanitizeSupabaseKey(process.env.SUPABASE_ANON_KEY);
  const supabaseKey = serviceRoleKey || anonKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are missing or look like placeholders.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const passwordHash = await bcrypt.hash(password, 12);

  const now = new Date().toISOString();
  const payload = {
    email,
    password_hash: passwordHash,
    first_name: 'Admin',
    last_name: 'User',
    phone: '+254746054224',
    country: 'Kenya',
    city: 'Nairobi',
    timezone: 'Africa/Nairobi',
    role: 'admin',
    is_active: true,
    is_email_verified: true,
    is_phone_verified: true,
    is_kyc_verified: true,
    trading_experience: 'intermediate',
    preferred_assets: ['forex', 'crypto'],
    risk_tolerance: 'moderate',
    subscription_type: 'free',
    subscription_status: 'active',
    subscription_start_date: now,
    subscription_end_date: null,
    portfolio_total_value: 0,
    portfolio_currency: 'USD',
    portfolio_risk_tolerance: 'moderate',
    portfolio_investment_goals: ['growth'],
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    login_attempts: 0,
    lock_until: null,
    last_login: now,
    last_activity: now,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from('users_accounts')
    .upsert(payload, { onConflict: 'email' })
    .select('id, email, role');

  if (error) {
    throw new Error(error.message);
  }

  return data && data[0];
}

(async () => {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node manage-admin.js <email> <password>');
    process.exit(1);
  }

  try {
    const admin = await upsertAdmin({ email, password });
    console.log('Admin account ready:', admin);
  } catch (error) {
    console.error('Failed to upsert admin:', error.message);
    process.exit(1);
  }
})();