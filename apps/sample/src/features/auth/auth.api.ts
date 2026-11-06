import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/routes";
import { apiClient, bffClient } from "@/lib/http/client";

import { AUTH_ENDPOINTS, meResponse } from "./auth.backend";
import {
  logoutResponseSchema,
  sessionResponseSchema,
  type LoginInput,
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

/**
 * Login/logout go to our BFF routes: they are the only place auth cookies are written.
 * Login is `silent` (the login form renders its own error) and stores the signed-in user as the
 * session, so no extra `/me` request follows. Redirects go to `mutate(vars, { onSuccess })`.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      bffClient.post(API_ROUTES.auth.login, input, { schema: sessionResponseSchema }),
    meta: { silent: true },
    onSuccess: ({ user }) => queryClient.setQueryData(authKeys.session(), user),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () =>
      bffClient.post(API_ROUTES.auth.logout, undefined, { schema: logoutResponseSchema }),
  });
}
