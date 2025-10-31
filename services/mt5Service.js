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
    
    // Default demo account for portfolio integration
    this.defaultDemoAccount = {
      login: '5040707296',
      password: 'CeD!5uIm',
      server: 'MetaQuotes-Demo',
      label: 'Default Demo Account'
    };
  }

  ensureFallbackStore() {
    if (!fs.existsSync(this.fallbackPath)) {
      fs.mkdirSync(path.dirname(this.fallbackPath), { recursive: true });
      fs.writeFileSync(this.fallbackPath, JSON.stringify({}), 'utf-8');
    }
  }

  readFallbackStore() {
    this.ensureFallbackStore();
    try {
      const raw = fs.readFileSync(this.fallbackPath, 'utf-8');
      const parsed = raw ? JSON.parse(raw) : {};
      console.log('[MT5 Service] Read fallback store, keys:', Object.keys(parsed));
      return parsed;
    } catch (error) {
      console.error('[MT5 Service] Error reading fallback store:', error.message);
      return {};
    }
  }

  writeFallbackStore(store) {
    try {
      this.ensureFallbackStore();
      fs.writeFileSync(this.fallbackPath, JSON.stringify(store, null, 2), 'utf-8');
      console.log('[MT5 Service] ✅ Fallback store written, keys:', Object.keys(store));
    } catch (error) {
      console.error('[MT5 Service] Error writing fallback store:', error.message);
      throw error;
    }
  }

  createId() {
    return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  }

  sanitizeConnection(record, includePassword = false) {
    if (!record) {
      return null;
    }

    const sanitized = {
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
      hasPassword: Boolean(record.password_encrypted || record.passwordEncrypted || record.password),
      created_at: record.created_at || record.createdAt || null,
      updated_at: record.updated_at || record.updatedAt || null
    };
    
    // Only include password fields if explicitly requested (for internal use)
    if (includePassword) {
      if (record.password_encrypted) {
        sanitized.password_encrypted = record.password_encrypted;
      }
      if (record.password) {
        sanitized.password = record.password;
      }
    }
    
    return sanitized;
  }

  async listConnections(userId) {
    if (!userId) {
      return [];
    }

    if (this.supabase) {
      try {
        // Normalize userId to string for consistent querying
        const userIdKey = String(userId);
        console.log('[MT5 Service] Querying Supabase for user_id:', userIdKey, '(type:', typeof userIdKey, ')');
        
        const { data, error } = await this.supabase
          .from('mt5_connections')
          .select('*')
          .eq('user_id', userIdKey)
          .order('created_at', { ascending: false });

        if (error) {
          // If table doesn't exist or query fails, fall back to local storage
          if (error.code === 'PGRST205' || error.message?.includes('table') || error.message?.includes('not found')) {
            console.warn('[MT5 Service] Table query failed, using fallback storage:', error.message);
            // Continue to fallback below
          } else {
            throw error;
          }
        } else {
          // Success - return Supabase data
          console.log('[MT5 Service] Found', data?.length || 0, 'connections in Supabase for user:', userId);
          if (data && data.length > 0) {
            console.log('[MT5 Service] Connection IDs:', data.map(r => ({ id: r.id, login: r.login, server: r.server })));
          }
          return (data || []).map((record) => this.sanitizeConnection(record, false));
        }
      } catch (supabaseError) {
        console.warn('[MT5 Service] Supabase query error, using fallback:', supabaseError.message);
        // Continue to fallback below
      }
    }

    // Fallback to local storage
    console.log('[MT5 Service] Using fallback storage to list connections for user:', userId, '(type:', typeof userId, ')');
    const store = this.readFallbackStore();
    
    // Normalize userId to string for consistent storage/retrieval
    const userIdKey = String(userId);
    console.log('[MT5 Service] Looking for key:', userIdKey);
    console.log('[MT5 Service] Available keys in store:', Object.keys(store));
    
    const connections = store[userIdKey] || [];
    console.log('[MT5 Service] Found', connections.length, 'connections in fallback storage');
    
    if (connections.length === 0) {
      // Try alternative key formats
      const altKeys = Object.keys(store).filter(key => 
        key.includes(String(userId)) || String(userId).includes(key)
      );
      if (altKeys.length > 0) {
        console.log('[MT5 Service] Trying alternative keys:', altKeys);
        for (const altKey of altKeys) {
          const altConnections = store[altKey] || [];
          if (altConnections.length > 0) {
            console.log('[MT5 Service] Found connections under alternative key:', altKey);
            return altConnections.map((record) => this.sanitizeConnection(record));
          }
        }
      }
    }
    
    return connections.map((record) => this.sanitizeConnection(record, false));
  }

  async getConnection(userId, connectionId, includePassword = false) {
    if (!userId || !connectionId) {
      console.log('[MT5 Service] getConnection: Missing userId or connectionId', { userId, connectionId });
      return null;
    }

    const userIdKey = String(userId);
    console.log('[MT5 Service] getConnection for user:', userIdKey, 'connection:', connectionId);

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('mt5_connections')
          .select('*')
          .eq('user_id', userIdKey)
          .eq('id', connectionId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('[MT5 Service] Connection not found in Supabase:', connectionId);
            return null;
          }
          console.error('[MT5 Service] Supabase error getting connection:', error);
          throw error;
        }

        console.log('[MT5 Service] Found connection in Supabase:', data?.id);
        return includePassword ? data : this.sanitizeConnection(data, includePassword);
      } catch (supabaseError) {
        console.warn('[MT5 Service] Supabase getConnection failed, trying fallback:', supabaseError.message);
        // Continue to fallback
      }
    }

    // Fallback to local storage
    const store = this.readFallbackStore();
    const list = store[userIdKey] || [];
    const record = list.find((r) => r.id === connectionId);
    
    if (record) {
      console.log('[MT5 Service] Found connection in fallback storage');
    } else {
      console.log('[MT5 Service] Connection not found in fallback storage');
    }
    
    return record ? (includePassword ? record : this.sanitizeConnection(record, includePassword)) : null;
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

    // Ensure login is a string (Supabase might expect string)
    const loginValue = payload.login ? String(payload.login).trim() : null;
    
    if (!loginValue) {
      throw new Error('Login is required');
    }

    // Ensure server is a string
    const serverValue = payload.server ? String(payload.server).trim() : null;
    
    if (!serverValue) {
      throw new Error('Server is required');
    }

    // Prepare metadata - ensure it's a valid object
    let metadata = {};
    if (payload.meta && typeof payload.meta === 'object') {
      metadata = payload.meta;
    } else if (payload.metadata && typeof payload.metadata === 'object') {
      metadata = payload.metadata;
    }

    // Normalize userId to string for consistent storage
    const userIdKey = String(userId);
    
    const record = {
      id: connectionId,
      user_id: userIdKey,
      label: payload.label || payload.connection_label || null,
      broker: payload.broker || null,
      server: serverValue,
      login: loginValue,
      account_type: payload.accountType || payload.account_type || null,
      leverage: payload.leverage ? String(payload.leverage) : null,
      timezone: payload.timezone ? String(payload.timezone) : null,
      is_demo: payload.isDemo ?? payload.is_demo ?? false,
      metadata: metadata,
      password_encrypted: encryptedPassword,
      updated_at: now
    };

    if (this.supabase) {
      try {
        const upsertData = {
          ...record,
          created_at: payload.created_at || now
        };

          console.log('[MT5 Service] Upserting connection to Supabase:', {
            id: upsertData.id,
            user_id: upsertData.user_id,
            user_id_type: typeof upsertData.user_id,
            server: upsertData.server,
            login: upsertData.login,
            has_password: !!upsertData.password_encrypted
          });

        const { data, error } = await this.supabase
          .from('mt5_connections')
          .upsert(upsertData, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (error) {
          // Check if it's a table not found error - try to create table automatically
          if (error.code === 'PGRST205' || error.message?.includes('table') || error.message?.includes('not found')) {
            console.warn('[MT5 Service] Table mt5_connections does not exist. Attempting to create...');
            
            // Try to create table using a workaround
            try {
              await this.createTableIfNotExists();
              
              // Retry the upsert after creating table
              const { data: retryData, error: retryError } = await this.supabase
                .from('mt5_connections')
                .upsert(upsertData, {
                  onConflict: 'id',
                  ignoreDuplicates: false
                })
                .select()
                .single();

          if (!retryError && retryData) {
            console.log('[MT5 Service] ✅ Table created and connection saved!', {
              id: retryData.id,
              user_id: retryData.user_id,
              login: retryData.login
            });
            return this.sanitizeConnection(retryData);
          }
            } catch (createError) {
              console.warn('[MT5 Service] Could not create table automatically:', createError.message);
              console.warn('[MT5 Service] Using fallback storage. Run database/mt5_connections_table.sql in Supabase SQL Editor.');
            }
          }
          
          console.error('[MT5 Service] Supabase error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        console.log('[MT5 Service] ✅ Connection saved to Supabase:', {
          id: data.id,
          user_id: data.user_id,
          login: data.login,
          server: data.server
        });
        return this.sanitizeConnection(data);
      } catch (supabaseError) {
        // If Supabase fails (table doesn't exist, etc), fall back to local storage
        console.warn('[MT5 Service] Supabase upsert failed, using fallback storage:', supabaseError.message);
        console.warn('[MT5 Service] Error code:', supabaseError.code);
        
        // Continue to fallback storage below
      }
    }

    // Fallback to local storage
    console.log('[MT5 Service] Using fallback storage for user:', userId, '(type:', typeof userId, ')');
    const store = this.readFallbackStore();
    
    // Normalize userId to string for consistent storage/retrieval
    const userIdKey = String(userId);
    const list = store[userIdKey] || [];
    
    console.log('[MT5 Service] Current connections for user:', list.length);
    const index = list.findIndex((item) => item.id === connectionId);

    const fallbackRecord = {
      ...record,
      created_at: index === -1 ? now : (list[index].created_at || now)
    };

    if (index === -1) {
      list.push(fallbackRecord);
      console.log('[MT5 Service] Adding new connection:', connectionId);
    } else {
      list[index] = fallbackRecord;
      console.log('[MT5 Service] Updating existing connection:', connectionId);
    }

    store[userIdKey] = list;
    this.writeFallbackStore(store);
    
    console.log('[MT5 Service] ✅ Saved to fallback storage. Total connections for user:', list.length);
    console.log('[MT5 Service] Store now has keys:', Object.keys(store));
    console.log('[MT5 Service] Saved connection details:', {
      id: fallbackRecord.id,
      user_id: userIdKey,
      login: fallbackRecord.login,
      server: fallbackRecord.server
    });

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

  /**
   * Get default demo account connection
   * @returns {Object} Demo account credentials
   */
  getDefaultDemoAccount() {
    return { ...this.defaultDemoAccount };
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
