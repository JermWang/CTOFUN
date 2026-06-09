-- ============================================================================
-- CTO.fun — Bounty-Powered Dead Coin Revival Protocol
-- Initial schema migration
-- ============================================================================
-- Auth model: Privy is the identity provider. The `users` table is keyed by a
-- Privy DID (`privy_id`). All privileged writes go through the Next.js server
-- using the Supabase service-role key (which bypasses RLS). RLS is enabled on
-- every table with public read access for the data that the site shows
-- publicly, and no anon write access.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type user_role as enum ('member', 'scout', 'contributor', 'moderator', 'council', 'admin');

create type dead_coin_status as enum (
  'newly_submitted',
  'under_review',
  'candidate',
  'up_for_vote',
  'selected_for_revival',
  'active_revival',
  'graduated',
  'failed_revival',
  'blacklisted'
);

create type revival_phase as enum (
  'discovery',   -- 0
  'review',      -- 1
  'vote',        -- 2
  'setup',       -- 3
  'rebuild',     -- 4
  'relaunch',    -- 5
  'growth',      -- 6
  'graduation',  -- 7
  'archive'      -- 8
);

create type revival_status as enum ('active', 'graduated', 'failed', 'archived');

create type bounty_category as enum (
  'scout',
  'meme',
  'lore',
  'design',
  'website',
  'social',
  'video',
  'moderation',
  'community_ops',
  'dashboard',
  'research',
  'holder_outreach',
  'revival_audit'
);

create type bounty_status as enum ('open', 'in_review', 'completed', 'cancelled', 'expired');

create type submission_status as enum ('pending', 'approved', 'rejected', 'paid', 'disputed');

create type vote_target_type as enum ('dead_coin', 'hall_entry', 'bounty_template', 'governance');

create type vote_choice as enum ('revive', 'skip', 'needs_research', 'blacklist', 'watchlist', 'yes', 'no');

create type buyback_status as enum ('pending', 'executed', 'burned', 'recycled');

create type dispute_status as enum ('open', 'reviewing', 'resolved', 'rejected');

