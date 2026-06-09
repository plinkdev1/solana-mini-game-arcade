-- Trigger to auto-update leaderboard rank
create or replace function public.update_leaderboard_rank()
returns trigger as $$
begin
  update public.leaderboards
  set rank = (
    select count(*) + 1
    from public.leaderboards as l2
    where l2.wins > new.wins or (l2.wins = new.wins and l2.total_bet_won > new.total_bet_won)
  ),
  updated_at = now()
  where id = new.id;
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_leaderboard_rank
after insert or update on public.leaderboards
for each row
execute function public.update_leaderboard_rank();

-- Trigger to update user stats when game ends
create or replace function public.update_user_stats()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    if new.winner_id is not null then
      update public.users
      set total_wins = total_wins + 1
      where id = new.winner_id;
      
      update public.users
      set total_losses = total_losses + 1
      where id in (new.player1_id, new.player2_id)
      and id != new.winner_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_user_stats
after update on public.games
for each row
execute function public.update_user_stats();
