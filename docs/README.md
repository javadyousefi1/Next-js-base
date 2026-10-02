# Documentation

| Document                                           | Read it when                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| [REPORT.fa.md](REPORT.fa.md)                       | گزارش کامل فارسی: همه‌ی کارهای انجام‌شده، چک‌لیست نیازمندی‌ها، هشدارها |
| [architecture.md](architecture.md)                 | You need the big picture: request, auth, data and cache flows          |
| [decisions.md](decisions.md)                       | You wonder _why_ something is built this way (ADRs + known caveats)    |
| [operations.md](operations.md)                     | Tooling, tests, CI hooks, Docker, environment variables                |
| [../AGENTS.md](../AGENTS.md)                       | Rules for everyone (humans and AI agents)                              |
| [../apps/admin/AGENTS.md](../apps/admin/AGENTS.md) | How the admin app is organised and how to extend it                    |

## Quick start

```bash
bun run setup        # toolchain check, install, .env.local, Playwright browser
bun run dev          # http://localhost:3000 — demo login: admin / admin123
bun run check        # lint + format + typecheck + unit tests
bun run test:e2e     # production build + Playwright (API mocked with MSW)
bun run docker:up    # production stack: admin + Redis (docker compose)
```

Requirements: Node ≥ 24 (`.nvmrc`), Bun 1.4.2, Docker (optional, for Redis/compose). Redis is
optional in development: rate limiting fails open and the health check reports `redis: "down"`.
