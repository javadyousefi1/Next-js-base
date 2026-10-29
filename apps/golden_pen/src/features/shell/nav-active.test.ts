import { describe, expect, test } from "bun:test";

import { NAV_GROUPS } from "@/config/navigation";

import { isActive, markActive } from "./nav-active";

describe("isActive", () => {
  test("the dashboard is active only on itself", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/users", "/")).toBe(false);
  });

  test("other pages are active on their subpages too", () => {
    expect(isActive("/users/42", "/users")).toBe(true);
    expect(isActive("/users-old", "/users")).toBe(false);
  });
});

const parent = (pathname: string) =>
  markActive(NAV_GROUPS, pathname)[0]?.items.find((item) => "children" in item);

describe("markActive", () => {
  test("a parent is active when one of its children is", () => {
    expect(parent("/invite-links")?.isActive).toBe(true);
    expect(parent("/users")?.isActive).toBe(true);
  });

  test("a parent is inactive on other pages", () => {
    expect(parent("/settings")?.isActive).toBe(false);
  });

  test("only the matching child is active", () => {
    const children = parent("/invite-links");
    expect(children && "children" in children && children.children.map((c) => c.isActive)).toEqual([
      false,
      true,
    ]);
  });
});
