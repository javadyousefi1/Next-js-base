import { describe, expect, test } from "bun:test";

import { loadUsersSearchParams } from "./users.search-params";

describe("loadUsersSearchParams", () => {
  test("parses the URL into the users list params", async () => {
    const params = await loadUsersSearchParams(
      Promise.resolve({
        page: "3",
        q: "علی",
        phoneNumber: "0912",
        role: "lawyer",
        identityStatus: "3",
      }),
    );
    expect(params).toEqual({
      page: 3,
      pageSize: 10,
      q: "علی",
      sortBy: null,
      order: "asc",
      phoneNumber: "0912",
      role: "lawyer",
      identityStatus: "3",
    });
  });

  test("ignores hand-edited values", async () => {
    const params = await loadUsersSearchParams(
      Promise.resolve({ page: "x", role: "root", identityStatus: "9" }),
    );
    expect(params).toEqual({
      page: 1,
      pageSize: 10,
      q: "",
      sortBy: null,
      order: "asc",
      phoneNumber: null,
      role: null,
      identityStatus: null,
    });
  });
});
