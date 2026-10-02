#!/usr/bin/env bash
# Verifies the local toolchain matches the versions the repo expects.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
required_bun="$(node -p "require('./package.json').packageManager.split('@')[1]" 2>/dev/null || echo "?")"
required_node_major="$(cut -d. -f1 .nvmrc)"

check() { # name, ok?, message
  if [[ "$2" == true ]]; then echo "  ✔ $1"; else echo "  ✖ $1 — $3"; fail=1; fi
}

echo "▶ Toolchain"
if command -v node >/dev/null; then
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  check "node $(node -v)" "$([[ "$node_major" -ge "$required_node_major" ]] && echo true || echo false)" "need Node >= $required_node_major (see .nvmrc)"
else
  check "node" false "install Node $required_node_major (nvm install)"
fi
if command -v bun >/dev/null; then
  check "bun $(bun --version)" "$([[ "$(bun --version)" == "$required_bun" ]] && echo true || echo false)" "expected bun $required_bun (bun upgrade)"
else
  check "bun" false "install bun $required_bun: https://bun.sh"
fi
if command -v docker >/dev/null; then echo "  ✔ docker $(docker --version | cut -d' ' -f3 | tr -d ,)"; else echo "  • docker not found (only needed for Redis/compose)"; fi

[[ -f apps/admin/.env.local ]] && echo "  ✔ apps/admin/.env.local" || echo "  • apps/admin/.env.local missing (bun run setup creates it)"

exit "$fail"
