-- Create powerup_events table for analytics tracking
CREATE TABLE IF NOT EXISTS powerup_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_hash TEXT NOT NULL, -- sha256(wallet) for privacy
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL, -- e.g., "tic-tac-toe", "bubble-flush"
  power_up_type TEXT NOT NULL, -- e.g., "flush_strike", "bandana_blind"
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  game_outcome TEXT, -- "win" or "loss"
  boost_active BOOLEAN DEFAULT FALSE,
  boost_percentage INTEGER DEFAULT 0,
  nft_equipped TEXT, -- NFT name if equipped
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE powerup_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can insert their own events
CREATE POLICY "Users can insert power-up events" ON powerup_events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR auth.role() = 'authenticated'
  );

-- RLS Policy: Admin only can select all events
CREATE POLICY "Admin can view all power-up events" ON powerup_events
  FOR SELECT USING (
    auth.uid() = (SELECT id FROM users WHERE email = 'admin@datxit.com' LIMIT 1)
  );

-- RLS Policy: Users can view their own events
CREATE POLICY "Users can view their own power-up events" ON powerup_events
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE powerup_events;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS powerup_events_user_id_idx ON powerup_events(user_id);
CREATE INDEX IF NOT EXISTS powerup_events_game_type_idx ON powerup_events(game_type);
CREATE INDEX IF NOT EXISTS powerup_events_power_up_type_idx ON powerup_events(power_up_type);
CREATE INDEX IF NOT EXISTS powerup_events_triggered_at_idx ON powerup_events(triggered_at DESC);