-- ----------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------
create table users (
  id                       uuid primary key default gen_random_uuid(),
  privy_id                 text unique not null,
  email                    text,
  wallet_address           text,
  username                 text unique,
  display_name             text,
  bio                      text,
  avatar_url               text,
  role                     user_role not null default 'member',
  reputation_score         integer not null default 0,
  total_bounties_completed integer not null default 0,
  total_rewards_earned     numeric(20, 4) not null default 0,
  specialties              text[] not null default '{}',
  account_verified         boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index users_username_idx on users (username);
create index users_wallet_idx on users (wallet_address);
create trigger users_set_updated_at before update on users
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- guilds
-- ----------------------------------------------------------------------------
create table guilds (
  id                 uuid primary key default gen_random_uuid(),
  name               text unique not null,
  slug               text unique not null,
  category           bounty_category,
  description        text,
  emblem_url         text,
  leader_id          uuid references users (id) on delete set null,
  total_earned       numeric(20, 4) not null default 0,
  completed_bounties integer not null default 0,
  reputation_score   integer not null default 0,
  win_rate           numeric(5, 2) not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger guilds_set_updated_at before update on guilds
  for each row execute function set_updated_at();

create table guild_members (
  guild_id  uuid not null references guilds (id) on delete cascade,
  user_id   uuid not null references users (id) on delete cascade,
  role      text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);

-- ----------------------------------------------------------------------------
-- dead_coins (The Graveyard)
-- ----------------------------------------------------------------------------
create table dead_coins (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  ticker              text not null,
  contract_address    text,
  chain               text not null default 'solana',
  chart_url           text,
  market_cap          numeric(20, 2),
  liquidity           numeric(20, 2),
  holder_count        integer,
  launch_date         date,
  old_socials         jsonb not null default '{}',
  old_website         text,
  telegram_status     text,
  website_status      text,
  last_dev_activity   date,
  status              dead_coin_status not null default 'newly_submitted',
  -- scoring (0-10 each, revival_score 0-100)
  meme_score          smallint,
  community_score     smallint,
  safety_score        smallint,
  liquidity_score     smallint,
  lore_score          smallint,
  ticker_score        smallint,
  difficulty_score    smallint,
  contributor_interest smallint,
  revival_score       smallint,
  reason_died         text,
  reason_revive       text,
  risk_notes          text,
  scout_notes         text,
  submitted_by        uuid references users (id) on delete set null,
  submitted_at        timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index dead_coins_status_idx on dead_coins (status);
create index dead_coins_chain_idx on dead_coins (chain);
create index dead_coins_score_idx on dead_coins (revival_score desc);
create trigger dead_coins_set_updated_at before update on dead_coins
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- revival_campaigns (Current Revivals)
-- ----------------------------------------------------------------------------
create table revival_campaigns (
  id                  uuid primary key default gen_random_uuid(),
  dead_coin_id        uuid not null references dead_coins (id) on delete cascade,
  slug                text unique not null,
  status              revival_status not null default 'active',
  phase               revival_phase not null default 'setup',
  start_date          timestamptz not null default now(),
  graduation_date     timestamptz,
  total_bounty_spend  numeric(20, 4) not null default 0,
  active_bounties     integer not null default 0,
  completed_bounties  integer not null default 0,
  contributors_count  integer not null default 0,
  new_website         text,
  new_telegram        text,
  new_x               text,
  manifesto           text,
  roadmap             text,
  risk_disclosure     text,
  before_metrics      jsonb not null default '{}',
  after_metrics       jsonb not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index revival_campaigns_status_idx on revival_campaigns (status);
create trigger revival_campaigns_set_updated_at before update on revival_campaigns
  for each row execute function set_updated_at();

create table revival_campaign_guilds (
  campaign_id uuid not null references revival_campaigns (id) on delete cascade,
  guild_id    uuid not null references guilds (id) on delete cascade,
  primary key (campaign_id, guild_id)
);

-- ----------------------------------------------------------------------------
-- bounties
-- ----------------------------------------------------------------------------
create table bounties (
  id                  uuid primary key default gen_random_uuid(),
  revival_campaign_id uuid references revival_campaigns (id) on delete cascade,
  title               text not null,
  description         text not null,
  category            bounty_category not null,
  reward_amount       numeric(20, 4) not null,
  reward_token        text not null default 'USDC',
  max_winners         integer not null default 1,
  deadline            timestamptz,
  status              bounty_status not null default 'open',
  proof_requirements  text,
  judging_criteria    text,
  rules               text,
  difficulty          text,
  created_by          uuid references users (id) on delete set null,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz,
  updated_at          timestamptz not null default now()
);
create index bounties_campaign_idx on bounties (revival_campaign_id);
create index bounties_status_idx on bounties (status);
create index bounties_category_idx on bounties (category);
create trigger bounties_set_updated_at before update on bounties
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- submissions
-- ----------------------------------------------------------------------------
create table submissions (
  id              uuid primary key default gen_random_uuid(),
  bounty_id       uuid not null references bounties (id) on delete cascade,
  contributor_id  uuid not null references users (id) on delete cascade,
  guild_id        uuid references guilds (id) on delete set null,
  submission_text text,
  file_url        text,
  link_url        text,
  status          submission_status not null default 'pending',
  rating          smallint,
  rejected_reason text,
  payout_tx       text,
  payout_amount   numeric(20, 4),
  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz,
  approved_at     timestamptz,
  updated_at      timestamptz not null default now()
);
create index submissions_bounty_idx on submissions (bounty_id);
create index submissions_contributor_idx on submissions (contributor_id);
create trigger submissions_set_updated_at before update on submissions
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- votes
-- ----------------------------------------------------------------------------
create table votes (
  id           uuid primary key default gen_random_uuid(),
  voter_id     uuid not null references users (id) on delete cascade,
  target_type  vote_target_type not null,
  target_id    uuid not null,
  vote         vote_choice not null,
  vote_weight  numeric(12, 4) not null default 1,
  created_at   timestamptz not null default now(),
  unique (voter_id, target_type, target_id)
);
create index votes_target_idx on votes (target_type, target_id);

-- ----------------------------------------------------------------------------
-- buybacks
-- ----------------------------------------------------------------------------
create table buybacks (
  id                 uuid primary key default gen_random_uuid(),
  fee_amount         numeric(20, 4) not null,
  token_amount_bought numeric(20, 4),
  buyback_tx         text,
  burn_tx            text,
  status             buyback_status not null default 'pending',
  source             text,
  occurred_at        timestamptz not null default now()
);
create index buybacks_occurred_idx on buybacks (occurred_at desc);

-- ----------------------------------------------------------------------------
-- disputes
-- ----------------------------------------------------------------------------
create table disputes (
  id            uuid primary key default gen_random_uuid(),
  bounty_id     uuid references bounties (id) on delete cascade,
  submission_id uuid references submissions (id) on delete cascade,
  opened_by     uuid references users (id) on delete set null,
  reason        text not null,
  evidence      text,
  status        dispute_status not null default 'open',
  resolution    text,
  resolved_by   uuid references users (id) on delete set null,
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz
);

-- ----------------------------------------------------------------------------
-- badges + user_badges
-- ----------------------------------------------------------------------------
create table badges (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  icon        text
);

create table user_badges (
  user_id    uuid not null references users (id) on delete cascade,
  badge_id   uuid not null references badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- Public read for everything the site shows publicly; writes happen via the
-- server using the service-role key (bypasses RLS). No anon writes are granted.

alter table users enable row level security;
alter table guilds enable row level security;
alter table guild_members enable row level security;
alter table dead_coins enable row level security;
alter table revival_campaigns enable row level security;
alter table revival_campaign_guilds enable row level security;
alter table bounties enable row level security;
alter table submissions enable row level security;
alter table votes enable row level security;
alter table buybacks enable row level security;
alter table disputes enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;

-- Public read policies
create policy "public read users"        on users        for select using (true);
create policy "public read guilds"       on guilds       for select using (true);
create policy "public read guild_members" on guild_members for select using (true);
create policy "public read dead_coins"   on dead_coins   for select using (true);
create policy "public read campaigns"    on revival_campaigns for select using (true);
create policy "public read campaign_guilds" on revival_campaign_guilds for select using (true);
create policy "public read bounties"     on bounties     for select using (true);
create policy "public read submissions"  on submissions  for select using (true);
create policy "public read votes"        on votes        for select using (true);
create policy "public read buybacks"     on buybacks     for select using (true);
create policy "public read disputes"     on disputes     for select using (true);
create policy "public read badges"       on badges       for select using (true);
create policy "public read user_badges"  on user_badges  for select using (true);
