-- M-Pesa Transactions Table
-- Stores M-Pesa STK Push payment transactions

CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- M-Pesa Transaction Identifiers
    merchant_request_id VARCHAR(255),
    checkout_request_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Payment Details
    amount NUMERIC(12, 2) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    account_reference VARCHAR(255),
    transaction_desc TEXT,
    
    -- Transaction Status
    status VARCHAR(50) DEFAULT 'pending',
    -- Possible statuses: 'pending', 'completed', 'failed', 'cancelled', 'timeout'
    
    result_code VARCHAR(10),
    result_desc TEXT,
    
    -- M-Pesa Receipt Information
    mpesa_receipt_number VARCHAR(255),
    transaction_date BIGINT, -- M-Pesa timestamp
    
    -- Additional Data
    metadata JSONB,
    callback_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_mpesa_user_id ON mpesa_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_checkout_request ON mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_phone_number ON mpesa_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_mpesa_receipt ON mpesa_transactions(mpesa_receipt_number);
CREATE INDEX IF NOT EXISTS idx_mpesa_created_at ON mpesa_transactions(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_mpesa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mpesa_updated_at
    BEFORE UPDATE ON mpesa_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_mpesa_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own transactions
CREATE POLICY "Users can view own mpesa transactions"
    ON mpesa_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own mpesa transactions"
    ON mpesa_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for callbacks)
CREATE POLICY "Service role can manage all mpesa transactions"
    ON mpesa_transactions
    FOR ALL
    USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE mpesa_transactions IS 'Stores M-Pesa Daraja API STK Push payment transactions';
COMMENT ON COLUMN mpesa_transactions.merchant_request_id IS 'M-Pesa Merchant Request ID from STK Push response';
COMMENT ON COLUMN mpesa_transactions.checkout_request_id IS 'Unique M-Pesa Checkout Request ID';
COMMENT ON COLUMN mpesa_transactions.amount IS 'Transaction amount in KES';
COMMENT ON COLUMN mpesa_transactions.phone_number IS 'Customer phone number in format 254XXXXXXXXX';
COMMENT ON COLUMN mpesa_transactions.status IS 'Transaction status: pending, completed, failed, cancelled, timeout';
COMMENT ON COLUMN mpesa_transactions.result_code IS 'M-Pesa result code from callback (0 = success)';
COMMENT ON COLUMN mpesa_transactions.mpesa_receipt_number IS 'M-Pesa receipt number for successful transactions';
COMMENT ON COLUMN mpesa_transactions.transaction_date IS 'M-Pesa transaction timestamp';
COMMENT ON COLUMN mpesa_transactions.metadata IS 'Additional metadata stored with transaction';
COMMENT ON COLUMN mpesa_transactions.callback_data IS 'Full callback data from M-Pesa webhook';

