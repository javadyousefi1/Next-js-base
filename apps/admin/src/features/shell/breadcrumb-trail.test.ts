import { describe, expect, test } from "bun:test";

import { breadcrumbTrail } from "./breadcrumb-trail";

const labels = { "/": "dashboard", "/users": "users", "/users/[id]": "settings" } as const;

describe("breadcrumbTrail", () => {
  test("the dashboard is a trail of its own", () => {
    expect(breadcrumbTrail("/")).toEqual([{ href: "/", labelKey: "dashboard" }]);
  });

  test("a page is listed after the pages on the way to it", () => {
    expect(breadcrumbTrail("/users")).toEqual([
      { href: "/", labelKey: "dashboard" },
      { href: "/users", labelKey: "users" },
    ]);
  });

  test("a [param] segment matches any value", () => {
    const trail = breadcrumbTrail("/users/42", labels);
    expect(trail.map((crumb) => crumb.href)).toEqual(["/", "/users", "/users/42"]);
  });

  test("a page without its own entry has no trail (no parent poses as the current page)", () => {
    expect(breadcrumbTrail("/users/42/unknown", labels)).toEqual([]);
  });

  test("paths in between without an entry are skipped", () => {
    const trail = breadcrumbTrail("/users/42/edit", {
      "/": "dashboard",
      "/users/[id]/edit": "settings",
    });
    expect(trail.map((crumb) => crumb.href)).toEqual(["/", "/users/42/edit"]);
  });

  test("a trailing slash and encoded segments", () => {
    expect(breadcrumbTrail("/users/")).toEqual(breadcrumbTrail("/users"));
    expect(breadcrumbTrail("/users/a%2Fb", labels).at(-1)?.href).toBe("/users/a%2Fb");
  });

  test("an exact entry beats a pattern", () => {
    const trail = breadcrumbTrail("/users/new", { ...labels, "/users/new": "account" });
    expect(trail.at(-1)).toEqual({ href: "/users/new", labelKey: "account" });
  });
});
