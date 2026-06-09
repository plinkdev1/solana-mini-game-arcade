-- Add NFT holding and session tracking fields to users table for high roller gating
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS holds_sewer_rebels_nft boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nft_rarity text; -- 'common', 'rare', 'legendary'
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS games_high_roller_hourly integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_high_roller_reset timestamp with time zone DEFAULT now();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_sewer_rebels ON public.users(holds_sewer_rebels_nft);
CREATE INDEX IF NOT EXISTS idx_users_nft_rarity ON public.users(nft_rarity);
CREATE INDEX IF NOT EXISTS idx_users_high_roller_hourly ON public.users(games_high_roller_hourly);

-- Add comment documenting the fields
COMMENT ON COLUMN public.users.holds_sewer_rebels_nft IS 'True if user holds any Sewer Rebels NFT';
COMMENT ON COLUMN public.users.nft_rarity IS 'NFT rarity tier: common (+0%), rare (+5% power-ups), legendary (+10% power-ups)';
COMMENT ON COLUMN public.users.games_high_roller_hourly IS 'Count of high roller games played in current hour (max 3)';
