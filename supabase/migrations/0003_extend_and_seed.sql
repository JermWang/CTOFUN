-- ============================================================================
-- CTO.fun — schema extensions + demo content seed
-- Applied to the live project (hemaeouyjjafcpypbrsf). Safe to re-run.
-- ============================================================================

-- Denormalized vote counters shown on dead-coin cards/profiles.
alter table dead_coins
  add column if not exists votes_revive integer not null default 0,
  add column if not exists votes_skip integer not null default 0,
  add column if not exists votes_research integer not null default 0;

-- Display-only counter for contributor profiles.
alter table users add column if not exists revivals_helped integer not null default 0;

-- ----------------------------------------------------------------------------
-- Demo content (contributors, dead coins, campaigns, bounties, buybacks, links)
-- ----------------------------------------------------------------------------
insert into users (privy_id, username, display_name, bio, role, reputation_score, total_bounties_completed, total_rewards_earned, revivals_helped, specialties) values
  ('seed:gravedigger', 'gravedigger.sol', 'Gravedigger', 'Professional necromancer. I find coins the market gave up on.', 'scout', 920, 34, 4120, 7, '{Scouting,Contract triage}'),
  ('seed:meme_md', 'meme_md', 'Meme MD', 'I make charts laugh. Meme Medics lead.', 'contributor', 1080, 58, 5230, 9, '{Memes,Reaction packs}'),
  ('seed:lore_priest', 'lore_priest', 'Lore Priest', 'Every dead coin deserves a resurrection myth.', 'contributor', 740, 22, 2640, 6, '{Manifestos,Lore threads}'),
  ('seed:site_surgeon', 'site_surgeon', 'Site Surgeon', 'Broken websites are my favorite patients.', 'contributor', 690, 19, 3380, 5, '{Landing pages,Dashboards}'),
  ('seed:scout_marrow', 'scout_marrow', 'Scout Marrow', 'Grave scout.', 'scout', 300, 8, 600, 2, '{Scouting}'),
  ('seed:chart_coroner', 'chart_coroner', 'Chart Coroner', 'I autopsy dead charts.', 'scout', 420, 12, 1100, 3, '{Research}'),
  ('seed:holder_hunter', 'holder_hunter', 'Holder Hunter', 'Reconnecting old holders, ethically.', 'contributor', 360, 9, 800, 2, '{Outreach}')
on conflict (privy_id) do nothing;

insert into dead_coins (name, ticker, contract_address, chain, chart_url, market_cap, liquidity, holder_count, launch_date, telegram_status, website_status, last_dev_activity, status, meme_score, community_score, safety_score, liquidity_score, lore_score, ticker_score, difficulty_score, contributor_interest, revival_score, reason_died, reason_revive, risk_notes, votes_revive, votes_skip, votes_research, submitted_by) values
  ('Rugzilla','RUGZ','Rugz4kP2sQh9vN1mTxWbY7cZ8dFgH3jK6LpQrStUvWx','solana','https://dexscreener.com',41200,9800,2143,'2025-09-12','Abandoned · 2,100 members, last admin post 4mo ago','Domain expired','2025-10-02','up_for_vote',9,7,8,5,9,8,6,8,79,'Dev stopped posting after a failed CEX listing rumor. Telegram lost moderators and filled with scam links.','Strong mascot, 2k+ holders still in the group, and the kaiju that eats rugs lore is highly memeable.','Mint + freeze authority already renounced. No malicious functions found. Liquidity thin but present.',312,44,61,(select id from users where username='gravedigger.sol')),
  ('Ghost Pepe','GPEPE','GPepe7yT3nQ8wVc2bX9aLmK4dRfH6jS1pUoEqWrZxYv','solana','https://dexscreener.com',18700,4200,880,'2025-07-30','Quiet · 880 members, organic chatter weekly','Up but unmaintained','2025-08-19','candidate',8,6,9,4,7,7,5,6,70,'Launched into a brutal market week, never recovered initial momentum, dev moved to a new project.','Clean contract, loyal small community, and the haunted frog angle is unused in the current cycle.','Contract verified safe. Top holder owns 6% — acceptable. Needs liquidity strategy before relaunch.',140,70,95,(select id from users where username='scout_marrow')),
  ('Dead Cat Bounce','DCB','DcB9xM4tR2vH7nK1qW8sLpZ3aYfG6jU5oEdQrTbWxCv','solana','https://dexscreener.com',6300,1500,410,'2025-11-05','Dead · group deleted','None','2025-11-21','under_review',10,3,6,2,8,9,8,7,62,'Pure pump-and-dump pattern, dev pulled most of the liquidity, community scattered.','The name is the joke crypto traders already know. A self-aware we ARE the dead cat bounce relaunch could rip.','HIGH: liquidity very low and prior LP removal. Needs new LP commitment. Verify no hidden mint.',88,120,150,(select id from users where username='chart_coroner')),
  ('Wojak Lives','WLIVE','WLive3kR8tQ2nV7mH1xW9sLpZ4aYfG6jU5oEdBrTcWx','solana','https://dexscreener.com',92000,22000,5120,'2025-06-18','Semi-active · 5k members, no admins','Up, outdated','2025-09-01','newly_submitted',7,9,8,7,6,6,4,9,75,'Founder burnout. No content engine after the first month, community ran on fumes.','5k holders and a still-talking Telegram. Mostly needs leadership, a content schedule, and moderation.','Contract safe, healthy distribution. Main risk is coordination, not the token itself.',22,4,9,(select id from users where username='holder_hunter')),
  ('Lazaroo','LAZ','Laz5kP9sQh2vN8mTxWbY1cZ4dFgH7jK3LpQrStUvZab','solana','https://dexscreener.com',12400,3100,640,'2025-08-08','Quiet · 640 members','Broken','2025-09-14','candidate',8,5,9,4,9,8,5,7,72,'Good concept, no design or content follow-through. The kangaroo-back-from-the-dead bit never got art.','On-theme for this very protocol. Strong lore hook, clean contract, just needs a full identity rebuild.','Safe contract. Broken site is an opportunity, not a risk. Liquidity needs reinforcement.',175,33,40,(select id from users where username='lore_priest')),
  ('Fomo Frog','FOMOF','FoMoFrog2kR8tQ9nV1mH7xW3sLpZ6aYfG4jU5oEdBrTc','solana','https://dexscreener.com',180000,46000,4800,'2025-05-10','Active · 3,600 members','Live + maintained','2026-04-22','graduated',9,8,9,8,8,8,4,9,84,'Original dev wandered off; community nearly lost the thread before the CTO.','Proved a dead coin can come back when the community owns the story.','Graduated and community-operated. Low residual risk.',980,40,30,(select id from users where username='meme_md'))
