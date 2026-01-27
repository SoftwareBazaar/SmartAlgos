/**
 * Portfolio Service - Supabase Implementation
 * Handles portfolio PnL data storage and retrieval
 */

const databaseService = require('./databaseService');

class PortfolioService {
  constructor() {
    this.tableName = 'portfolio_pnl';
  }

  /**
   * Get user's PnL data for date range
   */
  async getUserPnL(userId, startDate = null, endDate = null) {
    try {
      const supabase = databaseService.getClient();
      
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Portfolio] Error fetching PnL:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[Portfolio] getUserPnL error:', error);
      return [];
    }
  }

  /**
   * Upsert PnL entries (insert or update)
   */
  async upsertPnLEntries(userId, entries, source = 'csv', sourceFile = null) {
    try {
      const supabase = databaseService.getClient();
      
      // Prepare entries for upsert
      const records = entries.map(entry => ({
        user_id: userId,
        date: entry.date,
        pnl: entry.pnl,
        source: source,
        source_file: sourceFile ? JSON.stringify(sourceFile) : null,
        updated_at: new Date().toISOString()
      }));

      // Upsert entries (insert or update on conflict)
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(records, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('[Portfolio] Error upserting PnL entries:', error);
        throw error;
      }

      // Recalculate cumulative PnL
      await this.recalculateCumulativePnL(userId);

      return await this.getUserPnL(userId);
    } catch (error) {
      console.error('[Portfolio] upsertPnLEntries error:', error);
      throw error;
    }
  }

  /**
   * Recalculate cumulative PnL for all user entries
   */
  async recalculateCumulativePnL(userId) {
    try {
      const entries = await this.getUserPnL(userId);
      
      let cumulative = 0;
      const updates = entries.map(entry => {
        cumulative += entry.pnl;
        return {
          id: entry.id,
          cumulative_pnl: cumulative
        };
      });

      if (updates.length > 0) {
        const supabase = databaseService.getClient();
        
        // Update in batches
        for (const update of updates) {
          await supabase
            .from(this.tableName)
            .update({ cumulative_pnl: update.cumulative_pnl })
            .eq('id', update.id);
        }
      }
    } catch (error) {
      console.error('[Portfolio] recalculateCumulativePnL error:', error);
    }
  }

  /**
   * Get PnL statistics
   */
  async getPnLStats(userId, startDate = null, endDate = null) {
    try {
      const entries = await this.getUserPnL(userId, startDate, endDate);
      
      if (!entries.length) {
        return {
          totalPnL: 0,
          avgDailyPnL: 0,
          positiveDays: 0,
          negativeDays: 0,
          flatDays: 0,
          bestDay: 0,
          worstDay: 0,
          totalDays: 0
        };
      }

      const totalPnL = entries.reduce((sum, entry) => sum + entry.pnl, 0);
      const positiveDays = entries.filter(entry => entry.pnl > 0).length;
      const negativeDays = entries.filter(entry => entry.pnl < 0).length;
      const flatDays = entries.filter(entry => entry.pnl === 0).length;
      const bestDay = Math.max(...entries.map(entry => entry.pnl));
      const worstDay = Math.min(...entries.map(entry => entry.pnl));

      return {
        totalPnL: parseFloat(totalPnL.toFixed(2)),
        avgDailyPnL: parseFloat((totalPnL / entries.length).toFixed(2)),
        positiveDays,
        negativeDays,
        flatDays,
        bestDay,
        worstDay,
        totalDays: entries.length
      };
    } catch (error) {
      console.error('[Portfolio] getPnLStats error:', error);
      return {
        totalPnL: 0,
        avgDailyPnL: 0,
        positiveDays: 0,
        negativeDays: 0,
        flatDays: 0,
        bestDay: 0,
        worstDay: 0,
        totalDays: 0
      };
    }
  }

  /**
   * Delete user's PnL data
   */
  async deleteUserPnL(userId, date = null) {
    try {
      const supabase = databaseService.getClient();
      
      let query = supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);

      if (date) {
        query = query.eq('date', date);
      }

      const { error } = await query;

      if (error) {
        console.error('[Portfolio] Error deleting PnL:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[Portfolio] deleteUserPnL error:', error);
      throw error;
    }
  }
}

module.exports = new PortfolioService();
