# 🚀 Smart Algos Quick Start Guide

Get your Smart Algos Trading Platform up and running in minutes!

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher): [Download here](https://nodejs.org/)
- **MongoDB** (Local or Cloud):
  - **Local**: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - **Cloud**: [MongoDB Atlas (Free)](https://www.mongodb.com/atlas)
- **Git**: [Download here](https://git-scm.com/)

## ⚡ Quick Setup (3 Commands)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment and database
npm run setup

# 3. Start the application
npm run dev
```

That's it! Your Smart Algos platform is now running! 🎉

## 🌐 Access Your Application

- **Web Application**: http://localhost:3000
- **API Endpoints**: http://localhost:5000/api
- **Desktop App**: Run `cd desktop && npm run electron-dev`

## 🔑 Login Credentials

### Admin Account
- **Email**: `admin@smartalgos.com`
- **Password**: `password123`
- **Access**: Full platform access, institutional features

### Sample User Account
- **Email**: `user@smartalgos.com`
- **Password**: `password123`
- **Access**: Professional features, EA subscriptions

## 📊 What You'll See

After setup, your database will contain:

### 🏢 **8 Collections with Sample Data**
- **Users** (2): Admin and sample user accounts
- **EAs** (1): Golden Cross EA Pro with performance data
- **HFT Bots** (1): Crypto Scalping Pro Bot
- **Trading Signals** (2): EURUSD and BTCUSDT signals
- **AI Models** (1): SmartSignal AI v2.0 neural network
- **AI Signal Jobs** (1): Daily Forex Signals Generator
- **Subscriptions** (1): Active EA subscription
- **Escrow** (1): Multisig escrow transaction

### 🎯 **Key Features Available**
- **Dashboard**: Portfolio overview and market data
- **EA Marketplace**: Browse and subscribe to Expert Advisors
- **HFT Bots**: High-frequency trading bot rentals
- **AI Signals**: AI-generated trading signals
- **Markets**: Real-time US, Kenyan, and crypto market data
- **Portfolio**: Track investments and performance
- **Payments**: Paystack integration for subscriptions
- **Security**: Advanced security features and escrow system

## 🔧 Detailed Setup Options

### Option 1: Complete Setup (Recommended)
```bash
npm run setup
```
This runs both environment setup and database setup automatically.

### Option 2: Step-by-Step Setup
```bash
# Setup environment variables and directories
npm run setup-env

# Setup database with sample data
npm run setup-db

# Start the application
npm run dev
```

### Option 3: Manual Setup
```bash
# Copy environment file
copy env.example .env

# Install dependencies
npm install

# Setup database manually
node setup-database.js

# Start the application
npm run dev
```

## 🗄️ Database Setup Details

The `setup-database.js` script creates:

### **Users Collection**
- Complete user profiles with trading preferences
- Portfolio data and subscription information
- KYC verification status and preferences

### **EAs Collection**
- Expert Advisors with detailed performance metrics
- Backtest and live trading results
- Pricing, files, reviews, and subscription statistics

### **HFT Bots Collection**
- High-frequency trading bots for crypto markets
- Exchange integration and risk management
- System requirements and performance tracking

### **Trading Signals Collection**
- AI-generated trading signals with confidence scores
- Technical analysis and market context
- Performance tracking and execution data

### **AI Models Collection**
- Neural network models for signal generation
- Training data and performance metrics
- Deployment and monitoring configuration

### **AI Signal Jobs Collection**
- Automated signal generation jobs
- Schedule configuration and execution tracking
- Performance monitoring and error handling

### **Subscriptions Collection**
- User subscriptions to EAs and HFT bots
- Payment information and access control
- Performance tracking and support tickets

### **Escrow Collection**
- Blockchain-based multisig escrow transactions
- Smart contract integration and signature management
- Dispute handling and performance tracking

## 🎮 Explore the Features

### 1. **Dashboard**
- View portfolio overview and performance metrics
- Monitor market data and recent signals
- Quick access to all platform features

### 2. **EA Marketplace**
- Browse Expert Advisors with detailed information
- View performance metrics and backtest results
- Subscribe to EAs with escrow protection

### 3. **HFT Bots**
- Explore high-frequency trading bots
- Check system requirements and performance
- Rent bots with secure payment processing

### 4. **AI Signals**
- View AI-generated trading signals
- Filter by asset type, confidence level, and risk
- Track signal performance and execution

### 5. **Markets**
- Real-time US stock market data
- Kenyan NSE market information
- Cryptocurrency prices and forex rates

### 6. **Portfolio**
- Track your investments and performance
- Monitor P&L and risk metrics
- View detailed trade history

### 7. **Payments**
- Manage subscriptions and billing
- View payment history and invoices
- Process refunds and cancellations

### 8. **Security**
- Monitor security events and threats
- View audit logs and blockchain status
- Configure security settings

## 🔧 Customization

### Environment Variables
Edit `.env` file to customize:
- Database connection strings
- API keys for market data
- Payment gateway configurations
- Security settings

### Sample Data
Modify `setup-database.js` to:
- Add more sample users
- Create additional EAs and HFT bots
- Generate more trading signals
- Configure different AI models

### Frontend Customization
- Edit React components in `client/src/`
- Modify Tailwind CSS styles
- Add new pages and features

## 🚀 Production Deployment

### 1. **Environment Setup**
```bash
# Set production environment
NODE_ENV=production

# Use production database
MONGODB_URI=mongodb://your-production-db

# Set secure JWT secret
JWT_SECRET=your-secure-jwt-secret
```

### 2. **Build Application**
```bash
# Build frontend
npm run build:client

# Build desktop app
cd desktop && npm run build
```

### 3. **Deploy**
- Deploy backend to your server
- Deploy frontend to CDN or static hosting
- Configure reverse proxy (nginx/Apache)
- Set up SSL certificates

## 🐛 Troubleshooting

### Common Issues

#### **MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongod --version

# For local MongoDB
brew services start mongodb-community
# or
sudo systemctl start mongod

# For MongoDB Atlas, check connection string
```

#### **Port Already in Use**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

#### **Permission Errors**
```bash
# Fix file permissions
chmod +x setup-database.js
chmod +x setup-env.js
```

#### **Memory Issues**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 setup-database.js
```

### Reset Everything
```bash
# Clear database and recreate
npm run setup-db

# Or start fresh
rm -rf node_modules
rm -rf client/node_modules
rm -rf desktop/node_modules
npm install
npm run setup
```

## 📚 Additional Resources

- **Database Setup**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

## 🆘 Need Help?

1. **Check the logs**: Look at console output for error messages
2. **Verify prerequisites**: Ensure MongoDB and Node.js are installed
3. **Check environment**: Verify `.env` file is configured correctly
4. **Reset and retry**: Run `npm run setup` to start fresh

## 🎉 Success!

If everything is working correctly, you should see:

- ✅ Backend server running on http://localhost:5000
- ✅ Frontend application on http://localhost:3000
- ✅ Database connected with sample data
- ✅ All features accessible and functional

**Welcome to Smart Algos Trading Platform!** 🚀

---

**Next Steps:**
1. Explore the dashboard and features
2. Try subscribing to an EA
3. View AI-generated trading signals
4. Check out the HFT bot marketplace
5. Customize the platform for your needs

Happy trading! 📈
