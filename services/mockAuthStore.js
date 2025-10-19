const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const SALT_ROUNDS = 10;

const normalizeEmail = (value = '') => value.trim().toLowerCase();

// Default dev accounts to keep authentication flows working without Supabase
const DEFAULT_ACCOUNTS = [
  {
    first_name: 'Demo',
    last_name: 'User',
    email: 'demo@smartalgos.local',
    password: 'Password123!',
    role: 'user',
    is_active: true,
    is_email_verified: true,
    enforcePassword: true
  },
  {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@smartalgos.com',
    password: 'Test123!@#',
    role: 'user',
    is_active: true,
    is_email_verified: true,
    enforcePassword: true,
    legacyEmails: ['test@smartalgos.local']
  },
  {
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@smartalgos.com',
    password: 'Admin123!@#',
    role: 'admin',
    is_active: true,
    is_email_verified: true,
    enforcePassword: true,
    legacyEmails: ['admin@smartalgos.local']
  },
  {
    first_name: 'Software',
    last_name: 'Bazaar',
    email: 'Softwarebazaar.ke@gmail.com',
    password: '28103441Jw@',
    role: 'admin',
    is_active: true,
    is_email_verified: true,
    enforcePassword: true,
    subscription_type: 'institutional',
    subscription_status: 'active',
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }
];

class MockAuthStore {
  constructor() {
    this.storagePath = path.join(__dirname, '..', 'uploads', 'mock-users.json');
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
    this.users = [];
    this._ensureUploadsDir();
    this._load();
  }

