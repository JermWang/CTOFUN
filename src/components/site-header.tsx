"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { SiteLogo } from "@/components/site-logo";
import { usePrivyConfigured } from "@/components/providers";
import { shortAddress } from "@/lib/utils";

const NAV: [string, string][] = [
  ["/discover", "Discover"],
  ["/revivals", "Revivals"],
  ["/bounties", "Bounties"],
  ["/graveyard", "Graveyard"],
  ["/dashboard", "Proof"],
];

const X_URL = "https://x.com/ctoitdotfun";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function XLink() {
  return (
    <a
      href={X_URL}
      target="_blank"
      rel="noreferrer"
      className="btn btn-sm btn-ghost desktop-only x-link"
      aria-label="CTO.fun on X"
    >
      <XIcon />
    </a>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [drawer, setDrawer] = React.useState(false);

  return (
    <header className="proto sticky top-0 z-[60]">
      <div className="hdr">
        <div className="wrap hdr-in">
          <Link href="/" className="brand" aria-label="CTO.fun home">
            <SiteLogo variant="dark" height={38} priority />
          </Link>
          <nav className="nav">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={isActive(pathname, href) ? "on" : ""}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="hdr-cta">
            <XLink />
            <Link href="/submit" className="btn btn-sm btn-ghost desktop-only">
              Submit a token
            </Link>
            <span className="desktop-only">
              <ConnectButton />
            </span>
            <button className="burger" onClick={() => setDrawer(!drawer)} aria-label="Menu">
              {drawer ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>
      <div className={"drawer" + (drawer ? " open" : "")}>
        {NAV.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={isActive(pathname, href) ? "on" : ""}
            onClick={() => setDrawer(false)}
          >
            {label}
          </Link>
        ))}
        <Link href="/submit" onClick={() => setDrawer(false)}>
          Submit a token
        </Link>
        <a href={X_URL} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <XIcon size={16} /> Follow on X
        </a>
        <div style={{ marginTop: 18 }}>
          <ConnectButton full />
        </div>
      </div>
    </header>
  );
}

function ConnectButton({ full }: { full?: boolean }) {
  const configured = usePrivyConfigured();
  const style = full ? { width: "100%" } : undefined;
  if (!configured) {
    return (
      <button
        className={"btn btn-sm btn-solid"}
        style={style}
        disabled
        title="Set NEXT_PUBLIC_PRIVY_APP_ID to enable login"
      >
        Connect
      </button>
    );
  }
  return <ConnectedButton full={full} />;
}

function ConnectedButton({ full }: { full?: boolean }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const style = full ? { width: "100%" } : undefined;

  if (!ready) {
    return (
      <button className="btn btn-sm btn-outline" style={style} disabled>
        …
      </button>
    );
  }
  if (!authenticated) {
    return (
      <button className="btn btn-sm btn-solid" style={style} onClick={() => login()}>
        Connect
      </button>
    );
  }
  const address = user?.wallet?.address ?? (user?.email?.address as string | undefined) ?? "account";
  return (
    <button className="btn btn-sm btn-outline" style={style} onClick={() => logout()} title="Log out">
      {shortAddress(address)}
    </button>
  );
}
