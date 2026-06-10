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

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [drawer, setDrawer] = React.useState(false);

  return (
    <header className="proto sticky top-0 z-[60]">
      <div className="hdr">
        <div className="wrap hdr-in">
          <Link href="/" className="brand" aria-label="CTO.fun home">
            <SiteLogo variant="dark" height={15} priority />
          </Link>
          <nav className="nav">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={isActive(pathname, href) ? "on" : ""}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="hdr-cta">
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
