import * as React from "react";

// ============================================================================
// Official CTO.fun wordmark. Two PNG variants live in /public:
//   text-logo.png        — dark ".fun" text, for light backgrounds
//   white-text-logo.png  — white ".fun" text, for dark backgrounds (default)
// The "cto" glyph + arrow are identical in both; only the ".fun" text color
// differs. The site UI is dark, so most surfaces use the "light" variant.
// ============================================================================

export function SiteLogo({
  variant = "light",
  height = 28,
  className,
  priority,
}: {
  variant?: "light" | "dark";
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const src = variant === "light" ? "/white-text-logo.png" : "/text-logo.png";
  return (
    // Plain <img>: the intrinsic dimensions vary, and height + width:auto keeps
    // the aspect ratio crisp without hard-coding the source size.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="CTO.fun"
      className={className}
      style={{ height, width: "auto", display: "block" }}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
