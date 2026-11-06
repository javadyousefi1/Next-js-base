import { describe, expect, test } from "bun:test";

import {
  authorizationHeader,
  backOfficeHeader,
  meResponse,
  REGISTER_ROLE_ID,
  toOtpSendBody,
  toPasswordLoginBody,
  toRegisterBody,
  toResendOtpBody,
  toVerifyOtpBody,
  tokenResponse,
} from "./auth.backend";

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

/** An unsigned JWT with the given payload (header and signature are placeholders). */
function jwt(payload: object) {
  return `${encode({ alg: "none" })}.${encode(payload)}.sig`;
}

describe("tokenResponse", () => {
  test("reads the lifetime from the JWT `exp` claim", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = jwt({ sub: "1", exp });
    const result = tokenResponse.parse({ token });
    expect(result.accessToken).toBe(token);
    expect(result.expiresInSeconds).toBeGreaterThan(3590);
    expect(result.expiresInSeconds).toBeLessThanOrEqual(3600);
  });

  test("leaves the lifetime undefined without an `exp` claim", () => {
    expect(tokenResponse.parse({ token: jwt({ sub: "1" }) }).expiresInSeconds).toBeUndefined();
  });

  test("leaves the lifetime undefined for a token that is not a JWT", () => {
    expect(tokenResponse.parse({ token: "garbage" }).expiresInSeconds).toBeUndefined();
    expect(tokenResponse.parse({ token: "a.!!!.c" }).expiresInSeconds).toBeUndefined();
  });

  test("an empty token is rejected", () => {
    expect(tokenResponse.safeParse({ token: "" }).success).toBe(false);
  });
});

describe("meResponse", () => {
  const info = {
    id: "7d2f0c8e-0000-4000-8000-000000000001",
    fullName: "Ada Lovelace",
    firstName: "Ada",
    lastName: "Lovelace",
    phoneNumber: "09120000000",
    roles: ["Admin"],
    email: null,
    username: null,
    avatarUrl: null,
  };

  test("maps GetUserRsDto to the session user", () => {
    expect(meResponse.parse({ info, identity: null })).toEqual({
      id: info.id,
      fullName: "Ada Lovelace",
      firstName: "Ada",
      lastName: "Lovelace",
      phoneNumber: "09120000000",
      roles: ["Admin"],
      avatarUrl: null,
    });
  });

  test("falls back to the phone number when the id is missing", () => {
    const { id: _id, ...withoutId } = info;
    expect(meResponse.parse({ info: withoutId }).id).toBe("09120000000");
  });

  test("copes with null names and roles", () => {
    const user = meResponse.parse({
      info: {
        phoneNumber: "09120000000",
        fullName: null,
        firstName: null,
        lastName: null,
        roles: null,
      },
    });
    expect(user).toMatchObject({ fullName: "09120000000", firstName: "", lastName: "", roles: [] });
  });

  test("builds the full name from the parts when the backend sends none", () => {
    const user = meResponse.parse({ info: { ...info, fullName: null } });
    expect(user.fullName).toBe("Ada Lovelace");
  });
});

describe("request helpers", () => {
  test("password login sends the phone and the password", () => {
    expect(toPasswordLoginBody({ phoneNumber: "09120000000", password: "pw" })).toEqual({
      phoneNumber: "09120000000",
      password: "pw",
    });
  });

  test("OTP send is a login with `password: null`", () => {
    expect(toOtpSendBody({ phoneNumber: "09120000000" })).toEqual({
      phoneNumber: "09120000000",
      password: null,
    });
  });

  test("verify and resend bodies", () => {
    expect(toVerifyOtpBody({ phoneNumber: "09120000000", code: "123456" })).toEqual({
      phoneNumber: "09120000000",
      code: "123456",
    });
    expect(toResendOtpBody({ phoneNumber: "09120000000" })).toEqual({ phoneNumber: "09120000000" });
  });

  test("register sends `phone` and the role id, and no password", () => {
    const body = toRegisterBody({ firstName: "Ada", lastName: "L", phoneNumber: "09120000000" });
    expect(body).toEqual({
      firstName: "Ada",
      lastName: "L",
      phone: "09120000000",
      roleId: REGISTER_ROLE_ID,
    });
    expect("password" in body).toBe(false);
  });

  test("headers", () => {
    expect(authorizationHeader("at")).toEqual({ Authorization: "Bearer at" });
    expect(backOfficeHeader).toEqual({ "back-office": "true" });
  });
});
