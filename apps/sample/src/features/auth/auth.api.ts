import { API_ROUTES } from "@/config/routes";
import { bffClient } from "@/lib/http/client";
import { useApiMutation, useApiQuery } from "@/lib/query/api-hooks";

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
export const useSessionQuery = () =>
  useApiQuery({
    key: authKeys.session(),
    url: AUTH_ENDPOINTS.me,
    schema: meResponse,
    staleTime: 5 * 60_000,
  });

/*
 * Login/logout go to our BFF routes (`bffClient`): they are the only place auth cookies are
 * written. Login is `silent` (the login form renders its own error) and stores the signed-in user
 * as the session, so no extra `/me` request follows. Redirects go to `mutate(vars, { onSuccess })`.
 */

export const useLoginMutation = () =>
  useApiMutation({
    client: bffClient,
    method: "POST",
    url: API_ROUTES.auth.login,
    body: (input: LoginInput) => input,
    schema: sessionResponseSchema,
    onSuccess: ({ user }, _input, queryClient) =>
      queryClient.setQueryData(authKeys.session(), user),
    silent: true,
  });

export const useLogoutMutation = () =>
  useApiMutation({
    client: bffClient,
    method: "POST",
    url: API_ROUTES.auth.logout,
    body: () => undefined,
    schema: logoutResponseSchema,
  });
