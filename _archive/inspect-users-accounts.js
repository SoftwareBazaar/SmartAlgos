#!/usr/bin/env node

const path = require('path');
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

(async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = sanitizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const anonKey = sanitizeSupabaseKey(process.env.SUPABASE_ANON_KEY);
  const supabaseKey = serviceRoleKey || anonKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials missing.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('users_accounts')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }

  if (!data || !data.length) {
    console.log('No rows found in users_accounts.');
    process.exit(0);
  }

  const sample = data[0];
  console.log('Column keys:', Object.keys(sample));
})();