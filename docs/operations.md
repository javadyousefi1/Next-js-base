# Operations: tooling, tests, delivery

## Scripts (root)

| Script                                    | Does                                                        |
| ----------------------------------------- | ----------------------------------------------------------- |
| `setup` (`scripts/setup.sh`)              | doctor → `bun install` → `.env.local` → Playwright Chromium |
| `doctor` (`scripts/doctor.sh`)            | Checks Node/Bun versions, Docker, env file                  |
| `clean` (`scripts/clean.sh`)              | Removes `.next`, `.turbo`, `dist`, reports, `node_modules`  |
| `icons` (`scripts/pwa/generate-icons.ts`) | Regenerates PWA PNG icons from `public/icons/icon.svg`      |
| `check`                                   | `turbo run lint format:check typecheck test`                |
| `build` / `start` / `dev`                 | Turborepo-driven Next.js commands                           |
| `test` / `test:e2e`                       | bun unit tests (+ lint-rule tests) / Playwright             |
| `docker:build                             | up                                                          | down | redis` | docker compose helpers |

## Git hooks (Husky)

- `pre-commit` → lint-staged: `oxlint --fix` + `oxfmt` on staged files only.
- `commit-msg` → commitlint (`commitlint.config.ts`, Conventional Commits + scope enum).
- `pre-push` → `scripts/git/pre-push.sh`: `bun run check` always; when pushing `main` also
  `bun run build` and `bun run test:e2e` (`SKIP_E2E=1` skips e2e).

## Turborepo cache

- `build` inputs exclude tests, e2e and Markdown, so docs/test edits never rebuild the app.
- Outputs: `.next/**` minus `.next/cache` and `.next/dev`.
- Strict env: `env` (part of the hash) = `API_BASE_URL`, `API_MOCKING`, `NEXT_PUBLIC_*`;
  runtime-only secrets are `passThroughEnv` (available, not hashed).
- Root tasks (`//#lint`, `//#format:check`) hash the whole repo explicitly.
- Remote cache: `bunx turbo login && bunx turbo link` (Vercel) or set `TURBO_TOKEN`/`TURBO_TEAM`.

## Lint rules

Built-in categories `correctness` (error), `suspicious`/`perf` (warn), plugins typescript,
react, nextjs, jsx-a11y, import, promise, unicorn, oxc, node; type-aware rules
(`no-floating-promises`, `no-misused-promises`, `switch-exhaustiveness-check`…). Project rules
are documented in `packages/oxlint-plugin/README.md`. Overrides relax rules only for generated
shadcn code, mocks, scripts and tests.

## Tests

- Unit: `bun test` in `apps/admin` and in the packages (`@repo/http` against a real local server,
  `@repo/query` invalidation and validation).
- Lint rules: `node --test` in `packages/oxlint-plugin` (38 cases).
- E2E: 15 Playwright tests (`apps/admin/e2e`) against the production build with MSW:
  auth redirect/validation/errors/login/logout + httpOnly check, users table search/filter/sort/
  pagination/shared URL, RTL + language switch, dark mode, robots/hreflang/manifest/SW headers.

## Environment variables (`apps/admin`)

| Variable                         | Side   | Default              | Notes                                            |
| -------------------------------- | ------ | -------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`           | client | —                    | Canonical origin (metadata, sitemap). Build time |
| `NEXT_PUBLIC_SITE_INDEXABLE`     | client | `false`              | `true` only for the public production site       |
| `API_BASE_URL`                   | server | —                    | Upstream REST API                                |
| `API_MOCKING`                    | server | `disabled`           | `enabled` → MSW + Faker answer the upstream      |
| `REDIS_URL`                      | server | —                    | `redis://host:6379`                              |
| `REDIS_KEY_PREFIX`               | server | `admin:`             | Namespaces every key                             |
| `AUTH_COOKIE_SECURE`             | server | `true` in production | `false` only for plain-http deployments          |
| `AUTH_ACCESS_TOKEN_TTL_SECONDS`  | server | `900`                | Access cookie lifetime                           |
| `AUTH_REFRESH_TOKEN_TTL_SECONDS` | server | `604800`             | Refresh cookie lifetime                          |

All of them are declared in one file, `apps/admin/src/env.ts` (`server` and `client` objects of one
`createEnv`). Validation runs at build (`next.config.ts`) and at boot (`instrumentation.ts`); a
missing or invalid value stops the process with a readable zod error. Docker builds set
`SKIP_ENV_VALIDATION=1` (secrets are not needed to build); the container validates every variable
when it starts, including the `NEXT_PUBLIC_*` values inlined at build.

## Docker

`apps/admin/Dockerfile` (context = repo root):

1. `prune` — `turbo prune admin --docker` (only the app + workspace deps, pruned `bun.lock`).
2. `builder` — `bun install --frozen-lockfile` (cached layer), then `turbo run build --filter=admin`
   with BuildKit cache mounts for Bun, `.next/cache` and `.turbo`.
3. `runner` — `node:24-alpine`, non-root user, standalone server (~70 MB app), `HEALTHCHECK` on
   `/api/health`.

`docker-compose.yml`: `admin` + `redis:8-alpine` (AOF persistence, LRU 256 MB, healthcheck,
localhost-only port). Demo defaults use the mocked API — set `API_MOCKING=disabled` and a real
`API_BASE_URL` for production.
