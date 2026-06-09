import Link from "next/link";
import { CTO_DISCLAIMER } from "@/lib/domain";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="text-lg font-bold">
              CTO<span className="text-primary">.fun</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A bounty-powered dead coin revival protocol. We discover abandoned
              meme coins, vote on which deserve a second life, and fund public
              community takeovers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol
              title="Protocol"
              links={[
                ["Graveyard", "/graveyard"],
                ["Revivals", "/revivals"],
                ["Bounties", "/bounties"],
                ["Guilds", "/guilds"],
              ]}
            />
            <FooterCol
              title="Transparency"
              links={[
                ["Proof of Revival", "/dashboard"],
                ["Hall of Revival", "/hall"],
                ["Buybacks", "/dashboard#buybacks"],
                ["How It Works", "/#how-it-works"],
              ]}
            />
            <FooterCol
              title="Participate"
              links={[
                ["Submit a Coin", "/submit"],
                ["Vote", "/revivals?tab=vote"],
                ["Contributors", "/contributors"],
              ]}
            />
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-warning/20 bg-warning/5 p-4 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-warning">Disclaimer.</span>{" "}
          {CTO_DISCLAIMER} Always do your own research. Revivals are community-led
          and may fail.
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} CTO.fun · We do not pump. We resurrect.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
