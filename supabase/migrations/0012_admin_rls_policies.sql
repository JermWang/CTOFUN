-- ============================================================================
-- CTO.fun - add RLS policies for admin operations
-- ============================================================================
-- The service role needs explicit permission to update discovered_dead_tokens
-- for admin operations like marking revival targets. Without these policies,
-- updates fail even though service role bypasses RLS in theory. This ensures
-- explicit permission grants.
-- ============================================================================

-- Add policy allowing service role to update discovery tokens
create policy if not exists "service_role update tokens"
  on discovered_dead_tokens
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Add policy allowing service role to select tokens
create policy if not exists "service_role select tokens"
  on discovered_dead_tokens
  for select
  using (auth.role() = 'service_role');

-- Fix action_events table if it exists with wrong schema
-- Drop the potentially problematic version if it exists
drop table if exists action_events cascade;

-- Recreate action_events with correct structure matching migration 0005
create table if not exists action_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  action      text not null,
  occurred_at timestamptz not null default now()
);

create index if not exists action_events_user_action_time_idx
  on action_events (user_id, action, occurred_at desc);

alter table action_events enable row level security;

-- Ensure no public policies on action_events (service role only)
drop policy if exists "action_events_no_client_access" on action_events;
drop policy if exists "action_events_service_role" on action_events;
