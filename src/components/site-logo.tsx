import Image from "next/image";
import textLogo from "../../public/text-logo.png";
import whiteTextLogo from "../../public/white-text-logo.png";

// ============================================================================
// Official CTO.fun wordmark. Renders the RAW PNG from /public as-is — no
// cropping, no clip box, no border. The image is sized by height and keeps its
// native aspect ratio, so nothing is ever cut off.
//   text-logo.png       - dark ".fun" text, for light backgrounds
//   white-text-logo.png - white ".fun" text, for dark backgrounds
// ============================================================================

const SOURCE_WIDTH = 672;
const SOURCE_HEIGHT = 328;

export function SiteLogo({
  variant = "dark",
  height = 32,
  className,
  priority,
}: {
  variant?: "light" | "dark";
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const src = variant === "light" ? whiteTextLogo : textLogo;
  const width = Math.round((SOURCE_WIDTH / SOURCE_HEIGHT) * height);

  return (
    <Image
      src={src}
      alt="CTO.fun"
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={className}
      style={{ height, width: "auto", display: "block", objectFit: "contain" }}
    />
  );
}
