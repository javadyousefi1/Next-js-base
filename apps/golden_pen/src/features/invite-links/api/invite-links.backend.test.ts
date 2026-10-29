import { describe, expect, test } from "bun:test";

import { PAGE_INDEX_BASE } from "@/features/users/api/users.backend";

import {
  createInviteLinkResponse,
  inviteLinksListResponse,
  toBackendCreateBody,
  toBackendListQuery,
} from "./invite-links.backend";

const backendLink = {
  id: "1",
  token: "t",
  inviteUrl: "http://x/register?invite=t",
  firstName: "علی",
  lastName: "رضایی",
  phoneNumber: "09123456789",
  expiresAt: "2030-01-01T00:00:00Z",
  usedAt: null,
  usedByUserId: null,
  isValid: true,
  createdAt: null,
};

describe("toBackendListQuery", () => {
  test("maps the page to PageIndex (PAGE_INDEX_BASE) and leaves IsUsed out when unset", () => {
    expect(toBackendListQuery({ page: 3, pageSize: 20, isUsed: null })).toEqual({
      PageIndex: 2 + PAGE_INDEX_BASE,
      PageSize: 20,
      IsUsed: undefined,
    });
  });

  test("sends IsUsed as a boolean", () => {
    expect(toBackendListQuery({ page: 1, pageSize: 10, isUsed: "true" }).IsUsed).toBe(true);
    expect(toBackendListQuery({ page: 1, pageSize: 10, isUsed: "false" }).IsUsed).toBe(false);
  });
});

const parse = (override: object) =>
  inviteLinksListResponse.parse({ items: [{ ...backendLink, ...override }], totalCount: 1 })
    .items[0];

describe("inviteLinksListResponse", () => {
  test("treats null items as an empty page", () => {
    expect(inviteLinksListResponse.parse({ items: null, totalCount: 0 })).toEqual({
      items: [],
      total: 0,
    });
  });

  test("maps a link and derives the status", () => {
    expect(parse({})).toMatchObject({
      fullName: "علی رضایی",
      status: "active",
      usedAt: null,
      createdAt: null,
    });
    expect(parse({ isValid: false })?.status).toBe("expired");
    expect(parse({ usedAt: "2030-01-02T00:00:00Z", isValid: false })?.status).toBe("used");
    expect(parse({ usedAt: "2030-01-02T00:00:00Z", isValid: true })?.status).toBe("used");
  });
});

describe("toBackendCreateBody", () => {
  const input = { firstName: "علی", lastName: "رضایی", phoneNumber: "09123456789" };

  test("sends expiresInDays when set", () => {
    expect(toBackendCreateBody({ ...input, expiresInDays: 3 })).toEqual({
      ...input,
      expiresInDays: 3,
    });
  });

  test("omits expiresInDays when null", () => {
    expect(toBackendCreateBody({ ...input, expiresInDays: null }).expiresInDays).toBeUndefined();
  });
});

describe("createInviteLinkResponse", () => {
  test("keeps the URL and the expiry", () => {
    expect(
      createInviteLinkResponse.parse({ ...backendLink, token: "t", expiresAt: "2030-01-01" }),
    ).toEqual({ id: "1", inviteUrl: backendLink.inviteUrl, expiresAt: "2030-01-01" });
  });
});
