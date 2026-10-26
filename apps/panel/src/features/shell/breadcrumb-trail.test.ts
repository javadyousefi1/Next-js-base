import { describe, expect, test } from "bun:test";

import { breadcrumbTrail } from "./breadcrumb-trail";

const labels = {
  "/": "dashboard",
  "/settings": "settings",
  "/settings/[id]": "dashboard",
} as const;

describe("breadcrumbTrail", () => {
  test("the dashboard is a trail of its own", () => {
    expect(breadcrumbTrail("/")).toEqual([{ href: "/", labelKey: "dashboard" }]);
  });

  test("a page is listed after the pages on the way to it", () => {
    expect(breadcrumbTrail("/settings")).toEqual([
      { href: "/", labelKey: "dashboard" },
      { href: "/settings", labelKey: "settings" },
    ]);
  });

  test("a [param] segment matches any value", () => {
    const trail = breadcrumbTrail("/settings/42", labels);
    expect(trail.map((crumb) => crumb.href)).toEqual(["/", "/settings", "/settings/42"]);
  });

  test("a page without its own entry has no trail (no parent poses as the current page)", () => {
    expect(breadcrumbTrail("/settings/42/unknown", labels)).toEqual([]);
  });

  test("paths in between without an entry are skipped", () => {
    const trail = breadcrumbTrail("/settings/42/edit", {
      "/": "dashboard",
      "/settings/[id]/edit": "settings",
    });
    expect(trail.map((crumb) => crumb.href)).toEqual(["/", "/settings/42/edit"]);
  });

  test("a trailing slash and encoded segments", () => {
    expect(breadcrumbTrail("/settings/")).toEqual(breadcrumbTrail("/settings"));
    expect(breadcrumbTrail("/settings/a%2Fb", labels).at(-1)?.href).toBe("/settings/a%2Fb");
  });

  test("an exact entry beats a pattern", () => {
    const trail = breadcrumbTrail("/settings/new", { ...labels, "/settings/new": "account" });
    expect(trail.at(-1)).toEqual({ href: "/settings/new", labelKey: "account" });
  });
});
