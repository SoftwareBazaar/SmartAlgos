# ✅ Portfolio CSV Upload Fix Complete

## 🔧 What Was Fixed

**Problem:**
- Portfolio was using MongoDB (not connected)
- MongoDB timeout errors on CSV upload
- System uses Supabase, not MongoDB

**Solution:**
- ✅ Created `portfolioService.js` - Supabase-based service
- ✅ Replaced all MongoDB calls with Supabase
- ✅ Created SQL migration for `portfolio_pnl` table
- ✅ Updated routes to use new service

---

## 📋 REQUIRED: Run SQL Migration in Supabase

**You MUST run this SQL in your Supabase dashboard:**

1. **Go to:** https://supabase.com/dashboard
2. **Select your project**
3. **Click:** SQL Editor (left sidebar)
4. **Click:** "+ New Query"
5. **Copy and paste** the contents of: `database/create-portfolio-pnl-table.sql`
6. **Click:** "Run" button

This creates the `portfolio_pnl` table needed for CSV uploads.

---

## 🎯 What the Table Does

The `portfolio_pnl` table stores:
- ✅ Daily profit/loss data from CSV uploads
- ✅ Cumulative PnL calculations
- ✅ Source tracking (CSV, Excel, MT5)
- ✅ File metadata
- ✅ User isolation (RLS policies)

**Schema:**
```sql
- id: UUID (primary key)
- user_id: UUID (your user ID)
- date: DATE (trading date)
- pnl: DECIMAL (daily profit/loss)
- cumulative_pnl: DECIMAL (running total)
- source: VARCHAR (csv, excel, mt5)
- source_file: JSONB (file metadata)
- notes: TEXT (optional notes)
- created_at, updated_at: TIMESTAMP
```

---

## 🚀 How It Works Now

### CSV Upload Flow:
1. User uploads CSV/Excel file
2. System parses profit/loss data
3. Data saved to Supabase `portfolio_pnl` table
4. Cumulative PnL calculated automatically
5. Calendar displays beautiful PnL visualization

### Features:
- ✅ Supports CSV and Excel files
- ✅ Auto-detects date and profit columns
- ✅ Handles multiple date formats
- ✅ Calculates daily and cumulative PnL
- ✅ Stores file metadata
- ✅ User data isolation with RLS

---

## 📊 API Endpoints

### Upload CSV
```
POST /api/portfolio/upload-csv
- Accepts: CSV or Excel file
- Returns: Parsed data + analysis
- Saves: To Supabase automatically
```

### Get PnL Data
```
GET /api/portfolio/pnl
- Returns: All PnL entries for user
- Source: Database (CSV) or MT5 fallback
```

### Get Positions
```
GET /api/portfolio/positions
- Returns: Open MT5 positions
- Source: MT5 demo account
```

---

## ✅ Testing Steps

1. **Run SQL migration** (see above)
2. **Upload CSV file** in Portfolio page
3. **Check calendar** - should show PnL data
4. **Verify in Supabase:**
   - Go to Table Editor
   - Select `portfolio_pnl` table
   - See your uploaded data

---

## 🎨 What You'll See

After uploading CSV:
- ✅ Monthly PnL calendar with color-coded days
- ✅ Green = Profit days
- ✅ Red = Loss days
- ✅ Gray = Flat days
- ✅ Cumulative PnL tracking
- ✅ Statistics (best day, worst day, avg)

---

## 🔍 Troubleshooting

### If upload still fails:
1. Check Supabase SQL was run successfully
2. Verify table exists: `portfolio_pnl`
3. Check Railway logs for errors
4. Ensure SUPABASE_URL and keys are set

### If no data shows:
1. Check Supabase Table Editor
2. Verify data was inserted
3. Check user_id matches your auth user
4. Check RLS policies are active

---

## 📝 Files Changed

1. ✅ `services/portfolioService.js` - NEW Supabase service
2. ✅ `database/create-portfolio-pnl-table.sql` - NEW table migration
3. ✅ `routes/portfolio.js` - Updated to use Supabase
4. ✅ `models/PortfolioPnL.js` - No longer used (MongoDB)

---

## 🎯 Next Steps

1. **RUN THE SQL MIGRATION** in Supabase (most important!)
2. Test CSV upload
3. Verify data appears in calendar
4. Enjoy your portfolio tracking! 🚀

---

**Deployed:** Commit `559fb36`  
**Status:** ✅ Ready to test after SQL migration  
**Railway:** Auto-deployed in 2-3 minutes

