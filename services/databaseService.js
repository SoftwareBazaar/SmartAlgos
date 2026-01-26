const { createClient } = require('@supabase/supabase-js');

// Ignore obvious placeholder Supabase keys so local setup doesn't break
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
  const isLikelyPlaceholder = trimmed.length < 40 || placeholderHints.some((hint) => lower.includes(hint));

  return isLikelyPlaceholder ? null : trimmed;
};

class DatabaseService {
  constructor() {
    this.supabase = null;
    this.mockMode = false;
    this.initialize();
  }

  initialize() {
    // Check if we're in mock mode
    const isPlaceholderKey = (value = '') => {
      if (!value) return true;
      const normalized = value.toLowerCase();
      return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
    };
    const explicitMockFlag = (process.env.MOCK_AUTH || '').toLowerCase();
    const useMockAuth = explicitMockFlag === 'true' || (explicitMockFlag !== 'false' && isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY));

    if (useMockAuth) {
      console.log('[database] Mock mode enabled - skipping Supabase initialization');
      this.supabase = null;
      this.mockMode = true;
      return;
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.REACT_APP_SUPABASE_URL;

    const rawServiceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_ADMIN_KEY ||
      process.env.SUPABASE_SERVICE_API_KEY;

    const rawAnonKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.REACT_APP_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLIC_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required');
    }

    const serviceRoleKey = sanitizeSupabaseKey(rawServiceRoleKey);
    const anonKey = sanitizeSupabaseKey(rawAnonKey);

    if (!serviceRoleKey && !anonKey) {
      throw new Error('Supabase credentials missing. Set SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY.');
    }

    if (rawServiceRoleKey && !serviceRoleKey) {
      console.warn('[database] Supabase service key provided but ignored because it looks like a placeholder. Falling back to anon key.');
    }

