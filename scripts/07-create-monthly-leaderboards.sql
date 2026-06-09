-- Create monthly_leaderboards table to track monthly rankings
create table if not exists public.monthly_leaderboards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  month integer not null,
  year integer not null,
  wins integer default 0,
  losses integer default 0,
  total_bet_won numeric default 0,
  total_bet_lost numeric default 0,
  rank integer,
  datx_airdrop_amount numeric default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, month, year)
);

-- Enable RLS
alter table public.monthly_leaderboards enable row level security;

-- RLS policies
create policy "Monthly leaderboards are public readable"
  on public.monthly_leaderboards
  for select
  using (true);

create policy "Users can update their own monthly leaderboard"
  on public.monthly_leaderboards
  for update
  using (auth.uid() = user_id or auth.role() = 'authenticated');

create policy "Authenticated users can insert monthly leaderboard entries"
  on public.monthly_leaderboards
  for insert
  with check (auth.role() = 'authenticated');

-- Function to copy current leaderboard to monthly on month end
create or replace function public.reset_monthly_leaderboard()
returns void as $$
declare
  current_month int;
  current_year int;
begin
  current_month := extract(month from now());
  current_year := extract(year from now());
  
  -- Archive current leaderboard to monthly_leaderboards
  insert into public.monthly_leaderboards (user_id, month, year, wins, losses, total_bet_won, total_bet_lost, rank)
  select user_id, current_month, current_year, wins, losses, total_bet_won, total_bet_lost, rank
  from public.leaderboards
  where wins > 0 or losses > 0
  on conflict (user_id, month, year) do update set
    wins = excluded.wins,
    losses = excluded.losses,
    total_bet_won = excluded.total_bet_won,
    total_bet_lost = excluded.total_bet_lost,
    rank = excluded.rank,
    updated_at = now();
  
  -- Reset main leaderboard
  delete from public.leaderboards;
end;
$$ language plpgsql;

-- Enable realtime for monthly_leaderboards
alter publication supabase_realtime add table public.monthly_leaderboards;
