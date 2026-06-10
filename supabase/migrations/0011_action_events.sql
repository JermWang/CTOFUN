-- ============================================================================
-- CTO.fun - action events for rate limiting
-- ============================================================================
-- Track user actions for rate limiting on sensitive operations like
-- submitting coins, applying for revivals, and other admin functions.
-- ============================================================================

create table if not exists action_events (
  id bigint primary key generated always as identity,
  user_id uuid not null references users (id) on delete cascade,
  action text not null,
  occurred_at timestamptz not null default now()
);

-- Enable RLS
alter table action_events enable row level security;

-- Rate limiting table is internal; no direct client access
create policy "action_events_no_client_access"
  on action_events
  for all
  using (false);

-- Service role can manage action events
create policy "action_events_service_role"
  on action_events
  for all
  using (auth.role() = 'service_role');

-- Create index for efficient rate limit queries
create index if not exists action_events_user_action_idx
  on action_events (user_id, action, occurred_at desc);

create index if not exists action_events_occurred_at_idx
  on action_events (occurred_at desc);
