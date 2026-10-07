import { describe, expect, test } from "bun:test";

import { PERMISSIONS } from "@/config/access";

import type { SessionUser } from "../schemas/auth.schema";
import {
  authorizationHeader,
  loginResponse,
  meResponse,
  refreshResponse,
  toLoginBody,
  toRefreshBody,
} from "./auth.backend";

/** What the backend sends (one role). */
const backendUser = {
  id: 1,
  username: "admin",
  email: "admin@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  role: "admin" as const,
};

/** What the app uses: roles + the permissions its policy gives them. */
const { role: _role, ...profile } = backendUser;
const user: SessionUser = { ...profile, roles: ["admin"], permissions: [...PERMISSIONS] };

describe("loginResponse", () => {
  test("splits the backend response into user and tokens (minutes → seconds)", () => {
    const result = loginResponse.parse({
      ...backendUser,
      accessToken: "at",
      refreshToken: "rt",
      expiresInMins: 30,
      image: "https://example.com/ada.png",
    });
    expect(result).toEqual({
      user,
      tokens: { accessToken: "at", refreshToken: "rt", expiresInSeconds: 1800 },
    });
  });

  test("leaves the lifetime undefined when the backend sends none", () => {
    const { tokens } = loginResponse.parse({
      ...backendUser,
      accessToken: "at",
      refreshToken: "rt",
    });
    expect(tokens.expiresInSeconds).toBeUndefined();
  });
});

describe("refreshResponse", () => {
  test("is a TokenPair", () => {
    expect(
      refreshResponse.parse({ accessToken: "at2", refreshToken: "rt2", expiresInMins: 15 }),
    ).toEqual({ accessToken: "at2", refreshToken: "rt2", expiresInSeconds: 900 });
  });
});

describe("meResponse", () => {
  test("maps the backend role to roles + permissions (admin gets every permission)", () => {
    expect(meResponse.parse(backendUser)).toEqual(user);
  });

  test("a moderator gets the permissions of the users area", () => {
    expect(meResponse.parse({ ...backendUser, role: "moderator" })).toEqual({
      ...profile,
      roles: ["moderator"],
      permissions: ["users.read"],
    });
  });

  test("the role defaults to user, which has no permissions", () => {
    expect(meResponse.parse(profile)).toEqual({ ...profile, roles: ["user"], permissions: [] });
    // An unknown role is least privilege too, not a broken session.
    expect(meResponse.parse({ ...profile, role: "superuser" })).toEqual({
      ...profile,
      roles: ["user"],
      permissions: [],
    });
  });
});

describe("request helpers", () => {
  test("build the backend's request bodies and header", () => {
    expect(toLoginBody({ username: "admin", password: "admin123" })).toEqual({
      username: "admin",
      password: "admin123",
    });
    expect(toRefreshBody("rt")).toEqual({ refreshToken: "rt" });
    expect(authorizationHeader("at")).toEqual({ Authorization: "Bearer at" });
  });
});
