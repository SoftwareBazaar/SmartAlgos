const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const databaseService = require('./databaseService');
const securityService = require('./securityService');

class MT5Service {
  constructor() {
    this.supabase = null;
    try {
      this.supabase = databaseService.getClient();
    } catch (error) {
      this.supabase = null;
    }

    this.fallbackPath = path.join(__dirname, '..', 'logs', 'mt5-connections.json');
  }

  ensureFallbackStore() {
    if (!fs.existsSync(this.fallbackPath)) {
      fs.mkdirSync(path.dirname(this.fallbackPath), { recursive: true });
      fs.writeFileSync(this.fallbackPath, JSON.stringify({}), 'utf-8');
    }
  }

  readFallbackStore() {
    this.ensureFallbackStore();
    const raw = fs.readFileSync(this.fallbackPath, 'utf-8');
    return raw ? JSON.parse(raw) : {};
  }

  writeFallbackStore(store) {
    this.ensureFallbackStore();
    fs.writeFileSync(this.fallbackPath, JSON.stringify(store, null, 2));
  }

  createId() {
    return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  }

  sanitizeConnection(record) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      label: record.label || record.connection_label || `${record.server || 'MT5'}-${record.login}`,
      broker: record.broker || null,
      server: record.server,
      login: record.login,
      accountType: record.account_type || null,
      leverage: record.leverage || null,
      timezone: record.timezone || null,
      isDemo: Boolean(record.is_demo),
      meta: record.metadata || record.meta || {},
      hasPassword: Boolean(record.password_encrypted || record.passwordEncrypted),
      created_at: record.created_at || record.createdAt || null,
      updated_at: record.updated_at || record.updatedAt || null
    };
  }

  async listConnections(userId) {
    if (!userId) {
      return [];
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('mt5_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map((record) => this.sanitizeConnection(record));
    }

    const store = this.readFallbackStore();
    const connections = store[userId] || [];
    return connections.map((record) => this.sanitizeConnection(record));
  }

  async getConnection(userId, connectionId) {
    if (!userId || !connectionId) {
      return null;
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('mt5_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('id', connectionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    }

    const store = this.readFallbackStore();
    const list = store[userId] || [];
    return list.find((record) => record.id === connectionId) || null;
  }

  async upsertConnection(userId, payload) {
    if (!userId) {
      throw new Error('User id is required');
    }

    const now = new Date().toISOString();
    const connectionId = payload.id || this.createId();
    const encryptedPassword = payload.password
      ? securityService.encrypt(payload.password)
      : payload.password_encrypted || null;

    const record = {
      id: connectionId,
      user_id: userId,
      label: payload.label || payload.connection_label || null,
      broker: payload.broker || null,
      server: payload.server,
      login: payload.login,
      account_type: payload.accountType || payload.account_type || null,
      leverage: payload.leverage || null,
      timezone: payload.timezone || null,
      is_demo: payload.isDemo ?? payload.is_demo ?? false,
      metadata: payload.meta || payload.metadata || {},
      password_encrypted: encryptedPassword,
      updated_at: now
    };

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('mt5_connections')
        .upsert({
          ...record,
          created_at: payload.created_at || now
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.sanitizeConnection(data);
    }

    const store = this.readFallbackStore();
    const list = store[userId] || [];
    const index = list.findIndex((item) => item.id === connectionId);

    const fallbackRecord = {
      ...record,
      created_at: index === -1 ? now : (list[index].created_at || now)
    };

    if (index === -1) {
      list.push(fallbackRecord);
    } else {
      list[index] = fallbackRecord;
    }

    store[userId] = list;
    this.writeFallbackStore(store);

    return this.sanitizeConnection(fallbackRecord);
  }

  async deleteConnection(userId, connectionId) {
    if (!userId || !connectionId) {
      return false;
    }

    if (this.supabase) {
      const { error } = await this.supabase
        .from('mt5_connections')
        .delete()
        .eq('user_id', userId)
        .eq('id', connectionId);

      if (error) {
        throw error;
      }

      return true;
    }

    const store = this.readFallbackStore();
    const list = store[userId] || [];
    const nextList = list.filter((record) => record.id !== connectionId);
    store[userId] = nextList;
    this.writeFallbackStore(store);
    return true;
  }

  decryptPassword(record) {
    if (!record || !record.password_encrypted) {
      return null;
    }

    try {
      return securityService.decrypt(record.password_encrypted);
    } catch (error) {
      console.error('Failed to decrypt MT5 password:', error.message);
      return null;
    }
  }

  async generateDeploymentManifest(userId, { eaId, connectionId }) {
    if (!userId || !eaId || !connectionId) {
      throw new Error('EA id and connection id are required');
    }

    const connectionRecord = await this.getConnection(userId, connectionId);

    if (!connectionRecord) {
      throw new Error('MT5 connection not found');
    }

    const ea = await databaseService.getEAById(eaId);

    if (!ea) {
      throw new Error('EA not found');
    }

    const downloadUrl = ea.file_url || ea.download_url || ea.package_url || null;
    const localFallback = ea.file_path || ea.local_path || null;

    const sanitizedConnection = this.sanitizeConnection(connectionRecord);

    const instructions = [
      'Download the EA package to your computer.',
      'Open MetaTrader 5 and navigate to File > Open Data Folder.',
      'Copy the EA file into MQL5/Experts.',
      'Restart MetaTrader 5 and attach the EA to the desired chart.',
      'Configure the EA inputs and enable automated trading.'
    ];

    return {
      connection: sanitizedConnection,
      ea: {
        id: ea.id,
        name: ea.name,
        version: ea.version || '1.0.0',
        downloadUrl,
        localFallback,
        lastUpdated: ea.updated_at || ea.updatedAt || null
      },
      steps: instructions,
      metadata: {
        generatedAt: new Date().toISOString(),
        requiresManualDownload: !downloadUrl,
        notes: downloadUrl
          ? 'Use the secure download URL provided to retrieve the EA package.'
          : 'Contact support to receive the EA package or use the local fallback path.'
      }
    };
  }
}

module.exports = new MT5Service();
