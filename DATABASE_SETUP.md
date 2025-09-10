# 🗄️ Smart Algos Database Setup Guide

This guide will help you set up the complete database with all tables (collections) and sample data for the Smart Algos Trading Platform.

## 📋 Prerequisites

Before setting up the database, ensure you have:

1. **MongoDB installed and running**
   - Local MongoDB: [Download here](https://www.mongodb.com/try/download/community)
   - Or MongoDB Atlas (Cloud): [Sign up here](https://www.mongodb.com/atlas)

2. **Node.js dependencies installed**
   ```bash
   npm install
   ```

3. **Environment variables configured**
   ```bash
   copy env.example .env
   # Edit .env with your MongoDB connection string
   ```

## 🚀 Quick Setup

### Option 1: One-Command Setup (Recommended)
```bash
npm run setup-db
```

### Option 2: Manual Setup
```bash
node setup-database.js
```

## 📊 What Gets Created

The setup script creates **8 collections** with comprehensive sample data:

### 1. **Users Collection** (`users`)
- **Admin User**: `admin@smartalgos.com` / `password123`
- **Sample User**: `user@smartalgos.com` / `password123`
- Complete user profiles with trading preferences, portfolio data, and subscription info

### 2. **EAs Collection** (`eas`)
- **Golden Cross EA Pro**: Advanced trend-following Expert Advisor
- Complete performance metrics, backtest results, live trading data
- Pricing, files, reviews, and subscription statistics

### 3. **HFT Bots Collection** (`hftbots`)
- **Crypto Scalping Pro Bot**: High-frequency trading bot for cryptocurrency
- Exchange integration, risk management, system requirements
- Performance tracking and subscription management

### 4. **Trading Signals Collection** (`tradingsignals`)
- **EURUSD Buy Signal**: Forex trading signal with AI analysis
- **BTCUSDT Sell Signal**: Cryptocurrency trading signal
- Complete technical analysis, AI confidence scores, and market context

### 5. **AI Models Collection** (`aimodels`)
- **SmartSignal AI v2.0**: Advanced neural network for signal generation
- Training data, performance metrics, deployment information
- Model configuration and monitoring setup

### 6. **AI Signal Jobs Collection** (`aisignaljobs`)
- **Daily Forex Signals Generator**: Automated signal generation job
- Schedule configuration, execution tracking, performance monitoring
- Resource usage and error handling

### 7. **Subscriptions Collection** (`subscriptions`)
- **Sample EA Subscription**: User subscription to Golden Cross EA
- Payment information, access control, performance tracking
- Support tickets and file downloads

### 8. **Escrow Collection** (`escrows`)
- **Multisig Escrow Transaction**: Blockchain-based escrow for EA subscription
- Smart contract integration, signature management, dispute handling
- Performance tracking and fee structure

## 🔧 Database Schema Details

### User Schema
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  country: String,
  city: String,
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  isActive: Boolean,
  isKycVerified: Boolean,
  tradingExperience: String,
  preferredAssets: [String],
  riskTolerance: String,
  subscription: {
    type: String,
    startDate: Date,
    endDate: Date,
    isActive: Boolean,
    autoRenew: Boolean
  },
  portfolio: {
    totalValue: Number,
    totalProfit: Number,
    totalLoss: Number,
    winRate: Number,
    maxDrawdown: Number
  },
  preferences: {
    notifications: Object,
    theme: String,
    language: String,
    currency: String
  }
}
```

### EA Schema
```javascript
{
  name: String,
  description: String,
  category: String,
  version: String,
  mt4Compatible: Boolean,
  mt5Compatible: Boolean,
  minimumDeposit: Number,
  timeframes: [String],
  currencyPairs: [String],
  riskLevel: String,
  maxDrawdown: Number,
  performance: {
    totalTrades: Number,
    winningTrades: Number,
    losingTrades: Number,
    winRate: Number,
    profitFactor: Number,
    sharpeRatio: Number
  },
  backtestResults: Object,
  liveResults: Object,
  pricing: {
    weekly: Number,
    monthly: Number,
    quarterly: Number,
    yearly: Number,
    currency: String
  },
  files: {
    eaFile: String,
    setFile: String,
    manual: String,
    screenshots: [String],
    videoTutorial: String
  },
  status: String,
  isActive: Boolean,
  isFeatured: Boolean,
  creator: ObjectId,
  subscriptionStats: Object,
  reviews: [Object]
}
```

### HFT Bot Schema
```javascript
{
  name: String,
  description: String,
  strategy: String,
  exchange: String,
  markets: [Object],
  configuration: {
    minOrderSize: Number,
    maxOrderSize: Number,
    maxPositions: Number,
    maxDailyTrades: Number,
    latency: Number,
    slippage: Number
  },
  riskManagement: {
    maxDrawdown: Number,
    stopLoss: Number,
    takeProfit: Number,
    maxDailyLoss: Number,
    riskPerTrade: Number
  },
  performance: Object,
  liveResults: Object,
  backtestResults: Object,
  pricing: Object,
  systemRequirements: Object,
  files: Object,
  status: String,
  isActive: Boolean,
  isFeatured: Boolean,
  creator: ObjectId,
  subscriptionStats: Object,
  reviews: [Object]
}
```

### Trading Signal Schema
```javascript
{
  signalId: String (unique),
  name: String,
  asset: {
    symbol: String,
    name: String,
    type: String,
    exchange: String,
    market: String
  },
  signalType: String,
  action: String,
  currentPrice: Number,
  entryPrice: Number,
  targetPrice: Number,
  stopLoss: Number,
  riskLevel: String,
  positionSize: Number,
  riskRewardRatio: Number,
  aiAnalysis: {
    confidence: Number,
    sentiment: String,
    technicalScore: Number,
    fundamentalScore: Number,
    momentumScore: Number,
    volatilityScore: Number
  },
  technicalIndicators: Object,
  marketContext: Object,
  timeframe: String,
  validUntil: Date,
  aiModel: ObjectId,
  source: String,
  subscriptionTier: String,
  isPremium: Boolean,
  tags: [String],
  category: String,
  status: String,
  isActive: Boolean
}
```

### AI Model Schema
```javascript
{
  modelId: String (unique),
  name: String,
  description: String,
  version: String,
  modelType: String,
  architecture: String,
  framework: String,
  supportedAssets: Object,
  supportedMarkets: [String],
  supportedTimeframes: [String],
  trainingData: {
    startDate: Date,
    endDate: Date,
    dataSize: Number,
    dataSources: [String],
    features: [String],
    preprocessing: Object
  },
  performance: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1Score: Number,
    sharpeRatio: Number,
    maxDrawdown: Number,
    winRate: Number,
    profitFactor: Number,
    totalReturn: Number
  },
  configuration: {
    hyperparameters: Object,
    modelSize: Object,
    inferenceTime: Object
  },
  status: String,
  isActive: Boolean,
  isPublic: Boolean,
  deployment: Object,
  usage: Object,
  files: Object,
  creator: ObjectId,
  validation: Object,
  monitoring: Object,
  updates: [Object],
  tags: [String],
  category: String
}
```

### AI Signal Job Schema
```javascript
{
  jobId: String (unique),
  name: String,
  description: String,
  aiModel: ObjectId,
  modelVersion: String,
  configuration: {
    assetTypes: [String],
    markets: [String],
    timeframes: [String],
    symbols: [String],
    signalTypes: [String],
    minConfidence: Number,
    maxSignalsPerDay: Number,
    riskLevels: [String]
  },
  schedule: {
    type: String,
    cronExpression: String,
    timezone: String,
    frequency: String,
    startTime: Date,
    endTime: Date,
    isActive: Boolean
  },
  status: String,
  priority: String,
  execution: Object,
  results: Object,
  performance: Object,
  errors: [Object],
  monitoring: Object,
  resources: Object,
  creator: ObjectId,
  history: [Object],
  tags: [String],
  metadata: Object
}
```

### Subscription Schema
```javascript
{
  user: ObjectId,
  ea: ObjectId,
  subscriptionType: String,
  status: String,
  price: Number,
  currency: String,
  startDate: Date,
  endDate: Date,
  nextBillingDate: Date,
  paymentMethod: String,
  paymentReference: String,
  paymentStatus: String,
  escrowStatus: String,
  escrowAmount: Number,
  escrowReleaseDate: Date,
  escrowTransactionHash: String,
  hasAccess: Boolean,
  accessGrantedAt: Date,
  downloadedFiles: [Object],
  supportTickets: [Object],
  performanceMetrics: Object,
  cancellationReason: String,
  cancellationDate: Date,
  refundAmount: Number,
  refundStatus: String,
  autoRenew: Boolean,
  renewalAttempts: Number,
  maxRenewalAttempts: Number,
  notifications: Object,
  metadata: Object
}
```

### Escrow Schema
```javascript
{
  subscription: ObjectId,
  user: ObjectId,
  ea: ObjectId,
  creator: ObjectId,
  amount: Number,
  currency: String,
  blockchain: String,
  network: String,
  multisigAddress: String,
  transactionHash: String,
  blockNumber: Number,
  gasUsed: Number,
  gasPrice: Number,
  signatures: [Object],
  requiredSignatures: Number,
  totalSignatures: Number,
  status: String,
  state: String,
  createdAt: Date,
  fundedAt: Date,
  lockedAt: Date,
  unlockedAt: Date,
  releasedAt: Date,
  disputedAt: Date,
  resolvedAt: Date,
  expiresAt: Date,
  releaseConditions: Object,
  dispute: Object,
  performance: Object,
  fees: Object,
  notifications: Object,
  metadata: Object
}
```

## 🔍 Sample Data Overview

### Users (2 records)
- **Admin User**: Full access, institutional subscription, expert trader
- **Sample User**: Professional subscription, intermediate trader

### EAs (1 record)
- **Golden Cross EA Pro**: Trend-following EA with 68% win rate, 2.85 profit factor

### HFT Bots (1 record)
- **Crypto Scalping Pro Bot**: High-frequency crypto bot with 70% win rate, 3.2 profit factor

### Trading Signals (2 records)
- **EURUSD Buy Signal**: Forex signal with 85% confidence, bullish sentiment
- **BTCUSDT Sell Signal**: Crypto signal with 78% confidence, bearish sentiment

### AI Models (1 record)
- **SmartSignal AI v2.0**: LSTM neural network with 78.5% accuracy

### AI Signal Jobs (1 record)
- **Daily Forex Signals Generator**: Automated job generating 20 signals/day

### Subscriptions (1 record)
- **Sample EA Subscription**: Active monthly subscription with escrow protection

### Escrow Transactions (1 record)
- **Multisig Escrow**: Blockchain-based escrow with 2-of-3 signature requirement

## 🚀 Next Steps

After running the database setup:

1. **Start the backend server**:
   ```bash
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd client
   npm start
   ```

3. **Access the application**:
   - Web App: `http://localhost:3000`
   - API: `http://localhost:5000/api`

