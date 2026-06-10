-- ============================================================================
-- Add PEPE bounty (1.5 SOL, 14 day deadline)
-- ============================================================================
-- First ensure PEPE exists in dead_coins table
insert into dead_coins (
  name,
  ticker,
  contract_address,
  chain,
  market_cap,
  liquidity,
  holder_count,
  telegram_status,
  website_status,
  status,
  meme_score,
  community_score,
  safety_score,
  liquidity_score,
  lore_score,
  ticker_score,
  difficulty_score,
  contributor_interest,
  revival_score,
  reason_died,
  reason_revive,
  risk_notes
) values (
  'Pepe',
  'PEPE',
  'GsR6Z8sxiz9oiLWYAMYDvJu9jf3QwNbCa8xK4Emfh7F3',
  'solana',
  9900,
  2400,
  1200,
  'Active',
  'Up',
  'candidate',
  9,
  7,
  8,
  6,
  8,
  9,
  4,
  7,
  78,
  'Market moved on, needs community revival',
  'Strong community interest, clean contract',
  'Monitor holder concentration'
) on conflict (ticker) do nothing;

-- Create revival campaign for PEPE (if not exists)
insert into revival_campaigns (
  dead_coin_id,
  slug,
  status,
  phase,
  start_date,
  total_bounty_spend,
  active_bounties,
  manifesto
) values (
  (select id from dead_coins where ticker = 'PEPE' limit 1),
  'pepe-revival',
  'active',
  'setup',
  now(),
  1.5,
  1,
  'PEPE revival bounty: $1.5 SOL bounty for community engagement.'
) on conflict (slug) do nothing;

-- Create bounty for PEPE revival (1.5 SOL, 14 days to complete)
insert into bounties (
  revival_campaign_id,
  title,
  description,
  category,
  reward_amount,
  reward_token,
  max_winners,
  deadline,
  status,
  proof_requirements,
  judging_criteria
) select
  c.id,
  'PEPE Revival Bounty',
  'Community engagement and holder outreach for PEPE revival.',
  'community_ops'::bounty_category,
  1.5,
  'SOL',
  1,
  now() + interval '14 days',
  'open'::bounty_status,
  'Holder outreach documentation and engagement metrics.',
  E'Community engagement\nOutreach quality\nHolder participation'
from revival_campaigns c
where c.slug = 'pepe-revival'
on conflict do nothing;
