import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_DESCRIPTION =
  "A bounty-powered dead coin revival protocol. We find abandoned meme coins, vote on the best revival targets, and use bounties to rebuild their communities, content, and culture.";

export const metadata: Metadata = {
  metadataBase: new URL("https://cto.fun"),
  title: {
    default: "CTO.fun — Bring dead coins back to life",
    template: "%s · CTO.fun",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "CTO.fun",
    title: "CTO.fun — Bring dead coins back to life",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "CTO.fun — Bring dead coins back to life",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
