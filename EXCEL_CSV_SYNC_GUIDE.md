# Excel/CSV Data Synchronization Guide

## Overview

Your dashboard displays trading data that comes from **three possible sources**:

1. **CSV/Excel Uploads** (Primary) - Manual uploads via Portfolio page
2. **MT5 Integration** (Fallback) - Real-time data from MetaTrader 5 terminal
3. **Demo Data** (Default) - Sample data for demonstration

## Where Dashboard Data Comes From

### Dashboard Statistics
Located at: `Dashboard` page (top cards)

**Data Source**: `/api/users/dashboard-stats` endpoint
- Portfolio Value
- Today's P&L
- Active Signals
- Win Rate

**Current Status**: Uses demo/fallback data when API returns no data

### Portfolio PnL Calendar
Located at: `Portfolio` page (monthly calendar view)

**Data Source**: `/api/portfolio/pnl` endpoint
- Displays daily profit/loss
- Color-coded calendar (green = profit, red = loss, gray = flat)
- Monthly totals and statistics

**Data Priority**:
1. Database (from CSV uploads) ✅ **Recommended**
2. MT5 real-time data (if connected)
3. Default sample data

---

## How to Upload Excel/CSV Data

### Step 1: Prepare Your File

Your Excel or CSV file should contain trading data with these columns:

**Required Columns** (detected automatically):
- **Date Column**: `Date`, `Time`, `Open Time`, `Close Time`, `date`, `time`
- **Profit Column**: `Profit`, `P/L`, `PnL`, `profit`, `pnl`, `Net P/L`
- **Symbol Column** (optional): `Symbol`, `Pair`, `Instrument`, `symbol`

**Example CSV Format**:
```csv
Date,Symbol,Profit
2024-01-02,EURUSD,450.00
2024-01-03,GBPUSD,-220.00
2024-01-04,USDJPY,180.00
```

**Example Excel Format**:
| Date       | Symbol | Profit  |
|------------|--------|---------|
| 2024-01-02 | EURUSD | 450.00  |
| 2024-01-03 | GBPUSD | -220.00 |
| 2024-01-04 | USDJPY | 180.00  |

### Step 2: Upload via Portfolio Page

1. Navigate to **Portfolio** page
2. Find the **"Upload Portfolio CSV"** section
3. Click **"Choose CSV"** button
4. Select your Excel (.xlsx, .xls) or CSV (.csv) file
5. Click **"Upload & Preview"**

### Step 3: Review Preview

After upload, you'll see:
- **Preview**: First 8 lines of your file
- **PnL Summary**: Total profit, average daily, positive/negative days
- **CSV Details**: Rows parsed, detected columns, skipped rows

### Step 4: Data is Automatically Saved

✅ **Your data is automatically saved to the database!**

The system will:
- Parse your file and extract PnL data
- Save entries to `portfolio_pnl` table in Supabase
- Update the monthly calendar immediately
- Calculate cumulative PnL

---

## Supported File Formats

### Excel Files
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- Maximum file size: **5MB**

### CSV Files
- `.csv` (Comma-separated values)
- UTF-8 encoding recommended
- Maximum file size: **5MB**

### Broker Export Formats

The system automatically detects formats from:
- **MT4/MT5** account statements
- **Polygon.io** flat files
- **Generic broker** CSV exports

---

## How Data Appears on Dashboard

### Portfolio Page Calendar

After uploading, your data appears in the **Monthly PnL Calendar**:

```
┌─────────────────────────────────────┐
│  Monthly PnL - January 2024         │
│  Total: +$2,150                     │
├─────────────────────────────────────┤
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat │
│   1    2    3    4    5    6    7  │
│       +450 -220 +180 +720 -310 +940│
│   8    9   10   11   12   13   14  │
│  -120  0  +420 +280 -640 +390 +210 │
└─────────────────────────────────────┘
```

**Color Coding**:
- 🟢 **Green** = Profitable day
- 🔴 **Red** = Loss day
- ⚫ **Gray** = Flat/no trades

### Dashboard Statistics

The dashboard pulls aggregated data from your uploads:
- **Portfolio Value**: Calculated from cumulative PnL
- **Today's P&L**: Latest day's profit/loss
- **Win Rate**: Percentage of profitable days

---

## Database Storage

### Table: `portfolio_pnl`

Your uploaded data is stored in Supabase:

```sql
CREATE TABLE portfolio_pnl (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  pnl DECIMAL(15,2) NOT NULL,
  cumulative_pnl DECIMAL(15,2),
  source VARCHAR(50),
  source_file JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, date)
);
```

**Key Features**:
- **Upsert Logic**: Uploading same date overwrites previous data
- **Cumulative PnL**: Automatically calculated running total
- **Source Tracking**: Remembers which file data came from
- **User Isolation**: Each user's data is separate

