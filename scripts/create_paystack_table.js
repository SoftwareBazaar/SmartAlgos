
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPaystackTable() {
    console.log('🚀 Creating Paystack Payments Table...');

    const sql = `
    CREATE TABLE IF NOT EXISTS public.paystack_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        amount_usd DECIMAL(10, 2) NOT NULL,
        amount_ngn DECIMAL(20, 2),
        paystack_reference TEXT UNIQUE,
        access_code TEXT,
        product_type TEXT DEFAULT 'ea_subscription',
        product_id UUID NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, confirmed, failed
        metadata JSONB DEFAULT '{}'::jsonb,
        paystack_data JSONB DEFAULT '{}'::jsonb,
        confirmed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public.paystack_payments ENABLE ROW LEVEL SECURITY;
    
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'paystack_payments' 
            AND policyname = 'Users can view their own paystack payments'
        ) THEN
            CREATE POLICY "Users can view their own paystack payments" ON public.paystack_payments
            FOR SELECT USING (auth.uid() = user_id);
        END IF;
    END
    $$;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    // If RPC fails (often does depending on extensions), we try raw query via PG or just creating via JS API (not possible for DDL usually via JS API unless owner)
    // Wait, Supabase JS client doesn't support raw SQL without a function like 'exec_sql' or using the REST API for query.
    // BUT we can use the 'postgres' package if installed, or just try to use a specialized endpoint if we have one.
    // Actually, look at existing scripts. `create-admin-in-database.js` uses `databaseService`.
    // Most existing scripts seem to assume we have direct access or use Service Role.
    // IF RPC `exec_sql` exists (custom function) it works.

    // Let's try the RPC method first, assuming user has it (common in these templates).
    // If it fails, I'll print a message.

    if (error) {
        console.warn('⚠️ Standard RPC execution failed:', error.message);
        console.log('Attempting alternative table creation or it might already exist...');
        // In many Supabase setups, you can't run DDL from client easily.
        // However, we can try to "select" from it to see if it exists.
    }

    // Check if table exists by selecting
    const { data, error: selectError } = await supabase
        .from('paystack_payments')
        .select('id')
        .limit(1);

    if (selectError) {
        if (selectError.code === '42P01') { // undefined_table
            console.error('❌ Table creation failed: Table still does not exist.');
            console.log('💡 You may need to run the SQL manually in Supabase SQL Editor.');
        } else {
            console.error('❌ Error checking table:', selectError.message);
        }
    } else {
        console.log('✅ Table `paystack_payments` is confirmed to exist!');
    }
}

createPaystackTable();
