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

- `code-reviewer` — reviews a diff against AGENTS.md; use before committing larger changes.
- `architecture-guard` — checks logic/view separation, server/client boundary and BFF security.
- `test-writer` — writes unit (bun test) and e2e (Playwright) tests for a feature.

## Automation (`.claude/settings.json`)

- After every Edit/Write, `scripts/claude/post-edit.sh` formats the file (oxfmt) and lints it
  (oxlint). Lint errors are returned to you — fix them before continuing.
- Path-scoped rules in `.claude/rules/` load automatically when you work on matching files.
- Secrets (`.env`, `.env.local`, …) are not readable; ask the user for values instead.
