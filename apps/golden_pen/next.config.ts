import path from "node:path";

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Validate env vars at build time: a missing/invalid key fails `next build`.
import "./src/env.ts";

const isProduction = process.env.NODE_ENV === "production";

/**
 * CSP without nonces (keeps static rendering/caching). Tighten `connect-src` if you add hosts.
 * `img-src` allows any http(s) image: user content (avatars, documents) comes from object storage
 * on another host (currently plain http by IP). Images cannot run code, so this is the usual
 * trade-off; tighten it to the storage origin once that is fixed.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https: http:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  // Minimal self-contained server for Docker (`.next/standalone`).
  output: "standalone",
  // Monorepo: trace dependencies from the repo root so workspace packages are included.
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),

  reactStrictMode: true,
  poweredByHeader: false,
  // Auto-memoization (React Compiler 1.0, Babel plugin).
  reactCompiler: true,
  // Statically typed `href`s for next/link (we navigate via `@/i18n/navigation` + `ROUTES`).
  typedRoutes: true,
  // Next.js 16 caching model: `use cache` / `cacheLife` / `cacheTag`, partial prerendering.
  cacheComponents: true,

  // Workspace packages ship TypeScript source; t3-env must be transpiled for standalone output.
  transpilePackages: [
    "@repo/hooks",
    "@repo/http",
    "@repo/jalali",
    "@repo/query",
    "@repo/table",
    "@repo/ui",
    "@t3-oss/env-nextjs",
    "@t3-oss/env-core",
  ],
  // Loaded from node_modules at runtime instead of being bundled (patches Node's http stack).
  serverExternalPackages: ["msw"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  logging: {
    fetches: { fullUrl: true },
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
