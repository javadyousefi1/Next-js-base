import { describe, expect, test } from "bun:test";

import {
  authorizationHeader,
  loginResponse,
  meResponse,
  refreshResponse,
  toLoginBody,
  toRefreshBody,
} from "./auth.backend";

const user = {
  id: 1,
  username: "admin",
  email: "admin@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  role: "admin" as const,
};

describe("loginResponse", () => {
  test("splits the backend response into user and tokens (minutes → seconds)", () => {
    const result = loginResponse.parse({
      ...user,
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
    const { tokens } = loginResponse.parse({ ...user, accessToken: "at", refreshToken: "rt" });
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
  test("is the session user, role defaults to user", () => {
    const { role: _role, ...withoutRole } = user;
    expect(meResponse.parse(withoutRole)).toEqual({ ...withoutRole, role: "user" });
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
