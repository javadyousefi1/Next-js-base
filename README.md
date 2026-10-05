# Next.js Base

Production-ready Next.js 16 monorepo base (Turborepo + Bun) with a reference admin panel.

**گزارش کامل فارسی:** [`docs/REPORT.fa.md`](docs/REPORT.fa.md) — everything that was built, why,
a requirement-by-requirement checklist and the caveats.

## What's inside

- **Turborepo + Bun** workspaces, strict env mode, cached build/typecheck/test/lint tasks;
  app-agnostic code in shared packages (`@repo/http`, `query`, `table`, `hooks`, `redis`, `ui`)
- **Next.js 16** (App Router, Cache Components, React Compiler, `proxy.ts`), **React 19.3**,
  **TypeScript 7**, **Tailwind 4**, **shadcn/ui** (Base UI, RTL) in `packages/ui`
- **BFF auth**: tokens only in httpOnly cookies; `/api/auth/*` + `/api/proxy/*` with refresh
- **Data**: one `HttpClient` class (axios inside; data out — parsed when a `schema` is passed — or
  an `ApiError`) + TanStack Query wrapped by `makeQuery` / `makeMutation` (zod-validated input and
  output, related-key invalidation); URL-synced tables (nuqs, no table library)
- **i18n** (next-intl, English + Persian RTL), dark/light mode, top loader, SEO, **PWA**
- **Redis** (rate limiting, cache-aside), env validation (t3-env + zod), **MSW + Faker** mock API
- **Quality**: Oxlint (type-aware + project rules), Oxfmt, Husky, commitlint, lint-staged
- **Tests**: bun unit tests, Playwright e2e against the production build
- **Delivery**: multi-stage Dockerfile (turbo prune → standalone), docker compose with Redis
- **AI-ready**: `AGENTS.md`, `CLAUDE.md`, `.claude/` rules, skills, subagents and hooks

## Quick start

```bash
bun run setup     # toolchain check, install, .env.local, Playwright browser
bun run dev       # http://localhost:3000 — login: admin / admin123
```

| Command             | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `bun run check`     | lint + format check + typecheck + unit tests         |
| `bun run build`     | production build                                     |
| `bun run test:e2e`  | Playwright against the production build (mocked API) |
| `bun run docker:up` | admin + Redis with docker compose                    |

Docs: [`docs/`](docs/README.md) · Rules: [`AGENTS.md`](AGENTS.md) · App guide:
[`apps/admin/AGENTS.md`](apps/admin/AGENTS.md)
