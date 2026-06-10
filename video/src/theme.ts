import { loadFont as loadSans } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";

// ============================================================================
// CTO.fun brand tokens — mirrored 1:1 from src/app/globals.css :root so the
// video matches the live site exactly. No invented colors.
// ============================================================================
export const COLORS = {
  bg: "#f7faf8",
  bg2: "#eef5f1",
  ink: "#0c1712",
  dim: "#63746d",
  faint: "#879690",
  line: "#dbe6e1",
  line2: "#cbd9d2",
  green: "#04ff00",
  greenDim: "#0a8a00",
  greenDeep: "#03120b",
  violet: "#765cff",
  amber: "#f5b54a",
  red: "#ff5d6c",
  white: "#ffffff",
} as const;

const sans = loadSans();
const mono = loadMono();

export const FONT_SANS = sans.fontFamily;
export const FONT_MONO = mono.fontFamily;

// The four-stage pipeline that runs across the site (nav + home hero).
export const PIPELINE = ["Discover", "Apply", "Bounty", "Revive"] as const;
