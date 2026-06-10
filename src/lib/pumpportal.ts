import "server-only";

import bs58 from "bs58";
import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import { treasuryConfig, treasuryRpcUrl } from "@/lib/treasury";

const PUMPPORTAL_TRADE_LOCAL_ENDPOINT = "https://pumpportal.fun/api/trade-local";
const DEFAULT_CREATOR_FEE_PRIORITY_FEE_SOL = 0.000001;

export interface CreatorFeeAutomationStatus {
  enabled: boolean;
  configured: boolean;
  publicKey: string | null;
  rpcConfigured: boolean;
}

export interface CollectCreatorFeesResult {
  signature: string;
  publicKey: string;
  explorerUrl: string;
  claimedAt: string;
}

function trimmed(value: string | undefined): string {
  return (value ?? "").trim();
}

function creatorFeePriorityFeeSol(): number {
  const n = Number(process.env.PUMPFUN_CREATOR_FEE_PRIORITY_FEE_SOL);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CREATOR_FEE_PRIORITY_FEE_SOL;
}

function decodeSecret(secret: string): Uint8Array {
  const raw = secret.trim();
  if (!raw) throw new Error("Treasury signer secret is not configured.");

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return Uint8Array.from(parsed.map((n) => Number(n)));
    }
  } catch {
    // Not JSON; treat as base58 below.
  }

  if (raw.includes(",")) {
    return Uint8Array.from(raw.split(",").map((n) => Number(n.trim())));
  }

  return bs58.decode(raw);
}

function treasurySigner(): Keypair {
  const secret = trimmed(process.env.TREASURY_SIGNER_SECRET);
  const bytes = decodeSecret(secret);
  if (bytes.length === 64) return Keypair.fromSecretKey(bytes);
  if (bytes.length === 32) return Keypair.fromSeed(bytes);
  throw new Error("Treasury signer secret must decode to a 32-byte seed or 64-byte secret key.");
}

function signerPublicKey(): string | null {
  try {
    return treasurySigner().publicKey.toBase58();
  } catch {
    return null;
  }
}

export function creatorFeeAutomationStatus(): CreatorFeeAutomationStatus {
  const { signerEnabled } = treasuryConfig();
  const publicKey = signerPublicKey();
  return {
    enabled: signerEnabled,
    configured: signerEnabled && Boolean(publicKey) && Boolean(treasuryRpcUrl()),
    publicKey,
    rpcConfigured: Boolean(treasuryRpcUrl()),
  };
}

function assertTreasurySigner(): Keypair {
  const { wallet, signerEnabled } = treasuryConfig();
  if (!signerEnabled) {
    throw new Error("Treasury signing is disabled. Set TREASURY_SIGNER_ENABLED=true to allow fee collection.");
  }

  const signer = treasurySigner();
  const signerAddress = signer.publicKey.toBase58();

  if (wallet) {
    const expected = new PublicKey(wallet).toBase58();
    if (expected !== signerAddress) {
      throw new Error("TREASURY_WALLET does not match TREASURY_SIGNER_SECRET.");
    }
  }

  return signer;
}

async function pumpPortalLocalCollectTransaction(publicKey: string): Promise<Uint8Array> {
  const response = await fetch(PUMPPORTAL_TRADE_LOCAL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey,
      action: "collectCreatorFee",
      priorityFee: creatorFeePriorityFeeSol(),
    }),
  });

  if (!response.ok) {
    throw new Error(`PumpPortal collectCreatorFee failed with HTTP ${response.status}.`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength) throw new Error("PumpPortal returned an empty transaction.");
  return bytes;
}

export async function collectPumpCreatorFees(): Promise<CollectCreatorFeesResult> {
  const signer = assertTreasurySigner();
  const publicKey = signer.publicKey.toBase58();
  const rpcUrl = treasuryRpcUrl();
  if (!rpcUrl) throw new Error("SOLANA_RPC_URL is required to submit the signed transaction.");

  const unsignedBytes = await pumpPortalLocalCollectTransaction(publicKey);
  const transaction = VersionedTransaction.deserialize(unsignedBytes);
  transaction.sign([signer]);

  const connection = new Connection(rpcUrl, "confirmed");
  const signature = await connection.sendTransaction(transaction, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  await connection.confirmTransaction(signature, "confirmed");

  return {
    signature,
    publicKey,
    explorerUrl: `https://solscan.io/tx/${signature}`,
    claimedAt: new Date().toISOString(),
  };
}
