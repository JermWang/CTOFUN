-- ============================================================================
-- CTO.fun - explicit revival targets
-- ============================================================================
-- Operators can mark discovered dead tokens as public revival targets without
-- creating a bounty or approving a team. Bounty creation and payout remain
-- manual, while the community-facing UI can clearly show which tokens are
-- being prioritized for a CTO.
-- ============================================================================

alter table discovered_dead_tokens
  drop constraint if exists discovered_dead_tokens_status_check;

alter table discovered_dead_tokens
  add constraint discovered_dead_tokens_status_check
  check (status in ('candidate', 'watchlist', 'targeted', 'rejected', 'imported'));

alter table discovered_dead_tokens
  add column if not exists revival_targeted_at timestamptz,
  add column if not exists revival_targeted_by uuid references users (id) on delete set null,
  add column if not exists revival_target_notes text;

create index if not exists discovered_dead_tokens_targeted_idx
  on discovered_dead_tokens (status, revival_targeted_at desc, qualification_score desc);
