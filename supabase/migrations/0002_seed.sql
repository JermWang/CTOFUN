-- ============================================================================
-- CTO.fun — Seed data: core guilds and contributor badges
-- ============================================================================

insert into guilds (name, slug, category, description) values
  ('Grave Scouts',     'grave-scouts',     'scout',          'Find dead coins with revival potential.'),
  ('Meme Medics',      'meme-medics',      'meme',           'Create memes and reaction content.'),
  ('Lore Priests',     'lore-priests',     'lore',           'Write narratives, manifestos, and lore.'),
  ('Design Doctors',   'design-doctors',   'design',         'Handle visuals, mascots, banners, and stickers.'),
  ('Website Surgeons', 'website-surgeons', 'website',        'Build or repair websites.'),
  ('Chart Coroners',   'chart-coroners',   'research',       'Analyze what happened to dead coins.'),
  ('Mod Squad',        'mod-squad',        'moderation',     'Moderate Telegram and Discord.'),
  ('Holder Hunters',   'holder-hunters',   'holder_outreach','Find old public community traces and help with ethical outreach.'),
  ('Video Shamans',    'video-shamans',    'video',          'Create short-form video content.'),
  ('Dashboard Keepers','dashboard-keepers','dashboard',      'Track data, metrics, and revival progress.'),
  ('Raid Captains',    'raid-captains',    'social',         'Coordinate safe public posting campaigns without harassment or spam.'),
  ('Revival Council',  'revival-council',  'revival_audit',  'Reviews candidates, disputes, safety, and graduation status.')
on conflict (slug) do nothing;

insert into badges (slug, name, description, icon) values
  ('first-revival',          'First Revival',              'Contributed to your first revival.',        'sparkles'),
  ('grave-digger',           'Grave Digger',               'Submitted a coin that became a candidate.', 'shovel'),
  ('meme-medic',             'Meme Medic',                 'Completed meme bounties.',                  'image'),
  ('lore-doctor',            'Lore Doctor',                'Completed lore bounties.',                  'scroll'),
  ('chart-coroner',          'Chart Coroner',              'Completed research/audit bounties.',        'activity'),
  ('telegram-surgeon',       'Telegram Surgeon',           'Completed moderation bounties.',            'message-circle'),
  ('website-surgeon',        'Website Surgeon',            'Completed website bounties.',               'globe'),
  ('holder-hunter',          'Holder Hunter',              'Completed holder outreach bounties.',       'users'),
  ('resurrection-artist',    'Resurrection Artist',        'High-quality work across categories.',      'palette'),
  ('cto-captain',            'CTO Captain',                'Led a revival campaign.',                   'crown'),
  ('revival-veteran',        'Revival Veteran',            'Contributed to 5+ revivals.',               'medal'),
  ('hall-of-revival',        'Hall of Revival Contributor','Contributed to a graduated revival.',       'trophy'),
  ('ten-bounties',           '10 Bounties Completed',      'Completed 10 bounties.',                    'badge-check'),
  ('hundred-bounties',       '100 Bounties Completed',     'Completed 100 bounties.',                   'award'),
  ('no-dispute-streak',      'No-Dispute Streak',          'Long streak with no disputes.',             'shield-check'),
  ('community-favorite',     'Community Favorite',         'Highly rated by the community.',            'heart'),
  ('top-scout',              'Top Scout',                  'Top scout of the season.',                  'binoculars'),
  ('top-guild-member',       'Top Guild Member',           'Top contributor in a guild.',               'star')
on conflict (slug) do nothing;
