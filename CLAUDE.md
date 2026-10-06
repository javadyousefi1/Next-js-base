@AGENTS.md

# Claude Code

Everything above (AGENTS.md) applies. This part is specific to Claude Code.

## How to work here

- **Raise problems first.** When a request conflicts with AGENTS.md or is technically wrong, stop
  and say so before editing (see Working agreement §0). Ask when a decision is genuinely the user's.
- **Plan non-trivial work** (new feature, new pattern, cross-package change) before editing; list
  the files you will touch.
- **Use the skills** below instead of improvising — they encode the exact steps and file layout.
- **Verify before claiming done**: `bun run check`; plus `bun run build` / `bun run test:e2e` when
  relevant. Report failures honestly with the output.
- Next.js 16 docs for the installed version: `node_modules/next/dist/docs/` (read them; APIs
  changed: `proxy.ts`, Cache Components, `cacheLife`/`cacheTag`/`updateTag`, async params).

## Model routing (token budget)

Opus decides, Haiku reads, Sonnet types. Run the main session on Opus (`/model opus` — the main
model can't be set from this file); it orchestrates and delegates to subagents whose model is
fixed in their frontmatter:

| Step         | Who                    | Does                                                                                                        |
| ------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1. Clarify   | main (Opus)            | Re-read the request. Scope or place unclear → ask the user short questions first (§0.6).                    |
| 2. Read code | `explorer` (Haiku)     | Finds and summarizes the relevant code (`path:line`, pattern to copy). Independent questions → in parallel. |
| 3. Decide    | main (Opus)            | Research the approach (installed docs, AGENTS.md), choose, write the plan: files, pattern, checks.          |
| 4. Code      | `implementer` (Sonnet) | Implements exactly the plan with the project skills, runs `bun run check`.                                  |
| 5. Review    | `code-reviewer` (Opus) | Reviews the diff. Main fixes small findings or sends them back to `implementer`; build/e2e when relevant.   |

- Use the pipeline for new features and cross-file or cross-package work. Small edits in one or
  two known files: the main session does them directly — every subagent starts cold and re-reads
  context, so on tiny tasks the pipeline costs more tokens than it saves.
- Don't read many files in the main session; ask `explorer`. Read yourself only the few lines a
  decision depends on (Haiku summaries can miss details).
- Heavy change or a different flow (§0.7) → tell the user in step 3, before `implementer` starts.

## Project skills (`.claude/skills/`)

| Skill              | Use it to                                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| `add-feature`      | Scaffold a feature end-to-end (schema → API → hooks → views → page → tests) |
| `add-page`         | Add a route: `ROUTES`, thin page, metadata, nav entry, i18n, guard          |
| `add-query`        | Add a read endpoint: zod schemas, service, key, `makeQuery`, MSW handler    |
| `add-mutation`     | Add a write endpoint: `makeMutation`, invalidation, form hook               |
| `add-env-var`      | Add an environment variable everywhere it must be declared                  |
| `add-translation`  | Add/change UI text in both locales (ICU, RTL)                               |
| `add-ui-component` | Add a shadcn component to `packages/ui` with the CLI                        |
| `write-e2e-test`   | Write a Playwright test the way this repo does                              |
| `commit`           | Run checks and write a Conventional Commit                                  |

## Subagents (`.claude/agents/`)

- `explorer` (Haiku) — read-only: finds and summarizes code with `path:line`; never edits.
- `implementer` (Sonnet) — writes code from the main session's plan; stops if the plan doesn't fit.
- `code-reviewer` (Opus) — reviews a diff against AGENTS.md; use before committing larger changes.
- `architecture-guard` (Opus) — checks logic/view separation, server/client boundary, BFF security.
- `test-writer` (Sonnet) — writes unit (bun test) and e2e (Playwright) tests for a feature.

## Automation (`.claude/settings.json`)

- After every Edit/Write, `scripts/claude/post-edit.sh` formats the file (oxfmt) and lints it
  (oxlint). Lint errors are returned to you — fix them before continuing.
- Path-scoped rules in `.claude/rules/` load automatically when you work on matching files.
- Secrets (`.env`, `.env.local`, …) are not readable; ask the user for values instead.
