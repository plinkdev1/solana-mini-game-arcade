-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.games enable row level security;
alter table public.bets enable row level security;
alter table public.leaderboards enable row level security;
alter table public.treasury_logs enable row level security;
alter table public.game_history enable row level security;

-- Users table RLS
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id or true);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Games table RLS
create policy "Authenticated users can create games"
  on public.games for insert
  with check (auth.role() = 'authenticated');

create policy "Game players can view their games"
  on public.games for select
  using (auth.uid() = player1_id or auth.uid() = player2_id or true);

create policy "Game players can update their games"
  on public.games for update
  using (auth.uid() = player1_id or auth.uid() = player2_id);

-- Bets table RLS
create policy "Authenticated users can create bets"
  on public.bets for insert
  with check (auth.role() = 'authenticated');

create policy "Users can view bets for their games"
  on public.bets for select
  using (
    exists (
      select 1 from public.games
      where public.games.id = public.bets.game_id
      and (public.games.player1_id = auth.uid() or public.games.player2_id = auth.uid())
    )
  );

-- Leaderboards table RLS (public read, authenticated update)
create policy "Leaderboards are public readable"
  on public.leaderboards for select
  using (true);

create policy "Authenticated users can update leaderboards"
  on public.leaderboards for update
  using (auth.role() = 'authenticated');

-- Treasury logs RLS (public read for transparency)
create policy "Treasury logs are public readable"
  on public.treasury_logs for select
  using (true);

create policy "Authenticated users can insert treasury logs"
  on public.treasury_logs for insert
  with check (auth.role() = 'authenticated');

-- Game history RLS
create policy "Users can view their own game history"
  on public.game_history for select
  using (auth.uid() = user_id or true);

create policy "Authenticated users can create game history"
  on public.game_history for insert
  with check (auth.role() = 'authenticated');
