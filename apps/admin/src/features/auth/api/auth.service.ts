import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_ROUTES } from "@/config/routes";
import { bffClient } from "@/lib/http/client";
import type { QueryFetcher } from "@/lib/query";

import type { LoginInput } from "../schemas/auth.schema";

/** Login/logout go to our BFF routes: they are the only place auth cookies are written. */
export function login(input: LoginInput): Promise<unknown> {
  return bffClient.post(API_ROUTES.auth.login, input);
}

export function logout(): Promise<unknown> {
  return bffClient.post(API_ROUTES.auth.logout);
}

/** The signed-in user (upstream `/auth/me`, through the BFF proxy in the browser). */
export const fetchCurrentUser: QueryFetcher<void> = (_params, { http, signal }) =>
  http.get(API_ENDPOINTS.auth.me, { signal });
