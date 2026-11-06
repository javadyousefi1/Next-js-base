import { API_ROUTES } from "@/config/routes";
import { bffClient } from "@/lib/http/client";
import { useApiMutation, useApiQuery } from "@/lib/query/api-hooks";

import { AUTH_ENDPOINTS, meResponse } from "./auth.backend";
import {
  okResponseSchema,
  sessionResponseSchema,
  type OtpSendInput,
  type OtpVerifyInput,
  type PasswordLoginInput,
  type RegisterInput,
} from "./schemas/auth.schema";

/** Browser side of auth. The server side (token calls) lives in `auth.backend.ts`. */
export const authKeys = {
  all: ["auth"] as const,
  session: () => ["auth", "session"] as const,
};

/** The signed-in user (validated). A 401 here triggers the global "session expired" redirect. */
export const useSessionQuery = () =>
  useApiQuery({
    key: authKeys.session(),
    url: AUTH_ENDPOINTS.me,
    schema: meResponse,
    staleTime: 5 * 60_000,
  });

/*
 * Every sign-in step goes to our BFF routes (`bffClient`): they are the only place the auth
 * cookie is written. The sign-in forms render their own error message (`silent`). A sign-in
 * stores the signed-in user as the session, so no extra `/me` request follows. Redirects go to
 * `mutate(vars, { onSuccess })`.
 */

export const usePasswordLoginMutation = () =>
  useApiMutation({
    client: bffClient,
    method: "POST",
    url: API_ROUTES.auth.login,
    body: (input: PasswordLoginInput) => input,
    schema: sessionResponseSchema,
    onSuccess: ({ user }, _input, queryClient) =>
      queryClient.setQueryData(authKeys.session(), user),
    silent: true,
  });

export const useOtpSendMutation = () =>
  useApiMutation({
    client: bffClient,
    method: "POST",
    url: API_ROUTES.auth.otpSend,
    body: (input: OtpSendInput) => input,
    schema: okResponseSchema,
    silent: true,
  });

export const useOtpResendMutation = () =>
  useApiMutation({
    client: bffClient,
    method: "POST",
    url: API_ROUTES.auth.otpResend,
    body: (input: OtpSendInput) => input,
    schema: okResponseSchema,
    silent: true,
  });

export const useOtpVerifyMutation = () =>
  useApiMutation({
    client: bffClient,
    method: "POST",
    url: API_ROUTES.auth.otpVerify,
    body: (input: OtpVerifyInput) => input,
    schema: sessionResponseSchema,
    onSuccess: ({ user }, _input, queryClient) =>
      queryClient.setQueryData(authKeys.session(), user),
    silent: true,
  });

export const useRegisterMutation = () =>
  useApiMutation({
    client: bffClient,
    method: "POST",
    url: API_ROUTES.auth.register,
    body: (input: RegisterInput) => input,
    schema: okResponseSchema,
    silent: true,
  });

export const useLogoutMutation = () =>
  useApiMutation({
    client: bffClient,
    method: "POST",
    url: API_ROUTES.auth.logout,
    body: () => undefined,
    schema: okResponseSchema,
  });
