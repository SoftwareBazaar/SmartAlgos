# 🚂 Railway Environment Variables Setup Guide

## 📋 Complete Variable List

Add these to Railway Dashboard → Your Project → **Variables** tab

---

## 🔑 **API Keys (Required for Real Data)**

### **1. FMP_API_KEY** (Financial Modeling Prep)
**Purpose**: Real-time stocks, economic calendar, earnings

**How to get:**
1. Visit: https://financialmodelingprep.com/developer/docs/
2. Click "Get API Key"
3. Sign up (no credit card)
4. Copy your key

**Railway Setup:**
```
Variable Name: FMP_API_KEY
Variable Value: your_fmp_key_here
```

**Free Tier**: 250 requests/day

---

### **2. GNEWS_API_KEY** (GNews)
**Purpose**: Breaking news, financial news, market headlines

**How to get:**
1. Visit: https://gnews.io/register
2. Sign up free
3. Verify email
4. Copy API key from dashboard

**Railway Setup:**
```
Variable Name: GNEWS_API_KEY
Variable Value: your_gnews_key_here
```

**Free Tier**: 100 articles/day

---

### **3. ALPHA_VANTAGE_API_KEY** (Alpha Vantage - Optional Backup)
**Purpose**: Backup for stock data if FMP fails

**How to get:**
1. Visit: https://www.alphavantage.co/support/#api-key
2. Fill simple form (30 seconds)
3. Get instant key

**Railway Setup:**
```
Variable Name: ALPHA_VANTAGE_API_KEY
Variable Value: your_alphavantage_key_here
```

**Free Tier**: 25 requests/day

---

## 🎯 **How to Add in Railway Dashboard**

### **Step-by-Step:**

1. **Go to Railway**: https://railway.app/

2. **Select Your Project**: Click "Smartalgos" (or your project name)

3. **Go to Variables Tab**: 
   - Click on your service/deployment
   - Click "Variables" in the left sidebar

4. **Add Each Variable**:
   - Click **"+ New Variable"** button
   - **Variable**: Type the name (e.g., `FMP_API_KEY`)
   - **Value**: Paste your API key
   - Click **"Add"**

5. **Repeat for Each Key**:
   ```
   FMP_API_KEY=your_key_here
   GNEWS_API_KEY=your_key_here
   ALPHA_VANTAGE_API_KEY=your_key_here (optional)
   ```

6. **Railway Auto-Redeploys**: 
   - After adding variables, Railway automatically redeploys
   - Wait 2-3 minutes
   - Done!

---

## 📸 **Visual Guide**

### **Railway Variables Screen:**
```
┌─────────────────────────────────────────────┐
│ Variables                        + New Variable │
├─────────────────────────────────────────────┤
│ FMP_API_KEY                                 │
│ ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●         │
│                                             │
│ GNEWS_API_KEY                               │
│ ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●         │
│                                             │
│ SUPABASE_URL                                │
│ https://your-project.supabase.co            │
│                                             │
│ SUPABASE_SERVICE_ROLE_KEY                   │
│ ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●         │
└─────────────────────────────────────────────┘
```

---

## ✅ **Priority Setup (Minimum Required)**

### **Option 1: Best Setup (Recommended)**
```env
FMP_API_KEY=your_fmp_key
GNEWS_API_KEY=your_gnews_key
```
**Result**: ✅ Real-time stocks + ✅ Breaking news

### **Option 2: Quick Setup (Just FMP)**
```env
FMP_API_KEY=your_fmp_key
```
**Result**: ✅ Real-time stocks + ✅ Economic calendar

### **Option 3: News Only**
```env
GNEWS_API_KEY=your_gnews_key
```
**Result**: ✅ Breaking news only

---

## 🔍 **Verify It's Working**

### **After Railway Redeploys:**

1. **Test FMP**:
   ```
   GET https://your-app.railway.app/api/markets/stocks
   ```
   Should return fresh stock prices

2. **Test GNews**:
   ```
   GET https://your-app.railway.app/api/economic-calendar/breaking
   ```
   Should return latest news articles

3. **Test Economic Calendar**:
   ```
   GET https://your-app.railway.app/api/economic-calendar/tomorrow
   ```
   Should return tomorrow's events

---

## ⚠️ **Common Mistakes to Avoid**

