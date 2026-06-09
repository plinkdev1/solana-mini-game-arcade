-- Create admin_config table for storing global settings
CREATE TABLE IF NOT EXISTS admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS - admin-only access
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_config_select" ON admin_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_config_update" ON admin_config
  FOR UPDATE USING (
    (SELECT COUNT(*) FROM auth.users WHERE id = auth.uid() AND email = ANY(string_to_array(current_setting('admin.wallets', true), ','))) > 0
  );

-- Insert default config values
INSERT INTO admin_config (key, value, description) VALUES
  ('network', 'devnet', 'Current Solana network: devnet or mainnet'),
  ('mock_mode_override', 'false', 'Force all users into mock mode (true/false)'),
  ('high_roller_min_hold', '100', 'Minimum DATX for high roller access (default 100)')
ON CONFLICT (key) DO NOTHING;

COMMIT;
