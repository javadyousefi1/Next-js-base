import "server-only";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  ignoredResponse,
  meResponse,
  tokenResponse,
  toOtpSendBody,
  toPasswordLoginBody,
  toRegisterBody,
  toResendOtpBody,
  toVerifyOtpBody,
} from "@/features/auth/api/auth.backend";
import type {
  OtpSendInput,
  OtpVerifyInput,
  PasswordLoginInput,
  RegisterInput,
  SessionToken,
} from "@/features/auth/schemas/auth.schema";
import { upstream, upstreamFor } from "@/server/http/upstream";

/** The user behind a fresh token (`GET /User/Get`): a sign-in answers with `{ user, token }`. */
async function withUser(token: SessionToken) {
  const user = await upstreamFor(token.accessToken).get(API_ENDPOINTS.users.me, {
    schema: meResponse,
  });
  return { user, token };
}

/** Token-issuing upstream endpoints (only reachable through /api/auth/*, which sets the cookie). */
export async function upstreamPasswordLogin(input: PasswordLoginInput) {
  const token = await upstream.post(API_ENDPOINTS.auth.login, toPasswordLoginBody(input), {
    schema: tokenResponse,
  });
  return withUser(token);
}

/** Login with `password: null`: the backend sends an SMS code (its response body is ignored). */
export function upstreamOtpSend(input: OtpSendInput) {
  return upstream.post(API_ENDPOINTS.auth.login, toOtpSendBody(input), {
    schema: ignoredResponse,
  });
}

export function upstreamOtpResend(input: OtpSendInput) {
  return upstream.put(API_ENDPOINTS.auth.resendOtp, toResendOtpBody(input), {
    schema: ignoredResponse,
  });
}

export async function upstreamOtpVerify(input: OtpVerifyInput) {
  const token = await upstream.post(API_ENDPOINTS.auth.verifyOtp, toVerifyOtpBody(input), {
    schema: tokenResponse,
  });
  return withUser(token);
}

/** Registration sends the SMS code; the sign-in itself completes in `upstreamOtpVerify`. */
export function upstreamRegister(input: RegisterInput) {
  return upstream.post(API_ENDPOINTS.auth.register, toRegisterBody(input), {
    schema: ignoredResponse,
  });
}
