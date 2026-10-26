import { z } from "zod";

import type {
  OtpSendInput,
  OtpVerifyInput,
  PasswordLoginInput,
  RegisterInput,
  SessionToken,
  SessionUser,
} from "../schemas/auth.schema";

/**
 * The ONLY file that knows the backend's auth API: phone number + password or SMS code (OTP),
 * answered with ONE JWT (no refresh token, no logout endpoint). A new backend → change this file
 * (+ `API_ENDPOINTS`, the MSW mock), nothing else. It is imported by the browser too
 * (`meResponse`): no env and no secrets here.
 */

/**
 * Role given to a newly registered user. The value is a guess: confirm the
 * right role id with the backend team before going live.
 */
export const REGISTER_ROLE_ID = 1;

/** Every upstream request is a back-office request. */
export const backOfficeHeader = { "back-office": "true" };

/** Phone + password → the backend's login request body. */
export function toPasswordLoginBody(input: PasswordLoginInput) {
  return { phoneNumber: input.phoneNumber, password: input.password };
}

/** Phone only (`password: null`) → the backend sends an SMS code. */
export function toOtpSendBody(input: OtpSendInput) {
  return { phoneNumber: input.phoneNumber, password: null };
}

export function toVerifyOtpBody(input: OtpVerifyInput) {
  return { phoneNumber: input.phoneNumber, code: input.code };
}

export function toResendOtpBody(input: OtpSendInput) {
  return { phoneNumber: input.phoneNumber };
}

/** Registration has no password: the user signs in with the SMS code that follows. */
export function toRegisterBody(input: RegisterInput) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phoneNumber,
    roleId: REGISTER_ROLE_ID,
  };
}

/** How the backend authenticates a request with an access token. */
export function authorizationHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

/** Seconds until the JWT's `exp` claim (`undefined` when it is not a decodable JWT or has none). */
function secondsUntilExpiry(token: string): number | undefined {
  try {
    const payload = token.split(".")[1];
    if (!payload) return undefined;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims: unknown = JSON.parse(atob(base64));
    const exp = z.object({ exp: z.number() }).safeParse(claims);
    if (!exp.success) return undefined;
    return Math.max(Math.floor(exp.data.exp - Date.now() / 1000), 0);
  } catch {
    return undefined;
  }
}

/** Login / VerifyOtp response `{ token }` → the app's `SessionToken`. */
export const tokenResponse = z
  .object({ token: z.string().min(1) })
  .transform(({ token }): SessionToken => ({
    accessToken: token,
    expiresInSeconds: secondsUntilExpiry(token),
  }));

const backendUser = z.object({
  info: z.object({
    id: z.string().nullish(),
    fullName: z.string().nullish(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    phoneNumber: z.string(),
    roles: z.array(z.string()).nullish(),
  }),
});

/** `GetUserRsDto` (`GET /User/Get`) → the signed-in user. `info.id` is optional upstream. */
export const meResponse = backendUser.transform(({ info }): SessionUser => {
  const firstName = info.firstName ?? "";
  const lastName = info.lastName ?? "";
  return {
    id: info.id ?? info.phoneNumber,
    fullName: info.fullName || `${firstName} ${lastName}`.trim() || info.phoneNumber,
    firstName,
    lastName,
    phoneNumber: info.phoneNumber,
    roles: info.roles ?? [],
  };
});

/** Responses we don't read: the SMS-sending calls (a body may be empty, 204, or anything). */
export const ignoredResponse = z.unknown();
