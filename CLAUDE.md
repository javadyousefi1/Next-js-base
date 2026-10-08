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
- **Docs only where they are read.** `docs/REPORT.fa.md` (the Persian report) is updated only when
  the user asks — git log is the changelog. Keep `AGENTS.md` files short indexes; code examples
  belong in skills (loaded on demand) and path rules.
- **Filter command output** (`grep`/`tail` on build, test and e2e logs) instead of printing it.

## Model routing (token budget)

Opus decides, Haiku reads, Sonnet types. Run the main session on Opus for design and multi-step
work, on Sonnet (`/model sonnet`) for routine tasks a skill already covers (a page, a translation,
a simple fix) — the main model can't be set from this file. Subagents have their model fixed in
their frontmatter:

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
| `add-table`        | Table: URL state, filters drawer from config, sorting, pagination, prefetch |
| `add-access`       | Guard a page, component or Server Action with roles/permissions             |
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
