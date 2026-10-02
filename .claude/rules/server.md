---
paths:
  - "apps/*/src/server/**"
  - "apps/*/src/features/*/server/**"
  - "apps/*/src/app/api/**"
  - "apps/*/src/proxy.ts"
  - "apps/*/src/instrumentation.ts"
---

# Server code

- First line `import "server-only";` (lint: `project/require-server-only`). Server Actions live in
  `*.actions.ts` with `"use server"` and must check the session themselves.
- Tokens exist only in httpOnly cookies (`src/server/auth/cookies.ts`). Never return a token in a
  response body, never log it, never pass it to client components. Token-issuing upstream
  endpoints (`/auth/login`, `/auth/refresh`) are blocked in the BFF proxy — keep it that way.
- Route handlers: validate input with zod (`safeParse`), call upstream through `withSession()`,
  answer with `bffJson()` / `bffError()` (they handle rotated cookies, `no-store`, safe messages and
  `unstable_rethrow`). Never catch-and-swallow Next.js errors.
- Upstream calls: `upstreamGet(url, schema)` / `upstreamPost(url, body, schema)` — the response is
  validated and errors are labelled with the endpoint constant. Raw `upstream` only for
  pass-through (the BFF proxy).
- Hydration: `<PrefetchBoundary queries={[xQuery.with(params)]} fallback={…}>` in the page. Never
  hand-write prefetch/dehydrate code or a second (server) fetcher.
- `proxy.ts` is an optimistic guard (cookie presence) + next-intl routing. No data fetching there.
- Redis via `getRedis()`; features must keep working when Redis is down (fail open, log).
- Cache Components: `'use cache'` + `cacheLife` + `cacheTag(CACHE_TAGS.x)` only for non-personal
  data; request-time APIs (`cookies()`, `headers()`, `connection()`) only inside `<Suspense>`.
- Env: import `serverEnv` from `@/env/server`; never `process.env` (lint: `project/no-process-env`).
