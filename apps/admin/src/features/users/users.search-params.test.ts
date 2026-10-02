import { describe, expect, test } from "bun:test";

import { loadUsersSearchParams } from "./users.search-params";

describe("loadUsersSearchParams", () => {
  test("parses the URL into the users list params", async () => {
    const params = await loadUsersSearchParams(
      Promise.resolve({ page: "3", q: "ali", sortBy: "age", order: "desc", role: "admin" }),
    );
    expect(params).toEqual({
      page: 3,
      pageSize: 10,
      q: "ali",
      sortBy: "age",
      order: "desc",
      role: "admin",
    });
  });

  test("ignores hand-edited values", async () => {
    const params = await loadUsersSearchParams(
      Promise.resolve({ page: "x", sortBy: "password", order: "sideways", role: "root" }),
    );
    expect(params).toEqual({
      page: 1,
      pageSize: 10,
      q: "",
      sortBy: null,
      order: "asc",
      role: null,
    });
  });
});
