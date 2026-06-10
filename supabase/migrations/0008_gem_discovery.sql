-- ============================================================================
-- CTO.fun — GEM discovery fields
-- ============================================================================
-- Adds the abandoned-gem signals to discovered_dead_tokens: verified holder
-- counts (Helius), lifetime volume (indexed or estimated), and the gem
-- verdict produced by the sweeper's scoring formula.
-- ============================================================================

alter table discovered_dead_tokens
  add column if not exists holder_count integer,
  add column if not exists lifetime_volume_usd numeric,
  add column if not exists lifetime_volume_source text,
  add column if not exists is_gem boolean not null default false,
  add column if not exists gem_score integer not null default 0,
  add column if not exists gem_reasons jsonb not null default '[]'::jsonb;

create index if not exists discovered_dead_tokens_gem_idx
  on discovered_dead_tokens (is_gem desc, gem_score desc);
