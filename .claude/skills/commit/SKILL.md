---
name: commit
description: Verify and commit changes with a Conventional Commit message that passes commitlint and the husky hooks. Use when the user asks to commit, or at the end of a finished task when committing is expected.
disable-model-invocation: true
---

# Commit

1. `git status` / `git diff` — make sure only intended files changed (no `.env*`, no build output).
2. `bun run check` must pass (the pre-push hook runs it anyway). App changes: `bun run build`.
3. Message format (commitlint): `type(scope): subject`
   - types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `style`, `revert`
   - scopes: `admin`, `ui`, `oxlint-plugin`, `typescript-config`, `deps`, `docker`, `ci`, `docs`, `tooling`, `ai`
   - subject: imperative, lower case, no period, ≤ 100 chars header; body lines ≤ 100 chars;
     explain _why_ in the body when it isn't obvious.
4. `git add <files>` then `git commit` — never `--no-verify`. If a hook fails, fix the cause and
   create a new commit (don't amend someone else's pushed commit).
5. Pushing to `main` runs the production build and e2e tests in the pre-push hook.
