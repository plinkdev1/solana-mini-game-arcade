-- Create users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  username text,
  email text,
  created_at timestamp with time zone default now(),
  last_login timestamp with time zone,
  total_wins integer default 0,
  total_losses integer default 0,
  datx_balance_mock decimal default 1000,
  updated_at timestamp with time zone default now()
);

-- Create games table
create table public.games (
  id uuid primary key default gen_random_uuid(),
  game_type text not null,
  player1_id uuid not null references public.users(id) on delete cascade,
  player2_id uuid not null references public.users(id) on delete cascade,
  status text default 'pending',
  winner_id uuid references public.users(id) on delete set null,
  bet_amount decimal default 0,
  started_at timestamp with time zone default now(),
  ended_at timestamp with time zone,
  moves jsonb default '[]',
  created_at timestamp with time zone default now()
);

-- Create bets table
create table public.bets (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.users(id) on delete cascade,
  amount decimal not null,
  status text default 'pending',
  tx_signature text,
  rake_treasury decimal default 0,
  rake_team decimal default 0,
  created_at timestamp with time zone default now()
);

-- Create leaderboards table
create table public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.users(id) on delete cascade,
  wins integer default 0,
  losses integer default 0,
  total_bet_won decimal default 0,
  total_bet_lost decimal default 0,
  rank integer,
  updated_at timestamp with time zone default now()
);

-- Create treasury_logs table
create table public.treasury_logs (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid references public.bets(id) on delete set null,
  treasury_amount decimal not null,
  team_amount decimal not null,
  tx_signature text,
  created_at timestamp with time zone default now()
);

-- Create game_history table for user stats
create table public.game_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  game_type text not null,
  opponent_id uuid references public.users(id) on delete set null,
  bet_amount decimal,
  result text,
  rake_paid decimal default 0,
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index idx_games_game_type on public.games(game_type);
create index idx_games_status on public.games(status);
create index idx_games_player1_id on public.games(player1_id);
create index idx_games_player2_id on public.games(player2_id);
create index idx_bets_game_id on public.bets(game_id);
create index idx_bets_player_id on public.bets(player_id);
create index idx_users_wallet_address on public.users(wallet_address);
create index idx_leaderboards_rank on public.leaderboards(rank);
create index idx_game_history_user_id on public.game_history(user_id);
create index idx_game_history_created_at on public.game_history(created_at);