on conflict do nothing;

insert into revival_campaigns (dead_coin_id, slug, status, phase, start_date, graduation_date, total_bounty_spend, active_bounties, completed_bounties, contributors_count, new_website, new_telegram, new_x, manifesto, roadmap, before_metrics, after_metrics) values
  ((select id from dead_coins where ticker='RUGZ'),'rugzilla','active','rebuild','2026-05-20',null,2840,5,11,27,null,'https://t.me/rugzilla_cto','https://x.com/rugzilla_cto',
   'RUGZ was left behind, but the kaiju is not dead. This is a community-led revival organized by independent contributors. We are not the original developers and we are not pretending to be. The goal is to rebuild the culture, content, community, and public presence around a coin that still has meme potential. Everything will be done transparently and funded through bounties.',
   E'Rebuild visual identity (mascot, banner, sticker pack)\nRelaunch Telegram with a real moderation rota\nShip the landing page + risk disclosure\nRelease the resurrection lore thread + meme pack\nDaily content calendar for 30 days\nGraduate to the Hall of Revival',
   '{"holders":2143,"telegram":2100,"website":"Expired"}','{"holders":2390,"telegram":2640,"website":"Live"}'),
  ((select id from dead_coins where ticker='GPEPE'),'ghost-pepe','active','setup','2026-06-04',null,320,3,2,8,null,'https://t.me/ghostpepe_cto',null,
   'GPEPE haunts the chart for a reason. A small loyal community kept the lights on. This community takeover rebuilds the haunted-frog identity from the ground up, transparently and bounty-by-bounty.',
   E'Confirm contract + publish disclaimer\nStand up new Telegram + rules\nCommission mascot + banner\nWrite the haunting lore arc',
   '{"holders":880,"telegram":880,"website":"Stale"}','{"holders":905,"telegram":940,"website":"Planned"}'),
  ((select id from dead_coins where ticker='FOMOF'),'fomo-frog','graduated','graduation','2026-03-01','2026-04-22',6120,0,38,51,'https://fomofrog.example','https://t.me/fomofrog','https://x.com/fomofrog',
   'FOMOF proved a dead coin can come back when the community owns the story. 38 bounties, 51 contributors, a fully rebuilt presence.',
   E'Graduated — now community-operated.',
   '{"holders":1200,"telegram":900,"website":"Dead"}','{"holders":4800,"telegram":3600,"website":"Live + maintained"}')
on conflict (slug) do nothing;

