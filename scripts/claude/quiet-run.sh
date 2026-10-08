#!/usr/bin/env bash
# Runs a command and prints only what Claude needs: problem lines (with log line numbers), the
# summary at the end and the exit code. The full output stays in a log file (path printed) —
# read more of it with `sed -n 'A,Bp' <log>` when needed. Used by quiet-commands.sh.
set -uo pipefail

log="$(mktemp "${TMPDIR:-/tmp}/claude-run.XXXXXX")"
"$@" >"$log" 2>&1
status=$?

problems="$(grep -n -i -E 'error|fail|✘|✗|panic|timed out|warn|expected|received' "$log" |
  grep -v -i -E '\(pass\)|[^0-9]0 fail|fail 0|found 0 warnings and 0 errors|0 errors' |
  head -n 60)"
if [[ -n "$problems" ]]; then
  printf '%s\n---\n' "$problems"
fi
tail -n 8 "$log"
printf '[exit %s · %s lines · full log: %s]\n' "$status" "$(wc -l <"$log" | tr -d ' ')" "$log"
exit "$status"