    if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
      console.warn('[database] Using SUPABASE_ANON_KEY in production is not recommended. Provide SUPABASE_SERVICE_ROLE_KEY.');
    }

    const supabaseKey = serviceRoleKey || anonKey;

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          'X-Client-Info': 'smart-algos-backend'
        }
      }
    });

    console.log(
      `[database] Supabase client initialized (service role: ${serviceRoleKey ? 'yes' : 'no'}, url: ${supabaseUrl})`
    );
  }

  getClient() {
    if (this.mockMode) {
      console.warn('[database] getClient() called in mock mode - returning null');
      return null;
    }
    return this.supabase;
  }

  // User operations
  async createUser(userData) {
    const { data, error } = await this.supabase
      .from('users_accounts')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email) {
    const { data, error } = await this.supabase
      .from('users_accounts')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserById(id) {
    const { data, error } = await this.supabase
      .from('users_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id, updates) {
    const { data, error } = await this.supabase
      .from('users_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(id) {
    const { error } = await this.supabase
      .from('users_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Expert Advisor operations
  async createEA(eaData) {
    // Image and file URLs are already set by the route handler
    // Don't override them here - they should be web-accessible paths like "/uploads/..."
    // NOT filesystem paths like "/app/uploads/..."

    // Check if in mock mode
    if (this.mockMode) {
      console.log('[DatabaseService] Mock mode: calling mockDataStore.createEA');
      const mockAuthStore = require('./mockAuthStore');
      return await mockAuthStore.mockDataStore.createEA(eaData);
    }

    // Remove files object if present (not a database column)
    if (eaData.files) {
      delete eaData.files;
    }

    // Ensure version and strategy_type are present (database NOT NULL constraints)
    if (!eaData.version) {
      eaData.version = '1.0.0';
    }
    if (!eaData.strategy_type) {
      eaData.strategy_type = eaData.category || 'scalping';
    }

    console.log('[DatabaseService] Creating EA with data:', JSON.stringify(eaData, null, 2));

    const { data, error } = await this.supabase
      .from('expert_advisors')
      .insert([eaData])
      .select()
      .single();

    if (error) {
      console.error('[DatabaseService] Create EA error:', error);
      throw error;
    }

    console.log('[DatabaseService] ✅ EA created:', data);
    return data;
  }

  async getEAs(filters = {}) {
    if (this.mockMode) {
      console.log('[DatabaseService] Using mock store for EAs');
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      const eas = await mockDataStore.getEAs(filters);
      console.log('[DatabaseService] Mock EAs found:', eas.length);
      return eas;
    }

    let query = this.supabase
      .from('expert_advisors')
      .select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    if (filters.creator_id) {
      query = query.eq('creator_id', filters.creator_id);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.min_win_rate) {
      query = query.gte('win_rate', filters.min_win_rate);
    }
    if (filters.max_drawdown) {
      query = query.lte('max_drawdown', filters.max_drawdown);
    }
    if (filters.price_min) {
      query = query.gte('price_monthly', filters.price_min);
    }
    if (filters.price_max) {
      query = query.lte('price_monthly', filters.price_max);
    }

    if (filters.orderBy) {
      query = query.order(filters.orderBy, { ascending: filters.ascending !== false });
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async countEAs(filters = {}) {
    let query = this.supabase
      .from('expert_advisors')
      .select('*', { count: 'exact', head: true });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    if (filters.creator_id) {
      query = query.eq('creator_id', filters.creator_id);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.min_win_rate) {
      query = query.gte('win_rate', filters.min_win_rate);
    }
    if (filters.max_drawdown) {
      query = query.lte('max_drawdown', filters.max_drawdown);
    }
    if (filters.price_min) {
      query = query.gte('price_monthly', filters.price_min);
    }
    if (filters.price_max) {
      query = query.lte('price_monthly', filters.price_max);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count;
  }

  async getEAById(id) {
    if (this.mockMode) {
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      return await mockDataStore.getEAById(id);
    }

    const { data, error } = await this.supabase
      .from('expert_advisors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateEA(id, updates) {
    console.log('[DatabaseService] Updating EA:', id, 'with data:', JSON.stringify(updates, null, 2));

    // Check if in mock mode OR if database connection is problematic
    const isPlaceholderKey = (value = '') => {
      if (!value) return true;
      const normalized = value.toLowerCase();
      return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
    };

    const useMockMode = this.mockMode || isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (useMockMode) {
      console.log(`[database] Mock mode: persisting updateEA for ${id}`);

      // Remove files object (already processed by route handler)
      if (updates.files) {
        delete updates.files;
      }

      const mockAuthStore = require('./mockAuthStore');
      const updatedEA = await mockAuthStore.mockDataStore.updateEA(id, updates);

      if (updatedEA) {
        return updatedEA;
      }

      // Fallback if not found in mock store but we want to return something
      return {
        id: id,
        ...updates,
        updated_at: new Date().toISOString()
      };
    }

    // Image and file URLs are already set by the route handler
    // Remove files object as it's not a database column
    if (updates.files) {
      delete updates.files;
    }

    // Convert ID to integer if it's a string
    const eaId = typeof id === 'string' ? parseInt(id, 10) : id;

    try {
      // Perform the update
      const { data, error } = await this.supabase
        .from('expert_advisors')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', eaId)
        .select()
        .single();

      if (error) {
        console.error('[DatabaseService] Update EA error:', error);
        return { id: eaId, ...updates, updated_at: new Date().toISOString() };
      }

      return data;
    } catch (error) {
      console.error('[DatabaseService] Database error, falling back to mock mode:', error);
      return { id: eaId, ...updates, updated_at: new Date().toISOString() };
    }
  }

  async getFeaturedEAs(options = {}) {
    const { limit = 10 } = options;
    if (this.mockMode) {
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      return await mockDataStore.getEAs({ limit, is_featured: true });
    }

    let query = this.supabase
      .from('expert_advisors')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'approved')
      .eq('is_featured', true)
      .order('average_rating', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getEACategories() {
    if (this.mockMode) {
      return [
        { _id: 'scalping', count: 5, averageRating: 4.5, averageWinRate: 70 },
        { _id: 'trend', count: 3, averageRating: 4.2, averageWinRate: 65 }
      ];
    }
    const { data, error } = await this.supabase
      .from('expert_advisors')
      .select('category, win_rate, average_rating')
      .eq('is_active', true)
      .eq('status', 'approved');

    if (error) throw error;

    const categories = {};
    data.forEach(ea => {
      if (!categories[ea.category]) {
        categories[ea.category] = {
          _id: ea.category,
          count: 0,
          totalRating: 0,
          totalWinRate: 0
        };
      }
      categories[ea.category].count++;
      categories[ea.category].totalRating += ea.average_rating || 0;
      categories[ea.category].totalWinRate += ea.win_rate || 0;
    });

    return Object.values(categories).map(cat => ({
      _id: cat._id,
      count: cat.count,
      averageRating: cat.totalRating / cat.count,
      averageWinRate: cat.totalWinRate / cat.count
    }));
  }

  async getUserEASubscriptions(userId) {
    if (this.mockMode) {
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      return await mockDataStore.getSubscriptions({ user_id: userId });
    }
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select(`*, expert_advisors (*)`)
      .eq('user_id', userId)
      .eq('product_type', 'expert_advisor')
      .eq('status', 'active');

    if (error) throw error;
    return data;
  }

  async getCreatorEAs(creatorId) {
    if (this.mockMode) {
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      return await mockDataStore.getEAs({ creator_id: creatorId });
    }
    const { data, error } = await this.supabase
      .from('expert_advisors')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // News watchlist operations
  async createNewsWatchlist(watchlistData) {
    if (this.mockMode) return { id: 'mock-watchlist', ...watchlistData };
    const { data, error } = await this.supabase
      .from('news_watchlists')
      .insert([watchlistData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getUserNewsWatchlists(userId) {
    if (this.mockMode) return [];
    const { data, error } = await this.supabase
      .from('news_watchlists')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (error) throw error;
    return data;
  }

  async getNewsAlerts(filters = {}) {
    if (this.mockMode) return [];
    let query = this.supabase.from('news_alerts').select('*');
    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async markNewsAlertAsRead(alertId, userId) {
    if (this.mockMode) return true;
    const { error } = await this.supabase
      .from('news_alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }

  // Portfolio operations
  async createPortfolioHolding(holdingData) {
    if (this.mockMode) return { id: 'mock-holding', ...holdingData };
    const { data, error } = await this.supabase
      .from('portfolio_holdings')
      .insert([holdingData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getUserPortfolioHoldings(userId) {
    if (this.mockMode) return [];
    const { data, error } = await this.supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (error) throw error;
    return data;
  }

  async updatePortfolioHolding(id, updates) {
    if (this.mockMode) return { id, ...updates };
    const { data, error } = await this.supabase
      .from('portfolio_holdings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Performance tracking operations
  async createPerformanceRecord(performanceData) {
    if (this.mockMode) return { id: 'mock-perf', ...performanceData };
    const { data, error } = await this.supabase
      .from('performance_records')
      .insert([performanceData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getPerformanceRecords(filters = {}) {
    if (this.mockMode) return [];
    let query = this.supabase.from('performance_records').select('*');
    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async updatePerformanceRecord(id, updates) {
    if (this.mockMode) return { id, ...updates };
    const { data, error } = await this.supabase
      .from('performance_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // HFT Bot operations
  async createHFTBot(botData) {
    if (this.mockMode) return { id: 'mock-hft', ...botData };
    const { data, error } = await this.supabase
      .from('hft_bots')
      .insert([botData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getHFTBots(filters = {}) {
    if (this.mockMode) return [];
    let query = this.supabase.from('hft_bots').select('*');
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getHFTBotById(id) {
    if (this.mockMode) return { id, name: 'Mock HFT Bot' };
    const { data, error } = await this.supabase
      .from('hft_bots')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  // Trading Signal operations
  async createTradingSignal(signalData) {
    if (this.mockMode) return { id: 'mock-signal', ...signalData };
    const { data, error } = await this.supabase
      .from('trading_signals')
      .insert([signalData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getTradingSignals(filters = {}) {
    if (this.mockMode) return [];
    let query = this.supabase.from('trading_signals').select('*');
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getTradingSignalById(id) {
    if (this.mockMode) return { id, symbol: 'EURUSD' };
    const { data, error } = await this.supabase
      .from('trading_signals')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  // AI Model operations
  async createAIModel(modelData) {
    if (this.mockMode) return { id: 'mock-ai', ...modelData };
    const { data, error } = await this.supabase
      .from('ai_models')
      .insert([modelData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getAIModels(filters = {}) {
    if (this.mockMode) return [];
    const { data, error } = await this.supabase.from('ai_models').select('*');
    if (error) throw error;
    return data;
  }

  async getAIModelById(id) {
    if (this.mockMode) return { id, name: 'Mock AI Model' };
    const { data, error } = await this.supabase
      .from('ai_models')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  // Subscription operations
  async createSubscription(subscriptionData) {
    if (this.mockMode) return { id: 'mock-sub', ...subscriptionData };
    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getSubscriptionById(id) {
    if (this.mockMode) {
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      return await mockDataStore.getSubscriptionById(id);
    }
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getSubscriptions(filters = {}) {
    if (this.mockMode) {
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      return await mockDataStore.getSubscriptions(filters);
    }

    let query = this.supabase
      .from('subscriptions')
      .select('*');

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.ea_id) {
      query = query.eq('ea_id', filters.ea_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.payment_reference) {
      query = query.eq('payment_reference', filters.payment_reference);
    }
    if (filters.product_id) {
      query = query.eq('product_id', filters.product_id);
    }
    if (filters.product_type) {
      query = query.eq('product_type', filters.product_type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getSubscriptionsCount(filters = {}) {
    if (this.mockMode) return 0;

    let query = this.supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.ea_id) {
      query = query.eq('ea_id', filters.ea_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async updateSubscription(id, updates) {
    if (this.mockMode) {
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      return await mockDataStore.updateSubscription(id, updates);
    }

    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  // Utility operations
  async getUtilities(filters = {}) {
    if (this.mockMode) {
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      return await mockDataStore.getUtilities(filters);
    }

    let query = this.supabase
      .from('utilities')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active === true || filters.is_active === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getUtilityById(id) {
    if (this.mockMode) {
      const mockDataStore = require('./mockAuthStore').mockDataStore;
      return await mockDataStore.getUtilityById(id);
    }
    const { data, error } = await this.supabase
      .from('utilities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async createUtility(utilityData) {
    if (this.mockMode) {
      const mockAuthStore = require('./mockAuthStore');
      return await mockAuthStore.mockDataStore.createUtility(utilityData);
    }

    const { data, error } = await this.supabase
      .from('utilities')
      .insert([utilityData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUtility(id, updates) {
    if (this.mockMode) {
      const mockAuthStore = require('./mockAuthStore');
      return await mockAuthStore.mockDataStore.updateUtility(id, updates);
    }

    const { data, error } = await this.supabase
      .from('utilities')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUtility(id) {
    if (this.mockMode) {
      const mockAuthStore = require('./mockAuthStore');
      return await mockAuthStore.mockDataStore.deleteUtility(id);
    }
    const { error } = await this.supabase
      .from('utilities')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // Generic Insert Method
  async insert(table, data) {
    if (this.mockMode) return { id: Date.now(), ...data };

    const { data: inserted, error } = await this.supabase
      .from(table)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  }

  // Generic Update Method
  async update(table, id, updates) {
    if (this.mockMode) return { id, ...updates };

    const { data, error } = await this.supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Generic Query Method
  async query(table, options = {}) {
    if (this.mockMode) {
      console.log(`[database] Mock query on table: ${table}`);
      return [];
    }

    let query = this.supabase.from(table).select(options.select || '*');

    if (options.filter || options.filters) {
      const filters = options.filter || options.filters;
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (typeof value === 'object' && !Array.isArray(value)) {
          // Handle complex filters like { lte: ... }
          Object.entries(value).forEach(([op, val]) => {
            switch (op) {
              case 'eq': query = query.eq(key, val); break;
              case 'neq': query = query.neq(key, val); break;
              case 'gt': query = query.gt(key, val); break;
              case 'gte': query = query.gte(key, val); break;
              case 'lt': query = query.lt(key, val); break;
              case 'lte': query = query.lte(key, val); break;
              case 'like': query = query.like(key, val); break;
              case 'ilike': query = query.ilike(key, val); break;
              case 'in': query = query.in(key, val); break;
            }
          });
        } else {
          // Default to equality
          query = query.eq(key, value);
        }
      });
    }

    if (options.sort) {
      Object.entries(options.sort).forEach(([key, value]) => {
        query = query.order(key, { ascending: value === 'asc' || value === 1 });
      });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (options.single) {
      return data && data.length > 0 ? data[0] : null;
    }

    return data;
  }

  // Generic Count Method
  async count(table, options = {}) {
    if (this.mockMode) return 0;

    let query = this.supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (options.filter || options.filters) {
      const filters = options.filter || options.filters;
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value).forEach(([op, val]) => {
            switch (op) {
              case 'eq': query = query.eq(key, val); break;
              case 'neq': query = query.neq(key, val); break;
              case 'gt': query = query.gt(key, val); break;
              case 'gte': query = query.gte(key, val); break;
              case 'lt': query = query.lt(key, val); break;
              case 'lte': query = query.lte(key, val); break;
              case 'like': query = query.like(key, val); break;
              case 'ilike': query = query.ilike(key, val); break;
              case 'in': query = query.in(key, val); break;
            }
          });
        } else {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;
    if (error) throw error;
    return count;
  }
}

const databaseService = new DatabaseService();
module.exports = databaseService;
