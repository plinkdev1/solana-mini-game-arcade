-- =====================================================
-- Sewer Arena: Admin Logs Table
-- Purpose: Log admin authentication and actions
-- =====================================================

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  action TEXT NOT NULL, -- 'login', 'logout', 'settings_change', etc.
  details JSONB DEFAULT '{}', -- Additional action details
  ip_address TEXT, -- For audit (optional)
  user_agent TEXT, -- For audit (optional)
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_rate_limits table (for rate limiting auth attempts)
CREATE TABLE IF NOT EXISTS admin_rate_limits (
  wallet TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMPTZ DEFAULT NOW(),
  locked_until TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_wallet ON admin_logs(wallet);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp DESC);

-- RLS Policies
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_rate_limits ENABLE ROW LEVEL SECURITY;

-- Admin logs: Service role can insert, admins can view
CREATE POLICY "service_role_insert_admin_logs" ON admin_logs
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "admins_view_admin_logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_wallets 
      WHERE wallet = auth.jwt() ->> 'wallet' 
      AND active = true
    )
  );

-- Rate limits: Service role only
CREATE POLICY "service_role_admin_rate_limits" ON admin_rate_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Realtime disabled for security
-- Admin logs are write-only, audit trail

COMMENT ON TABLE admin_logs IS 'Audit log for admin authentication and actions';
COMMENT ON TABLE admin_rate_limits IS 'Rate limiting for admin login attempts';
