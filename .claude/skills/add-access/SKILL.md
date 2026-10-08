---
name: add-access
description: Guard a page, a component or a Server Action in apps/admin with roles/permissions (@repo/access), add a permission or change who gets it. Use whenever something should be visible or allowed only for some users.
---

# Add or use access control

The model lives in `@repo/access` (no app knowledge); the app supplies the data in
`src/config/access.ts`. It hides UI — the backend still authorizes every request.

- **Grants** (what a role gets): one permission (`users.read`), a whole area (`users.*`) or
  everything (`*`). Permissions are `<area>.<action>`.
- **Checks** (what a page or component asks for): a permission (`"users.read"`) or a role
  (`{ role: "admin" }`, any of `{ role: ["admin", "moderator"] }`).

## Steps

1. **Permission** — add it to `PERMISSIONS` in `src/config/access.ts` and grant it in
   `ACCESS_POLICY` (role → grants; `*` and `area.*` already cover new permissions of that area).
2. **Use it**:

   ```tsx
   // Component — views: <Can> · hooks: useAccess().can(rule)   (@repo/access/access-context)
   <Can permission="stats.refresh" fallback={<Hint />}><RefreshStatsButton /></Can>
   <Can role={["admin", "moderator"]}>…</Can>
   const { can, isReady } = useAccess();   // everything is denied until the session has loaded

   // Page — one line in ROUTE_ACCESS (src/config/access.ts); the nav link hides itself too
   [ROUTES.reports]: "reports.read",

   // Server Action / route handler — they are public endpoints (src/server/auth/access.ts)
   if (!(await hasAccess("stats.refresh"))) return;
   ```

3. **Mock** — make the MSW handler refuse the endpoint for roles without the permission (403),
   like a real API.
4. **Tests** — e2e with `MEMBER_USER` (`member` / `member123`, role `user`) and the admin: what
   each sees, and that the API answers 403 (`page.request.get("/api/proxy/…")`). Copy
   `e2e/access.spec.ts`.

## Rules

- `ROUTE_ACCESS`: a key covers its nested pages, `[param]` matches any value, the most specific
  key wins (a static segment beats `[param]`). `/` would cover every page — keep the dashboard
  open. A page without an entry is open to every signed-in user.
- `<RouteGuard>` (app layout) shows "No access" (not a redirect) when denied; while the session
  loads the page renders as usual (optimistic, like `proxy.ts`), so server prefetch still paints.
- **Only `features/auth/api/auth.backend.ts` (`toSessionUser`) maps what the backend sends** into
  the session user's `roles` + `permissions`. A backend with role lists or its own permissions
  changes that function and nothing else. Unknown role → `user`; unreadable session → no access.
