# 🔑 Setup Real News & Market Data APIs

## ⚠️ Current Issue

Your app is using **mock/fallback data** because real API keys are not configured. Here's how to get **real live feeds**:

---

## 📰 **1. GNews API (Financial News - FREE)**

### **Get Your Free API Key:**

1. **Go to**: https://gnews.io/register
2. **Sign up** with email (takes 30 seconds)
3. **Verify email** (check your inbox)
4. **Copy API key** from dashboard
5. **Free Tier**: 100 articles/day

### **Add to Railway:**
```
Variable Name: GNEWS_API_KEY
Variable Value: your_gnews_key_here
```

### **Add to Local `.env`:**
```env
GNEWS_API_KEY=your_gnews_key_here
```

---

## 📊 **2. Financial Modeling Prep (FMP) - Market Data & News**

### **Get Your Free API Key:**

1. **Go to**: https://financialmodelingprep.com/developer/docs/
2. **Click "Get API Key"** (top right)
3. **Sign up** (no credit card needed)
4. **Copy API key** from dashboard
5. **Free Tier**: 250 requests/day

### **Add to Railway:**
```
Variable Name: FMP_API_KEY
Variable Value: your_fmp_key_here
```

### **Add to Local `.env`:**
```env
FMP_API_KEY=your_fmp_key_here
```

---

## 🌐 **3. MarketAux (Optional - News API)**

### **Get Your Free API Key:**

1. **Go to**: https://marketaux.com/
2. **Sign up** for free account
3. **Get API key** from dashboard
4. **Free Tier**: 50 requests/day

### **Add to Railway:**
```
Variable Name: MARKETAUX_API_KEY
Variable Value: your_marketaux_key_here
```

### **Add to Local `.env`:**
```env
MARKETAUX_API_KEY=your_marketaux_key_here
```

---

## 🚀 **Quick Setup Steps:**

### **For Railway (Production):**

1. **Go to Railway Dashboard**: https://railway.app/
2. **Select your project** → **Variables** tab
3. **Add each key** one by one:
   - Click **"+ New Variable"**
   - Add name and value
   - Click **"Add"**
4. **Railway auto-redeploys** (2-3 minutes)

### **For Local Development:**

1. **Open `.env` file** in project root
2. **Add or update** these lines:
   ```env
   GNEWS_API_KEY=your_gnews_key_here
   FMP_API_KEY=your_fmp_key_here
   MARKETAUX_API_KEY=your_marketaux_key_here
   ```
3. **Save the file**
4. **Restart server**: `npm start`

---

## ✅ **After Adding Keys:**

### **What You'll Get:**

1. **Real Financial News** from GNews
   - Breaking market news
   - Financial headlines
   - Real-time updates

2. **Market Data** from FMP
   - Stock quotes
   - Market news
   - Economic calendar events

3. **No More Mock Data!**
   - All news will be real
   - Market data will be live
   - Feeds update every few minutes

---

## 🧪 **Test It's Working:**

### **Check Server Logs:**

**✅ GOOD (Real API working):**
```
[GNews] Fetching financial news...
[FMP] Fetching market news...
```

**❌ WARNING (Still using mock):**
```
[GNews] No API key configured
[FMP] Using fallback data
```

### **Check in Browser:**

1. **Go to News page**
2. **Look at articles** - they should be real, recent news
3. **Check dates** - should be today/yesterday
4. **Check sources** - should be real news sources (Reuters, Bloomberg, etc.)

---

## 💡 **Recommended Setup:**

**Minimum (Good for testing):**
- ✅ **GNEWS_API_KEY** - 100 articles/day (FREE)

**Better (More data):**
- ✅ **GNEWS_API_KEY** - Financial news
- ✅ **FMP_API_KEY** - Market data + news (250 requests/day FREE)

**Best (Complete coverage):**
- ✅ **GNEWS_API_KEY** - Breaking news
- ✅ **FMP_API_KEY** - Market data
- ✅ **MARKETAUX_API_KEY** - Additional news source

---

## 🆘 **Troubleshooting:**

**"Still seeing mock data":**
1. ✅ Check key format (no spaces, correct value)
2. ✅ Restart server after adding to `.env`
3. ✅ Check Railway variables are saved
4. ✅ Wait 2-3 minutes after Railway deploy

**"API rate limit exceeded":**
- Free tiers have limits
- GNews: 100/day
- FMP: 250/day
- App will fall back to mock if limit reached

**"Invalid API key":**
- Make sure key is complete (no truncation)
- Verify in API provider dashboard
- Check for typos

---

## 📝 **Current Status:**

After adding keys, your app will:
- ✅ Fetch **real financial news** from multiple sources
- ✅ Show **live market data**
- ✅ Display **real-time headlines**
- ✅ Update **every few minutes** automatically

**No more mock data!** 🎉

