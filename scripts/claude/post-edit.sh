#!/usr/bin/env bash
# Claude Code PostToolUse hook (.claude/settings.json → Edit|MultiEdit|Write).
# Formats the edited file with oxfmt, then lints it with oxlint. Lint errors are sent back to
# Claude (exit code 2 = blocking feedback on stderr) so they get fixed immediately.
# Input: the hook JSON on stdin — { "tool_name": "...", "tool_input": { "file_path": "..." } }.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

file="$(bun -e 'const input = await Bun.stdin.json(); console.log(input?.tool_input?.file_path ?? "")' 2>/dev/null)"
[[ -z "$file" || ! -f "$file" ]] && exit 0

case "$file" in
  */node_modules/* | */.next/* | */.turbo/*) exit 0 ;;
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.jsonc | *.css | *.md | *.yml | *.yaml) ;;
  *) exit 0 ;;
esac

bunx oxfmt --no-error-on-unmatched-pattern "$file" >/dev/null 2>&1 || true

case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs)
    if ! output="$(bunx oxlint "$file" 2>&1)"; then
      echo "oxlint found problems in $file — fix them (conventions: AGENTS.md):" >&2
      echo "$output" >&2
      exit 2
    fi
    ;;
esac
exit 0
