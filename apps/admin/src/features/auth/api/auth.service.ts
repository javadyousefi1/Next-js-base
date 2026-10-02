import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_ROUTES } from "@/config/routes";
import { bffClient } from "@/lib/http/client";
import type { QueryFetcher } from "@/lib/query";

import type { LoginInput } from "../schemas/auth.schema";

/** Login/logout go to our BFF routes: they are the only place auth cookies are written. */
export async function login(input: LoginInput): Promise<unknown> {
  const { data } = await bffClient.post<unknown>(API_ROUTES.auth.login, input);
  return data;
}

export async function logout(): Promise<unknown> {
  const { data } = await bffClient.post<unknown>(API_ROUTES.auth.logout);
  return data;
}

/** The signed-in user (upstream `/auth/me`, through the BFF proxy in the browser). */
export const fetchCurrentUser: QueryFetcher<void> = async (_params, { http, signal }) => {
  const { data } = await http.get<unknown>(API_ENDPOINTS.auth.me, { signal });
  return data;
};
