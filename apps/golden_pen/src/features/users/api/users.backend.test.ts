import { describe, expect, test } from "bun:test";

import { PAGE_INDEX_BASE, toBackendListQuery, usersListResponse } from "./users.backend";

const empty = {
  page: 1,
  pageSize: 10,
  q: "",
  phoneNumber: null,
  role: null,
  identityStatus: null,
} as const;

const ali = {
  id: "10000000-0000-4000-8000-000000000001",
  fullName: "علی رضایی",
  phoneNumber: "09121234567",
  email: "ali@example.com",
  username: "ali",
  avatarUrl: null,
  isActive: true,
  isPhoneNumberVerified: true,
  identity: { statusType: 3, nationalCode: "0012345678" },
  roles: ["super-admin"],
  createdAt: "2025-03-01T09:30:00Z",
  updatedAt: null,
};

describe("usersListResponse", () => {
  test("maps the backend page to the app's UsersList", () => {
    const list = usersListResponse.parse({ items: [ali], totalCount: 1 });
    expect(list).toEqual({
      items: [
        {
          id: ali.id,
          fullName: ali.fullName,
          phoneNumber: ali.phoneNumber,
          email: "ali@example.com",
          username: "ali",
          roles: ["super-admin"],
          identityStatus: 3,
          identityRequestedAt: null,
          identityVerifiedAt: null,
          identityMessage: null,
          isActive: true,
          isPhoneNumberVerified: true,
          createdAt: "2025-03-01T09:30:00Z",
        },
      ],
      total: 1,
    });
  });

  test("null items are an empty page", () => {
    expect(usersListResponse.parse({ items: null, totalCount: 0 })).toEqual({
      items: [],
      total: 0,
    });
  });

  test("null identity, roles, email, username and createdAt are tolerated", () => {
    const list = usersListResponse.parse({
      items: [
        { ...ali, identity: null, roles: null, email: null, username: null, createdAt: null },
      ],
      totalCount: 1,
    });
    expect(list.items[0]).toMatchObject({
      identityStatus: null,
      roles: [],
      email: null,
      username: null,
      createdAt: null,
    });
  });

  test("maps the review fields of the identity", () => {
    const list = usersListResponse.parse({
      items: [
        {
          ...ali,
          identity: {
            statusType: 4,
            requestedAt: "2025-04-01T08:00:00Z",
            verifiedAt: "2025-04-02T08:00:00Z",
            message: "ناخوانا",
          },
        },
      ],
      totalCount: 1,
    });
    expect(list.items[0]).toMatchObject({
      identityStatus: 4,
      identityRequestedAt: "2025-04-01T08:00:00Z",
      identityVerifiedAt: "2025-04-02T08:00:00Z",
      identityMessage: "ناخوانا",
    });
  });

  test("rejects an unexpected shape", () => {
    expect(usersListResponse.safeParse({ users: [ali], total: 1 }).success).toBe(false);
  });
});

describe("toBackendListQuery", () => {
  test("maps the paging, always asks for the identity and drops empty filters", () => {
    expect(toBackendListQuery({ ...empty, page: 3, pageSize: 20 })).toEqual({
      PageIndex: 2 + PAGE_INDEX_BASE,
      PageSize: 20,
      IncludeIdentity: true,
      FullName: undefined,
      PhoneNumber: undefined,
      Role: undefined,
      IdentityStatus: undefined,
    });
  });

  test("the first page is PAGE_INDEX_BASE", () => {
    expect(toBackendListQuery(empty).PageIndex).toBe(PAGE_INDEX_BASE);
  });

  test("passes search, phone, role and identity status (as a number) through", () => {
    expect(
      toBackendListQuery({
        ...empty,
        q: "علی",
        phoneNumber: "0912",
        role: "lawyer",
        identityStatus: "0",
      }),
    ).toMatchObject({ FullName: "علی", PhoneNumber: "0912", Role: "lawyer", IdentityStatus: 0 });
  });
});
