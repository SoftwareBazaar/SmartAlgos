# Remove Mock Data - Complete Guide

## Overview
Your application currently uses mock/demo data in several places as fallbacks. This guide identifies all mock data and shows how to replace it with real data from your database or APIs.

---

## 🎯 Priority 1: Dashboard Mock Data (HIGH PRIORITY)

### 1. Recent Trading Signals
**Location**: `client/src/pages/Dashboard/Dashboard.js` (lines ~160-200)

**Current Mock Data**:
```javascript
const recentSignals = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    signal: 'BUY',
    confidence: 85,
    price: 175.50,
    change: '+2.30',
    changePercent: '+1.33%',
    time: '2 min ago',
  },
  // ... more mock signals
];
```

**How to Replace**:
```javascript
const [recentSignals, setRecentSignals] = useState([]);

useEffect(() => {
  const fetchSignals = async () => {
    try {
      const response = await apiClient.get('/api/signals/active');
      if (response.data?.success) {
        setRecentSignals(response.data.data.slice(0, 4)); // Get top 4
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error);
      setRecentSignals([]); // Empty instead of mock
    }
  };
  fetchSignals();
}, []);
```

**API Endpoint**: Already exists at `/api/signals/active`

---

### 2. Market Overview
**Location**: `client/src/pages/Dashboard/Dashboard.js` (lines ~205-235)

**Current Mock Data**:
```javascript
const marketOverview = [
  {
    symbol: 'S&P 500',
    value: '4,567.89',
    change: '+23.45',
    changePercent: '+0.52%',
    trend: 'up',
  },
  // ... more mock indices
];
```

**How to Replace**:
```javascript
const [marketOverview, setMarketOverview] = useState([]);

useEffect(() => {
  const fetchMarketData = async () => {
    try {
      const response = await apiClient.get('/api/markets/overview');
      if (response.data?.success) {
        const data = response.data.data;
        
        // Format for display
        const overview = [
          ...(data.us?.indices || []).slice(0, 2),
          ...(data.crypto?.top || []).slice(0, 2)
        ];
        
        setMarketOverview(overview);
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      setMarketOverview([]);
    }
  };
  fetchMarketData();
}, []);
```

**API Endpoint**: Already exists at `/api/markets/overview`

---

## 🎯 Priority 2: Portfolio Mock Data (MEDIUM PRIORITY)

### 3. Demo Portfolios
**Location**: `client/src/pages/Portfolio/Portfolio.js` (lines ~108-243)

**Current Mock Data**:
```javascript
const demoPortfolios = [
  {
    id: 1,
    name: "My Trading Portfolio",
    description: "Diversified trading portfolio...",
    total_value: 125000,
    total_invested: 100000,
    total_profit: 25000,
    // ... more fields
  },
  // ... more demo portfolios
];
```

**How to Replace**:

**Option A: Create Real Portfolios from PnL Data**
```javascript
useEffect(() => {
  const fetchPortfolioData = async () => {
    try {
      setPortfolioLoading(true);
      
      // Get PnL data
      const pnlResponse = await apiClient.get('/api/portfolio/pnl');
      const pnlData = pnlResponse.data?.data || [];
      
      if (pnlData.length > 0) {
        // Calculate portfolio from PnL data
        const latestEntry = pnlData[pnlData.length - 1];
        const totalPnL = latestEntry.cumulative_pnl || 0;
        const profitableDays = pnlData.filter(e => e.pnl > 0).length;
        const winRate = (profitableDays / pnlData.length) * 100;
        
        const realPortfolio = {
          id: 1,
          name: "My Trading Portfolio",
          description: "Portfolio based on uploaded trading data",
          total_value: totalPnL,
          total_invested: 0, // Can be set by user
          total_profit: totalPnL,
          profit_percentage: 0, // Calculate if invested amount known
          daily_change: pnlData[pnlData.length - 1]?.pnl || 0,
          win_rate: winRate,
          total_trades: pnlData.length,
          profitable_trades: profitableDays,
          asset_count: 1,
          is_featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setPortfolios([realPortfolio]);
      } else {
        // No data yet - show empty state
        setPortfolios([]);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setPortfolios([]);
    } finally {
      setPortfolioLoading(false);
    }
  };
  
  fetchPortfolioData();
}, []);
```

**Option B: Create Portfolio Management System**
- Add `portfolios` table to database
- Allow users to create/manage multiple portfolios
- Link PnL data to specific portfolios
- Full CRUD operations

---

## 🎯 Priority 3: News Fallback Data (LOW PRIORITY)

### 4. Demo News Articles
**Location**: `client/src/pages/News/News.js` (lines ~36-125)

**Current Behavior**: Falls back to demo news when API returns empty

**Recommendation**: 
- Keep fallback for better UX
- But add clear indicator that it's demo data
- Or show empty state instead

**How to Improve**:
```javascript
if (newsData.length === 0 && !hasFilters) {
  // Option 1: Show empty state
  setNews([]);
  setShowEmptyState(true);
  
  // Option 2: Show demo with clear label
  setNews(demoFallback);
  setIsDemoData(true);
}
```

Then in UI:
```javascript
{isDemoData && (
  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
    <p className="text-sm text-yellow-800 dark:text-yellow-200">
      📰 Showing demo news articles. Real news will appear once API keys are configured.
    </p>
  </div>
)}
```

---

## 🎯 Priority 4: Mock Auth Store (DEVELOPMENT ONLY)

### 5. Mock Authentication Data
**Location**: `services/mockAuthStore.js`

**Current Use**: Development/testing only

