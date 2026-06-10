// One-off / ops runner for the real dead-token sweeper. Bundles the canonical
// src/lib/dead-token-sweeper.ts with esbuild (stubbing `server-only`, resolving
// the @/ path alias) so there is zero logic drift from production, then runs a
// live sweep and persists qualifying tokens to Supabase via the service role.
//
//   node scripts/run-sweep.mjs [limit]
//
// Reads credentials from .env.local.
import { build } from "esbuild";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import WS from "ws";

// supabase-js's realtime client needs a global WebSocket; Node 20 has none.
if (!globalThis.WebSocket) globalThis.WebSocket = WS;

// --- load .env.local into process.env -------------------------------------
function loadEnv(file) {
  let text = "";
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return;
  }
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv(join(process.cwd(), ".env.local"));

const limit = Number(process.argv[2] ?? 60);

// --- bundle the sweeper ----------------------------------------------------
// Output inside the project so Node resolves externalized npm deps (e.g.
// @supabase/supabase-js) against this project's node_modules.
const outdir = mkdtempSync(join(process.cwd(), ".sweep-tmp-"));
const outfile = join(outdir, "sweep.mjs");

const serverOnlyStub = {
  name: "stub-server-only",
  setup(b) {
    b.onResolve({ filter: /^server-only$/ }, () => ({ path: "server-only", namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export {};", loader: "js" }));
  },
};

await build({
  stdin: {
    contents: `
      import { sweepDeadTokenCandidates } from "@/lib/dead-token-sweeper";
      const r = await sweepDeadTokenCandidates(${limit});
      const gems = r.candidates.filter((c) => c.isGem);
      globalThis.__SWEEP_RESULT__ = {
        persisted: r.persisted,
        upserted: r.upserted,
        candidates: r.candidates.length,
        gems: gems.length,
        topGems: gems.slice(0, 12).map((c) => ({
          symbol: c.symbol,
          name: c.name,
          mcap: Math.round(c.marketCapUsd),
          holders: c.holderCount,
          lifetimeVol: c.lifetimeVolumeUsd,
          gemScore: c.gemScore,
          dormantDays: c.dormantDays,
        })),
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "sweep-entry.ts",
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  outfile,
  tsconfig: join(process.cwd(), "tsconfig.json"),
  external: ["@supabase/supabase-js", "@solana/web3.js", "clsx", "tailwind-merge"],
  plugins: [serverOnlyStub],
  logLevel: "warning",
});

// --- run it ----------------------------------------------------------------
try {
  await import(pathToFileURL(outfile).href);
  console.log(JSON.stringify(globalThis.__SWEEP_RESULT__, null, 2));
} finally {
  rmSync(outdir, { recursive: true, force: true });
}
