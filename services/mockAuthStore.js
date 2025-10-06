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
let mockEAs = [];

const mockAuthStoreInstance = new MockAuthStore();

module.exports = mockAuthStoreInstance;
module.exports.mockEAs = mockEAs;

