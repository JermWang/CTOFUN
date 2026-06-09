-- ============================================================================
-- CTO.fun - discovered token category intelligence
-- ============================================================================
-- Adds automatic meme-category classification and revival signal metadata to
-- Pump.fun discovery rows. These fields are source intelligence, not council
-- endorsement.
-- ============================================================================

alter table discovered_dead_tokens
  add column if not exists categories text[] not null default '{}',
  add column if not exists category_scores jsonb not null default '{}',
  add column if not exists category_confidence smallint not null default 0,
  add column if not exists discovery_signals text[] not null default '{}';

create index if not exists discovered_dead_tokens_categories_gin_idx
  on discovered_dead_tokens using gin (categories);

create index if not exists discovered_dead_tokens_category_confidence_idx
  on discovered_dead_tokens (category_confidence desc);
