---
name: spec
description: Before a large or unclear feature — interview the user about the decisions only they can make, then write docs/specs/<feature>.md so a fresh session can implement it with clean context.
disable-model-invocation: true
---

# Spec first: $ARGUMENTS

Use for features that touch many files, need product decisions, or have an unknown backend
contract. Small, clear tasks skip this.

1. **Restate** the feature in 2–3 lines. Look up only what a question depends on (`explorer`
   for code questions) — don't explore "just in case".
2. **Interview** with `AskUserQuestion`: at most 4 questions per round, at most 2 rounds,
   recommended option first. Ask only what the user must decide (behaviour, scope, edge cases,
   who may see/do it, unknown backend fields) — never what AGENTS.md or the code already answers.
3. **Write `docs/specs/<feature>.md`** (short, concrete, no code dumps):
   - **Goal** (1–3 lines) and **Out of scope**
   - **Flows & UI states**: loading / empty / error, mobile, RTL
   - **Data**: endpoints, backend fields (known vs unknown), domain types, params, invalidation
   - **Access**: permissions and guarded routes (`add-access`)
   - **Files**: what to create or change, with the skill for each (`add-feature`, `add-table`,
     `add-query`, `add-mutation`, `add-page`, `add-translation`)
   - **Verification**: unit tests, the e2e flow, `bun run check`, `bun run build`,
     `bun run test:e2e`
   - **Open questions** (if any)
4. **Stop.** Tell the user to review the spec, then run `/clear` and start the implementation
   with: `implement docs/specs/<feature>.md`.
