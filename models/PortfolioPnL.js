/**
 * Portfolio PnL Model
 * Stores daily P&L (Profit & Loss) data from CSV uploads
 */

const mongoose = require('mongoose');

const portfolioPnLSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  pnl: {
    type: Number,
    required: true,
    default: 0
  },
  // Metadata about the source
  source: {
    type: String,
    enum: ['csv', 'excel', 'mt5', 'api', 'manual'],
    default: 'csv'
  },
  sourceFile: {
    originalName: String,
    filename: String,
    uploadedAt: Date
  },
  // Additional trade data if available
  trades: [{
    symbol: String,
    action: String, // BUY, SELL
    quantity: Number,
    entryPrice: Number,
    exitPrice: Number,
    profit: Number,
    timestamp: Date
  }],
  // Cumulative PnL for this date
  cumulativePnL: {
    type: Number,
    default: 0
  },
  // Notes or comments
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one PnL entry per user per date
portfolioPnLSchema.index({ user: 1, date: 1 }, { unique: true });

// Index for date range queries
portfolioPnLSchema.index({ user: 1, date: -1 });

// Static methods
portfolioPnLSchema.statics.getUserPnL = function(userId, startDate = null, endDate = null) {
  const query = { user: userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  
  return this.find(query)
    .sort({ date: 1 })
    .lean();
};

portfolioPnLSchema.statics.upsertPnLEntries = async function(userId, entries, source = 'csv', sourceFile = null) {
  const operations = entries.map(entry => ({
    updateOne: {
      filter: { user: userId, date: entry.date },
      update: {
        $set: {
          pnl: entry.pnl,
          source: source,
          ...(sourceFile && { sourceFile }),
          updatedAt: new Date()
        },
        $setOnInsert: {
          user: userId,
          date: entry.date,
          createdAt: new Date()
        }
      },
      upsert: true
    }
  }));

  await this.bulkWrite(operations);
  
  // Recalculate cumulative PnL for all user entries
  await this.recalculateCumulativePnL(userId);
  
  return this.getUserPnL(userId);
};

portfolioPnLSchema.statics.recalculateCumulativePnL = async function(userId) {
  const entries = await this.find({ user: userId })
    .sort({ date: 1 })
    .lean();
  
  let cumulative = 0;
  const updates = entries.map(entry => {
    cumulative += entry.pnl;
    return {
      updateOne: {
        filter: { _id: entry._id },
        update: { $set: { cumulativePnL: cumulative } }
      }
    };
  });
  
  if (updates.length > 0) {
    await this.bulkWrite(updates);
  }
};

portfolioPnLSchema.statics.getPnLStats = async function(userId, startDate = null, endDate = null) {
  const query = { user: userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalPnL: { $sum: '$pnl' },
        avgDailyPnL: { $avg: '$pnl' },
        positiveDays: {
          $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] }
        },
        negativeDays: {
          $sum: { $cond: [{ $lt: ['$pnl', 0] }, 1, 0] }
        },
        flatDays: {
          $sum: { $cond: [{ $eq: ['$pnl', 0] }, 1, 0] }
        },
        bestDay: { $max: '$pnl' },
        worstDay: { $min: '$pnl' },
        totalDays: { $sum: 1 }
      }
    }
  ]);
  
  return stats[0] || {
    totalPnL: 0,
    avgDailyPnL: 0,
    positiveDays: 0,
    negativeDays: 0,
    flatDays: 0,
    bestDay: 0,
    worstDay: 0,
    totalDays: 0
  };
};

portfolioPnLSchema.statics.deleteUserPnL = function(userId, date = null) {
  const query = { user: userId };
  if (date) query.date = date;
  return this.deleteMany(query);
};

module.exports = mongoose.model('PortfolioPnL', portfolioPnLSchema);

