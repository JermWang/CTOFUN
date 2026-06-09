-- ============================================================================
-- CTO.fun - automatic dead-token discovery staging
-- ============================================================================
-- Stores sweeper candidates separately from reviewed dead_coins. These rows are
-- source intelligence, not endorsed revival submissions.
-- ============================================================================

create table if not exists discovered_dead_tokens (
  id                    uuid primary key default gen_random_uuid(),
  source                text not null default 'pump.fun',
  source_token_id       text,
  mint                  text not null unique,
  name                  text not null,
  symbol                text not null,
  description           text,
  image_url             text,
  pump_url              text,
  chart_url             text,
  website_url           text,
  twitter_url           text,
  telegram_url          text,
  source_created_at     timestamptz,
  last_trade_at         timestamptz,
  dormant_days          integer not null default 0,
  reply_count           integer not null default 0,
  migrated              boolean not null default false,
  raydium_pool          text,
  market_cap_usd        numeric(20, 4),
  liquidity_usd         numeric(20, 4),
  volume_24h_usd        numeric(20, 4),
  historical_volume_usd numeric(20, 4),
  historical_volume_source text,
  ath_market_cap_usd    numeric(20, 4),
  ath_market_cap_at     timestamptz,
  qualification_score   smallint not null default 0,
  revival_score         smallint not null default 0,
  qualification_reasons text[] not null default '{}',
  status                text not null default 'candidate'
    check (status in ('candidate', 'watchlist', 'rejected', 'imported')),
  raw_source            jsonb not null default '{}',
  swept_at              timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists discovered_dead_tokens_status_score_idx
  on discovered_dead_tokens (status, qualification_score desc);

create index if not exists discovered_dead_tokens_last_trade_idx
  on discovered_dead_tokens (last_trade_at asc);

create index if not exists discovered_dead_tokens_source_idx
  on discovered_dead_tokens (source);

alter table discovered_dead_tokens enable row level security;

drop trigger if exists discovered_dead_tokens_set_updated_at on discovered_dead_tokens;
create trigger discovered_dead_tokens_set_updated_at before update on discovered_dead_tokens
  for each row execute function set_updated_at();
