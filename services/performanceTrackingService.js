const EventEmitter = require('events');
const databaseService = require('./databaseService');

class PerformanceTrackingService extends EventEmitter {
  constructor() {
    super();
    this.performanceCache = new Map(); // userId -> performance data
    this.tradeCache = new Map(); // tradeId -> trade data
    this.portfolioCache = new Map(); // portfolioId -> portfolio data
    this.updateInterval = 30000; // 30 seconds
    this.isRunning = false;
    
    this.startService();
  }

  startService() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Performance tracking service started');
    
    // Start periodic updates
    this.updateInterval = setInterval(() => {
      this.updateAllPerformances();
    }, this.updateInterval);
  }

  stopService() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    console.log('Performance tracking service stopped');
  }

  /**
   * Track a new trade
   */
  async trackTrade(tradeData) {
    try {
      const trade = {
        id: tradeData.id || this.generateTradeId(),
        userId: tradeData.userId,
        portfolioId: tradeData.portfolioId,
        eaId: tradeData.eaId,
        signalId: tradeData.signalId,
        symbol: tradeData.symbol,
        type: tradeData.type, // 'buy' or 'sell'
        action: tradeData.action, // 'open' or 'close'
        quantity: tradeData.quantity,
        entryPrice: tradeData.entryPrice,
        exitPrice: tradeData.exitPrice,
        stopLoss: tradeData.stopLoss,
        takeProfit: tradeData.takeProfit,
        commission: tradeData.commission || 0,
        status: tradeData.status || 'open',
        openTime: tradeData.openTime || new Date(),
        closeTime: tradeData.closeTime,
        profit: tradeData.profit || 0,
        profitPercentage: tradeData.profitPercentage || 0,
        metadata: tradeData.metadata || {}
      };

      // Calculate profit if trade is closed
      if (trade.action === 'close' && trade.exitPrice) {
        const { profit, profitPercentage } = this.calculateTradeProfit(trade);
        trade.profit = profit;
        trade.profitPercentage = profitPercentage;
        trade.closeTime = trade.closeTime || new Date();
      }

      // Store trade in database
      const savedTrade = await databaseService.createPerformanceRecord({
        user_id: trade.userId,
        portfolio_id: trade.portfolioId,
        ea_id: trade.eaId,
        signal_id: trade.signalId,
        symbol: trade.symbol,
        trade_type: trade.type,
        action: trade.action,
        quantity: trade.quantity,
        entry_price: trade.entryPrice,
        exit_price: trade.exitPrice,
        stop_loss: trade.stopLoss,
        take_profit: trade.takeProfit,
        commission: trade.commission,
        status: trade.status,
        open_time: trade.openTime,
        close_time: trade.closeTime,
        profit: trade.profit,
        profit_percentage: trade.profitPercentage,
        metadata: trade.metadata,
        created_at: new Date().toISOString()
      });

      // Cache the trade
      this.tradeCache.set(trade.id, trade);

      // Update performance metrics
      await this.updateUserPerformance(trade.userId);
      if (trade.portfolioId) {
        await this.updatePortfolioPerformance(trade.portfolioId);
      }
      if (trade.eaId) {
        await this.updateEAPerformance(trade.eaId);
      }

      // Emit trade event
      this.emit('trade_tracked', {
        trade,
        timestamp: new Date().toISOString()
      });

      return savedTrade;
    } catch (error) {
      console.error('Error tracking trade:', error);
      throw error;
    }
  }

  /**
   * Update trade status
   */
  async updateTrade(tradeId, updates) {
    try {
      const trade = this.tradeCache.get(tradeId);
      if (!trade) {
        throw new Error(`Trade ${tradeId} not found`);
      }

      // Update trade data
      Object.assign(trade, updates);

      // Recalculate profit if needed
      if (updates.exitPrice || updates.status === 'closed') {
        const { profit, profitPercentage } = this.calculateTradeProfit(trade);
        trade.profit = profit;
        trade.profitPercentage = profitPercentage;
        trade.closeTime = trade.closeTime || new Date();
        trade.status = 'closed';
      }

      // Update in database
      await databaseService.updatePerformanceRecord(tradeId, {
        exit_price: trade.exitPrice,
        status: trade.status,
        close_time: trade.closeTime,
        profit: trade.profit,
        profit_percentage: trade.profitPercentage,
        updated_at: new Date().toISOString()
      });

      // Update cache
      this.tradeCache.set(tradeId, trade);

      // Update performance metrics
      await this.updateUserPerformance(trade.userId);
      if (trade.portfolioId) {
        await this.updatePortfolioPerformance(trade.portfolioId);
      }
      if (trade.eaId) {
        await this.updateEAPerformance(trade.eaId);
      }

      // Emit update event
      this.emit('trade_updated', {
        trade,
        timestamp: new Date().toISOString()
      });

      return trade;
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  }

  /**
   * Calculate trade profit
   */
  calculateTradeProfit(trade) {
    if (!trade.exitPrice || !trade.entryPrice) {
      return { profit: 0, profitPercentage: 0 };
    }

    const priceDiff = trade.type === 'buy' 
      ? trade.exitPrice - trade.entryPrice
      : trade.entryPrice - trade.exitPrice;
    
    const grossProfit = priceDiff * trade.quantity;
    const profit = grossProfit - trade.commission;
    const profitPercentage = (priceDiff / trade.entryPrice) * 100;

    return {
      profit: parseFloat(profit.toFixed(2)),
      profitPercentage: parseFloat(profitPercentage.toFixed(2))
    };
  }

  /**
   * Update user performance metrics
   */
  async updateUserPerformance(userId) {
    try {
      // Get all user trades
      const trades = await databaseService.getPerformanceRecords({
        user_id: userId,
        limit: 1000
      });

      if (!trades || trades.length === 0) {
        return;
      }

      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(trades);
      
      // Cache performance data
      this.performanceCache.set(userId, {
        ...performance,
        lastUpdated: new Date().toISOString()
      });

      // Emit performance update
      this.emit('user_performance_updated', {
        userId,
        performance,
        timestamp: new Date().toISOString()
      });

      return performance;
    } catch (error) {
      console.error('Error updating user performance:', error);
      throw error;
    }
  }

  /**
   * Update portfolio performance metrics
   */
  async updatePortfolioPerformance(portfolioId) {
    try {
      // Get all portfolio trades
      const trades = await databaseService.getPerformanceRecords({
        portfolio_id: portfolioId,
        limit: 1000
      });

      if (!trades || trades.length === 0) {
        return;
      }

      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(trades);
      
      // Update portfolio in database
      await databaseService.updatePortfolioHolding(portfolioId, {
        total_profit: performance.totalProfit,
        profit_percentage: performance.totalReturn,
        win_rate: performance.winRate,
        total_trades: performance.totalTrades,
        profitable_trades: performance.profitableTrades,
        max_drawdown: performance.maxDrawdown,
        sharpe_ratio: performance.sharpeRatio,
        updated_at: new Date().toISOString()
      });

      // Cache performance data
      this.portfolioCache.set(portfolioId, {
        ...performance,
        lastUpdated: new Date().toISOString()
      });

      // Emit performance update
      this.emit('portfolio_performance_updated', {
        portfolioId,
        performance,
        timestamp: new Date().toISOString()
      });

      return performance;
    } catch (error) {
      console.error('Error updating portfolio performance:', error);
      throw error;
    }
  }

  /**
   * Update EA performance metrics
   */
  async updateEAPerformance(eaId) {
    try {
      // Get all EA trades
      const trades = await databaseService.getPerformanceRecords({
        ea_id: eaId,
        limit: 1000
      });

      if (!trades || trades.length === 0) {
        return;
      }

      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(trades);
      
      // Update EA in database
      await databaseService.updateEA(eaId, {
        win_rate: performance.winRate,
        total_trades: performance.totalTrades,
        profitable_trades: performance.profitableTrades,
        max_drawdown: performance.maxDrawdown,
        profit_factor: performance.profitFactor,
        average_profit: performance.averageProfit,
        average_loss: performance.averageLoss,
        updated_at: new Date().toISOString()
      });

      // Emit performance update
      this.emit('ea_performance_updated', {
        eaId,
        performance,
        timestamp: new Date().toISOString()
      });

      return performance;
    } catch (error) {
      console.error('Error updating EA performance:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive performance metrics
   */
  calculatePerformanceMetrics(trades) {
    const closedTrades = trades.filter(t => t.status === 'closed');
    const profitableTrades = closedTrades.filter(t => t.profit > 0);
    const losingTrades = closedTrades.filter(t => t.profit < 0);

    const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalGrossProfit = profitableTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalGrossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));

    const winRate = closedTrades.length > 0 
      ? (profitableTrades.length / closedTrades.length) * 100 
      : 0;

    const averageProfit = profitableTrades.length > 0 
      ? totalGrossProfit / profitableTrades.length 
      : 0;

    const averageLoss = losingTrades.length > 0 
      ? totalGrossLoss / losingTrades.length 
      : 0;

    const profitFactor = totalGrossLoss > 0 
      ? totalGrossProfit / totalGrossLoss 
      : totalGrossProfit > 0 ? 999 : 0;

    // Calculate drawdown
    const { maxDrawdown, currentDrawdown } = this.calculateDrawdown(closedTrades);

    // Calculate Sharpe ratio (simplified)
    const returns = closedTrades.map(t => t.profit_percentage || 0);
    const sharpeRatio = this.calculateSharpeRatio(returns);

    // Calculate total return percentage
    const initialCapital = 10000; // Assume $10,000 initial capital
    const totalReturn = (totalProfit / initialCapital) * 100;

    return {
      totalTrades: closedTrades.length,
      profitableTrades: profitableTrades.length,
      losingTrades: losingTrades.length,
      winRate: parseFloat(winRate.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalGrossProfit: parseFloat(totalGrossProfit.toFixed(2)),
      totalGrossLoss: parseFloat(totalGrossLoss.toFixed(2)),
      averageProfit: parseFloat(averageProfit.toFixed(2)),
      averageLoss: parseFloat(averageLoss.toFixed(2)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      currentDrawdown: parseFloat(currentDrawdown.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      totalReturn: parseFloat(totalReturn.toFixed(2)),
      lastTradeDate: closedTrades.length > 0 
        ? Math.max(...closedTrades.map(t => new Date(t.close_time).getTime()))
        : null
    };
  }

  /**
   * Calculate maximum drawdown
   */
  calculateDrawdown(trades) {
    if (trades.length === 0) {
      return { maxDrawdown: 0, currentDrawdown: 0 };
    }

    let runningBalance = 10000; // Initial balance
    let peak = runningBalance;
    let maxDrawdown = 0;
    let currentDrawdown = 0;

    // Sort trades by close time
    const sortedTrades = trades.sort((a, b) => 
      new Date(a.close_time) - new Date(b.close_time)
    );

    for (const trade of sortedTrades) {
      runningBalance += trade.profit || 0;
      
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      
      const drawdown = ((peak - runningBalance) / peak) * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    currentDrawdown = ((peak - runningBalance) / peak) * 100;

    return { maxDrawdown, currentDrawdown };
  }

  /**
   * Calculate Sharpe ratio
   */
  calculateSharpeRatio(returns) {
    if (returns.length < 2) return 0;

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
    const standardDeviation = Math.sqrt(variance);

    return standardDeviation > 0 ? meanReturn / standardDeviation : 0;
  }

  /**
   * Update all performances (periodic task)
   */
  async updateAllPerformances() {
    try {
      console.log('Updating all performance metrics...');
      
      // Get all active users
      const users = await databaseService.query('users_accounts', {
        select: 'id',
        filters: { is_active: true }
      });

      for (const user of users) {
        try {
          await this.updateUserPerformance(user.id);
        } catch (error) {
          console.error(`Error updating performance for user ${user.id}:`, error);
        }
      }

      console.log(`Updated performance for ${users.length} users`);
    } catch (error) {
      console.error('Error in periodic performance update:', error);
    }
  }

  /**
   * Get cached performance data
   */
  getUserPerformance(userId) {
    return this.performanceCache.get(userId);
  }

  getPortfolioPerformance(portfolioId) {
    return this.portfolioCache.get(portfolioId);
  }

  /**
   * Generate unique trade ID
   */
  generateTradeId() {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get service statistics
   */
  getServiceStats() {
    return {
      isRunning: this.isRunning,
      cachedPerformances: this.performanceCache.size,
      cachedTrades: this.tradeCache.size,
      cachedPortfolios: this.portfolioCache.size,
      updateInterval: this.updateInterval,
      uptime: process.uptime()
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.performanceCache.clear();
    this.tradeCache.clear();
    this.portfolioCache.clear();
    console.log('Performance tracking cache cleared');
  }
}

// Create singleton instance
const performanceTrackingService = new PerformanceTrackingService();

// Graceful shutdown
process.on('SIGTERM', () => {
  performanceTrackingService.stopService();
});

process.on('SIGINT', () => {
  performanceTrackingService.stopService();
});

module.exports = performanceTrackingService;
