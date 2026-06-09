-- ============================================================================
-- CTO.fun — mainnet security hardening
-- ============================================================================
-- Public app rendering should go through the Next.js server Data Access Layer,
-- which returns DTOs. Do not expose raw Supabase tables directly to the browser.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Drop permissive public read policies from raw tables.
-- The service-role server client can still read/write for DTO rendering/actions.
-- ---------------------------------------------------------------------------
drop policy if exists "public read users" on users;
drop policy if exists "public read guilds" on guilds;
drop policy if exists "public read guild_members" on guild_members;
drop policy if exists "public read dead_coins" on dead_coins;
drop policy if exists "public read campaigns" on revival_campaigns;
drop policy if exists "public read campaign_guilds" on revival_campaign_guilds;
drop policy if exists "public read bounties" on bounties;
drop policy if exists "public read submissions" on submissions;
drop policy if exists "public read votes" on votes;
drop policy if exists "public read buybacks" on buybacks;
drop policy if exists "public read disputes" on disputes;
drop policy if exists "public read badges" on badges;
drop policy if exists "public read user_badges" on user_badges;

-- ---------------------------------------------------------------------------
-- Server-action rate limiting ledger.
-- No public policies: only service-role can read/write.
-- ---------------------------------------------------------------------------
create table if not exists action_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  action      text not null,
  occurred_at timestamptz not null default now()
);

create index if not exists action_events_user_action_time_idx
  on action_events (user_id, action, occurred_at desc);

alter table action_events enable row level security;

-- ---------------------------------------------------------------------------
-- Keep dead_coins vote counters synchronized at the database layer too.
-- This makes denormalized tallies resilient to concurrent Server Actions.
-- ---------------------------------------------------------------------------
create or replace function refresh_dead_coin_vote_counts(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update dead_coins
  set
    votes_revive = (
      select count(*)::int from votes
      where target_type = 'dead_coin' and target_id = target and vote = 'revive'
    ),
    votes_skip = (
      select count(*)::int from votes
      where target_type = 'dead_coin' and target_id = target and vote = 'skip'
    ),
    votes_research = (
      select count(*)::int from votes
      where target_type = 'dead_coin' and target_id = target and vote = 'needs_research'
    )
  where id = target;
end;
$$;

create or replace function sync_dead_coin_vote_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.target_type = 'dead_coin' then
    perform refresh_dead_coin_vote_counts(old.target_id);
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.target_type = 'dead_coin' then
    perform refresh_dead_coin_vote_counts(new.target_id);
  end if;

  return null;
end;
$$;

drop trigger if exists votes_sync_dead_coin_counts on votes;
create trigger votes_sync_dead_coin_counts
after insert or update or delete on votes
for each row execute function sync_dead_coin_vote_counts();

