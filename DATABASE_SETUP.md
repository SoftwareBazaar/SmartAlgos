# Database Setup Guide

## MT5 Connections Table

The `mt5_connections` table stores encrypted MT5 broker connection credentials.

### Create the Table

Run this SQL in your Supabase SQL Editor:

```sql
-- See database/mt5_connections_table.sql for the complete SQL
```

Or copy and paste the contents of `database/mt5_connections_table.sql` into the Supabase SQL Editor.

### Quick Setup Steps

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `database/mt5_connections_table.sql`
5. Paste into the editor
6. Click **Run** (or press Ctrl+Enter)

### What Gets Created

- ✅ `mt5_connections` table with all required columns
- ✅ Indexes for fast lookups
- ✅ Row Level Security (RLS) policies
- ✅ Automatic `updated_at` trigger

### After Setup

Once the table is created, MT5 connections will be stored in Supabase. If the table doesn't exist, the system will automatically use local file storage as a fallback.

### Verify Table Creation

Run this query to verify:

```sql
SELECT * FROM public.mt5_connections LIMIT 1;
```

You should see an empty result (no error), confirming the table exists.
