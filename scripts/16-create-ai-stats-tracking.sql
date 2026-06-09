-- Create AI stats tracking table for free AI mode games
CREATE TABLE IF NOT EXISTS public.ai_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  ai_difficulty text NOT NULL CHECK (ai_difficulty IN ('easy', 'hard')),
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  total_games integer GENERATED ALWAYS AS (wins + losses + draws) STORED,
  avg_duration_seconds integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_stats_user_id ON public.ai_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_stats_game_type ON public.ai_stats(game_type);
CREATE INDEX IF NOT EXISTS idx_ai_stats_user_game ON public.ai_stats(user_id, game_type);

-- Enable RLS
ALTER TABLE public.ai_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI stats" ON public.ai_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI stats" ON public.ai_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI stats" ON public.ai_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.ai_stats IS 'Tracks player stats against AI/NPC El Shito (free mode)';
COMMENT ON COLUMN public.ai_stats.ai_difficulty IS 'AI difficulty level: easy (random) or hard (minimax)';
