-- Create portfolio_pnl table for storing daily P&L data
CREATE TABLE IF NOT EXISTS portfolio_pnl (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  pnl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  cumulative_pnl DECIMAL(15, 2) DEFAULT 0,
  source VARCHAR(50) DEFAULT 'csv',
  source_file JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one entry per user per date
  UNIQUE(user_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolio_pnl_user_id ON portfolio_pnl(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_pnl_date ON portfolio_pnl(date);
CREATE INDEX IF NOT EXISTS idx_portfolio_pnl_user_date ON portfolio_pnl(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE portfolio_pnl ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own PnL data
CREATE POLICY "Users can view own portfolio PnL"
  ON portfolio_pnl
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own PnL data
CREATE POLICY "Users can insert own portfolio PnL"
  ON portfolio_pnl
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own PnL data
CREATE POLICY "Users can update own portfolio PnL"
  ON portfolio_pnl
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own PnL data
CREATE POLICY "Users can delete own portfolio PnL"
  ON portfolio_pnl
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_portfolio_pnl_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER portfolio_pnl_updated_at
  BEFORE UPDATE ON portfolio_pnl
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_pnl_updated_at();

COMMENT ON TABLE portfolio_pnl IS 'Stores daily profit and loss data from CSV uploads or MT5 integration';
COMMENT ON COLUMN portfolio_pnl.user_id IS 'Reference to the user who owns this PnL data';
COMMENT ON COLUMN portfolio_pnl.date IS 'Trading date (YYYY-MM-DD format)';
COMMENT ON COLUMN portfolio_pnl.pnl IS 'Daily profit/loss amount';
COMMENT ON COLUMN portfolio_pnl.cumulative_pnl IS 'Running total of all PnL up to this date';
COMMENT ON COLUMN portfolio_pnl.source IS 'Source of data: csv, excel, mt5, api, manual';
COMMENT ON COLUMN portfolio_pnl.source_file IS 'Metadata about the uploaded file (JSON)';
