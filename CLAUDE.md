@AGENTS.md

# Claude Code

Everything above (AGENTS.md) applies. This part is specific to Claude Code.

## How to work here

- **Plan non-trivial work** (new feature, new pattern, cross-package change) before editing; list
  the files you will touch.
- **Use the skills** below instead of improvising — they encode the exact steps and file layout.
- **Docs only where they are read.** `docs/REPORT.fa.md` changes only when the user asks. Keep
  `AGENTS.md` files short indexes; working code lives in `apps/sample` (AGENTS.md §6).
- Check/test/build output is filtered by a hook (below); filter other noisy output yourself.

## Model routing (token budget)

Opus decides, Haiku reads, Sonnet types: main session on Opus for design, on Sonnet (`/model
sonnet`) for routine tasks a skill covers. Subagents have their model fixed in their frontmatter:

| Step         | Who                    | Does                                                                                                        |
| ------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1. Clarify   | main (Opus)            | Re-read the request. Scope or place unclear → ask the user short questions first (§0.6).                    |
| 2. Read code | `explorer` (Haiku)     | Finds and summarizes the relevant code (`path:line`, pattern to copy). Independent questions → in parallel. |
| 3. Decide    | main (Opus)            | Research the approach (installed docs, AGENTS.md), choose, write the plan: files, pattern, checks.          |
| 4. Code      | `implementer` (Sonnet) | Implements exactly the plan with the project skills, runs `bun run check`.                                  |
| 5. Review    | `code-reviewer` (Opus) | Reviews the diff. Main fixes small findings or sends them back to `implementer`; build/e2e when relevant.   |

- Size the pipeline to the task — every subagent starts cold and re-reads context (a feature
  implementer ≈ 150–330k tokens, a review ≈ 100k):

  | Task                                                     | Pipeline                                   |
  | -------------------------------------------------------- | ------------------------------------------ |
  | Small: one or two known files, UI tweak, copy, small fix | main session directly, no subagents        |
  | Medium: a feature or cross-file change, no risk          | `implementer` (+ `explorer` if needed)     |
  | Large or risky: auth, access, data flow, a package API   | full pipeline incl. `code-reviewer` (Opus) |

- Run subagents in the **foreground** (`run_in_background: false`) and finish the task in the same
  turn: ending a turn with half-done work fires the environment's "commit and push" stop hook and
  wastes a turn. Background only for truly independent work.
- One task (or a group of related tasks) per session; after it is pushed, start fresh (`/clear`).
- Don't read many files in the main session; ask `explorer` (read only the lines a decision needs).
- Heavy change or a different flow (§0.7) → tell the user in step 3, before `implementer` starts.

## Skills and subagents

Skills (`.claude/skills/`) and subagents (`.claude/agents/`) are listed to you automatically with
their descriptions — use a skill instead of improvising whenever one fits. `commit` and `spec`
run only when the user types them (`/commit`, `/spec <feature>`); for a large or unclear feature,
suggest `/spec` first.

## Automation (`.claude/settings.json`)

- After every Edit/Write, `scripts/claude/post-edit.sh` formats the file (oxfmt) and lints it
  (oxlint). Lint errors are returned to you — fix them before continuing.
- Before every Bash call, `scripts/claude/quiet-commands.sh` reruns the repo's own commands
  (`bun run` check, test, test:e2e, build, typecheck, lint, and `bun test`) through
  `quiet-run.sh`: only problem lines (with log line numbers), the summary and the exit code come
  back, plus the full log's path — read ranges of it (`sed -n 'A,Bp'`) when you need more.
- Plugin `typescript-7-lsp` (`.claude/marketplace`): TS 7 diagnostics + go-to-definition in local
  sessions. Not installed? `claude plugin install typescript-7-lsp@next-js-base --scope project`.
- **Find code via the code map first**: `.claude/codemap.md` (`name · kind · path:line · doc` per
  export, written at session start; `bun run codemap` refreshes it). For "how is X used", open the
  example page of X in `apps/sample` (`src/config/examples.ts`).
- Path-scoped rules in `.claude/rules/` load automatically when you work on matching files.
- Secrets (`.env`, `.env.local`, …) are not readable; ask the user for values instead.

## Compact instructions

When compacting, keep: the user's request and every decision they made (answers included), the
files changed and why, the commands run with pass/fail, what is committed and pushed, and what is
still left to do.
