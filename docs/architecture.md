# Architecture

## Stack

| Area         | Choice                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| Monorepo     | Turborepo 2 (strict env mode, cached tasks) + Bun 1.4 workspaces (isolated installs)                           |
| App          | Next.js 16 App Router, React 19.3 + React Compiler, Cache Components, `proxy.ts`                               |
| Language     | TypeScript 7 (native compiler), strict + `noUncheckedIndexedAccess`                                            |
| UI           | shadcn/ui (`base-nova` style, Base UI primitives, RTL) in `packages/ui`, Tailwind CSS 4                        |
| Data         | `HttpClient` (axios inside) → BFF route handlers → upstream API; TanStack Query via `makeQuery`/`makeMutation` |
| Validation   | zod 4 everywhere (env, forms, query params, API responses)                                                     |
| State in URL | nuqs (tables: search, filters, sort, pagination)                                                               |
| i18n         | next-intl (`en`, `fa` + RTL), prefix routing `/en/...`, `/fa/...`                                              |
| Server infra | Redis (node-redis): rate limiting + cache-aside; httpOnly cookie sessions                                      |
| Mock API     | MSW 3 + Faker (`API_MOCKING=enabled`) — no backend needed                                                      |
| Quality      | Oxlint (type-aware + project rules), Oxfmt, Husky, commitlint, lint-staged                                     |
| Tests        | `bun test` (unit), `node --test` (lint rules), Playwright (e2e, against production build)                      |
| Delivery     | Docker multi-stage (turbo prune → standalone Next.js on Node), docker compose + Redis                          |

## Monorepo

```
apps/admin                Next.js 16 app (App Router, Cache Components, React Compiler)
packages/http             HttpClient (axios inside): data or ApiError out
packages/query            makeQuery / makeMutation, related-key invalidation, QueryClient
packages/access           role-based access: grants, permission/role checks, <Can>
packages/table            headless tables: nuqs URL contract + useTableState
packages/hooks            generic React hooks
packages/redis            server-only Redis: client, remember, rateLimit
packages/ui               shadcn/ui (base-nova, Base UI) + Tailwind 4 tokens + cn()
packages/oxlint-plugin    project lint rules (project/*)
packages/typescript-config  tsconfig presets
```

Turborepo runs every task (`build`, `typecheck`, `test`, `test:e2e`, root `lint`/`format:check`)
with content-hash caching; strict env mode means only declared variables reach a task and change
its hash. Bun installs dependencies (isolated layout) and runs scripts/unit tests; Next.js runs on
Node in production (standalone output).

## Request flow

```
Browser ──page request──▶ proxy.ts ── i18n (next-intl): "/" → "/en", locale cookie
                              └── guard: no auth cookie on a protected page → /<locale>/login?callbackUrl=…
        ──/api/auth/*────▶ BFF route handlers ── upstream /auth/* ── Set-Cookie (httpOnly)
        ──/api/proxy/*───▶ BFF catch-all ── Bearer <access_token cookie> ──▶ upstream API
                              └── 401 → refresh once → retry → rotate cookies │ fail → clear cookies → 401
<PrefetchBoundary> ── same query fetchers, http = upstream + cookie token ── dehydrate → HydrationBoundary
MSW (API_MOCKING=enabled) intercepts every upstream call inside the Node process (instrumentation.ts)
```

- The browser never sees a token: cookies are `httpOnly`, `Secure` in production, `SameSite=Lax`.
- `proxy.ts` only checks cookie presence (fast, optimistic). The upstream API is the authority.
- A 401 that survives the refresh clears the cookies and makes the client redirect to login
  (`emitUnauthorized` → `useUnauthorizedRedirect`), keeping `callbackUrl` (validated against open
  redirects).
- Login is rate limited per IP in Redis (5/minute); Redis being down never blocks login.

## Data flow (client)

```
view ──calls──▶ feature hook ──▶ xQuery.useQuery(params)
                                   │ params ── zod parse (VALIDATION on failure)
                                   │ fetcher(params, { http }) ── http = apiClient (/api/proxy) ── BFF ── upstream
                                   │ response ── zod parse (INVALID_RESPONSE on failure)
                                   ▼
                              React Query cache (key from QUERY_KEYS)
mutation success ──▶ invalidate `invalidates` keys ──▶ + every query whose `relatedKeys` match
                                                      (transitively, cycle-safe)
```

Tables follow the shadcn data-table pattern: a feature's `<x>.search-params.ts` (nuqs parsers)
is the URL contract, read by `useQueryStates` in the browser and by `createLoader` in
`<PrefetchBoundary>` on the server, so both build the same query key. `useTableState` turns
that URL state into actions (search, filter, sort, page) and the toolbar, table and pagination
components are plain React (no table library). Token-issuing endpoints (`/auth/login`,
`/auth/refresh`) are blocked in the proxy; the current user is `/auth/me`.

## Caching layers

| Layer          | What                                                                         | Invalidation                     |
| -------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| Next.js        | `'use cache'` + `cacheLife` + `cacheTag` (dashboard stats)                   | `updateTag()` in a Server Action |
| Static shell   | Partial prerendering of every page (Cache Components)                        | Rebuild / deploy                 |
| React Query    | Per-key cache in the browser (staleTime 60s default)                         | `invalidates` / `relatedKeys`    |
| Redis          | `remember()` cache-aside, rate-limit counters                                | TTL / key delete                 |
| HTTP           | `/_next/static/*` immutable, icons 7 days, `/sw.js` no-cache, BFF `no-store` | file hashes                      |
| Service worker | `/_next/static/*` cache-first, offline page precached                        | bump `VERSION` in `public/sw.js` |
| Turborepo      | Task outputs keyed by inputs + env                                           | content hash                     |

## PWA

`app/manifest.ts` (installable, maskable icons), `public/sw.js` (offline fallback page per locale,
static assets cache-first, never API/auth), `useServiceWorker` (production only), install card in
Settings (`beforeinstallprompt`, iOS hint), offline banner (`next/offline`).

## SEO

Locale-prefixed URLs with `hreflang` alternates and canonical URLs (`lib/seo/metadata.ts`);
`robots.txt` and `sitemap.xml` from `app/robots.ts` / `app/sitemap.ts`. Indexing is opt-in with
`NEXT_PUBLIC_SITE_INDEXABLE=true`; otherwise every page sends `noindex` and robots disallows all —
the safe default for an admin panel and for preview deployments.
