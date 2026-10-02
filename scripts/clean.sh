#!/usr/bin/env bash
# Removes every build output, cache and dependency folder (then: bun install).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ Removing build outputs and caches"
find . -name node_modules -prune -o \( -name .next -o -name .turbo -o -name dist -o -name playwright-report -o -name test-results -o -name "*.tsbuildinfo" \) -prune -print0 \
  | xargs -0 rm -rf
echo "▶ Removing node_modules"
find . -name node_modules -type d -prune -print0 | xargs -0 rm -rf
echo "✔ Clean. Run: bun install"
