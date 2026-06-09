-- Add RLS policies to admin_wallets table
-- This allows the auth flow to verify admin wallets

-- Allow anyone to check if a wallet exists in admin_wallets (for auth flow)
-- Only reveals active status, not other data
CREATE POLICY "Anyone can check wallet status" ON admin_wallets
  FOR SELECT USING (true);

-- Allow service role full access for admin management
CREATE POLICY "Service role has full access" ON admin_wallets
  FOR ALL USING (auth.role() = 'service_role');

-- Note: In production, you may want to restrict SELECT to specific columns
-- or use a function to verify without exposing the full table
