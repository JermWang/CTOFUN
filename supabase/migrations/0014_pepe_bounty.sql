-- ============================================================================
-- Add PEPE bounty (1.5 SOL, 14 day deadline)
-- ============================================================================
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
