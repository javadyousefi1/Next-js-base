import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_ROUTES } from "@/config/routes";
import { bffClient } from "@/lib/http/client";
import type { QueryFetcher } from "@/lib/query";

import type {
  OtpSendInput,
  OtpVerifyInput,
  PasswordLoginInput,
  RegisterInput,
} from "../schemas/auth.schema";

/** Every sign-in step goes to our BFF routes: they are the only place the auth cookie is written. */
export function passwordLogin(input: PasswordLoginInput): Promise<unknown> {
  return bffClient.post(API_ROUTES.auth.login, input);
}

export function otpSend(input: OtpSendInput): Promise<unknown> {
  return bffClient.post(API_ROUTES.auth.otpSend, input);
}

export function otpResend(input: OtpSendInput): Promise<unknown> {
  return bffClient.post(API_ROUTES.auth.otpResend, input);
}

export function otpVerify(input: OtpVerifyInput): Promise<unknown> {
  return bffClient.post(API_ROUTES.auth.otpVerify, input);
}

export function register(input: RegisterInput): Promise<unknown> {
  return bffClient.post(API_ROUTES.auth.register, input);
}

export function logout(): Promise<unknown> {
  return bffClient.post(API_ROUTES.auth.logout);
}

/** The signed-in user (upstream `GET /User/Get`, through the BFF proxy in the browser). */
export const fetchCurrentUser: QueryFetcher<void> = (_params, { http, signal }) =>
  http.get(API_ENDPOINTS.users.me, { signal });
