# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot…) **and** humans working in
this repository. Read this file completely before changing anything. App-specific rules live in
[`apps/admin/AGENTS.md`](apps/admin/AGENTS.md); background and rationale in [`docs/`](docs/README.md).

## 0. Working agreement

1. **Say it before you do it.** If a request is technically wrong, risky, conflicts with a rule in
   this file, or there is a clearly better way — say so **before** writing code, explain why in one
   or two sentences, and propose the alternative. Never silently comply with something broken and
   never silently deviate from what was asked.
2. **Don't invent APIs.** Every dependency here is newer than most training data (Next.js 16,
   React 19.3, TypeScript 7, Tailwind 4, TanStack Query 5, zod 4, nuqs 2, next-intl 4,
   MSW 3, Oxlint). Read the installed version: types in `node_modules/<pkg>`, Next.js docs in
   `node_modules/next/dist/docs/`, Turborepo docs in the installed `turbo` package (see the block
   at the end of this file). If you can't verify an API, say so.
3. **Copy the closest existing pattern.** `apps/admin/src/features/users` is the reference feature
   (schema → service → query → hook → view). Match its names, folders, comments and size.
4. **Keep it simple.** Small readable functions, no clever abstractions, no new dependency or new
   pattern without asking first.
5. **Cover the whole request.** Re-read the request before finishing; list anything you didn't do
   and why. Never leave a TODO without saying so.
6. **Done means green.** `bun run check` passes (lint + format + typecheck + unit tests). For app
   changes also `bun run build`, and `bun run test:e2e` when a user flow changed.

## 1. Stack

| Area         | Choice                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------- |
| Monorepo     | Turborepo 2 (strict env mode, cached tasks) + Bun 1.4 workspaces (isolated installs)      |
| App          | Next.js 16 App Router, React 19.3 + React Compiler, Cache Components, `proxy.ts`          |
| Language     | TypeScript 7 (native compiler), strict + `noUncheckedIndexedAccess`                       |
| UI           | shadcn/ui (`base-nova` style, Base UI primitives, RTL) in `packages/ui`, Tailwind CSS 4   |
| Data         | axios → BFF route handlers → upstream API; TanStack Query via `makeQuery`/`makeMutation`  |
| Validation   | zod 4 everywhere (env, forms, query params, API responses)                                |
| State in URL | nuqs (tables: search, filters, sort, pagination)                                          |
| i18n         | next-intl (`en`, `fa` + RTL), prefix routing `/en/...`, `/fa/...`                         |
| Server infra | Redis (node-redis): rate limiting + cache-aside; httpOnly cookie sessions                 |
| Mock API     | MSW 3 + Faker (`API_MOCKING=enabled`) — no backend needed                                 |
| Quality      | Oxlint (type-aware + project rules), Oxfmt, Husky, commitlint, lint-staged                |
| Tests        | `bun test` (unit), `node --test` (lint rules), Playwright (e2e, against production build) |
| Delivery     | Docker multi-stage (turbo prune → standalone Next.js on Node), docker compose + Redis     |

## 2. Commands (repo root)

| Command                               | What it does                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `bun run setup`                       | Toolchain check, install, create `apps/admin/.env.local`, Playwright browser          |
| `bun run dev`                         | All apps in dev mode (admin → http://localhost:3000, demo login `admin` / `admin123`) |
| `bun run check`                       | lint + format check + typecheck + unit tests (what pre-push runs)                     |
| `bun run build`                       | Production build (turbo-cached)                                                       |
| `bun run test:e2e`                    | Builds, then Playwright against `next start` with the mocked API                      |
| `bun run lint:fix` / `bun run format` | Auto-fix lint issues / format everything                                              |
| `bun run docker:up`                   | Production stack (admin + Redis) with docker compose                                  |
| `bun run doctor` / `bun run clean`    | Verify toolchain / remove build outputs and node_modules                              |

Add a dependency to one workspace: `bun add <pkg> --cwd apps/admin` (pin exact versions). Never
use npm/yarn/pnpm here (the root `devEngines` pins Bun).

## 3. Repository layout

```
apps/admin/              Next.js admin panel (reference app) — see apps/admin/AGENTS.md
packages/ui/             Design system: shadcn components, Tailwind tokens, cn(), shared hooks
packages/oxlint-plugin/  Project lint rules (`project/*`) + their tests
packages/typescript-config/  Shared tsconfig presets
scripts/                 setup, doctor, clean, git hooks, Claude hooks, PWA icon generator
docs/                    Architecture & decisions (start at docs/README.md)
.claude/                 Claude Code: settings + hooks, path rules, skills, subagents
```

## 4. Golden rules

Most rules are enforced by Oxlint (`oxlint.config.ts`) — a lint error is a rule violation, not a
nuisance: fix the code, don't disable the rule. Disabling needs a comment with a real reason.

| #   | Rule                                                                                                                                                                                               | Enforced by                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | Paths only from `ROUTES` (`src/config/routes.ts`); navigate with `Link`/`useAppRouter`/`redirect` from `@/i18n/navigation`                                                                         | `project/no-hardcoded-routes`, `no-restricted-imports`              |
| 2   | Query/mutation keys only from `QUERY_KEYS`/`MUTATION_KEYS` (`src/config/query-keys.ts`)                                                                                                            | `project/no-inline-query-keys`                                      |
| 3   | Server data only through `makeQuery`/`makeMutation` with zod `params`/`variables` **and** `response` schemas                                                                                       | `no-restricted-imports`                                             |
| 4   | Conditional/composed class names only with `cn()` from `@repo/ui/lib/utils`                                                                                                                        | `project/cn-for-conditional-classes`                                |
| 5   | **No logic in views.** Components render; state, effects, fetching, mapping and validation live in hooks/services                                                                                  | `project/no-logic-in-views`                                         |
| 6   | Server code stays on the server: `src/server/**` and `features/*/server/**` start with `import "server-only"`; client files never import them (Server Actions in `*.actions.ts` are the exception) | `project/require-server-only`, `project/no-server-import-in-client` |
| 7   | Env vars only via `env` from `src/env.ts` (`server`/`client` objects), validated by zod — a missing key fails the build/boot                                                                       | `project/no-process-env`                                            |
| 8   | Tokens never reach the browser: httpOnly cookies, browser calls only the BFF (`/api/auth/*`, `/api/proxy/*`)                                                                                       | architecture + review                                               |
| 9   | HTTP clients only in `src/lib/http` (browser → BFF) and `src/server/http` (server → upstream)                                                                                                      | `no-restricted-imports` (axios)                                     |
| 10  | Every user-facing string in `messages/en.json` **and** `messages/fa.json` (same keys); layouts must work in RTL (logical classes `ms-*`, `ps-*`, `start-*`)                                        | review                                                              |
| 11  | File names kebab-case; one component/hook per file; named exports (default only where Next requires it)                                                                                            | `unicorn/filename-case`                                             |
| 12  | Conventional Commits: `type(scope): subject`                                                                                                                                                       | commitlint (commit-msg hook)                                        |

## 5. Git workflow

- Hooks (Husky): **pre-commit** lint-staged (oxlint --fix + oxfmt on staged files) · **commit-msg**
  commitlint · **pre-push** `bun run check`, plus `bun run build` and e2e when pushing to `main`.
- Scopes: `admin`, `ui`, `oxlint-plugin`, `typescript-config`, `deps`, `docker`, `ci`, `docs`,
  `tooling`, `ai`. Example: `feat(admin): add user details page`.
- Never bypass hooks (`--no-verify`) or force-push shared branches.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
