# apps/admin — AGENTS.md

The reference Next.js 16 app. Repository rules: [`../../AGENTS.md`](../../AGENTS.md). Details and
code live where they are needed: path rules in `.claude/rules/` (load with the files they cover)
and skills in `.claude/skills/` (`add-feature`, `add-page`, `add-query`, `add-mutation`,
`add-table`, `add-access`, `add-translation`, `add-env-var`, `write-e2e-test`). Next.js docs for
**this exact version**: `node_modules/next/dist/docs/` (App Router in `01-app/`).

## Folder structure (`src/`)

```
app/                    Routing only — thin pages/layouts, BFF route handlers, metadata routes
  [locale]/             Root layout (html, fonts, providers), not-found, error boundary
    (app)/              Authenticated shell (sidebar): dashboard `/`, `/users`, `/settings`
    (auth)/login/       Public login page
    offline/            PWA offline fallback (public, precached by public/sw.js)
  api/auth/*            BFF: login · logout (the only place auth cookies are written)
  api/proxy/[...path]/  BFF: browser → upstream API with the access token (refresh on 401)
  api/health/           Liveness probe (Docker HEALTHCHECK)
  manifest.ts · robots.ts · sitemap.ts
components/             Shared, feature-agnostic VIEWS: data-table, feedback, layout, providers
config/                 Constants: routes, query-keys, api-endpoints, cache-tags, navigation, breadcrumbs, site, auth, access
features/<name>/        Vertical slices (anatomy below)
hooks/                  App hooks (useAppRouter: i18n router + top loader); generic ones: @repo/hooks
i18n/                   next-intl routing, navigation (Link, useRouter…), request config, locale meta
lib/                    App bindings: http (apiClient/bffClient), query (makeQuery + error toasts), seo
mocks/                  MSW handlers + Faker database (fake upstream API)
server/                 Server-only: auth (cookies, refresh), bff responses, upstream client, getRedis, PrefetchBoundary
env.ts                  All env vars, zod-validated: `server` + `client` objects (@t3-oss/env-nextjs)
instrumentation.ts      Boot: validates env, starts MSW when API_MOCKING=enabled
proxy.ts                Next 16 proxy (formerly middleware): i18n routing + optimistic auth guard
```

App-agnostic building blocks come from workspace packages: `@repo/http`, `@repo/query`,
`@repo/table`, `@repo/access`, `@repo/hooks`, `@repo/redis`, `@repo/ui` (root `AGENTS.md` §3).

## Feature anatomy — copy `features/users`

```
schemas/<f>.schema.ts     domain types + params schema (the app's own shapes)
api/<f>.backend.ts        the ONLY file that knows the backend: query mapping + response → domain
api/<f>.service.ts        fetcher: (params, { http, signal }) → raw data
api/<f>.queries.ts        makeQuery / makeMutation (key + schemas + fetcher)
<f>.search-params.ts      tables: nuqs parsers = the URL contract (page prefetch + hook)
hooks/use-<f>-*.ts        logic: state, queries, mapping → a render-ready model
components/*.tsx          views: render the hook's result
```

Dependency direction: `schemas` ← `api` ← `hooks` ← `components` ← `app`. `server/` may use `api`
and `schemas`; client code never imports `server/` (except Server Actions in `*.actions.ts`).
Features import other features only through `schemas` or a deliberately shared component.
Shared by two features → `lib/`, `hooks/`, `components/`, `config/`, or a `packages/*` package
when no app knowledge is involved.

## Rules in short (details: `.claude/rules/*`, skills)

- **Views vs hooks** — a view renders props and ONE feature hook's result (+ `useTranslations`,
  presentational hooks); state, effects, queries, forms and mapping live in hooks (lint:
  `project/no-logic-in-views`). Rules: `views.md`, `hooks.md`.
- **Server vs client** — cookies/tokens, secrets, upstream API, Redis: `src/server/**`, route
  handlers, Server Components (`import "server-only"`). Interactivity: `"use client"` on the lowest
  file. Shared non-personal data: Server Component + `'use cache'`. Writes: `makeMutation`; Server
  Actions only for server-only effects (`updateTag`). Never pass tokens or secrets as props.
  Rule: `server.md`.
