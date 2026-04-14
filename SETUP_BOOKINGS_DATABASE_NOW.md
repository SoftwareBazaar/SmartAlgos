# Setup Bookings Database Table

## Quick Setup (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com
2. Open your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run This SQL

Copy and paste this entire SQL script:

```sql
-- Create consultation_bookings table
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  service TEXT NOT NULL,
  consultation_type TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  amount NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  paystack_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON consultation_bookings(reference);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON consultation_bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON consultation_bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON consultation_bookings(status);

-- Enable Row Level Security
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role (backend) full access
CREATE POLICY "Service role has full access" ON consultation_bookings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to view their own bookings
CREATE POLICY "Users can view own bookings" ON consultation_bookings
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Policy: Allow public to insert bookings (for booking form)
CREATE POLICY "Anyone can create bookings" ON consultation_bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE consultation_bookings IS 'Stores consultation booking requests';
```

### Step 3: Click "Run" or Press F5

You should see: `Success. No rows returned`

### Step 4: Verify Table Created

Run this query to check:

```sql
SELECT * FROM consultation_bookings LIMIT 5;
```

Should return empty result (no bookings yet) but no errors.

---

## Check Existing Bookings

After the table is created and you make some test bookings, check them with:

```sql
-- View all bookings
SELECT 
  reference,
  name,
  email,
  service,
  consultation_type,
  date,
  time,
  status,
  payment_status,
  created_at
FROM consultation_bookings
ORDER BY created_at DESC;
```

---

## View Bookings by Status

```sql
-- Pending bookings
SELECT * FROM consultation_bookings 
WHERE status = 'pending' 
ORDER BY date, time;

-- Confirmed bookings
SELECT * FROM consultation_bookings 
WHERE status = 'confirmed' 
ORDER BY date, time;

-- Free consultations
SELECT * FROM consultation_bookings 
WHERE consultation_type = 'free_30' 
ORDER BY created_at DESC;

-- Paid consultations
SELECT * FROM consultation_bookings 
WHERE consultation_type = 'paid_90' 
ORDER BY created_at DESC;
```

---

## Update Booking Status

If you need to manually update a booking:

```sql
-- Mark as confirmed
UPDATE consultation_bookings 
SET status = 'confirmed', updated_at = NOW()
WHERE reference = 'BOOK-1234567890-ABC123';

-- Mark as completed
UPDATE consultation_bookings 
SET status = 'completed', updated_at = NOW()
WHERE reference = 'BOOK-1234567890-ABC123';

-- Cancel a booking
UPDATE consultation_bookings 
SET status = 'cancelled', updated_at = NOW()
WHERE reference = 'BOOK-1234567890-ABC123';
```

---

## Export Bookings to CSV

In Supabase SQL Editor:
1. Run your query
2. Click "Download CSV" button
3. Open in Excel or Google Sheets

---

## Common Queries

### Today's Bookings
```sql
SELECT * FROM consultation_bookings 
WHERE date = CURRENT_DATE 
ORDER BY time;
```

### This Week's Bookings
```sql
SELECT * FROM consultation_bookings 
WHERE date >= CURRENT_DATE 
  AND date < CURRENT_DATE + INTERVAL '7 days'
ORDER BY date, time;
```

### Bookings by Service
```sql
SELECT 
  service,
  COUNT(*) as total_bookings,
  SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as total_revenue
FROM consultation_bookings
GROUP BY service
ORDER BY total_bookings DESC;
```

### Revenue Summary
```sql
SELECT 
  COUNT(*) as total_bookings,
  SUM(CASE WHEN payment_status = 'free' THEN 1 ELSE 0 END) as free_bookings,
  SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_bookings,
  SUM(amount) as total_revenue
FROM consultation_bookings;
```

---

## Troubleshooting

### Error: "relation already exists"
Table is already created. Skip to Step 4 to verify.

### Error: "permission denied"
Make sure you're using the service role key in Railway environment variables.

### No bookings showing up
1. Check Railway logs for errors
2. Try making a test booking
3. Run: `SELECT * FROM consultation_bookings;`

---

## Next Steps

1. ✅ Create the table (run the SQL above)
2. 🧪 Test a booking on the website
3. 📊 Check the database to see the booking
4. 📧 (Optional) Fix email configuration later

The booking system will work perfectly without emails - all data is saved to the database!
