import type { DiscoveredDeadToken } from "@/lib/dead-token-sweeper";

export const PRIORITY_OG_2024_MINTS = [
  "6VoGmoGsCP7eraJoXiQ6n3fTeJW4g6tap7cNRBEsXbD1",
  "2LBvTfgwfA45PkvyVTF7fZQLHnDoTSF9P4Bvw6DS112e",
  "F23GvgK5TvSA78FmibZot7gtU3yfAiPb4BkD4RrZc18B",
  "BqYJQ6hVYxYzGrSbUyXy52oP6aFduq1PRxUVSrFtuDgz",
  "2784oaEfz4nRg7vmkwYcTRWWkit6DQacRCoi74hY4jbh",
  "GP7m3USdHDSrNoUzsZqZTboKaJiabFQShzgV2RkFnZyh",
  "GsR6Z8sxiz9oiLWYAMYDvJu9jf3QwNbCa8xK4Emfh7F3",
] as const;

const PRIORITY_OG_2024_SET = new Set<string>(PRIORITY_OG_2024_MINTS);

export function isPriorityOg2024Mint(mint: string | null | undefined): boolean {
  return PRIORITY_OG_2024_SET.has((mint ?? "").trim());
}

export function priorityOg2024Rank(mint: string | null | undefined): number {
  const index = PRIORITY_OG_2024_MINTS.indexOf((mint ?? "").trim() as (typeof PRIORITY_OG_2024_MINTS)[number]);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function applyPriorityOg2024Metadata(token: DiscoveredDeadToken): DiscoveredDeadToken {
  if (!isPriorityOg2024Mint(token.mint)) return token;

  const categories = ["og2024", "y2024", "og", ...token.categories.filter((category) => !["og2024", "y2024", "og"].includes(category))];
  const discoverySignals = [
    "OG 2024 priority cohort",
    ...token.discoverySignals.filter((signal) => signal !== "OG 2024 priority cohort"),
  ].slice(0, 8);
  const qualificationReasons = [
    "OG 2024 Pump.fun launch",
    ...token.qualificationReasons.filter((reason) => reason !== "OG 2024 Pump.fun launch"),
  ].slice(0, 5);

  return {
    ...token,
    categories,
    categoryScores: {
      ...token.categoryScores,
      og2024: Math.max(100, token.categoryScores.og2024 ?? 0),
      y2024: Math.max(80, token.categoryScores.y2024 ?? 0),
      og: Math.max(72, token.categoryScores.og ?? 0),
    },
    categoryConfidence: Math.max(100, token.categoryConfidence),
    discoverySignals,
    qualificationReasons,
    qualificationScore: Math.max(96, token.qualificationScore),
    revivalScore: Math.max(94, token.revivalScore),
  };
}
