#!/usr/bin/env bash
# One-time local setup: toolchain check, dependencies, env file, git hooks, Playwright browser.
#   bun run setup            # full setup
#   SKIP_BROWSERS=1 bun run setup
set -euo pipefail
cd "$(dirname "$0")/.."

bash scripts/doctor.sh

echo "▶ Installing dependencies (bun)"
bun install

if [[ ! -f apps/sample/.env.local ]]; then
  cp apps/sample/.env.example apps/sample/.env.local
  echo "▶ Created apps/sample/.env.local from .env.example (API mocked with MSW)"
fi

if [[ ! -f apps/panel/.env.local ]]; then
  cp apps/panel/.env.example apps/panel/.env.local
  echo "▶ Created apps/panel/.env.local from .env.example (API mocked with MSW)"
fi

if [[ "${SKIP_BROWSERS:-0}" != "1" ]]; then
  echo "▶ Installing the Playwright browser (chromium)"
  (cd apps/sample && bunx playwright install chromium)
fi

echo "✔ Ready. Start Redis (optional: bun run docker:redis) and run: bun run dev"
