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

  test("skips paths without a label", () => {
    const trail = breadcrumbTrail("/users/42/unknown", labels);
    expect(trail.map((crumb) => crumb.href)).toEqual(["/", "/users", "/users/42"]);

    // A path in the middle without a label does not cut the trail.
    const nested = breadcrumbTrail("/users/42/edit", {
      "/": "dashboard",
      "/users/[id]/edit": "settings",
    });
    expect(nested.map((crumb) => crumb.href)).toEqual(["/", "/users/42/edit"]);
  });

  test("an exact entry beats a pattern", () => {
    const trail = breadcrumbTrail("/users/new", { ...labels, "/users/new": "account" });
    expect(trail.at(-1)).toEqual({ href: "/users/new", labelKey: "account" });
  });
});