  _ensureUploadsDir() {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
        console.log('[mock-auth] Created uploads directory');
      }
    } catch (error) {
      console.error('[mock-auth] Failed to create uploads directory:', error.message);
    }
  }

  _load() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, 'utf8');
        this.users = raw ? JSON.parse(raw) : [];
        if (this._ensureDefaultAccounts()) {
          this._persist();
        }
      } else {
        this.users = [];
        this._seedDefaults();
      }
    } catch (error) {
      console.warn('[mock-auth] Failed to load mock users, starting fresh:', error.message);
      this.users = [];
      this._seedDefaults();
    }
  }

  _persist() {
    try {
      // Ensure directory exists before writing
      this._ensureUploadsDir();
      fs.writeFileSync(this.storagePath, JSON.stringify(this.users, null, 2));
    } catch (error) {
      console.error('[mock-auth] Failed to persist mock users:', error.message);
    }
  }

  _ensureDefaultAccounts() {
    const now = new Date().toISOString();
    let hasChanges = false;

    for (const account of DEFAULT_ACCOUNTS) {
      const candidateEmails = [account.email, ...(account.legacyEmails || [])].map(normalizeEmail);
      const user = this.users.find((u) => candidateEmails.includes(normalizeEmail(u.email)));

      if (user) {
        let accountChanged = false;

        if (normalizeEmail(user.email) !== normalizeEmail(account.email)) {
          user.email = account.email;
          accountChanged = true;
        }

        if (account.first_name && user.first_name !== account.first_name) {
          user.first_name = account.first_name;
          accountChanged = true;
        }

        if (account.last_name && user.last_name !== account.last_name) {
          user.last_name = account.last_name;
          accountChanged = true;
        }

        if (account.role && user.role !== account.role) {
          user.role = account.role;
          accountChanged = true;
        }

        if (account.is_active !== undefined && user.is_active !== account.is_active) {
          user.is_active = account.is_active;
          accountChanged = true;
        }

        if (account.is_email_verified !== undefined && user.is_email_verified !== account.is_email_verified) {
          user.is_email_verified = account.is_email_verified;
          accountChanged = true;
        }

        const hasPassword = Boolean(user.password_hash);
        let passwordMatches = false;

        if (hasPassword) {
          try {
            passwordMatches = bcrypt.compareSync(account.password, user.password_hash);
          } catch (error) {
            passwordMatches = false;
          }
        }

        if (account.enforcePassword && !passwordMatches) {
          user.password_hash = bcrypt.hashSync(account.password, SALT_ROUNDS);
          accountChanged = true;
        }

        // Update subscription data if provided
        if (account.subscription_type && user.subscription_type !== account.subscription_type) {
          user.subscription_type = account.subscription_type;
          accountChanged = true;
        }

        if (account.subscription_status && user.subscription_status !== account.subscription_status) {
          user.subscription_status = account.subscription_status;
          accountChanged = true;
        }

        if (account.subscription_start_date && user.subscription_start_date !== account.subscription_start_date) {
          user.subscription_start_date = account.subscription_start_date;
          accountChanged = true;
        }

        if (account.subscription_end_date && user.subscription_end_date !== account.subscription_end_date) {
          user.subscription_end_date = account.subscription_end_date;
          accountChanged = true;
        }

        if (accountChanged) {
          user.login_attempts = 0;
          user.updated_at = now;
          if (!user.created_at) {
            user.created_at = now;
          }
          hasChanges = true;
        }

        continue;
      }

      const newUser = {
        id: randomUUID(),
        first_name: account.first_name,
        last_name: account.last_name,
        email: account.email,
        password_hash: bcrypt.hashSync(account.password, SALT_ROUNDS),
        role: account.role,
        is_active: account.is_active !== false,
        is_email_verified: account.is_email_verified !== false,
        login_attempts: 0,
        subscription_type: account.subscription_type || 'free',
        subscription_status: account.subscription_status || 'active',
        subscription_start_date: account.subscription_start_date || now,
        subscription_end_date: account.subscription_end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: now,
        updated_at: now
      };

      this.users.push(newUser);
      hasChanges = true;
    }

    return hasChanges;
  }

  _seedDefaults() {
    if (this._ensureDefaultAccounts()) {
      this._persist();
    }
    
    // Add test EAs with files matching production database IDs and structure
    this.eas = [
      {
        id: 1,
        name: 'Gold Scalper Pro v2.0',
        description: 'Advanced scalping EA for gold trading with high win rate',
        category: 'scalping',
        price_weekly: 6.99,
        price_monthly: 18.00,
        price_quarterly: 45.00,
        price_yearly: 97.00,
        win_rate: 68,
        max_drawdown: 12,
        supported_pairs: ['XAUUSD'],
        timeframes: ['M1', 'M5'],
        is_active: true,
        status: 'approved',
        ea_file_path: 'https://example.com/gold-scalper-pro-v2.ex4',
        set_file_path: 'https://example.com/gold-scalper-pro-v2.set',
        manual_file_path: 'https://example.com/gold-scalper-pro-v2.pdf',
        screenshots: ['https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-screenshots/image-1759871730248-24446785.jpg'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Multi Indicator Scalping Arrows EA v6.0 - Enhanced Profit Maximization',
        description: 'Advanced scalping EA with visual arrow indicator integration',
        category: 'scalping',
        price_weekly: 8.99,
        price_monthly: 25.00,
        price_quarterly: 60.00,
        price_yearly: 120.00,
        win_rate: 75,
        max_drawdown: 5.2,
        supported_pairs: ['EURUSD', 'GBPUSD', 'USDJPY'],
        timeframes: ['M1', 'M5', 'M15'],
        is_active: true,
        status: 'approved',
        ea_file_path: 'https://example.com/multi-indicator-scalping.ex4',
        set_file_path: 'https://example.com/multi-indicator-scalping.set',
        manual_file_path: 'https://example.com/multi-indicator-scalping.pdf',
        screenshots: [
          'https://example.com/multi-indicator-screenshot1.png',
          'https://example.com/multi-indicator-screenshot2.png',
          'https://example.com/multi-indicator-screenshot3.png',
          'https://example.com/multi-indicator-screenshot4.png',
          'https://example.com/multi-indicator-screenshot5.png'
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    this._persist();
  }

  _sanitize(user) {
    if (!user) {
      return null;
    }

    const { password_hash, ...rest } = user;
    return { ...rest };
  }

  async createUser(userData) {
    const now = new Date().toISOString();
    const newUser = {
      id: randomUUID(),
      login_attempts: 0,
      is_active: true,
      is_email_verified: false,
      created_at: now,
      updated_at: now,
      ...userData
    };

    this.users.push(newUser);
    this._persist();
    return this._sanitize(newUser);
  }

  async getUserByEmail(email) {
    const user = this.users.find((u) => normalizeEmail(u.email) === normalizeEmail(email));
    return user ? { ...user } : null;
  }

  async getUserById(id) {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async updateUser(id, updates) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return null;
    }

    const updated = {
      ...this.users[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.users[index] = updated;
    this._persist();
    return this._sanitize(updated);
  }

  async deleteUser(id) {
    const initialLength = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    if (this.users.length !== initialLength) {
      this._persist();
      return true;
    }
    return false;
  }
}

// Mock EA storage for development

const mockDataPath = path.join(__dirname, '..', 'uploads', 'mock-data.json');
let mockEAs = [];
let mockSubscriptions = [];

// Load mock data from file
function loadMockData() {
  try {
    if (fs.existsSync(mockDataPath)) {
      const raw = fs.readFileSync(mockDataPath, 'utf8');
      const data = raw ? JSON.parse(raw) : { eas: [], subscriptions: [] };
      mockEAs = data.eas || [];
      mockSubscriptions = data.subscriptions || [];
    }
  } catch (error) {
    console.warn('[mock-auth] Failed to load mock data, starting fresh:', error.message);
    mockEAs = [];
    mockSubscriptions = [];
  }
}

// Save mock data to file
function saveMockData() {
  try {
    const data = {
      eas: mockEAs,
      subscriptions: mockSubscriptions
    };
    fs.writeFileSync(mockDataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[mock-auth] Failed to save mock data:', error.message);
  }
}

// Load data on startup
loadMockData();

// Add methods to handle EAs and subscriptions
class MockDataStore {
  constructor() {
    this.eas = mockEAs;
    this.subscriptions = mockSubscriptions;
    this.storagePath = path.join(__dirname, '..', 'uploads', 'mock-data.json');
    this._ensureUploadsDir();
  }

  _ensureUploadsDir() {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  _persist() {
    try {
      const data = {
        eas: this.eas,
        subscriptions: this.subscriptions
      };
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[MockDataStore] Failed to persist data:', error.message);
    }
  }

  // EA methods
  async getEAs(filters = {}) {
    let filteredEAs = [...this.eas];
    
    if (filters.category) {
      filteredEAs = filteredEAs.filter(ea => ea.category === filters.category);
    }
    if (filters.status) {
      filteredEAs = filteredEAs.filter(ea => ea.status === filters.status);
    }
    if (filters.is_active !== undefined) {
      filteredEAs = filteredEAs.filter(ea => ea.is_active === filters.is_active);
    }
    
    return filteredEAs;
  }

  async getEAById(id) {
    return this.eas.find(ea => ea.id === id) || null;
  }

  async createEA(eaData) {
    const newEA = {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Ensure file fields are properly set and persist using database column names
      ea_file_path: eaData.ea_file_path || eaData.ea_file || null,
      set_file_path: eaData.set_file_path || eaData.set_file || null,
      manual_file_path: eaData.manual_file_path || eaData.manual_file || null,
      screenshots: eaData.screenshots || [],
      // Ensure EA is active and approved by default
      is_active: true,
      status: 'approved',
      ...eaData
    };
    
    // Add to EAs array
    this.eas.push(newEA);
    
    // Persist to file system
    this._persist();
    
    console.log('[MockAuthStore] Created EA with files:', {
      id: newEA.id,
      name: newEA.name,
      ea_file_path: !!newEA.ea_file_path,
      set_file_path: !!newEA.set_file_path,
      manual_file_path: !!newEA.manual_file_path,
      screenshots: newEA.screenshots?.length || 0,
      is_active: newEA.is_active,
      status: newEA.status
    });
    
    return newEA;
  }

  // Add method to update EA files
  async updateEA(id, updates) {
    const eaIndex = this.eas.findIndex(ea => ea.id === id);
    if (eaIndex !== -1) {
      this.eas[eaIndex] = {
        ...this.eas[eaIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this._persist();
      console.log('[MockAuthStore] Updated EA:', {
        id,
        name: this.eas[eaIndex].name,
        ea_file_path: !!this.eas[eaIndex].ea_file_path,
        set_file_path: !!this.eas[eaIndex].set_file_path,
        manual_file_path: !!this.eas[eaIndex].manual_file_path,
        screenshots: this.eas[eaIndex].screenshots?.length || 0
      });
      return this.eas[eaIndex];
    }
    return null;
  }

  // Subscription methods
  async getSubscriptions(filters = {}) {
    let filteredSubscriptions = [...this.subscriptions];
    
    if (filters.user_id) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.user_id === filters.user_id);
    }
    if (filters.status) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === filters.status);
    }
    if (filters.ea_id) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.ea_id === filters.ea_id);
    }
    
    return filteredSubscriptions;
  }

  async getSubscriptionById(id) {
    return this.subscriptions.find(sub => sub.id === id) || null;
  }

  async createSubscription(subscriptionData) {
    const newSubscription = {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...subscriptionData
    };
    this.subscriptions.push(newSubscription);
    this._persist();
    console.log('[MockAuthStore] Created subscription:', {
      id: newSubscription.id,
      user_id: newSubscription.user_id,
      ea_id: newSubscription.ea_id,
      status: newSubscription.status
    });
    return newSubscription;
  }

  async updateSubscription(id, updates) {
    const index = this.subscriptions.findIndex(sub => sub.id === id);
    if (index === -1) return null;
    
    this.subscriptions[index] = {
      ...this.subscriptions[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveMockData();
    return this.subscriptions[index];
  }
}

const mockDataStore = new MockDataStore();

const mockAuthStoreInstance = new MockAuthStore();

module.exports = mockAuthStoreInstance;
module.exports.mockEAs = mockEAs;
module.exports.mockSubscriptions = mockSubscriptions;
module.exports.mockDataStore = mockDataStore;

