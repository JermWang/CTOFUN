import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";

const LINKS: [string, string][] = [
  ["Discover", "/discover"],
  ["Graveyard", "/graveyard"],
  ["Bounties", "/bounties"],
];

export function SiteFooter() {
  return (
    <footer className="proto">
      <div className="ftr">
        <div className="wrap ftr-in">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SiteLogo variant="dark" height={46} />
            <p className="disc">
              CTO.fun is a community coordination hub for reviving abandoned Pump.fun-origin tokens. Not
              affiliated with or endorsed by Pump.fun. Community takeovers are organized by independent contributors —
              this is not financial advice and not a promise of price recovery.
            </p>
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            {LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="mono"
                style={{ fontSize: 12, color: "var(--dim)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
