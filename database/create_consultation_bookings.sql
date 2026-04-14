-- ============================================================
-- Consultation Bookings Table
-- Smart Algos Trading Platform
-- ============================================================
-- Run this in your Supabase SQL Editor once.
-- ============================================================

CREATE TABLE IF NOT EXISTS consultation_bookings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference            TEXT UNIQUE NOT NULL,
  service              TEXT NOT NULL,           -- algo_development | stock_trading | forex_trading | web_development | other
  consultation_type    TEXT NOT NULL,           -- free_30 | paid_90
  date                 DATE NOT NULL,
  time                 TEXT NOT NULL,           -- HH:MM (24h)
  name                 TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT,
  notes                TEXT,
  amount               NUMERIC(10,2) DEFAULT 0,
  currency             TEXT DEFAULT 'USD',
  status               TEXT DEFAULT 'pending',  -- pending | confirmed | cancelled | completed
  payment_status       TEXT DEFAULT 'free',     -- free | pending | paid | failed
  paystack_payment_id  TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_email      ON consultation_bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_date       ON consultation_bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference  ON consultation_bookings(reference);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_booking_timestamp ON consultation_bookings;
CREATE TRIGGER trg_update_booking_timestamp
  BEFORE UPDATE ON consultation_bookings
  FOR EACH ROW EXECUTE FUNCTION update_booking_updated_at();

-- Row Level Security: admins see all, public can insert
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a booking (public landing page)
DROP POLICY IF EXISTS "allow_public_insert_booking" ON consultation_bookings;
CREATE POLICY "allow_public_insert_booking"
  ON consultation_bookings FOR INSERT
  WITH CHECK (true);

-- Allow service role (backend) full access
DROP POLICY IF EXISTS "allow_service_role_all" ON consultation_bookings;
CREATE POLICY "allow_service_role_all"
  ON consultation_bookings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify table was created
SELECT 'consultation_bookings table created successfully ✅' AS result;
