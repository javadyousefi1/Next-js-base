/** Permissions are "<area>.<action>" (`users.read`). */
type AreaOf<P extends string> = P extends `${infer Area}.${string}` ? Area : never;

/** What a role is given: one permission (`users.read`), a whole area (`users.*`) or everything (`*`). */
export type Grant<P extends string> = P | `${AreaOf<P>}.*` | "*";

/** Role → grants: the app's whole access policy in one object. */
export type AccessPolicy<R extends string, P extends string> = Readonly<
  Record<R, readonly Grant<P>[]>
>;

/** Who the signed-in user is and what they may do (lives on the session user). */
export type Access<R extends string, P extends string> = {
  roles: readonly R[];
  permissions: readonly P[];
};

/** A requirement: a permission (`"users.read"`) or a role (`{ role: "admin" }`, or any of `{ role: ["admin", "moderator"] }`). */
export type AccessRule<R extends string, P extends string> = P | { role: R | readonly R[] };

function covers(grant: string, permission: string) {
  if (grant === "*" || grant === permission) return true;
  // `users.*` covers every permission that starts with `users.`.
  return grant.endsWith(".*") && permission.startsWith(grant.slice(0, -1));
}

/**
 * The permissions `roles` get: `area.*` and `*` are expanded against `all` (the app's full
 * permission list). In the order of `all`, no duplicates; a role the policy doesn't know grants nothing.
 */
export function permissionsOf<R extends string, P extends string>(
  policy: AccessPolicy<R, NoInfer<P>>,
  roles: readonly R[],
  all: readonly P[],
): P[] {
  const grants = roles.flatMap((role) => (Object.hasOwn(policy, role) ? policy[role] : []));
  return all.filter((permission) => grants.some((grant) => covers(grant, permission)));
}

/** Does `access` satisfy the rule? A permission must be granted; a role rule needs any of its roles. */
export function allows<R extends string, P extends string>(
  access: Access<R, P>,
  rule: AccessRule<R, P>,
): boolean {
  if (typeof rule === "string") return access.permissions.includes(rule);
  const wanted = typeof rule.role === "string" ? [rule.role] : rule.role;
  return wanted.some((role) => access.roles.includes(role));
}

function toSegments(path: string) {
  return path.split("/").filter(Boolean);
}

/** A pattern covers a path when its segments are the path's first ones (`[param]` matches any). */
function coversPath(pattern: readonly string[], path: readonly string[]) {
  return (
    pattern.length <= path.length &&
    pattern.every((segment, index) => segment.startsWith("[") || segment === path[index])
  );
}

/** How specific a key is: deeper first, then more static (non-`[param]`) segments. */
function specificity(segments: readonly string[]) {
  return segments.length * 1000 + segments.filter((segment) => !segment.startsWith("[")).length;
}

/**
 * The rule of the most specific key that covers `pathname`: the deepest one, and on a tie the
 * one with more static segments (`/users/new` beats `/users/[id]`).
 * A key covers its nested pages (`/users` covers `/users/42/edit`), a `[param]` segment matches
 * any value and `/` covers every path. `undefined` when no key matches.
 */
export function ruleForPath<T>(rules: Readonly<Record<string, T>>, pathname: string) {
  const path = toSegments(pathname);
  let best: { rule: T; score: number } | undefined;

  for (const [pattern, rule] of Object.entries(rules)) {
    const segments = toSegments(pattern);
    const score = specificity(segments);
    if (coversPath(segments, path) && (!best || score > best.score)) best = { rule, score };
  }
  return best?.rule;
}
