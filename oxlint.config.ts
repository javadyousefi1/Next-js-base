import { defineConfig } from "oxlint";

/**
 * Oxlint (Rust, ~50-100x faster than ESLint) — the only linter in this repo.
 *
 * - Built-in rule categories + plugins for TS, React, Next.js, a11y, imports, promises, unicorn.
 * - Type-aware rules (`options.typeAware`, powered by oxlint-tsgolint / TypeScript 7).
 * - Project conventions as custom rules (`project/*`, packages/oxlint-plugin).
 *
 * Every rule here encodes a convention from AGENTS.md — keep them in sync.
 */
export default defineConfig({
  plugins: [
    "typescript",
    "react",
    "nextjs",
    "jsx-a11y",
    "import",
    "promise",
    "unicorn",
    "oxc",
    "node",
  ],
  jsPlugins: ["./packages/oxlint-plugin/src/index.ts"],
  categories: {
    correctness: "error",
    suspicious: "warn",
    perf: "warn",
  },
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: "warn",
  },
  env: { browser: true, node: true, es2024: true },
  ignorePatterns: [
    "**/node_modules/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/dist/**",
    "**/coverage/**",
    "**/playwright-report/**",
    "**/test-results/**",
    "**/next-env.d.ts",
    "apps/admin/public/sw.js",
  ],
  rules: {
    // ── Language & TypeScript ──────────────────────────────────────────────────────────────
    eqeqeq: "error",
    "no-var": "error",
    "prefer-const": "error",
    "no-console": ["warn", { allow: ["info", "warn", "error"] }],
    "typescript/consistent-type-imports": "error",
    "typescript/no-explicit-any": "warn",
    "typescript/no-non-null-assertion": "warn",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/await-thenable": "error",
    "typescript/no-unnecessary-type-assertion": "warn",
    "typescript/switch-exhaustiveness-check": "error",
    "unicorn/filename-case": ["error", { case: "kebabCase" }],
    "unicorn/prefer-node-protocol": "error",
    "import/no-cycle": "error",
    "import/no-duplicates": "error",

    // ── React / Next.js ────────────────────────────────────────────────────────────────────
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "react/jsx-key": "error",
    "react/no-array-index-key": "warn",
    "react/self-closing-comp": "warn",
    "nextjs/no-img-element": "error",
    "nextjs/no-html-link-for-pages": "off",
    // New JSX transform; side-effect imports ("server-only", CSS, env validation) are intentional.
    "react/react-in-jsx-scope": "off",
    "import/no-unassigned-import": "off",
    // `axios.create()` is axios' documented API; Base UI relies on ARIA roles.
    "import/no-named-as-default-member": "off",
    "jsx-a11y/prefer-tag-over-role": "off",
    "oxc/no-map-spread": "off",
    "promise/no-promise-in-callback": "off",

    // ── Project conventions (see AGENTS.md) ─────────────────────────────────────────────────
    "project/no-inline-query-keys": "error",
    "project/no-hardcoded-routes": "error",
    "project/cn-for-conditional-classes": "error",
    "project/no-server-import-in-client": "error",
    "project/no-process-env": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "next/link",
            message: "Use Link from @/i18n/navigation (locale-aware) with a ROUTES constant.",
          },
          {
            name: "next/navigation",
            importNames: ["useRouter", "usePathname", "redirect", "permanentRedirect"],
            message: "Use @/i18n/navigation (or useAppRouter) — they keep the locale prefix.",
          },
          { name: "clsx", message: 'Use cn() from "@repo/ui/lib/utils".' },
          { name: "classnames", message: 'Use cn() from "@repo/ui/lib/utils".' },
          { name: "tailwind-merge", message: 'Use cn() from "@repo/ui/lib/utils".' },
          {
            name: "axios",
            message:
              "HTTP goes through src/lib/http (browser → BFF) or src/server/http (upstream).",
          },
          {
            name: "@tanstack/react-query",
            importNames: [
              "useQuery",
              "useSuspenseQuery",
              "useInfiniteQuery",
              "useMutation",
              "queryOptions",
            ],
            message: "Declare queries/mutations with makeQuery / makeMutation (src/lib/query).",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Views: render only. State, effects and fetching live in hooks.
      files: ["apps/*/src/app/**/*.tsx", "apps/*/src/**/components/**/*.tsx"],
      rules: { "project/no-logic-in-views": "error" },
    },
    {
      // Server modules must be guarded against client imports.
      files: ["apps/*/src/server/**/*.ts", "apps/*/src/features/*/server/**/*.ts"],
      excludeFiles: ["**/*.test.ts"],
      rules: { "project/require-server-only": "error" },
    },
    {
      // The only places allowed to create HTTP clients.
      files: ["apps/*/src/lib/http/**", "apps/*/src/server/http/**"],
      rules: { "no-restricted-imports": "off" },
    },
    {
      // The query layer wraps the raw React Query APIs.
      files: ["apps/*/src/lib/query/**"],
      rules: {
        "no-restricted-imports": "off",
        "project/no-inline-query-keys": "off",
        // Generic wrapper internals (zod output types are only known at the call site).
        "typescript/no-unsafe-type-assertion": "off",
      },
    },
    {
      // Key/route registries define the constants the rules point to.
      files: ["apps/*/src/config/**"],
      rules: { "project/no-inline-query-keys": "off", "project/no-hardcoded-routes": "off" },
    },
    {
      // Env modules, config files, scripts and tests may read process.env / log freely.
      files: [
        "apps/*/src/env/**",
        "apps/*/src/instrumentation.ts",
        "**/*.config.ts",
        "**/*.config.mjs",
        "scripts/**",
        "**/e2e/**",
        "**/*.test.ts",
        "**/*.test.tsx",
      ],
      rules: {
        "project/no-process-env": "off",
        "no-console": "off",
        "no-await-in-loop": "off",
        "typescript/no-non-null-assertion": "off",
        "typescript/no-unsafe-type-assertion": "off",
      },
    },
    {
      // Fake upstream API (MSW + Faker): test data, not production code.
      files: ["apps/*/src/mocks/**"],
      rules: {
        "typescript/no-unsafe-type-assertion": "off",
        "typescript/no-non-null-assertion": "off",
      },
    },
    {
      // shadcn/ui primitives are generated (CLI) — only correctness rules apply.
      files: ["packages/ui/src/**"],
      rules: {
        "project/cn-for-conditional-classes": "off",
        "react/no-array-index-key": "off",
        "react/set-state-in-effect": "off",
        "react/jsx-no-constructed-context-values": "off",
        "no-restricted-imports": "off",
        eqeqeq: "off",
        "eslint/no-shadow": "off",
        "typescript/no-unsafe-type-assertion": "off",
        "jsx-a11y/label-has-associated-control": "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-noninteractive-element-interactions": "off",
      },
    },
    {
      // Next.js special files use framework naming; route folders use [param] syntax.
      files: ["**/next-env.d.ts"],
      rules: { "unicorn/filename-case": "off" },
    },
  ],
});
