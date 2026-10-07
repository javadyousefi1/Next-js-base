# packages/access — AGENTS.md

`@repo/access`: role-based access, with no knowledge of the app's roles, routes or backend.
Repository rules: [`../../AGENTS.md`](../../AGENTS.md).

- Model: a **role** is given **grants** — one permission (`users.read`), a whole area
  (`users.*`) or everything (`*`). Permissions are `<area>.<action>`. A **check** (`AccessRule`)
  asks for a permission (`"users.read"`) or for a role (`{ role: "admin" }`, any of
  `{ role: ["admin", "moderator"] }`).
- `@repo/access/access` — pure and unit tested:
  - `permissionsOf(policy, roles, all)`: the permissions the roles get, `area.*` and `*` expanded
    against `all` (the app's full permission list), in its order, no duplicates. An unknown role
    grants nothing.
  - `allows(access, rule)`: does `{ roles, permissions }` satisfy the rule?
  - `ruleForPath(rules, pathname)`: the rule of the most specific key that covers the path
    (`/users` covers `/users/42/edit`, `[param]` matches any segment, `/` covers every path).
  - Types: `AccessPolicy`, `Grant`, `Access`, `AccessRule`.
- `@repo/access/access-context` (client) — `<AccessProvider access={…}>` (`null` = session still
  loading), `useAccess()` → `{ isReady, can(rule) }` (everything is denied until ready) and
  `<Can permission="…" | role="…" fallback={…}>`.
- `@repo/access/register` — the app registers its role and permission unions once, so `can()` and
  `<Can>` are typed (same idea as TanStack Query's `Register`):
  `declare module "@repo/access/register" { interface Register { role: …; permission: … } }`.
- The app decides where `access` comes from and how the backend's roles map to permissions; this
  package only decides what a policy and a rule mean. It hides UI — the backend still authorizes.
- Tests: `bun test` (`access`).
