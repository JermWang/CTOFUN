# CTO.fun

**Bringing dead coins back to life.** A bounty-powered dead coin revival protocol:
the community discovers abandoned meme coins, votes on which deserve a second life,
funds public CTO (community takeover) campaigns, rewards contributors for rebuilding
culture and infrastructure, and tracks every revival through transparent proof-of-work.

> We do not pump. We resurrect.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** + hand-rolled ShadCN-style UI kit (`src/components/ui`)
- **Privy** auth + embedded **Solana** wallets
- **Supabase** (Postgres) for data — schema in `supabase/migrations`

## Current status (MVP scaffold)

Every page renders today against a **mock-data layer** (`src/lib/mock-data.ts`) so the
product is fully browsable before any keys or DB are connected. To go live, you:

1. Add Privy + Supabase keys (below).
2. Apply the SQL migrations to a Supabase project.
3. Swap the accessor functions in `src/lib/mock-data.ts` for Supabase queries
   (clients are ready in `src/lib/supabase/`).

Auth is wired with a **graceful fallback**: with no `NEXT_PUBLIC_PRIVY_APP_ID`, the
Connect button is disabled and the app still builds/runs. Add the key to enable login.

## Pages

| Route | Description |
| --- | --- |
| `/` | Homepage — hero, current revival, active bounties, how it works, top contributors, Hall teaser |
| `/graveyard` · `/graveyard/[id]` | The Graveyard list + dead coin profiles (market data, scorecard, vote tally, risk notes) |
| `/submit` | Scout submission form with a live revival-score preview |
| `/revivals` · `/revivals/[slug]` | Active revivals + campaign pages (phases, manifesto, bounties, before/after, roadmap) |
| `/bounties` · `/bounties/[id]` | Bounty board (category filter) + detail with submission form & fee/buyback math |
| `/guilds` | The 12 core guilds, ranked, with stats |
| `/contributors` · `/contributors/[username]` | Contributor leaderboard + public profiles (badges, guilds, earnings) |
| `/dashboard` | Proof of Revival — global metrics + transparent buyback ledger |
| `/hall` | Hall of Revival — graduated community takeovers |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in keys (optional for first run)
pnpm dev                     # http://localhost:3000
```

`pnpm build` runs a full typecheck + static prerender of all routes.

## Environment variables

See [`.env.example`](.env.example). Summary of what you need:

- **Privy** — `NEXT_PUBLIC_PRIVY_APP_ID`, `PRIVY_APP_SECRET` (enable Solana embedded wallets in the Privy dashboard).
- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only).
- **Solana / Helius** — `NEXT_PUBLIC_SOLANA_RPC_URL`, `HELIUS_API_KEY`.
- **Token** — `NEXT_PUBLIC_TOKEN_MINT` (the coordination token mint, once launched).

## Database

Migrations in `supabase/migrations/`:

- `0001_init.sql` — all tables (`users`, `dead_coins`, `revival_campaigns`, `bounties`,
  `submissions`, `guilds`, `votes`, `buybacks`, `disputes`, badges), enums, and RLS
  (public read; privileged writes via the service-role key after verifying Privy identity).
- `0002_seed.sql` — the 12 core guilds and contributor badges.
- `0003_extend_and_seed.sql` — denormalized vote counters, `revivals_helped`, and the
  demo content (contributors, dead coins, campaigns, bounties, buybacks, relationships).

All three are already applied to the live project (`hemaeouyjjafcpypbrsf`). For a fresh
project, apply in order with the Supabase SQL editor, the CLI (`supabase db push`), or
the Supabase MCP `apply_migration` tool.

The read path uses the public anon key against RLS public-read policies. Server writes
(submission/vote creation, admin review) need `SUPABASE_SERVICE_ROLE_KEY` — paste it from
the dashboard once you wire those server actions.

## Domain logic

`src/lib/domain.ts` holds the shared model: enum labels, the 12 guilds, the **weighted
revival score** (`computeRevivalScore`, out of 100), and the **5% platform fee →
buyback** helper. The submit form and dead-coin pages use these directly.

## Safety / positioning

Every revival surface carries the required disclaimer: *community takeover, not the
original dev, not financial advice, no promise of price recovery.* Banned-activity rules
(no impersonation, manipulation, harassment, spam) are baked into bounty rules copy.
Get legal review before launch — buybacks must never be marketed as guaranteed profit.
