# apps/admin — AGENTS.md

The reference Next.js 16 app. Repository rules: [`../../AGENTS.md`](../../AGENTS.md).
Next.js docs for **this exact version** are bundled: `node_modules/next/dist/docs/` (App Router
in `01-app/`). Read them before using a Next.js API you are not sure about.

## Folder structure (`src/`)

```
app/                    Routing only — thin pages/layouts, BFF route handlers, metadata routes
  [locale]/             Root layout (html, fonts, providers), not-found, error boundary
    (app)/              Authenticated shell (sidebar): dashboard `/`, `/users`, `/settings`
    (auth)/login/       Public login page
    offline/            PWA offline fallback (public, precached by public/sw.js)
  api/auth/*            BFF: login · logout · session (the only place cookies are written)
  api/proxy/[...path]/  BFF: browser → upstream API with the access token (refresh on 401)
  api/health/           Liveness probe (Docker HEALTHCHECK)
  manifest.ts · robots.ts · sitemap.ts
components/             Shared, feature-agnostic VIEWS: data-table, feedback, layout, providers
config/                 Constants: routes, query-keys, api-endpoints, cache-tags, navigation, site, auth
env/                    server.ts / client.ts — zod-validated env (@t3-oss/env-nextjs)
features/<name>/        Vertical slices (anatomy below)
hooks/                  Generic hooks with no feature knowledge (debounce, media query, table state…)
i18n/                   next-intl routing, navigation (Link, useRouter…), request config, locale meta
lib/                    Building blocks: http (axios + ApiError), query (makeQuery…), table, seo
mocks/                  MSW handlers + Faker database (fake upstream API)
server/                 Server-only: auth (cookies, refresh), bff responses, upstream http, redis
instrumentation.ts      Boot: validates env, starts MSW when API_MOCKING=enabled
proxy.ts                Next 16 proxy (formerly middleware): i18n routing + optimistic auth guard
```

## Feature anatomy — copy `features/users`

```
features/users/
  schemas/user.schema.ts       zod: entity + params (input contract) + response (output contract)
  api/users.service.ts         HTTP only (browser → BFF), returns `unknown`; maps params → upstream query
  api/users.queries.ts         makeQuery / makeMutation definitions (key + schemas + fetcher)
  server/users.prefetch.ts     server-only SSR prefetch → dehydrated cache (optional)
  users.search-params.ts       nuqs parsers shared by the server loader and the client hook
  hooks/use-users-table.ts     ALL logic of the view; returns a ready-to-render model
  components/users-table.tsx   view: calls one hook, renders the result
  components/users-columns.tsx static column definitions (presentation only)
```

Dependency direction: `schemas` ← `api` ← `hooks` ← `components` ← `app`. `server/` may use `api`
and `schemas`; client code never imports `server/` (except Server Actions in `*.actions.ts`).
Features import other features only through `schemas` or a deliberately shared component
(e.g. the shell renders `auth/components/user-menu`). Anything shared by two features moves to
`lib/`, `hooks/`, `components/` or `config/`.

## Logic vs. view

- A **view** (`components/**`, `app/**`) renders props and the return value of ONE feature hook. It
  may call `useTranslations`, other presentational hooks and event handlers that forward to the
  hook. No `useState`/`useEffect`/`useQuery`/`useForm`/`fetch`/axios (lint: `project/no-logic-in-views`).
- A **hook** owns state, effects, queries, mutations, validation, mapping and navigation, and returns
  plain values + callbacks named for the view (`status`, `rows`, `setSearch`, `onSubmit`).
- Pages are Server Components that compose views; they may call a feature's server function
  (e.g. prefetch) inside `<Suspense>`.

## Server vs. client

| Need                                         | Put it in                                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Cookies/tokens, secrets, upstream API, Redis | `src/server/**`, `features/*/server/**`, route handlers, Server Components                |
| Interactivity, browser APIs, state           | `"use client"` leaf components + hooks                                                    |
| Data for interactive views                   | `makeQuery` (browser → BFF), optionally prefetched on the server                          |
| Shared, non-personal data (stats, catalogs)  | Server Component + `'use cache'` + `cacheLife` + `cacheTag`                               |
| Writes                                       | `makeMutation` (browser → BFF); Server Actions only for server-only effects (`updateTag`) |

