-- Optional: Add oracle tracking to treasury_logs table
-- Note: Current Supabase schema already supports this via the existing tables

-- If you want to add oracle-specific tracking, create this supplementary table:
CREATE TABLE IF NOT EXISTS oracle_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  power_up_type TEXT NOT NULL,
  rng_result BIGINT,
  request_tx_signature TEXT,
  apply_tx_signature TEXT,
  cost_usd NUMERIC,
  oracle_feed TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE oracle_calls ENABLE ROW LEVEL SECURITY;

-- Public readable
CREATE POLICY "oracle_calls_public_read" ON oracle_calls
  FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "oracle_calls_insert" ON oracle_calls
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
