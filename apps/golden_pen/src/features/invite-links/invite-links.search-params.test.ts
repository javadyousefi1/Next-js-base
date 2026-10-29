import { describe, expect, test } from "bun:test";

import { loadInviteLinksSearchParams } from "./invite-links.search-params";

describe("loadInviteLinksSearchParams", () => {
  test("parses the URL into the invite links list params", async () => {
    const params = await loadInviteLinksSearchParams(
      Promise.resolve({ page: "2", isUsed: "false" }),
    );
    expect(params).toEqual({
      page: 2,
      pageSize: 10,
      q: "",
      sortBy: null,
      order: "asc",
      isUsed: "false",
    });
  });

  test("ignores hand-edited values", async () => {
    const params = await loadInviteLinksSearchParams(
      Promise.resolve({ page: "x", isUsed: "maybe" }),
    );
    expect(params).toEqual({
      page: 1,
      pageSize: 10,
      q: "",
      sortBy: null,
      order: "asc",
      isUsed: null,
    });
  });
});
