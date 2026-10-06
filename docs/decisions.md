# Decisions and caveats

Short ADRs. Each one says what was chosen, why, and what to watch out for.

1. **Turborepo + Bun workspaces.** Fast installs and scripts with Bun; Turborepo for cached,
   dependency-aware tasks. Next.js still runs on **Node** in production (officially supported);
   Bun is not used as the production runtime.
2. **Exact version pins, latest at creation time.** Reproducible builds. "Latest" moves — update
   deliberately (`bun outdated`, `bun update --latest`, then `bun run check && bun run test:e2e`).
3. **TypeScript 7 (native compiler).** Much faster type checking; Next.js 16.3 runs it through the
   `tsc` CLI. Caveat: no TypeScript JS API — tools that need it (and Next's editor plugin) don't
   work; use the TypeScript native preview extension in VS Code.
4. **Oxlint + Oxfmt instead of ESLint/Prettier.** 50–100× faster. Project conventions are custom
   JS-plugin rules (`project/*`). Caveats: JS plugins are alpha (not semver) and type-aware linting
   relies on `oxlint-tsgolint`; Oxfmt is pre-1.0. Versions are pinned; upgrade with the checks.
5. **BFF with httpOnly cookies.** Tokens never reach JavaScript (XSS can't steal them); one place
   (`/api/proxy`) adds auth and refreshes sessions. Cost: one extra hop per API call.
6. **`makeQuery` / `makeMutation`.** One typed, zod-validated definition per endpoint with
   key, schemas and invalidation in one place. Related keys give cross-feature refetching without
   manual `invalidateQueries` calls.
7. **Cache Components (`cacheComponents: true`).** The Next.js 16 caching model: static shells +
   streamed dynamic holes, explicit `'use cache'`. Consequences: request-time data must sit in
   `<Suspense>`; route segment configs (`dynamic`, `revalidate`) no longer exist.
8. **In-memory `'use cache'` handler.** Kept simple on purpose. With several instances, each has
   its own cache — configure `cacheHandlers` (e.g. Redis) when you scale horizontally.
9. **Hand-written service worker** instead of Serwist/next-pwa: their route-handler integration
   conflicts with Cache Components, and the needs here are small (offline page + static assets).
10. **CSP without nonces.** Nonce-based CSP forces dynamic rendering of every page. The policy uses
    `'unsafe-inline'` for scripts (needed by Next.js/next-themes inline scripts) but blocks other
    origins, framing and object embeds. Move to nonces if you accept full dynamic rendering.
11. **MSW + Faker as the upstream API.** The app runs end-to-end with no backend and deterministic
    data (seeded Faker); the same mocks drive e2e tests. Disable with `API_MOCKING=disabled`. The
    mock speaks a DummyJSON-like contract; only the `*.backend.ts` files know it.
12. **Backend-independent frontend.** Each feature's `api/<x>.backend.ts` is the only code that
    knows the backend (query params, response shapes, JWT auth fields); it maps them to the app's
    domain types with typed zod schemas. A different backend changes those files, the endpoint
    paths and the mock — never views, hooks or the BFF.
13. **Fail-open Redis.** Rate limiting and caching degrade (logged) instead of taking login down.
14. **Optimistic route guard.** `proxy.ts` only checks cookie presence (no network call per
    request). Authorization is the upstream API's job; expired sessions are handled by the BFF.
15. **Roboto + Vazirmatn.** Roboto (requested) has no Arabic-script glyphs, so Persian text falls
    back to Vazirmatn (loaded on demand) instead of a random system font.
16. **"No logic in components"** applies to app views (lint-enforced). shadcn primitives in
    `packages/ui` are vendor UI code and keep their internal UI state.
17. **React Compiler + react-hook-form.** The compiler can memoize RHF's mutable `formState`
    reads; form hooks opt out with `"use no memo"` (see `use-login-form.ts`).
18. **`experimental.useOffline`** is an experimental Next.js flag (offline banner + retry). Remove
    the flag and the banner if you need only stable APIs.
