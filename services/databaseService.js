const { createClient } = require('@supabase/supabase-js');

class DatabaseService {
  constructor() {
    this.supabase = null;
    this.initialize();
  }

  initialize() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://ncikobfahncdgwvkfivz.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaWtvYmZhaG5jZGd3dmtmaXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDY2NDQsImV4cCI6MjA3Mjk4MjY0NH0.TKIwIpXr9c92Xi0AgoioeC2db3tonPtM1wHHMo5-7mk';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
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
