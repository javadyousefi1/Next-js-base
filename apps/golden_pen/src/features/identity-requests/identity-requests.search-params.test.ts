import { describe, expect, test } from "bun:test";

import { loadIdentityRequestsSearchParams } from "./identity-requests.search-params";
import { identityRequestsListParamsSchema } from "./schemas/identity-requests.schema";

describe("loadIdentityRequestsSearchParams", () => {
  test("the requested tab is the default", async () => {
    const params = await loadIdentityRequestsSearchParams(Promise.resolve({}));
    expect(params.status).toBe("requested");
  });

  test("parses the status tab and the table state", async () => {
    const params = await loadIdentityRequestsSearchParams(
      Promise.resolve({ status: "verified", page: "2", q: "علی", phoneNumber: "0912" }),
    );
    expect(params).toMatchObject({ status: "verified", page: 2, q: "علی", phoneNumber: "0912" });
  });

  test("a hand-edited status falls back to the default tab", async () => {
    const params = await loadIdentityRequestsSearchParams(Promise.resolve({ status: "hack" }));
    expect(params.status).toBe("requested");
  });
});

describe("identityRequestsListParamsSchema", () => {
  test("sanitizes the list params", () => {
    expect(
      identityRequestsListParamsSchema.parse({ page: -3, pageSize: 0, status: "x", q: 5 }),
    ).toEqual({ page: 1, pageSize: 10, q: "", phoneNumber: null, status: "requested" });
  });
});
