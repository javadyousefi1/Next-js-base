import { describe, expect, test } from "bun:test";

import { isPublicRoute, ROUTES, sanitizeCallbackUrl } from "./routes";

describe("public landing and authenticated dashboard routes", () => {
  test("the landing is public without exposing panel pages", () => {
    expect(isPublicRoute(ROUTES.landing)).toBe(true);
    expect(isPublicRoute(ROUTES.login)).toBe(true);
    expect(isPublicRoute(ROUTES.register)).toBe(true);
    expect(isPublicRoute(ROUTES.dashboard)).toBe(false);
    expect(isPublicRoute(ROUTES.users)).toBe(false);
  });
  test("missing or unsafe callbacks lead to the dashboard", () => {
    for (const value of [
      undefined,
      null,
      "",
      "https://example.com",
      "//example.com",
      "/\\example.com",
    ]) {
      expect(sanitizeCallbackUrl(value)).toBe(ROUTES.dashboard);
    }
    expect(sanitizeCallbackUrl("/settings")).toBe(ROUTES.settings);
  });
});
