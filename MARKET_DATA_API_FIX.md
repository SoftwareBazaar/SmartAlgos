# 📊 Market Data & News API - Complete Setup Guide

## 🔴 Current Problems

### 1. **Stale Market Data**
- Alpha Vantage using 'demo' key (rate limited to 5 calls/day)
- Polygon.io key expired (403 Forbidden)
- Cache duration too long (5 minutes)
- Services falling back to mock/random data

### 2. **No Economic Calendar**
- Missing upcoming news/events API
- No high-impact event alerts
- No market-moving news integration

---

## ✅ Solutions

### **Option 1: Financial Modeling Prep (FMP) - Best for Your Needs**

**Why FMP?**
- ✅ **Real-time stock data** (15min delay on free tier)
- ✅ **Economic calendar** with impact levels
- ✅ **News feed** with market relevance
- ✅ **Generous free tier**: 250 requests/day
- ✅ **No credit card required**

**Get Free API Key:**
1. Go to: https://financialmodelingprep.com/developer/docs/
2. Click "Get API Key" (top right)
3. Sign up with email
4. Copy your API key
5. Free tier gives you 250 requests/day

**Features:**
```javascript
// Real-time quotes
GET /api/v3/quote/AAPL?apikey=YOUR_KEY

// Economic calendar (upcoming events!)
GET /api/v3/economic_calendar?apikey=YOUR_KEY

// Market news
GET /api/v3/stock_news?apikey=YOUR_KEY&limit=50

// Earnings calendar
GET /api/v3/earning_calendar?apikey=YOUR_KEY
```

---

### **Option 2: Twelve Data - Best for Forex/Crypto**

**Why Twelve Data?**
- ✅ **Real-time Forex** (no delay)
- ✅ **Crypto prices**
- ✅ **Economic calendar**
- ✅ **800 requests/day** (free tier)

**Get Free API Key:**
1. Go to: https://twelvedata.com/pricing
2. Choose "Free" plan
3. Sign up
4. Copy API key from dashboard

---

### **Option 3: Keep Current Setup + Add Economic Calendar**

If you want to stick with Alpha Vantage + Polygon:

**Get REAL Alpha Vantage Key:**
1. Go to: https://www.alphavantage.co/support/#api-key
2. Click "Get your free API key"
3. Fill form (takes 30 seconds)
4. Free tier: 25 requests/day, 5/minute

**Add Trading Economics for Calendar:**
1. Go to: https://tradingeconomics.com/api
2. Sign up for free tier
3. Get calendar data

---

## 🎯 Recommended Setup (Best Value)

### **For Your Platform:**

| Service | Use Case | Free Tier | Best For |
|---------|----------|-----------|----------|
| **FMP** | Stocks, News, Calendar | 250/day | Main data source |
| **Binance API** | Crypto prices | Unlimited | Crypto real-time |
| **Twelve Data** | Forex | 800/day | Forex pairs |
| **News API** | General news | 100/day | Breaking news |

---

## 📰 Best News APIs for Market Events

### **1. News API (newsapi.org)**
```
Free Tier: 100 requests/day
Perfect for: Breaking financial news
```
**Get Key:**
1. Go to: https://newsapi.org/register
2. Free account
3. Copy API key
4. 100 requests/day

### **2. MarketAux (Already Configured!)**
```
Your Key: UQuKirjX1oPrPMH9C4hsFCrvfwXMWkFWUI5q65XC
Status: Should be working
Free Tier: 100 requests/day
```

### **3. FMP Economic Calendar**
```
Best for: Upcoming high-impact events
Example: Federal Reserve announcements, NFP, CPI data
```

---

## 🚀 Quick Fix Instructions

### **Step 1: Get API Keys (5 minutes)**

1. **FMP (Main data)**:
   - Visit: https://financialmodelingprep.com/developer/docs/
   - Sign up → Get key
   - Add to Railway: `FMP_API_KEY=your_key_here`

2. **News API (News feed)**:
   - Visit: https://newsapi.org/register
   - Sign up → Get key
   - Add to Railway: `NEWS_API_KEY=your_key_here`

3. **Alpha Vantage (Backup)**:
   - Visit: https://www.alphavantage.co/support/#api-key
   - Get FREE key (takes 10 seconds)
   - Add to Railway: `ALPHA_VANTAGE_API_KEY=your_real_key`

### **Step 2: Update Railway Environment Variables**

Go to Railway dashboard → Your project → Variables:
```env
# Add these new keys
FMP_API_KEY=your_fmp_key_here
NEWS_API_KEY=your_newsapi_key_here
ALPHA_VANTAGE_API_KEY=your_real_alpha_vantage_key

# Update existing (if you want)
POLYGON_API_KEY=get_new_one_from_polygon.io
MARKETAUX_API_KEY=UQuKirjX1oPrPMH9C4hsFCrvfwXMWkFWUI5q65XC
```

### **Step 3: I'll Update the Code**

I'll create:
1. ✅ FMP service for real-time data
2. ✅ Economic calendar service
3. ✅ News aggregator with upcoming events
4. ✅ Reduce cache duration (5 sec instead of 5 min)
5. ✅ Better fallback handling

---

## 💰 Cost Comparison (All Free!)

| Service | Free Tier | Paid Starts At |
|---------|-----------|----------------|
| FMP | 250 req/day | $14/month (5K/day) |
| News API | 100 req/day | $449/month |
| Alpha Vantage | 25 req/day | $50/month |
| Twelve Data | 800 req/day | $12/month |
| Binance | Unlimited | Free forever |

**Your current usage estimate**: ~200 requests/day
**Recommended**: FMP (250/day) + Binance (crypto) = FREE!

---

## 🎯 Next Steps

**Choose ONE option:**

### **Option A: Quick Fix (Recommended)**
1. Get FMP API key (2 minutes)
2. I'll update code to use it
3. Deploy to Railway
4. Real-time data working!

### **Option B: Premium Setup**
1. Get FMP + News API + Twelve Data keys
2. Full integration with calendar
3. Multiple data sources
4. Best reliability

### **Option C: Minimal Fix**
1. Just get new Alpha Vantage key
2. Fix current setup
3. Add News API for calendar

---

**Which option do you prefer?** Get the API keys and I'll immediately integrate them!

