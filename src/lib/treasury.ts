import "server-only";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// ============================================================================
// CTO.fun treasury & bounty economics.
//
// The money loop:
//   1. CTO.fun's own SPL token accrues creator/trading fees on Pump.fun.
//   2. Those fees land in the treasury wallet (TREASURY_WALLET).
//   3. CTO.fun funds a SOL bounty on Pump.fun's bounty feature for each
//      approved revival (teams don't pay — they earn it).
//   4. On delivery, the bounty SOL is paid to the winning team's wallet.
//
// What is automated today vs. an operator (admin) step:
//   - Fee collection from Pump.fun: automated through PumpPortal's documented
//     Local collectCreatorFee transaction only when TREASURY_SIGNER_ENABLED and
//     TREASURY_SIGNER_SECRET are set on the server.
//   - Bounty creation/funding on Pump.fun: recorded as an ops step on the
//     application (bounty_pumpfun_url) until Pump.fun exposes a documented
//     programmatic bounty API/program we can call.
//   - Payout to the team: recorded as a signed-transfer tx hash by an admin
//     (recordRevivalPayout). Automating it means a hot treasury signer, which
//     is an explicit operator decision — see TREASURY_SIGNER_ENABLED.
//
// Everything degrades gracefully: with no env set, getters return null/false
// and the UI renders honest "not configured / pending" states.
// ============================================================================

export interface TreasuryConfig {
  /** Solana address that receives CTO token fees and funds bounties. */
  wallet: string;
  /** The CTO.fun coordination token mint. */
  ctoMint: string;
  /** Whether a documented programmatic Pump.fun bounty integration is wired. */
  pumpfunBountyApi: boolean;
  /** Whether treasury-signed automation is enabled for server-only flows. */
  signerEnabled: boolean;
}

function trimmed(value: string | undefined): string {
  return (value ?? "").trim();
}

export function treasuryConfig(): TreasuryConfig {
  return {
    wallet: trimmed(process.env.TREASURY_WALLET || process.env.NEXT_PUBLIC_TREASURY_WALLET),
    ctoMint: trimmed(process.env.NEXT_PUBLIC_TOKEN_MINT || process.env.REVIVAL_REQUEST_TOKEN_MINT),
    pumpfunBountyApi: Boolean(trimmed(process.env.PUMPFUN_BOUNTY_API)),
    signerEnabled: process.env.TREASURY_SIGNER_ENABLED === "true",
  };
}

export function treasuryRpcUrl(): string {
  return trimmed(process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL);
}

/**
 * Live SOL balance of the treasury wallet — the funds available to back
 * bounties. Returns null when the wallet or RPC isn't configured, or on error,
 * so callers can show an honest "—" rather than a fabricated number.
 */
export async function getTreasuryBalanceSol(): Promise<number | null> {
  const { wallet } = treasuryConfig();
  const url = treasuryRpcUrl();
  if (!wallet || !url) return null;
  try {
    const connection = new Connection(url, "confirmed");
    const lamports = await connection.getBalance(new PublicKey(wallet));
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return null;
  }
}
