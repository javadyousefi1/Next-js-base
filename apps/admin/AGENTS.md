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
  api/auth/*            BFF: login · logout (the only place auth cookies are written)
  api/proxy/[...path]/  BFF: browser → upstream API with the access token (refresh on 401)
  api/health/           Liveness probe (Docker HEALTHCHECK)
  manifest.ts · robots.ts · sitemap.ts
components/             Shared, feature-agnostic VIEWS: data-table, feedback, layout, providers
config/                 Constants: routes, query-keys, api-endpoints, cache-tags, navigation, site, auth
env/                    server.ts / client.ts — zod-validated env (@t3-oss/env-nextjs)
features/<name>/        Vertical slices (anatomy below)
hooks/                  Generic hooks with no feature knowledge (debounce, media query, router…)
i18n/                   next-intl routing, navigation (Link, useRouter…), request config, locale meta
lib/                    Building blocks: http (axios + ApiError), query (makeQuery…), table (generic tables), seo
mocks/                  MSW handlers + Faker database (fake upstream API)
server/                 Server-only: auth (cookies, refresh), bff responses, upstream http, redis, PrefetchBoundary
instrumentation.ts      Boot: validates env, starts MSW when API_MOCKING=enabled
proxy.ts                Next 16 proxy (formerly middleware): i18n routing + optimistic auth guard
```

## Feature anatomy — copy `features/users`

```
features/users/
  schemas/user.schema.ts       zod: entity + params (input contract) + response (output contract)
  api/users.service.ts         fetcher: (params, { http, signal }) → raw data; maps params → upstream query
  api/users.queries.ts         makeQuery / makeMutation definitions (key + schemas + fetcher)
  users.table.ts               defineDataTable({ sortFields, filters }) — shared by page and hook
  hooks/use-users-table.ts     useQueryTable({ definition, query, select, columns, labels })
  components/users-table.tsx   <DataTableView model={useUsersTable(usersColumns)} />
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
// features/<x>/api/<x>.service.ts — one fetcher for browser AND server
export const fetchUsersList: QueryFetcher<UsersListParams> = async (params, { http, signal }) => {
  const { data } = await http.get<unknown>(API_ENDPOINTS.users.list, {
    params: toQuery(params),
    signal,
  });
  return data; // `http` = apiClient (→ /api/proxy) in the browser, upstream + user token on the server
};

// features/<x>/api/<x>.queries.ts
export const usersListQuery = makeQuery({
  key: QUERY_KEYS.users.list, // from src/config/query-keys.ts — also names errors ("users.list")
  params: usersListParamsSchema, // input contract: parsed BEFORE the request
  response: usersListResponseSchema, // output contract: parsed BEFORE it reaches the cache
  fetcher: fetchUsersList,
  relatedKeys: [], // other keys whose invalidation must refetch this query
  staleTime: 30_000,
});
// in a hook: usersListQuery.useQuery(params) · on the server: usersListQuery.with(params)
```

- Invalid input → `ApiError` code `VALIDATION`; unexpected response → `INVALID_RESPONSE` (logged with
  the zod tree in development). The UI never receives unvalidated data.
- `makeMutation({ variables, response, mutationFn, invalidates })` — `invalidates` keys (and every
  query that lists them in `relatedKeys`, transitively) are invalidated after success.
- Errors are always `ApiError` (`code`, `status`, `retryAfterSeconds`). 4xx are not retried. Background
  failures show a toast; a first-load failure renders `<QueryError>` in the view.
- Fetchers use `http` from their context with `API_ENDPOINTS` paths (the proxy maps them 1:1).
  `bffClient` (→ `/api/auth/*`) is only for login/logout. A 401 in the browser emits
  `unauthorized` → `useUnauthorizedRedirect` sends the user to login.
- Server-only calls (Server Components, `'use cache'`, route handlers): `upstreamGet(url, schema)` /
  `upstreamPost(url, body, schema)` — validated, errors labelled with the endpoint (`GET /stats`).

## Tables (search + filters + sorting + pagination)

One definition, one hook, one view — the whole pattern for any server-driven table:

```ts
// features/<x>/<x>.table.ts — shared by the page (server) and the hook (client)
export const usersTable = defineDataTable({ sortFields: USER_SORT_FIELDS, filters: { role: USER_ROLES } });

// features/<x>/hooks/use-<x>-table.ts — wiring + labels only
export function useUsersTable(columns: UsersColumns) {
  const t = useTranslations("Users");
  return useQueryTable({
    definition: usersTable,
    query: usersListQuery, // params = page, pageSize, q, sortBy, order + filter values
    select: (data) => ({ rows: data.users, total: data.total }),
    columns,
    getRowId: (user) => String(user.id),
    labels: {
      searchPlaceholder: t("searchPlaceholder"),
      filters: { role: { title: t("roleFilter"), option: (role) => t(`roles.${role}`) } },
    },
  });
}

// features/<x>/components/<x>-table.tsx
export function UsersTable() {
  return <DataTableView model={useUsersTable(usersColumns)} />;
}
```

URL state (debounced search, page reset on change, `?role=admin`), toolbar, loading/error/empty
states and pagination are generic (`lib/table`, `components/data-table`). A new filter = one entry
in `filters` + its labels. Need another filter kind (date range, multi-select)? Extend
`defineDataTable` + `DataTableToolbar` once, never per page.

## Server prefetch (hydration)

```tsx
<PrefetchBoundary
  queries={[usersListQuery.with(usersTable.loadParams(searchParams))]}
  fallback={<DataTableSkeleton />}
>
  <UsersTable />
</PrefetchBoundary>
```

`PrefetchBoundary` (server-only) wraps itself in `<Suspense>`, reads the auth cookie, runs each
query's own fetcher against the upstream API with the user's token, and dehydrates the cache. Any
`makeQuery` definition works: `xQuery.with(params)` (params may be a promise). No session or an
expired token → nothing is prefetched and the client fetches through the BFF.

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
