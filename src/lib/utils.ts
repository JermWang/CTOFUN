import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the URL only when it parses as http(s); empty string otherwise.
 * Use for externally-sourced links/artwork (pump.fun metadata) so javascript:
 * and other schemes never reach an href/src.
 */
export function safeHttpUrl(value: string | null | undefined): string {
  if (!value) return "";
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

/**
 * Returns a browser-displayable token artwork URL.
 *
 * Pump/IPFS metadata can arrive as `ipfs://...` or through gateways that later
 * become unreliable. Keep general links strict, but normalize artwork to a
 * stable HTTP gateway so cards don't disappear when an old gateway fails.
 */
export function safeImageUrl(value: string | null | undefined): string {
  if (!value) return "";
  const text = value.trim();
  if (!text) return "";

  if (text.startsWith("ipfs://")) {
    const path = text.slice("ipfs://".length).replace(/^ipfs\//, "");
    return path ? `https://ipfs.io/ipfs/${path}` : "";
  }

  const httpUrl = safeHttpUrl(text);
  if (!httpUrl) return "";

  const url = new URL(httpUrl);
  if (url.hostname === "cf-ipfs.com" && url.pathname.startsWith("/ipfs/")) {
    url.hostname = "ipfs.io";
    return url.toString();
  }
  return url.toString();
}

/** Compact USD formatter, e.g. $1.2K, $3.4M */
export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10_000 ? 1 : 2,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function shortAddress(addr: string | null | undefined, chars = 4): string {
  if (!addr) return "-";
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count}${label} ago`;
  }
  return "just now";
}
