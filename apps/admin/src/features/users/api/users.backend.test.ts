import { describe, expect, test } from "bun:test";

import { toBackendListQuery, usersListResponse } from "./users.backend";

const ada = {
  id: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  username: "ada",
  email: "ada@example.com",
  phone: "+44 20 7946 0000",
  age: 36,
  role: "admin" as const,
};

describe("usersListResponse", () => {
  test("maps the backend page to the app's UsersList", () => {
    const list = usersListResponse.parse({ users: [ada], total: 1, skip: 0, limit: 10 });
    expect(list).toEqual({ items: [ada], total: 1 });
  });

  test("defaults a missing role to user", () => {
    const { role: _role, ...withoutRole } = ada;
    const list = usersListResponse.parse({ users: [withoutRole], total: 1 });
    expect(list.items[0]?.role).toBe("user");
  });

  test("rejects an unexpected shape", () => {
    expect(usersListResponse.safeParse({ items: [ada], total: 1 }).success).toBe(false);
  });
});

describe("toBackendListQuery", () => {
  test("maps page/pageSize to limit/skip and drops empty filters", () => {
    const query = toBackendListQuery({
      page: 2,
      pageSize: 10,
      q: "",
      role: null,
      sortBy: null,
      order: "asc",
    });
    expect(query).toEqual({
      limit: 10,
      skip: 10,
      q: undefined,
      role: undefined,
      sortBy: undefined,
      order: undefined,
    });
  });

  test("passes search, role and sort through", () => {
    const query = toBackendListQuery({
      page: 1,
      pageSize: 20,
      q: "ali",
      role: "admin",
      sortBy: "age",
      order: "desc",
    });
    expect(query).toEqual({
      limit: 20,
      skip: 0,
      q: "ali",
      role: "admin",
      sortBy: "age",
      order: "desc",
    });
  });
});
