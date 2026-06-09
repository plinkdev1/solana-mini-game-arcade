-- Create admin_wallets table for storing authorized admin wallets
-- SECURITY: Admin wallet list is stored in Supabase, not exposed to frontend

CREATE TABLE IF NOT EXISTS admin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  notes TEXT
);

-- Enable RLS - service role only (no public access)
ALTER TABLE admin_wallets ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role can access
-- This ensures wallet list is never exposed to frontend

-- Create rate_limits table for API protection
CREATE TABLE IF NOT EXISTS admin_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP DEFAULT now(),
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE admin_rate_limits ENABLE ROW LEVEL SECURITY;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_wallets_wallet ON admin_wallets(wallet);
CREATE INDEX IF NOT EXISTS idx_admin_rate_limits_wallet ON admin_rate_limits(wallet);

COMMIT;
