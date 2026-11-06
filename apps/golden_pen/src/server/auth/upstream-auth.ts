import "server-only";
import {
  AUTH_ENDPOINTS,
  ignoredResponse,
  meResponse,
  tokenResponse,
  toOtpSendBody,
  toPasswordLoginBody,
  toRegisterBody,
  toResendOtpBody,
  toVerifyOtpBody,
} from "@/features/auth/auth.backend";
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
  const user = await upstreamFor(token.accessToken).get(AUTH_ENDPOINTS.me, {
    schema: meResponse,
  });
  return { user, token };
}

/** Token-issuing upstream endpoints (only reachable through /api/auth/*, which sets the cookie). */
export async function upstreamPasswordLogin(input: PasswordLoginInput) {
  const token = await upstream.post(AUTH_ENDPOINTS.login, toPasswordLoginBody(input), {
    schema: tokenResponse,
  });
  return withUser(token);
}

/** Login with `password: null`: the backend sends an SMS code (its response body is ignored). */
export function upstreamOtpSend(input: OtpSendInput) {
  return upstream.post(AUTH_ENDPOINTS.login, toOtpSendBody(input), {
    schema: ignoredResponse,
  });
}

export function upstreamOtpResend(input: OtpSendInput) {
  return upstream.put(AUTH_ENDPOINTS.resendOtp, toResendOtpBody(input), {
    schema: ignoredResponse,
  });
}

export async function upstreamOtpVerify(input: OtpVerifyInput) {
  const token = await upstream.post(AUTH_ENDPOINTS.verifyOtp, toVerifyOtpBody(input), {
    schema: tokenResponse,
  });
  return withUser(token);
}

/** Registration sends the SMS code; the sign-in itself completes in `upstreamOtpVerify`. */
export function upstreamRegister(input: RegisterInput) {
  return upstream.post(AUTH_ENDPOINTS.register, toRegisterBody(input), {
    schema: ignoredResponse,
  });
}