insert into revival_campaign_guilds (campaign_id, guild_id)
select c.id, g.id from revival_campaigns c, guilds g
where (c.slug='rugzilla' and g.slug in ('meme-medics','lore-priests','design-doctors','mod-squad'))
   or (c.slug='ghost-pepe' and g.slug in ('design-doctors','lore-priests'))
   or (c.slug='fomo-frog' and g.slug in ('meme-medics','lore-priests','design-doctors','mod-squad','raid-captains'))
on conflict do nothing;

insert into bounties (revival_campaign_id, title, description, category, reward_amount, reward_token, max_winners, deadline, status, proof_requirements, judging_criteria) values
  ((select id from revival_campaigns where slug='rugzilla'),'Create 10 memes for the RUGZ revival','We are reviving RUGZ through a community-led CTO. Create 10 original memes around resurrection, comebacks, and the rug-eating kaiju. Usable on X and Telegram.','meme',100,'USDC',5,'2026-06-18','open','10 original PNG/JPG memes, no watermarked or stolen content.',E'Originality\nHumor\nRelevance to RUGZ\nShareability\nVisual clarity'),
  ((select id from revival_campaigns where slug='rugzilla'),'Write the RUGZ CTO manifesto','Write the resurrection myth and community manifesto for RUGZ. Must include the required community-takeover disclaimer.','lore',80,'USDC',1,'2026-06-14','in_review','400-700 word manifesto + a 5-tweet lore thread.',E'Narrative strength\nTone\nClarity\nDisclaimer compliance'),
  ((select id from revival_campaigns where slug='rugzilla'),'Redesign the Rugzilla mascot','Deliver a modern mascot for the kaiju that eats rugs. Vector + transparent PNGs in multiple poses.','design',250,'USDC',1,'2026-06-20','open','SVG + 3 pose PNGs, 1024px min, transparent background.',E'Originality\nBrand fit\nVersatility\nPolish'),
  ((select id from revival_campaigns where slug='rugzilla'),'Set up and moderate the RUGZ Telegram','Stand up the new Telegram: rules, welcome flow, anti-scam settings, and a 7-day moderation rota.','community_ops',120,'USDC',2,'2026-06-16','open','Invite link, pinned rules, screenshot of bot/anti-spam config.',E'Setup quality\nAnti-scam coverage\nResponsiveness'),
  (null,'Find 10 dead coins with revival potential','Scout the graveyard. Submit 10 abandoned Solana meme coins with funny tickers, surviving holders, and clean-looking contracts. Use the scout submission template.','scout',150,'USDC',3,'2026-06-22','open','10 completed scout submissions with chart links and risk notes.',E'Revival potential\nAccuracy\nRisk diligence\nOriginality of finds'),
  ((select id from revival_campaigns where slug='ghost-pepe'),'Design the Ghost Pepe banner + PFP set','Create the haunted-frog banner and a 4-piece PFP set for the GPEPE relaunch.','design',180,'USDC',1,'2026-06-19','open','1500x500 banner + 4 PFPs, transparent PNG.',E'Originality\nBrand fit\nPolish')
on conflict do nothing;

insert into guild_members (guild_id, user_id, role)
select g.id, u.id, 'member' from guilds g, users u
where (u.username='gravedigger.sol' and g.slug in ('grave-scouts','chart-coroners'))
   or (u.username='meme_md' and g.slug in ('meme-medics'))
   or (u.username='lore_priest' and g.slug in ('lore-priests'))
   or (u.username='site_surgeon' and g.slug in ('website-surgeons','dashboard-keepers'))
on conflict do nothing;

insert into user_badges (user_id, badge_id)
select u.id, b.id from users u, badges b
where (u.username='gravedigger.sol' and b.slug in ('grave-digger','top-scout','revival-veteran','ten-bounties'))
   or (u.username='meme_md' and b.slug in ('meme-medic','resurrection-artist','hundred-bounties','community-favorite'))
   or (u.username='lore_priest' and b.slug in ('lore-doctor','first-revival','ten-bounties'))
   or (u.username='site_surgeon' and b.slug in ('website-surgeon','first-revival'))
on conflict do nothing;

insert into buybacks (fee_amount, token_amount_bought, buyback_tx, status, source, occurred_at) values
  (142,121340,'5xQ...8aF','burned','Bounty fees','2026-06-07'),
  (98,83110,'3kR...2nV','burned','Bounty fees','2026-06-06'),
  (210,179800,'9mH...1xW','recycled','Featured listing','2026-06-05'),
  (64,54900,'7yT...3nQ','burned','Bounty fees','2026-06-04')
on conflict do nothing;