4. **Login with sample credentials**:
   - Admin: `admin@smartalgos.com` / `password123`
   - User: `user@smartalgos.com` / `password123`

## 🔧 Customization

To customize the sample data:

1. **Edit the setup script**: Modify `setup-database.js`
2. **Add more records**: Extend the sample data arrays
3. **Change configurations**: Update model parameters
4. **Add new collections**: Create additional models and setup functions

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for cloud databases

2. **Permission Errors**:
   - Ensure MongoDB user has read/write permissions
   - Check database access rights

3. **Memory Issues**:
   - Increase Node.js memory limit: `node --max-old-space-size=4096 setup-database.js`

4. **Timeout Errors**:
   - Increase MongoDB connection timeout
   - Check network connectivity

### Reset Database

To clear and recreate all data:
```bash
npm run setup-db
```

The script automatically clears existing data before creating new records.

## 📈 Performance Considerations

- **Indexes**: All models include optimized indexes for common queries
- **Virtual Fields**: Calculated fields for performance metrics
- **Validation**: Input validation and data integrity checks
- **Relationships**: Proper foreign key relationships between collections

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Comprehensive validation rules
- **Access Control**: Role-based access control
- **Audit Logging**: Complete audit trail for all operations
- **Encryption**: Sensitive data encryption support

## 📊 Monitoring

The database includes built-in monitoring for:
- **Performance Metrics**: Real-time performance tracking
- **Usage Statistics**: User activity and system usage
- **Error Tracking**: Comprehensive error logging
- **Health Checks**: Database health monitoring

## 🎯 Production Deployment

For production deployment:

1. **Use MongoDB Atlas** or dedicated MongoDB server
2. **Configure proper indexes** for your query patterns
3. **Set up monitoring** and alerting
4. **Implement backup strategies**
5. **Configure security settings**
6. **Set up replication** for high availability

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Smart Algos API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**🎉 Congratulations!** Your Smart Algos database is now fully set up with comprehensive sample data. You can now explore all the features of the trading platform!
