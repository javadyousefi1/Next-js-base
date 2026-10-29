import { describe, expect, test } from "bun:test";

import { PAGE_INDEX_BASE } from "@/features/users/api/users.backend";

import {
  identityErrorKind,
  IDENTITY_ACTION,
  toBackendListQuery,
  toDetailQuery,
  toIdentityActionBody,
} from "./identity-requests.backend";

const list = { page: 1, pageSize: 10, q: "", phoneNumber: null } as const;

describe("toIdentityActionBody", () => {
  test("request carries no user", () => {
    expect(toIdentityActionBody({ action: "request" })).toEqual({
      actionType: IDENTITY_ACTION.request,
    });
  });

  test("verify names the user", () => {
    expect(toIdentityActionBody({ action: "verify", userId: "u1" })).toEqual({
      actionType: 2,
      userId: "u1",
    });
  });

  test("reject and revoke carry the reason", () => {
    expect(toIdentityActionBody({ action: "reject", userId: "u1", message: "ناخوانا" })).toEqual({
      actionType: 3,
      userId: "u1",
      message: "ناخوانا",
    });
    expect(toIdentityActionBody({ action: "revoke", userId: "u1", message: "جعلی" })).toEqual({
      actionType: 4,
      userId: "u1",
      message: "جعلی",
    });
  });
});

describe("toBackendListQuery", () => {
  test("a status tab filters by its identity status", () => {
    expect(toBackendListQuery({ ...list, status: "requested" })).toMatchObject({
      PageIndex: PAGE_INDEX_BASE,
      IncludeIdentity: true,
      IdentityStatus: 1,
    });
    expect(toBackendListQuery({ ...list, status: "verified" }).IdentityStatus).toBe(3);
    expect(toBackendListQuery({ ...list, status: "rejected" }).IdentityStatus).toBe(4);
    expect(toBackendListQuery({ ...list, status: "revoked" }).IdentityStatus).toBe(5);
  });

  test("all lists every status; search and phone pass through", () => {
    expect(
      toBackendListQuery({ ...list, q: "علی", phoneNumber: "0912", status: "all" }),
    ).toMatchObject({ FullName: "علی", PhoneNumber: "0912", IdentityStatus: undefined });
  });
});

test("toDetailQuery asks for the identity of one user", () => {
  expect(toDetailQuery({ userId: "u1" })).toEqual({ userId: "u1", includeIdentity: true });
});

const problem = (code: string) => ({ status: 400, details: { errors: [{ code, message: "x" }] } });

describe("identityErrorKind", () => {
  test("maps the backend error codes", () => {
    expect(identityErrorKind(problem("UserErrors.ProfileNotComplete"))).toBe("profileNotComplete");
    expect(identityErrorKind(problem("UserErrors.IdentityNotInRequestedState"))).toBe(
      "notInRequestedState",
    );
    expect(identityErrorKind(problem("UserErrors.InvalidIdentityAction"))).toBe("invalidAction");
  });

  test("403 is forbidden whatever the body", () => {
    expect(identityErrorKind({ status: 403, details: undefined })).toBe("forbidden");
  });

  test("unknown codes and bodies are not mapped", () => {
    expect(identityErrorKind(problem("UserErrors.Other"))).toBeNull();
    expect(identityErrorKind({ status: 400, details: { errors: "x" } })).toBeNull();
    expect(identityErrorKind({ status: 500, details: null })).toBeNull();
  });
});
