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
    this.initialize();
  }

  initialize() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const rawAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required');
    }

    const serviceRoleKey = sanitizeSupabaseKey(rawServiceRoleKey);
    const anonKey = sanitizeSupabaseKey(rawAnonKey);

    if (!serviceRoleKey && !anonKey) {
      throw new Error('Supabase credentials missing. Set SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY.');
    }

    if (rawServiceRoleKey && !serviceRoleKey) {
      console.warn('[database] Ignoring SUPABASE_SERVICE_ROLE_KEY because it looks like a placeholder value. Falling back to anon key.');
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
  }

  getClient() {
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
    const { data, error } = await this.supabase
      .from('expert_advisors')
      .insert([eaData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getEAs(filters = {}) {
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
    const { data, error } = await this.supabase
      .from('expert_advisors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateEA(id, updates) {
    const { data, error } = await this.supabase
      .from('expert_advisors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getFeaturedEAs(options = {}) {
    const { limit = 10, includeCreator = false } = options;
    
    let query = this.supabase
      .from('expert_advisors')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'approved')
      .eq('is_featured', true)
      .order('average_rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getEACategories() {
    const { data, error } = await this.supabase
      .from('expert_advisors')
      .select('category, win_rate, average_rating')
      .eq('is_active', true)
      .eq('status', 'approved');
    
    if (error) throw error;
    
    // Group by category and calculate statistics
    const categories = {};
    data.forEach(ea => {
      if (!categories[ea.category]) {
        categories[ea.category] = {
          _id: ea.category,
          count: 0,
          averageRating: 0,
          averageWinRate: 0,
          totalRating: 0,
          totalWinRate: 0
        };
      }
      
      categories[ea.category].count++;
      categories[ea.category].totalRating += ea.average_rating || 0;
      categories[ea.category].totalWinRate += ea.win_rate || 0;
    });
    
    // Calculate averages
    Object.values(categories).forEach(category => {
      category.averageRating = category.totalRating / category.count;
      category.averageWinRate = category.totalWinRate / category.count;
      delete category.totalRating;
      delete category.totalWinRate;
    });
    
    return Object.values(categories).sort((a, b) => b.count - a.count);
  }

  async getUserEASubscriptions(userId) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select(`
        *,
        expert_advisors (
          id,
          name,
          description,
          category,
          creator_name,
          price_monthly,
          win_rate,
          average_rating
        )
      `)
      .eq('user_id', userId)
      .eq('product_type', 'expert_advisor')
      .eq('status', 'active');
    
    if (error) throw error;
    return data;
  }

  async getCreatorEAs(creatorId) {
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
    const { data, error } = await this.supabase
      .from('news_watchlists')
      .insert([watchlistData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserNewsWatchlists(userId) {
    const { data, error } = await this.supabase
      .from('news_watchlists')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getNewsAlerts(filters = {}) {
    let query = this.supabase
      .from('news_alerts')
      .select('*');
    
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    
    if (filters.unread_only) {
      query = query.eq('is_read', false);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async markNewsAlertAsRead(alertId, userId) {
    const { error } = await this.supabase
      .from('news_alerts')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', alertId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  }

  // Portfolio operations
  async createPortfolioHolding(holdingData) {
    const { data, error } = await this.supabase
      .from('portfolio_holdings')
      .insert([holdingData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserPortfolioHoldings(userId) {
    const { data, error } = await this.supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updatePortfolioHolding(id, updates) {
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
    const { data, error } = await this.supabase
      .from('performance_records')
      .insert([performanceData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getPerformanceRecords(filters = {}) {
    let query = this.supabase
      .from('performance_records')
      .select('*');
    
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    
    if (filters.ea_id) {
      query = query.eq('ea_id', filters.ea_id);
    }
    
    if (filters.symbol) {
      query = query.eq('symbol', filters.symbol);
    }
    
    if (filters.from_date) {
      query = query.gte('created_at', filters.from_date);
    }
    
    if (filters.to_date) {
      query = query.lte('created_at', filters.to_date);
    }
    
    query = query.order('created_at', { ascending: false });
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // HFT Bot operations
  async createHFTBot(botData) {
    const { data, error } = await this.supabase
      .from('hft_bots')
      .insert([botData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getHFTBots(filters = {}) {
    let query = this.supabase
      .from('hft_bots')
      .select('*');
    
    if (filters.strategy) {
      query = query.eq('strategy', filters.strategy);
    }
    if (filters.exchange) {
      query = query.eq('exchange', filters.exchange);
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
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getHFTBotById(id) {
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
    const { data, error } = await this.supabase
      .from('trading_signals')
      .insert([signalData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getTradingSignals(filters = {}) {
    let query = this.supabase
      .from('trading_signals')
      .select('*');
    
    if (filters.asset_type) {
      query = query.eq('asset_type', filters.asset_type);
    }
    if (filters.symbol) {
      query = query.eq('symbol', filters.symbol);
    }
    if (filters.market) {
      query = query.eq('market', filters.market);
    }
    if (filters.signal_type) {
      query = query.eq('signal_type', filters.signal_type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.subscription_tier) {
      query = query.eq('subscription_tier', filters.subscription_tier);
    }
    if (filters.is_premium !== undefined) {
      query = query.eq('is_premium', filters.is_premium);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getTradingSignalById(id) {
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
    const { data, error } = await this.supabase
      .from('ai_models')
      .insert([modelData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAIModels(filters = {}) {
    let query = this.supabase
      .from('ai_models')
      .select('*');
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.creator_id) {
      query = query.eq('creator_id', filters.creator_id);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getAIModelById(id) {
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
    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getSubscriptions(filters = {}) {
    let query = this.supabase
      .from('subscriptions')
      .select('*');
    
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.product_id) {
      query = query.eq('product_id', filters.product_id);
    }
    if (filters.product_type) {
      query = query.eq('product_type', filters.product_type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.subscription_type) {
      query = query.eq('subscription_type', filters.subscription_type);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getSubscriptionById(id) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateSubscription(id, updates) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Escrow operations
  async createEscrowTransaction(escrowData) {
    const { data, error } = await this.supabase
      .from('escrow_transactions')
      .insert([escrowData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getEscrowTransactions(filters = {}) {
    let query = this.supabase
      .from('escrow_transactions')
      .select('*');
    
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.creator_id) {
      query = query.eq('creator_id', filters.creator_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.state) {
      query = query.eq('state', filters.state);
    }
    if (filters.blockchain_network) {
      query = query.eq('blockchain_network', filters.blockchain_network);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getEscrowTransactionById(id) {
    const { data, error } = await this.supabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateEscrowTransaction(id, updates) {
    const { data, error } = await this.supabase
      .from('escrow_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Review operations
  async createEAReview(reviewData) {
    const { data, error } = await this.supabase
      .from('ea_reviews')
      .insert([reviewData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getEAReviews(eaId) {
    const { data, error } = await this.supabase
      .from('ea_reviews')
      .select('*')
      .eq('ea_id', eaId);
    
    if (error) throw error;
    return data;
  }

  async createHFTBotReview(reviewData) {
    const { data, error } = await this.supabase
      .from('hft_bot_reviews')
      .insert([reviewData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getHFTBotReviews(botId) {
    const { data, error } = await this.supabase
      .from('hft_bot_reviews')
      .select('*')
      .eq('hft_bot_id', botId);
    
    if (error) throw error;
    return data;
  }

  // AI Signal Job operations
  async createAISignalJob(jobData) {
    const { data, error } = await this.supabase
      .from('ai_signal_jobs')
      .insert([jobData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAISignalJobs(filters = {}) {
    let query = this.supabase
      .from('ai_signal_jobs')
      .select('*');
    
    if (filters.ai_model_id) {
      query = query.eq('ai_model_id', filters.ai_model_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.creator_id) {
      query = query.eq('creator_id', filters.creator_id);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getAISignalJobById(id) {
    const { data, error } = await this.supabase
      .from('ai_signal_jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateAISignalJob(id, updates) {
    const { data, error } = await this.supabase
      .from('ai_signal_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Generic query method
  async query(table, options = {}) {
    const { select = '*', filters = {}, orderBy = null, limit = null, offset = null } = options;
    
    let query = this.supabase.from(table).select(select);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
    }
    
    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }
    
    // Apply offset
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Generic insert method
  async insert(table, data) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(Array.isArray(data) ? data : [data])
      .select();
    
    if (error) throw error;
    return Array.isArray(data) ? result : result[0];
  }

  // Generic update method
  async update(table, id, updates) {
    const { data, error } = await this.supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Generic delete method
  async delete(table, id) {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;
