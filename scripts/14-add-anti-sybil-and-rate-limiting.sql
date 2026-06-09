-- Add anti-sybil and rate limiting fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wallet_verified boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS captcha_completed boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_captcha_time timestamp with time zone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS games_played_hourly integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_games_hourly_reset timestamp with time zone DEFAULT now();

-- Create indexes for anti-sybil checks
CREATE INDEX IF NOT EXISTS idx_users_wallet_verified ON public.users(wallet_verified);
CREATE INDEX IF NOT EXISTS idx_users_captcha_completed ON public.users(captcha_completed);
CREATE INDEX IF NOT EXISTS idx_users_games_played_hourly ON public.users(games_played_hourly);

-- Add comments
COMMENT ON COLUMN public.users.wallet_verified IS 'True if wallet address has been verified as unique (anti-Sybil)';
COMMENT ON COLUMN public.users.captcha_completed IS 'True if user has completed CAPTCHA verification on first join';
COMMENT ON COLUMN public.users.games_played_hourly IS 'Count of games played in current hour (max 10 per hour rate limit)';
