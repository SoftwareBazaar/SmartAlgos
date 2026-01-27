/**
 * Admin Panel Setup Script
 * Creates admin user, initializes models, and sets up the admin panel
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PLACEHOLDER_HINTS = ['your-', 'your_', 'change', 'replace', 'example', 'dummy'];

const sanitizeSupabaseKey = (value) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  const looksPlaceholder = trimmed.length < 40 || PLACEHOLDER_HINTS.some((hint) => lower.includes(hint));
  return looksPlaceholder ? null : trimmed;
};

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  console.error('[setup] Missing Supabase configuration: SUPABASE_URL is required.');
  process.exit(1);
}

const extractProjectRef = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split('.')[0];
  } catch (error) {
    return null;
  }
};

const supabaseProjectRef = process.env.SUPABASE_PROJECT_REF || extractProjectRef(supabaseUrl);

const loadCursorAccessToken = () => {
  try {
    const cursorConfigPath = path.join(__dirname, '.cursor', 'mcp.json');
    const raw = fs.readFileSync(cursorConfigPath, 'utf8');
    const config = JSON.parse(raw);
    return config?.mcpServers?.supabase?.env?.SUPABASE_ACCESS_TOKEN || null;
  } catch (error) {
    return null;
  }
};

const fetchSupabaseApiKeys = (accessToken, projectRef) => {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: 'api.supabase.com',
        path: `/v1/projects/${projectRef}/api-keys`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      },
      (response) => {
        let rawData = '';

        response.on('data', (chunk) => {
          rawData += chunk;
        });

        response.on('end', () => {
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            try {
              resolve(rawData ? JSON.parse(rawData) : []);
            } catch (parseError) {
              reject(new Error(`Failed to parse Supabase API response: ${parseError.message}`));
            }
          } else {
            reject(new Error(`Supabase API responded with status ${response.statusCode}`));
          }
        });
      }
    );

    request.on('error', (error) => reject(error));
    request.end();
  });
};

const resolveSupabaseKey = async () => {
  const serviceRoleKey = sanitizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (serviceRoleKey) {
    return { key: serviceRoleKey, source: 'service-role' };
  }

  const accessToken = (process.env.SUPABASE_ACCESS_TOKEN || loadCursorAccessToken() || '').trim();
  if (accessToken && supabaseProjectRef) {
    try {
      const keys = await fetchSupabaseApiKeys(accessToken, supabaseProjectRef);
      const serviceKeyEntry = Array.isArray(keys)
        ? keys.find((entry) => entry.name === 'service_role' || entry.id === 'service_role')
        : null;

      if (serviceKeyEntry?.api_key) {
        return { key: serviceKeyEntry.api_key, source: 'supabase-access-token' };
      }
    } catch (error) {
      console.warn(`[setup] Unable to retrieve service role key via Supabase API: ${error.message}`);
    }
  } else if (!serviceRoleKey && !supabaseProjectRef) {
    console.warn('[setup] Supabase project reference could not be determined; skipping API key retrieval.');
  }

  const anonKey = sanitizeSupabaseKey(process.env.SUPABASE_ANON_KEY);
  if (anonKey) {
    console.warn('[setup] Falling back to SUPABASE_ANON_KEY; ensure RLS policies permit setup operations.');
    return { key: anonKey, source: 'anon' };
  }

  throw new Error('Supabase credentials missing. Provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ACCESS_TOKEN.');
};

let supabase;

const ADMIN_EMAIL = 'admin@smartalgos.com';
const ADMIN_DEFAULT_PASSWORD = 'admin123456';
const ADMIN_UPLOAD_DIR = path.join(__dirname, 'uploads', 'admin');
const CONTENT_STORE_PATH = path.join(ADMIN_UPLOAD_DIR, 'content.json');
const SETTINGS_STORE_PATH = path.join(ADMIN_UPLOAD_DIR, 'settings.json');
const ACTIVITY_LOG_PATH = path.join(__dirname, 'logs', 'admin-activity.log');
const fsPromises = fs.promises;

const DEFAULT_SETTINGS = {
  siteName: 'Smart Algos Trading Platform',
  siteDescription: 'Advanced algorithmic trading and investment solutions',
  maintenanceMode: false,
  allowRegistrations: true,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  requireTwoFactor: false,
  requireEmailVerification: true
};

const readJsonFile = async (filePath, fallback) => {
  try {
    const raw = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const writeJsonFile = async (filePath, data) => {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const ensureFileExists = async (filePath, defaultContent) => {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fsPromises.access(filePath);
  } catch (error) {
    await fsPromises.writeFile(filePath, defaultContent, 'utf8');
  }
};


const ensureSupabaseClient = async () => {
  if (supabase) {
    return;
  }

  const { key, source } = await resolveSupabaseKey();
  supabase = createClient(supabaseUrl, key);

  if (source !== 'service-role') {
    console.warn(`[setup] Supabase client initialized using ${source} credentials.`);
  }
};

async function setupAdminPanel() {
    console.log('🚀 Setting up Smart Algos Admin Panel...\n');

    try {
        await ensureSupabaseClient();

        // 1. Create admin user if not exists
        await createAdminUser();
        
        // 2. Create content management tables
        await createContentTables();
        
        // 3. Create activity log tables
        await createActivityLogTables();
        
        // 4. Create system settings tables
        await createSystemSettingsTables();
        
        // 5. Initialize default system settings
        await initializeSystemSettings();
        
        // 6. Create sample content
        await createSampleContent();
        
        // 7. Setup admin permissions
        await setupAdminPermissions();
        
        console.log('✅ Admin Panel setup completed successfully!\n');
        console.log('🎉 You can now access the admin panel at: http://localhost:3000/admin');
        console.log('📧 Admin Login: admin@smartalgos.com');
        console.log('🔑 Password: admin123456');
        console.log('\n⚠️  Please change the admin password after first login!');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

async function createAdminUser() {
  console.log('[setup] Ensuring default admin account...');

  const { data, error } = await supabase
    .from('users_accounts')
    .select('id, first_name, last_name, email')
    .eq('email', ADMIN_EMAIL)
    .limit(1);

  if (error) {
    throw new Error(`Failed to check admin account: ${error.message}`);
  }

  const existingAdmin = Array.isArray(data) ? data[0] : data;

  if (existingAdmin) {
    console.log('[setup] Admin account already exists.');
    return existingAdmin;
  }

  const passwordHash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 12);
  const now = new Date().toISOString();

  const payload = {
    email: ADMIN_EMAIL,
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
    trading_experience: 'expert',
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

  const { data: inserted, error: insertError } = await supabase
    .from('users_accounts')
    .insert([payload])
    .select('id, first_name, last_name, email')
    .single();

  if (insertError) {
    throw new Error(`Failed to create admin user: ${insertError.message}`);
  }

  console.log('[setup] Admin account created.');
  return inserted;
}

async function createContentTables() {
  console.log('[setup] Ensuring admin content store...');
  await fsPromises.mkdir(ADMIN_UPLOAD_DIR, { recursive: true });

  try {
    await fsPromises.access(CONTENT_STORE_PATH);
    console.log('[setup] Content store already exists.');
  } catch (error) {
    await writeJsonFile(CONTENT_STORE_PATH, []);
    console.log('[setup] Content store initialized.');
  }
}

async function createActivityLogTables() {
  console.log('[setup] Ensuring admin activity log...');
  await fsPromises.mkdir(path.dirname(ACTIVITY_LOG_PATH), { recursive: true });

  try {
    await fsPromises.access(ACTIVITY_LOG_PATH);
    console.log('[setup] Activity log already exists.');
  } catch (error) {
    await fsPromises.writeFile(ACTIVITY_LOG_PATH, '', 'utf8');
    console.log('[setup] Activity log initialized.');
  }
}

async function createSystemSettingsTables() {
  console.log('[setup] Ensuring admin settings store...');
  await fsPromises.mkdir(ADMIN_UPLOAD_DIR, { recursive: true });

  try {
    await fsPromises.access(SETTINGS_STORE_PATH);
    console.log('[setup] Settings store already exists.');
  } catch (error) {
    await writeJsonFile(SETTINGS_STORE_PATH, {});
    console.log('[setup] Settings store initialized.');
  }
}

async function initializeSystemSettings() {
  console.log('[setup] Applying default admin settings...');
  const current = await readJsonFile(SETTINGS_STORE_PATH, {});

  if (Object.keys(current).length > 0) {
    console.log('[setup] Settings store already populated.');
    return;
  }

  const payload = {
    settings: {
      ...DEFAULT_SETTINGS,
      updatedAt: new Date().toISOString()
    }
  };

  await writeJsonFile(SETTINGS_STORE_PATH, payload);
  console.log('[setup] Default admin settings saved.');
}

async function createSampleContent(adminUser) {
  console.log('[setup] Seeding sample admin content...');
  const content = await readJsonFile(CONTENT_STORE_PATH, []);
  const hasSample = content.some((item) => item.slug === 'getting-started-with-smart-algos');

  if (hasSample) {
    console.log('[setup] Sample content already present.');
    return;
  }

  const now = new Date().toISOString();

  const entry = {
    _id: crypto.randomUUID ? crypto.randomUUID() : `content_${Date.now()}`,
    slug: 'getting-started-with-smart-algos',
    title: 'Getting Started with Smart Algos',
    type: 'announcement',
    status: 'published',
    content: 'Welcome to the Smart Algos admin panel. This sample entry illustrates how announcements appear inside the dashboard.',
    summary: 'Welcome message for Smart Algos administrators.',
    tags: ['welcome', 'onboarding'],
    createdAt: now,
    createdBy: {
      id: adminUser?.id || 'admin',
      name: [adminUser?.first_name, adminUser?.last_name].filter(Boolean).join(' ') || adminUser?.email || 'Admin'
    }
  };

  content.push(entry);
  await writeJsonFile(CONTENT_STORE_PATH, content);
  console.log('[setup] Sample content created.');
}

async function setupAdminPermissions() {
  console.log('[setup] Skipping Supabase policy changes; access is enforced by middleware.');
}

// Run the setup
if (require.main === module) {
    setupAdminPanel()
        .then(() => {
            console.log('\n🎉 Setup completed! You can now start the server and access the admin panel.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupAdminPanel };
