// ============================================================================
// Pure formatters shared by server + client. Kept out of any "use client"
// module so server components can call them directly.
// ============================================================================

/** Compact USD formatter matching the prototype: $41k, $1.8M, dash for null. */
export const fmtUsd = (n: number | null | undefined): string => {
  if (n == null) return "-";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + "k";
  return "$" + n;
};

export const fmtNum = (n: number): string => new Intl.NumberFormat("en").format(n);

/** SOL amount formatter: trims trailing zeros, dash for null. e.g. "12 SOL", "1.5 SOL". */
export const fmtSol = (n: number | null | undefined): string => {
  if (n == null) return "-";
  const rounded = Math.round(n * 1000) / 1000;
  return `${rounded.toLocaleString("en", { maximumFractionDigits: 3 })} SOL`;
};