---

## API Endpoints

### Upload CSV/Excel
```
POST /api/portfolio/upload-csv
Content-Type: multipart/form-data

Body: { file: <your-file> }
```

**Response**:
```json
{
  "message": "File processed and saved successfully",
  "originalName": "trading_history.xlsx",
  "entriesCount": 22,
  "analysis": {
    "parsedRows": 22,
    "totalRows": 23,
    "pnlEntries": [...],
    "totals": {
      "totalProfit": 2150.00,
      "averageDailyProfit": 97.73,
      "positiveDays": 14,
      "negativeDays": 7,
      "flatDays": 1
    }
  }
}
```

### Get PnL Data
```
GET /api/portfolio/pnl
```

**Response**:
```json
{
  "success": true,
  "data": [
    { "date": "2024-01-02", "pnl": 450.00 },
    { "date": "2024-01-03", "pnl": -220.00 }
  ],
  "source": "database"
}
```

---

## Troubleshooting

### Issue: "No data detected"

**Causes**:
- File has no recognizable date or profit columns
- File is empty or corrupted
- Wrong file format

**Solution**:
1. Check your file has `Date` and `Profit` columns
2. Ensure dates are in format: `YYYY-MM-DD` or `MM/DD/YYYY`
3. Ensure profit values are numbers (not text)

### Issue: "Some rows skipped"

**Causes**:
- Header rows without data
- Invalid date formats
- Missing profit values

**Solution**:
- Review the preview to see which rows were skipped
- Clean up your Excel file to remove empty rows
- Ensure all dates are valid

### Issue: Calendar shows default data

**Causes**:
- No CSV uploaded yet
- Upload failed silently
- Database connection issue

**Solution**:
1. Upload a CSV file via Portfolio page
2. Check browser console for errors
3. Verify file was processed (check preview)
4. Refresh the page

### Issue: Dashboard shows $0

**Causes**:
- Dashboard stats endpoint not connected to database yet
- No data uploaded
- API error

**Solution**:
1. Upload CSV data first
2. Check `/api/users/dashboard-stats` endpoint
3. Verify database has entries: `SELECT * FROM portfolio_pnl WHERE user_id = '<your-id>'`

---

## Advanced: MT5 Integration

If you have MetaTrader 5 installed locally, you can enable real-time data sync:

### Requirements
- MT5 terminal installed on your computer
- MT5 Python API package
- Local development environment (not Railway)

### Enable MT5 Sync

1. Install MT5 Python package:
```bash
pip install MetaTrader5
```

2. Configure MT5 credentials in `.env`:
```env
MT5_ENABLED=true
MT5_LOGIN=your_account_number
MT5_PASSWORD=your_password
MT5_SERVER=your_broker_server
```

3. Restart server - data will sync automatically

**Note**: MT5 integration is disabled on Railway (cloud) deployment as it requires local MT5 terminal installation.

---

## Best Practices

### 1. Regular Uploads
- Upload your trading statements weekly or monthly
- Keep file names organized: `trading_2024_01.xlsx`

### 2. Data Consistency
- Use same date format across all uploads
- Ensure profit values include commissions/fees
- Don't mix different account currencies

### 3. Backup Your Files
- Keep original Excel/CSV files as backup
- Database stores processed data, not original files

### 4. Review Before Upload
- Check preview after upload
- Verify totals match your expectations
- Look for skipped rows

---

## File Location

Uploaded files are temporarily stored in:
```
/uploads/portfolio-csv/
```

**Note**: Only processed data is saved to database. Original files are kept for reference but not required for dashboard display.

---

## Summary

✅ **To sync Excel data to dashboard**:
1. Go to Portfolio page
2. Click "Choose CSV" and select your Excel/CSV file
3. Click "Upload & Preview"
4. Data automatically appears in monthly calendar
5. Dashboard stats update on next page load

✅ **Data flows**:
```
Excel/CSV File
    ↓
Upload via Portfolio Page
    ↓
Parse & Validate
    ↓
Save to Supabase (portfolio_pnl table)
    ↓
Display in Calendar & Dashboard
```

✅ **Supported formats**: Excel (.xlsx, .xls), CSV (.csv)

✅ **Max file size**: 5MB

✅ **Auto-detection**: Date and Profit columns detected automatically

---

## Need Help?

If you're still having issues:

1. Check browser console for errors (F12)
2. Verify file format matches examples above
3. Test with a small sample file first
4. Check Railway logs if deployed: `railway logs`

For technical support, provide:
- Sample of your Excel/CSV file (first few rows)
- Error messages from browser console
- Upload preview screenshot
