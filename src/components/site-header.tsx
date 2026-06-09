"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/auth-button";

const NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/graveyard", label: "Graveyard" },
  { href: "/revivals", label: "Revivals" },
  { href: "/bounties", label: "Bounties" },
  { href: "/guilds", label: "Guilds" },
  { href: "/dashboard", label: "Proof of Revival" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="liquid-glass sticky top-0 z-50 border-b bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/30">
            <BrandMark className="size-6" />
          </span>
          <span className="text-lg">
            CTO<span className="text-primary">.fun</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/submit"
            className="hidden rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 sm:inline-block"
          >
            Submit a Dead Coin
          </Link>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
