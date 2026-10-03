# @repo/oxlint-plugin

Project conventions as Oxlint rules (JS plugin, ESLint-compatible API, written in TypeScript and
loaded natively by Node's type stripping). Enabled in the root `oxlint.config.ts` as `project/*`.

| Rule                         | Enforces                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `no-inline-query-keys`       | React Query keys come from `QUERY_KEYS` / `MUTATION_KEYS`                        |
| `no-hardcoded-routes`        | `href` / `router.push` / `redirect` use `ROUTES` constants                       |
| `cn-for-conditional-classes` | Conditional / composed `className` goes through `cn()`                           |
| `no-logic-in-views`          | No state, effects, data fetching or forms in view files                          |
| `no-server-import-in-client` | `"use client"` files never import server-only modules                            |
| `require-server-only`        | Server modules start with `import "server-only"` (or `"use server"`)             |
| `no-process-env`             | `process.env` only in `src/env.ts` (validated), except `NODE_ENV`/`NEXT_RUNTIME` |

Add a rule: create `src/rules/<name>.ts` with `defineRule`, register it in `src/index.ts`, add
valid/invalid cases to `src/index.test.ts`, enable it in `oxlint.config.ts`, document it in
`AGENTS.md`. Tests: `bun run test` here (runs `node --test`; Oxlint's RuleTester needs Node).
