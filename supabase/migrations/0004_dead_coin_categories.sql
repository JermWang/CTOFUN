-- ============================================================================
-- CTO.fun — meme categories (origin/theme) for dead coins
-- A coin can belong to several categories (e.g. {frogs, og}). Used to organize
-- and filter the Graveyard. Category slugs are defined in src/lib/domain.ts.
-- ============================================================================

alter table dead_coins add column if not exists categories text[] not null default '{}';

-- Backfill the demo coins.
update dead_coins set categories = '{absurd,og}'      where ticker = 'RUGZ'  and categories = '{}';
update dead_coins set categories = '{frogs,og}'       where ticker = 'GPEPE' and categories = '{}';
update dead_coins set categories = '{cats,absurd,og}' where ticker = 'DCB'   and categories = '{}';
update dead_coins set categories = '{og,classic}'     where ticker = 'WLIVE' and categories = '{}';
update dead_coins set categories = '{animals,absurd}' where ticker = 'LAZ'   and categories = '{}';
update dead_coins set categories = '{frogs,y2024}'    where ticker = 'FOMOF' and categories = '{}';
