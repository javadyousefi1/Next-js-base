# packages/http — AGENTS.md

`@repo/http`: the HTTP client every app uses. Repository rules: [`../../AGENTS.md`](../../AGENTS.md).

- `HttpClient` wraps axios. Every request resolves to the response data — parsed with
  `{ schema }` when one is given, `unknown` otherwise — or throws an `ApiError`. No axios type
  leaves the class (`request()` returns `{ status, data }` for pass-through proxies).
- App-agnostic: never import from `apps/*`, never read env, routes or i18n. Apps create their
  instances (base URL, timeout, `onError`) in `src/lib/http` / `src/server/http` — the only places
  allowed to construct one (lint: `no-restricted-imports`).
- Tests: `bun test` against a real local HTTP server (`src/http-client.test.ts`).
