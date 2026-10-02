#!/usr/bin/env bash
# Claude Code PostToolUse hook (.claude/settings.json): after Claude edits/writes a file,
# format it with oxfmt and lint it with oxlint. Lint errors are sent back to Claude
# (exit code 2 = blocking feedback) so it fixes them immediately.
set -uo pipefail

file="$(jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[[ -z "$file" || ! -f "$file" ]] && exit 0
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

case "$file" in
  *.ts | *.tsx | *.js | *.mjs | *.cjs | *.json | *.css | *.md) ;;
  *) exit 0 ;;
esac

bunx oxfmt --no-error-on-unmatched-pattern "$file" >/dev/null 2>&1 || true

case "$file" in
  *.ts | *.tsx | *.js | *.mjs | *.cjs)
    if ! output="$(bunx oxlint "$file" 2>&1)"; then
      echo "oxlint found problems in $file — fix them (see AGENTS.md conventions):" >&2
      echo "$output" >&2
      exit 2
    fi
    ;;
esac
exit 0