**Action**: 
- ✅ Keep for development
- ✅ Already disabled in production
- ✅ No changes needed

**Verification**:
```javascript
// In server.js or config
const useMockAuth = process.env.USE_MOCK_AUTH === 'true';
```

Make sure `USE_MOCK_AUTH=false` in production `.env`

---

## 🎯 Priority 5: Market Data Mocks (API DEPENDENT)

### 6. NSE Mock Stocks
**Location**: `routes/markets.js` (line ~774)

**Current Mock Data**:
```javascript
const mockNSEStocks = [
  { symbol: 'SBI', name: 'State Bank of India', price: 580.50, ... },
  // ... more stocks
];
```

**How to Replace**:
- Integrate real NSE API (requires API key)
- Or remove NSE section if not needed
- Or clearly label as demo data

**API Options**:
- NSE Official API (requires approval)
- Yahoo Finance API
- Alpha Vantage (supports Indian stocks)

---

## 🎯 Priority 6: Security Events Mock (ADMIN ONLY)

### 7. Mock Security Events
**Location**: `routes/security.js` (lines ~90, ~170)

**Current Use**: Admin dashboard security logs

**How to Replace**:
- Create `security_events` table in database
- Log real security events (login attempts, failed auth, etc.)
- Query from database instead of mock

**Database Schema**:
```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Priority

### Phase 1: Critical (Do Now) ✅
1. ✅ **Dashboard Stats** - Already fixed! Now pulls from `portfolio_pnl`
2. 🔄 **Recent Signals** - Replace with real signals from database
3. 🔄 **Market Overview** - Connect to existing `/api/markets/overview`

### Phase 2: Important (Do Soon)
4. **Portfolio Data** - Create real portfolios from PnL data
5. **News Fallback** - Add demo data indicator or empty state

### Phase 3: Nice to Have (Do Later)
6. **NSE Stocks** - Integrate real API or remove
7. **Security Events** - Create real logging system

---

## Quick Wins (Easy Fixes)

### Fix 1: Recent Signals (15 minutes)

**File**: `client/src/pages/Dashboard/Dashboard.js`

**Replace**:
```javascript
// OLD
const recentSignals = [ /* mock data */ ];

// NEW
const [recentSignals, setRecentSignals] = useState([]);
const [loadingSignals, setLoadingSignals] = useState(true);

useEffect(() => {
  const fetchSignals = async () => {
    try {
      const response = await apiClient.get('/api/signals/active', {
        params: { limit: 4, sort: '-createdAt' }
      });
      setRecentSignals(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch signals:', error);
      setRecentSignals([]);
    } finally {
      setLoadingSignals(false);
    }
  };
  fetchSignals();
}, []);
```

### Fix 2: Market Overview (15 minutes)

**File**: `client/src/pages/Dashboard/Dashboard.js`

**Replace**:
```javascript
// OLD
const marketOverview = [ /* mock data */ ];

// NEW
const [marketOverview, setMarketOverview] = useState([]);
const [loadingMarket, setLoadingMarket] = useState(true);

useEffect(() => {
  const fetchMarketData = async () => {
    try {
      const response = await apiClient.get('/api/markets/overview');
      const data = response.data?.data;
      
      // Format indices for display
      const indices = [];
      if (data?.us?.indices) indices.push(...data.us.indices.slice(0, 2));
      if (data?.crypto?.top) indices.push(...data.crypto.top.slice(0, 2));
      
      setMarketOverview(indices);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      setMarketOverview([]);
    } finally {
      setLoadingMarket(false);
    }
  };
  fetchMarketData();
}, []);
```

### Fix 3: Portfolio from PnL (30 minutes)

**File**: `client/src/pages/Portfolio/Portfolio.js`

**Replace the entire `demoPortfolios` section** with the code from "Option A" above.

---

## Testing Checklist

After removing mock data:

- [ ] Dashboard shows real signals (or empty state if none)
- [ ] Dashboard shows real market data (or loading state)
- [ ] Portfolio shows data from uploaded CSV (or empty state)
- [ ] No console warnings about mock data
- [ ] Empty states look good (not broken)
- [ ] Loading states work properly
- [ ] Error handling works (API failures don't break UI)

---

## Environment Variables Needed

Make sure these are set in production:

```env
# Disable mock auth
USE_MOCK_AUTH=false

# API Keys for real data
ALPHA_VANTAGE_API_KEY=your_key
POLYGON_API_KEY=your_key
MARKETAUX_API_KEY=your_key

# Database
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

---

## Summary

### Mock Data Locations:
1. ✅ **Dashboard Stats** - Fixed! Now uses real data
2. 🔄 **Recent Signals** - Dashboard (easy fix)
3. 🔄 **Market Overview** - Dashboard (easy fix)
4. 🔄 **Demo Portfolios** - Portfolio page (medium fix)
5. ⚠️ **News Fallback** - Keep with indicator
6. ✅ **Mock Auth** - Dev only, keep as is
7. ⚠️ **NSE Stocks** - Needs API integration
8. ⚠️ **Security Events** - Needs database table

### Recommended Action Plan:
1. **Today**: Fix Recent Signals and Market Overview (30 min total)
2. **This Week**: Fix Portfolio data from PnL (30 min)
3. **Later**: Add news demo indicator, NSE API, security logging

### Files to Modify:
- `client/src/pages/Dashboard/Dashboard.js` (signals + market)
- `client/src/pages/Portfolio/Portfolio.js` (portfolios)
- `client/src/pages/News/News.js` (demo indicator)

**Total estimated time: 1-2 hours for all critical fixes** ⏱️
