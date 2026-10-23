import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Auto-memoization (React Compiler 1.0, Babel plugin).
  reactCompiler: true,
  // Workspace packages ship TypeScript source.
  transpilePackages: ["@repo/hooks", "@repo/ui"],
};

// Single locale (fa): no locale routing, the request config always returns Persian.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
