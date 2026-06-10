"use client";

import React, { useState } from "react";

interface TokenCopyButtonProps {
  tokenMint?: string;
}

export function TokenCopyButton({ tokenMint }: TokenCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!tokenMint) return null;

  const truncated = tokenMint.slice(-7);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tokenMint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="proto btn-token-copy"
      title={tokenMint}
      aria-label={`Copy token address: ${tokenMint}`}
    >
      <span className="token-addr">{truncated}</span>
      <span className="copy-icon">{copied ? "✓" : "⎘"}</span>
    </button>
  );
}
