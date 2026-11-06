import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/routes";
import { apiClient, bffClient } from "@/lib/http/client";

import { AUTH_ENDPOINTS, meResponse } from "./auth.backend";
import {
  okResponseSchema,
  sessionResponseSchema,
  type OtpSendInput,
  type OtpVerifyInput,
  type PasswordLoginInput,
  type RegisterInput,
  type SessionResponse,
} from "./schemas/auth.schema";

/** Browser side of auth. The server side (token calls) lives in `auth.backend.ts`. */
export const authKeys = {
  all: ["auth"] as const,
  session: () => ["auth", "session"] as const,
};

/** The signed-in user (validated). A 401 here triggers the global "session expired" redirect. */
export const sessionQuery = () =>
  queryOptions({
    queryKey: authKeys.session(),
    queryFn: ({ signal }) => apiClient.get(AUTH_ENDPOINTS.me, { signal, schema: meResponse }),
    staleTime: 5 * 60_000,
  });

export function useSessionQuery() {
  return useQuery(sessionQuery());
}

/*
 * Every sign-in step goes to our BFF routes: they are the only place the auth cookie is written.
 * The sign-in forms render their own error message (`silent`). Redirects go to
 * `mutate(vars, { onSuccess })`.
 */

/** A sign-in stores the signed-in user as the session, so no extra `/me` request follows. */
function useStoreSession() {
  const queryClient = useQueryClient();
  return ({ user }: SessionResponse) => queryClient.setQueryData(authKeys.session(), user);
}

export function usePasswordLoginMutation() {
  const storeSession = useStoreSession();
  return useMutation({
    mutationFn: (input: PasswordLoginInput) =>
      bffClient.post(API_ROUTES.auth.login, input, { schema: sessionResponseSchema }),
    meta: { silent: true },
    onSuccess: storeSession,
  });
}

export function useOtpSendMutation() {
  return useMutation({
    mutationFn: (input: OtpSendInput) =>
      bffClient.post(API_ROUTES.auth.otpSend, input, { schema: okResponseSchema }),
    meta: { silent: true },
  });
}

export function useOtpResendMutation() {
  return useMutation({
    mutationFn: (input: OtpSendInput) =>
      bffClient.post(API_ROUTES.auth.otpResend, input, { schema: okResponseSchema }),
    meta: { silent: true },
  });
}

export function useOtpVerifyMutation() {
  const storeSession = useStoreSession();
  return useMutation({
    mutationFn: (input: OtpVerifyInput) =>
      bffClient.post(API_ROUTES.auth.otpVerify, input, { schema: sessionResponseSchema }),
    meta: { silent: true },
    onSuccess: storeSession,
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      bffClient.post(API_ROUTES.auth.register, input, { schema: okResponseSchema }),
    meta: { silent: true },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () =>
      bffClient.post(API_ROUTES.auth.logout, undefined, { schema: okResponseSchema }),
  });
}
