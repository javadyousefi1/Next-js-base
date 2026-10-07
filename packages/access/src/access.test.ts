import { describe, expect, test } from "bun:test";

import { allows, permissionsOf, ruleForPath, type AccessPolicy } from "./access";

const ALL = ["users.read", "users.write", "stats.refresh", "stats.read"] as const;
type Permission = (typeof ALL)[number];

const policy: AccessPolicy<string, Permission> = {
  admin: ["*"],
  moderator: ["users.*"],
  analyst: ["stats.read", "stats.refresh"],
  reader: ["users.read"],
  user: [],
};

describe("permissionsOf", () => {
  test("an exact grant gives that permission only", () => {
    expect(permissionsOf(policy, ["reader"], ALL)).toEqual(["users.read"]);
  });

  test("`area.*` gives every permission of the area", () => {
    expect(permissionsOf(policy, ["moderator"], ALL)).toEqual(["users.read", "users.write"]);
  });

  test("`*` gives everything", () => {
    expect(permissionsOf(policy, ["admin"], ALL)).toEqual([...ALL]);
  });

  test("a role without grants, or an unknown role, gives nothing", () => {
    expect(permissionsOf(policy, ["user"], ALL)).toEqual([]);
    expect(permissionsOf(policy, ["ghost"], ALL)).toEqual([]);
    expect(permissionsOf(policy, ["constructor"], ALL)).toEqual([]);
    expect(permissionsOf(policy, [], ALL)).toEqual([]);
  });

  test("two roles are merged without duplicates, in the order of `all`", () => {
    expect(permissionsOf(policy, ["analyst", "moderator", "reader"], ALL)).toEqual([
      "users.read",
      "users.write",
      "stats.refresh",
      "stats.read",
    ]);
  });
});

describe("allows", () => {
  const access = { roles: ["moderator"], permissions: ["users.read"] };

  test("a permission rule needs that permission", () => {
    expect(allows(access, "users.read")).toBe(true);
    expect(allows(access, "stats.refresh")).toBe(false);
  });

  test("a role rule needs that role", () => {
    expect(allows(access, { role: "moderator" })).toBe(true);
    expect(allows(access, { role: "admin" })).toBe(false);
  });

  test("a role list needs any of the roles", () => {
    expect(allows(access, { role: ["admin", "moderator"] })).toBe(true);
    expect(allows(access, { role: ["admin", "user"] })).toBe(false);
  });
});

describe("ruleForPath", () => {
  const rules = {
    "/users": "users",
    "/users/[id]/edit": "edit",
    "/users/[id]": "details",
    "/settings/": "settings",
  };

  test("an exact key matches", () => {
    expect(ruleForPath(rules, "/users")).toBe("users");
  });

  test("on equal depth a static segment beats a [param] (whatever the key order)", () => {
    const tie = { "/users/[id]": "details", "/users/new": "create" };
    expect(ruleForPath(tie, "/users/new")).toBe("create");
    expect(ruleForPath(tie, "/users/42")).toBe("details");
  });

  test("a key covers its nested pages", () => {
    expect(ruleForPath(rules, "/users/42/permissions")).toBe("details");
    expect(ruleForPath({ "/users": "users" }, "/users/42/edit")).toBe("users");
  });

  test("the more specific key wins, whatever the order", () => {
    expect(ruleForPath(rules, "/users/42/edit")).toBe("edit");
    expect(ruleForPath(rules, "/users/42")).toBe("details");
  });

  test("`[param]` matches any one segment", () => {
    expect(ruleForPath({ "/users/[id]": "details" }, "/users/42")).toBe("details");
    expect(ruleForPath({ "/users/[id]": "details" }, "/users")).toBeUndefined();
  });

  test("`/` covers every path, but loses to a more specific key", () => {
    const withRoot = { "/": "root", "/users": "users" };
    expect(ruleForPath(withRoot, "/")).toBe("root");
    expect(ruleForPath(withRoot, "/settings")).toBe("root");
    expect(ruleForPath(withRoot, "/users/42")).toBe("users");
  });

  test("no matching key → undefined", () => {
    expect(ruleForPath(rules, "/")).toBeUndefined();
    expect(ruleForPath(rules, "/dashboard")).toBeUndefined();
    expect(ruleForPath({}, "/users")).toBeUndefined();
  });

  test("trailing slashes are ignored", () => {
    expect(ruleForPath(rules, "/users/")).toBe("users");
    expect(ruleForPath(rules, "/settings")).toBe("settings");
  });
});
