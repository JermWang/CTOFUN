import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Anti-framing and HSTS only apply in production: HSTS pins localhost to
// HTTPS and frame denial blocks embedded dev previews, so both break local
// development while adding nothing on localhost.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  ...(isProd
    ? [
        { key: "X-Frame-Options", value: "DENY" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          // Conservative baseline: blocks framing, plugins, and injected
          // <base>/form targets without restricting script/img sources that
          // Privy and external token artwork rely on.
          key: "Content-Security-Policy",
          value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
        },
      ]
    : [
        {
          key: "Content-Security-Policy",
          value: "object-src 'none'; base-uri 'self'",
        },
      ]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Pin the workspace root to this project so Next doesn't pick up an
  // unrelated lockfile higher up the directory tree.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
