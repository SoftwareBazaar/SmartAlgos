-- Create mt5_connections table for storing MT5 connection credentials
-- This table stores encrypted MT5 broker connection details

CREATE TABLE IF NOT EXISTS public.mt5_connections (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT,
  broker TEXT,
  server TEXT NOT NULL,
  login TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('demo', 'live', 'prop')),
  leverage TEXT,
  timezone TEXT,
  is_demo BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  password_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mt5_connections_user_id ON public.mt5_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_mt5_connections_server_login ON public.mt5_connections(server, login);

-- Enable Row Level Security (RLS)
ALTER TABLE public.mt5_connections ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own connections
-- Note: Using service role key bypasses RLS, so we filter by user_id in code
CREATE POLICY "Users can view own connections"
  ON public.mt5_connections
  FOR SELECT
  USING (true); -- Allow all, filter by user_id in application code

-- Create policy: Users can insert their own connections
CREATE POLICY "Users can insert own connections"
  ON public.mt5_connections
  FOR INSERT
  WITH CHECK (true); -- Allow all, validate user_id in application code

-- Create policy: Users can update their own connections
CREATE POLICY "Users can update own connections"
  ON public.mt5_connections
  FOR UPDATE
  USING (true)
  WITH CHECK (true); -- Allow all, validate user_id in application code

-- Create policy: Users can delete their own connections
CREATE POLICY "Users can delete own connections"
  ON public.mt5_connections
  FOR DELETE
  USING (true); -- Allow all, validate user_id in application code

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mt5_connections_updated_at
  BEFORE UPDATE ON public.mt5_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.mt5_connections IS 'Stores encrypted MT5 broker connection credentials for users';
COMMENT ON COLUMN public.mt5_connections.password_encrypted IS 'Encrypted MT5 password using security service';
COMMENT ON COLUMN public.mt5_connections.metadata IS 'Additional connection metadata stored as JSON';

