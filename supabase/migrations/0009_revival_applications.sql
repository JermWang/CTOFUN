-- ============================================================================
-- CTO.fun — revival applications (team-led takeovers funded by Pump.fun bounties)
-- ============================================================================
-- The core loop: CTO.fun's own SPL-token fees bankroll bounties on Pump.fun.
-- Teams do NOT pay to revive a dead token — they APPLY, prove they are a
-- competent team, get vetted/approved, deliver the revival, and claim the
-- bounty SOL as startup capital. Every step is public proof.
--
-- A row here is one team's application to lead the revival of one discovered
-- dead token (keyed by mint). Lifecycle:
--   pending   → submitted, awaiting review
--   approved  → team vetted & selected; bounty_amount_sol assigned
--   funded    → bounty escrowed/funded on Pump.fun (ops-recorded)
--   delivered → team submitted proof of completed revival work
--   paid      → bounty SOL released to the team (payout_tx recorded)
--   rejected  → not selected
--   failed    → approved but did not deliver
--
-- No public RLS policies: the Next.js server Data Access Layer reads/writes via
-- the service-role key (consistent with 0005_mainnet_security).
-- ============================================================================

create table if not exists revival_applications (
  id                 uuid primary key default gen_random_uuid(),
  -- The discovered dead token this team wants to lead (pump.fun mint).
  mint               text not null,
  token_name         text not null,
  token_symbol       text not null,
  token_image_url    text,
  -- Applicant + their team.
  applicant_id       uuid not null references users (id) on delete cascade,
  team_name          text not null,
  pitch              text not null,
  plan               text,
  team_size          smallint not null default 1,
  team_members       text,
  prior_work         text,
  -- Solana address the bounty SOL is paid to once the revival is delivered.
  payout_wallet      text not null,
  contact            text,
  -- Bounty assigned by CTO.fun on approval, funded from token fees via Pump.fun.
  bounty_amount_sol  numeric(20, 6),
  bounty_pumpfun_url text,
  -- Proof of delivered revival work (team-submitted).
  delivery_proof     text,
  delivery_links     text[] not null default '{}',
  delivered_at       timestamptz,
  -- Payout record (the on-chain SOL transfer to the team).
  payout_tx          text,
  paid_amount_sol    numeric(20, 6),
  paid_at            timestamptz,
  -- Review trail.
  review_notes       text,
  reviewed_by        uuid references users (id) on delete set null,
  reviewed_at        timestamptz,
  status             text not null default 'pending'
    check (status in ('pending', 'approved', 'funded', 'delivered', 'paid', 'rejected', 'failed')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- One live application per (team, token): a team can't spam the same mint while
-- an earlier attempt is still in play. Rejected/failed attempts may re-apply.
create unique index if not exists revival_applications_active_per_team_mint_idx
  on revival_applications (applicant_id, mint)
  where status in ('pending', 'approved', 'funded', 'delivered', 'paid');

create index if not exists revival_applications_status_idx
  on revival_applications (status, created_at desc);

create index if not exists revival_applications_mint_idx
  on revival_applications (mint);

alter table revival_applications enable row level security;

drop trigger if exists revival_applications_set_updated_at on revival_applications;
create trigger revival_applications_set_updated_at before update on revival_applications
  for each row execute function set_updated_at();