- **Data** — `makeQuery` / `makeMutation` with zod `params`/`variables` and `response`; keys from
  `QUERY_KEYS`; fetchers use the injected `http` (browser: BFF; server prefetch: upstream with the
  user's token). Errors are always `ApiError` (`code`, `status`). Rule: `data-fetching.md`;
  skills: `add-query`, `add-mutation`.
- **Backend independence** — views, hooks, tables, cookies and the BFF only know domain types.
  A new backend = `API_BASE_URL` → `src/config/api-endpoints.ts` → every `*.backend.ts`
  (`z.ZodType<Domain>` or a typed `.transform()`; lists → `{ items, total }`) → the MSW mock.
  Nothing else changes. Auth (JWT) mapping: `features/auth/api/auth.backend.ts`.
- **Prefetch** — pages wrap a view in `<PrefetchBoundary queries={[xQuery.with(params)]}
fallback={…}>`: it runs the same fetchers on the server with the user's token and hydrates
  the cache; no session → the client fetches.

## Tables · access · breadcrumbs

- **Tables** — URL state (nuqs) + `useTableState` + `<DataTableProvider>` with prop-less
  toolbar/table/pagination; filters come from a config (`select` · `multiSelect` · `text`) and
  open in a drawer; changes apply instantly. Skill: `add-table`.
- **Access** — `src/config/access.ts` (`PERMISSIONS`, `ACCESS_POLICY`, `ROUTE_ACCESS`);
  `<Can permission|role>`, `useAccess().can()`, `hasAccess()` in Server Actions; a guarded page
  shows "No access" and its nav link hides. Only `auth.backend.ts` maps the backend's roles. It
  hides UI — the backend still authorizes. Skill: `add-access`.
- **Breadcrumbs** — one entry per page in `src/config/breadcrumbs.ts` (`"/users/[id]"` for a
  dynamic segment) + the `Nav` message; nested pages need nothing else. Skill: `add-page`.

## Auth (BFF + httpOnly cookies)

```
login:   browser → POST /api/auth/login → upstream /auth/login → Set-Cookie access_token + refresh_token (httpOnly, Secure in prod, SameSite=Lax)
request: browser → /api/proxy/<path> → BFF adds Bearer from cookie → upstream (also /auth/me = the session)
         401 → refresh once with refresh_token → retry → rotated cookies on the response
         refresh fails → cookies cleared → 401 → client redirects to /login?callbackUrl=…
guard:   proxy.ts redirects by cookie presence only (optimistic); the upstream API authorizes
blocked: /api/proxy/auth/login and /auth/refresh → 404 (tokens must never reach JavaScript)
```

Login is rate limited in Redis (5/min/IP); if Redis is down it fails open (logged), never blocks.

## Caching

- **Next.js**: Cache Components on. `'use cache'` + `cacheLife` + `cacheTag(CACHE_TAGS.x)` for
  shared data; `updateTag(tag)` from a Server Action. Never read cookies inside `'use cache'`.
  Request-time data only inside `<Suspense>`; `await connection()` keeps work out of the build.
- **Client**: React Query defaults (staleTime 60s, gcTime 5m); per-query `staleTime`.
- **Redis** (`@repo/redis`): `remember(getRedis(), key, ttl, schema, load)` and `rateLimit(…)`.
- **HTTP**: `/_next/static` immutable; `/sw.js` no-cache; BFF responses `no-store`.

## i18n, RTL & fonts

- Locales `en`, `fa`, URLs always prefixed; same keys in `messages/en.json` and `fa.json`.
  `APP_DIRECTION` in `src/i18n/routing.ts`: `"rtl"`, `"ltr"` or `"both"` (+ switcher); the first
  locale is the default. Rule: `i18n.md`; skill: `add-translation`.
- Fonts are self-hosted in `src/fonts` (`next/font/local`) — never `next/font/google` (when Google
  is unreachable, dev silently renders Arial and the build fails). LTR → Roboto first; RTL →
  Vazirmatn first, Latin too (`--app-font` in `styles/globals.css`): Roboto's fallback face is
  local Arial, which has Persian glyphs on Windows/macOS.
- Navigation only via `@/i18n/navigation` or `useAppRouter`. Logical classes (`ms-*`, `pe-*`,
  `start-*`); directional icons get `rtl:rotate-180`.

## Env & testing

- One file, `src/env.ts` (`server` + `client` objects); new keys also in `.env.example`,
  `turbo.json` and `docker-compose.yml`. Skill: `add-env-var`.
- Unit: `*.test.ts` next to the code (`bun test`). E2E: `e2e/*.spec.ts`, Playwright against
  `next start` + MSW, role/label locators. Demo logins: `admin` / `admin123`, `member` /
  `member123` (no users access). Skill: `write-e2e-test`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
