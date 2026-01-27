-- ============================================
-- LICENSE GENERATION SYSTEM - DATABASE SCHEMA
-- ============================================

-- Main licenses table
CREATE TABLE IF NOT EXISTS ea_licenses (
    id SERIAL PRIMARY KEY,
    license_key VARCHAR(50) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    mt5_account VARCHAR(20) NOT NULL,
    license_type VARCHAR(10) NOT NULL, -- LT, W1, M1, M3, M6, Y1
    purchase_date DATE NOT NULL,
    expiry_date DATE, -- NULL for lifetime
    is_lifetime BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    payment_id VARCHAR(100),
    payment_amount DECIMAL(10,2),
    ea_id INTEGER REFERENCES expert_advisors(id),
    user_id INTEGER REFERENCES users_accounts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for fast lookups
    CONSTRAINT unique_license_key UNIQUE (license_key)
);

CREATE INDEX idx_ea_licenses_key ON ea_licenses(license_key);
CREATE INDEX idx_ea_licenses_email ON ea_licenses(customer_email);
CREATE INDEX idx_ea_licenses_account ON ea_licenses(mt5_account);
CREATE INDEX idx_ea_licenses_user ON ea_licenses(user_id);
CREATE INDEX idx_ea_licenses_ea ON ea_licenses(ea_id);
CREATE INDEX idx_ea_licenses_expiry ON ea_licenses(expiry_date);

-- License usage tracking table
CREATE TABLE IF NOT EXISTS ea_license_usage (
    id SERIAL PRIMARY KEY,
    license_key VARCHAR(50) NOT NULL,
    mt5_account VARCHAR(20) NOT NULL,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    platform_version VARCHAR(50),
    terminal_build VARCHAR(20),
    
    FOREIGN KEY (license_key) REFERENCES ea_licenses(license_key) ON DELETE CASCADE
);

CREATE INDEX idx_license_usage_key ON ea_license_usage(license_key);
CREATE INDEX idx_license_usage_account ON ea_license_usage(mt5_account);
CREATE INDEX idx_license_usage_last_used ON ea_license_usage(last_used);

-- License regeneration history
CREATE TABLE IF NOT EXISTS ea_license_regenerations (
    id SERIAL PRIMARY KEY,
    old_license_key VARCHAR(50) NOT NULL,
    new_license_key VARCHAR(50) NOT NULL,
    old_mt5_account VARCHAR(20) NOT NULL,
    new_mt5_account VARCHAR(20) NOT NULL,
    reason TEXT,
    regenerated_by INTEGER REFERENCES users_accounts(id),
    regenerated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (new_license_key) REFERENCES ea_licenses(license_key) ON DELETE CASCADE
);

CREATE INDEX idx_license_regen_old_key ON ea_license_regenerations(old_license_key);
CREATE INDEX idx_license_regen_new_key ON ea_license_regenerations(new_license_key);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ea_licenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ea_licenses_updated_at
    BEFORE UPDATE ON ea_licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_ea_licenses_updated_at();

-- Comments for documentation
COMMENT ON TABLE ea_licenses IS 'Stores all MT5 EA license keys with hardware locking';
COMMENT ON COLUMN ea_licenses.license_key IS 'Format: LB-[TYPE]-[HASH]-[EXPIRY]';
COMMENT ON COLUMN ea_licenses.mt5_account IS 'MT5 account number (hardware lock)';
COMMENT ON COLUMN ea_licenses.license_type IS 'LT=Lifetime, W1=Weekly, M1=Monthly, M3=3Months, M6=6Months, Y1=Yearly';
COMMENT ON COLUMN ea_licenses.expiry_date IS 'NULL for lifetime licenses, YYYY-MM-DD for rental';