### **❌ Wrong:**
```
Variable Name: FMP API KEY (with spaces)
Variable Name: FMP-API-KEY (with dashes)
Variable Value: "your_key" (with quotes)
```

### **✅ Correct:**
```
Variable Name: FMP_API_KEY (underscore, no spaces)
Variable Value: abc123xyz456 (no quotes, no spaces)
```

---

## 📊 **Variable Name Reference**

| What You See in Code | Railway Variable Name | Required? |
|---------------------|----------------------|-----------|
| `process.env.FMP_API_KEY` | `FMP_API_KEY` | ✅ Highly Recommended |
| `process.env.GNEWS_API_KEY` | `GNEWS_API_KEY` | ✅ Highly Recommended |
| `process.env.ALPHA_VANTAGE_API_KEY` | `ALPHA_VANTAGE_API_KEY` | Optional (backup) |
| `process.env.POLYGON_API_KEY` | `POLYGON_API_KEY` | Optional (if you have it) |
| `process.env.MARKETAUX_API_KEY` | `MARKETAUX_API_KEY` | Optional (already set) |

---

## 🎯 **Copy-Paste Template**

After getting your keys, copy this template and fill in:

```env
# Market Data APIs
FMP_API_KEY=PASTE_YOUR_FMP_KEY_HERE
GNEWS_API_KEY=PASTE_YOUR_GNEWS_KEY_HERE
ALPHA_VANTAGE_API_KEY=PASTE_YOUR_ALPHA_KEY_HERE

# These are optional
POLYGON_API_KEY=your_polygon_key
MARKETAUX_API_KEY=UQuKirjX1oPrPMH9C4hsFCrvfwXMWkFWUI5q65XC
```

Then add each line to Railway **one by one**.

---

## 🚀 **Quick Start (5 Minutes)**

### **Fastest Way to Get Started:**

1. **Get FMP Key** (2 min):
   - https://financialmodelingprep.com/developer/docs/
   - Sign up → Get key

2. **Get GNews Key** (2 min):
   - https://gnews.io/register
   - Sign up → Verify email → Get key

3. **Add to Railway** (1 min):
   - Railway → Variables → Add both keys
   - Wait for redeploy

4. **Test** (30 sec):
   - Visit: `https://your-app.railway.app/api/economic-calendar/breaking`
   - Should see news articles!

---

## 💡 **Pro Tips**

### **Tip 1: Use Both FMP + GNews**
```
FMP = Stocks + Calendar + Earnings
GNews = Breaking News + Headlines
Together = Complete solution!
```

### **Tip 2: Check Railway Logs**
After adding keys, check logs:
```
Railway Dashboard → Deployments → View Logs

Look for:
[FMP] API is working ✅
[GNews] API is working ✅
```

### **Tip 3: Test Before Production**
Use the test endpoints to verify:
```bash
# Test FMP
curl https://your-app.railway.app/api/markets/stocks

# Test GNews
curl https://your-app.railway.app/api/economic-calendar/breaking
```

---

## 📞 **Troubleshooting**

### **Problem: "API key invalid"**
**Solution**: 
1. Check for typos in Railway
2. Make sure no spaces or quotes
3. Verify key is active on provider's dashboard

### **Problem: "Rate limit exceeded"**
**Solution**: 
1. You hit the free tier limit
2. Add Alpha Vantage as backup
3. Or upgrade to paid tier

### **Problem: "No data returned"**
**Solution**:
1. Check Railway logs for errors
2. Verify keys are added correctly
3. Wait a few minutes after adding keys

---

## ✅ **Final Checklist**

- [ ] Got FMP API key
- [ ] Got GNews API key  
- [ ] Added `FMP_API_KEY` to Railway
- [ ] Added `GNEWS_API_KEY` to Railway
- [ ] Waited for Railway redeploy (2-3 min)
- [ ] Tested `/api/economic-calendar/breaking`
- [ ] Tested `/api/markets/stocks`
- [ ] Checked Railway logs for errors
- [ ] All working! 🎉

---

## 🎯 **Expected Result**

After setup, your app will have:
- ✅ Real-time stock prices (5-second updates)
- ✅ Breaking financial news
- ✅ Economic calendar (tomorrow's events)
- ✅ Earnings reports
- ✅ Market headlines
- ✅ All FREE! 💰

---

**Time to complete**: 5 minutes  
**Cost**: $0/month  
**Value**: Priceless! 🚀

