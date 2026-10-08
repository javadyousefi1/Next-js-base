#!/usr/bin/env bash
# Claude Code PreToolUse hook (.claude/settings.json → Bash). The repo's check/test/build
# commands print hundreds of lines; this reruns them through quiet-run.sh so only failures and
# the summary enter Claude's context (the full log stays on disk). Only these exact commands are
# rewritten — anything with pipes, redirects or other programs passes through untouched.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

input="$(cat)"
[[ "$input" == *"bun run "* || "$input" == *"bun test"* ]] || exit 0 # fast path: nothing to rewrite
cmd="$(printf '%s' "$input" | bun -e 'const i = await Bun.stdin.json(); process.stdout.write(i?.tool_input?.command ?? "")' 2>/dev/null)"

re='^((PLAYWRIGHT_[A-Z_]+=[A-Za-z0-9/._:-]+ )*)(bun run (check|test|test:e2e|build|typecheck|lint)|bun test)( [A-Za-z0-9/._:=@-]+)*$'
[[ "$cmd" =~ $re ]] || exit 0

prefix="${BASH_REMATCH[1]}"
runner="$(printf '%q' "$PWD/scripts/claude/quiet-run.sh")"
new_cmd="${prefix}${runner} ${cmd#"$prefix"}"

# Allowed without a prompt: the original is one of the repo's own check/test/build commands.
printf '%s' "$input" | NEW_CMD="$new_cmd" bun -e '
  const input = await Bun.stdin.json();
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: "repo check/test/build command, output filtered by quiet-run.sh",
      updatedInput: { ...input.tool_input, command: process.env.NEW_CMD },
    },
  }));
'
