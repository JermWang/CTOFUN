import Image from "next/image";
import * as React from "react";
import textLogo from "../../public/text-logo.png";
import whiteTextLogo from "../../public/white-text-logo.png";

// ============================================================================
// Official CTO.fun wordmark. Two PNG variants live in /public:
//   text-logo.png       - dark ".fun" text, for light backgrounds
//   white-text-logo.png - white ".fun" text, for dark backgrounds
// The files include whitespace around the artwork, so this component crops the
// rendered box to the actual wordmark bounds before scaling.
// ============================================================================

const SOURCE_WIDTH = 672;
const SOURCE_HEIGHT = 328;
const LOGO_CROP = {
  left: 25,
  top: 89,
  width: 625,
  height: 140,
};

export function SiteLogo({
  variant = "dark",
  height = 28,
  className,
  priority,
}: {
  variant?: "light" | "dark";
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const src = variant === "light" ? whiteTextLogo : textLogo;
  const scale = height / LOGO_CROP.height;
  const renderedWidth = Math.round(LOGO_CROP.width * scale);
  const renderedSourceHeight = SOURCE_HEIGHT * scale;

  return (
    <span
      className={className}
      style={{
        display: "block",
        height,
        overflow: "hidden",
        position: "relative",
        width: renderedWidth,
      }}
    >
      <Image
        src={src}
        alt="CTO.fun"
        width={SOURCE_WIDTH}
        height={SOURCE_HEIGHT}
        preload={priority}
        sizes={`${renderedWidth}px`}
        style={{
          display: "block",
          height: renderedSourceHeight,
          maxWidth: "none",
          transform: `translate(${-LOGO_CROP.left * scale}px, ${-LOGO_CROP.top * scale}px)`,
          width: "auto",
        }}
      />
    </span>
  );
}
