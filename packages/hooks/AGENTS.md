# packages/hooks — AGENTS.md

`@repo/hooks`: generic React hooks with no app knowledge. Repository rules:
[`../../AGENTS.md`](../../AGENTS.md).

- One hook per file, imported by path: `@repo/hooks/use-debounced-value`.
- Debouncing: `use-debounced-value` (a value), `use-debounced-callback` (a function),
  `use-debounced-input` (a text input bound to a committed value such as URL state: typing shows
  at once, `onCommit` runs after a pause, an outside change replaces the text).
- A hook belongs here only if any app could use it unchanged: no routes, i18n, env, feature or
  query knowledge (those stay in the app's `src/hooks` or feature hooks).
- SSR-safe: guard browser APIs (`runtime.ts`: `isBrowser`, `assertBrowser`).