`"use client"` goes on the lowest file that needs it. Server modules start with
`import "server-only"`. Never pass tokens or secrets as props.

## Data fetching

```ts
// features/<x>/api/<x>.queries.ts
export const usersListQuery = makeQuery({
  name: "users.list", // label used in validation errors
  key: QUERY_KEYS.users.list, // from src/config/query-keys.ts — never inline arrays
  params: usersListParamsSchema, // input contract: parsed BEFORE the request
  response: usersListResponseSchema, // output contract: parsed BEFORE it reaches the cache
  fetcher: fetchUsersList, // (parsedParams, { signal }) => Promise<unknown>
  relatedKeys: [], // other keys whose invalidation must refetch this query
  staleTime: 30_000,
});
// in a hook: usersListQuery.useQuery(params, { placeholderData: keepPreviousData })
// on the server: usersListQuery.prefetch(queryClient, params, { fetcher: serverFetcher })
```

- Invalid input → `ApiError` code `VALIDATION`; unexpected response → `INVALID_RESPONSE` (logged with
  the zod tree in development). The UI never receives unvalidated data.
- `makeMutation({ variables, response, mutationFn, invalidates })` — `invalidates` keys (and every
  query that lists them in `relatedKeys`, transitively) are invalidated after success.
- Errors are always `ApiError` (`code`, `status`, `retryAfterSeconds`). 4xx are not retried. Background
  failures show a toast; a first-load failure renders `<QueryError>` in the view.
- Browser HTTP uses `apiClient` (→ `/api/proxy`) or `bffClient` (→ `/api/auth/*`) from `lib/http`.
  A 401 emits `unauthorized` → `useUnauthorizedRedirect` sends the user to login.

## Auth (BFF + httpOnly cookies)

```
login:   browser → POST /api/auth/login → upstream /auth/login → Set-Cookie access_token + refresh_token (httpOnly, Secure in prod, SameSite=Lax)
request: browser → /api/proxy/<path> → BFF adds Bearer from cookie → upstream
         401 → refresh once with refresh_token → retry → rotated cookies on the response
         refresh fails → cookies cleared → 401 → client redirects to /login?callbackUrl=…
guard:   proxy.ts redirects by cookie presence only (optimistic); the upstream API authorizes
```

Login is rate limited in Redis (5/min/IP); if Redis is down it fails open (logged), never blocks.

## Caching

- **Next.js**: Cache Components are on. `'use cache'` + `cacheLife(...)` + `cacheTag(CACHE_TAGS.x)` for
  shared data; invalidate with `updateTag(tag)` from a Server Action. Never read cookies inside
  `'use cache'`. Request-time data (cookies, searchParams) only inside `<Suspense>`; call
  `await connection()` to keep work out of the build.
- **Client**: React Query defaults (staleTime 60s, gcTime 5m); per-query `staleTime`.
- **Redis**: `remember(key, ttl, schema, load)` (validated cache-aside) and `rateLimit(key, opts)`.
- **HTTP**: `/_next/static` immutable; `/sw.js` no-cache; BFF responses `no-store`.

## i18n & RTL

- Locales `en`, `fa` (`src/i18n/routing.ts`), URLs always prefixed. Messages in `messages/*.json`,
  same keys in both files. Server: `getTranslations`; client: `useTranslations`.
- Navigation only through `@/i18n/navigation` (`Link`, `redirect`, `usePathname`) or
  `useAppRouter` (adds the top loader).
- Use logical Tailwind classes (`ms-*`, `pe-*`, `start-*`, `text-start`); flip directional icons with
  `rtl:rotate-180`.

## Env

Declare every variable in `src/env/server.ts` (server) or `src/env/client.ts` (`NEXT_PUBLIC_*`), add
it to `.env.example`, to `turbo.json` (`env`/`passThroughEnv`) and to `docker-compose.yml` when
the container needs it. Skill: `add-env-var`.

## Testing

- Unit: `*.test.ts` next to the code, `bun test` (`bun run test`).
- E2E: `e2e/*.spec.ts`, Playwright against `next start` with MSW (`bun run test:e2e`). Use roles and
  labels (`getByRole`, `getByLabel`), never CSS classes. Skill: `write-e2e-test`.
