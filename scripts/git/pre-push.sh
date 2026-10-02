#!/usr/bin/env bash
# Husky pre-push hook (see .husky/pre-push).
#
#  every push : lint + format check + typecheck + unit tests   (turbo, cached)
#  push → main: + production build + Playwright e2e            (SKIP_E2E=1 to skip e2e)
#
# git passes "<local ref> <local sha> <remote ref> <remote sha>" lines on stdin.
set -euo pipefail

pushes_main=false
while read -r _local_ref _local_sha remote_ref _remote_sha; do
  if [[ "$remote_ref" == "refs/heads/main" ]]; then pushes_main=true; fi
done
if [[ "$(git rev-parse --abbrev-ref HEAD)" == "main" ]]; then pushes_main=true; fi

echo "▶ pre-push: lint, format, typecheck, unit tests"
bun run check

if [[ "$pushes_main" == true ]]; then
  echo "▶ pre-push (main): production build"
  bun run build
  if [[ "${SKIP_E2E:-0}" != "1" ]]; then
    echo "▶ pre-push (main): end-to-end tests"
    bun run test:e2e
  fi
fi

echo "✔ pre-push checks passed"
