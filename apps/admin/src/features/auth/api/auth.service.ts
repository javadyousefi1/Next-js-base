import { API_ROUTES } from "@/config/routes";
import { bffClient } from "@/lib/http/client";

import type { LoginInput } from "../schemas/auth.schema";

/** Browser → BFF auth routes. Tokens never reach JS: the BFF sets httpOnly cookies. */
export async function login(input: LoginInput): Promise<unknown> {
  const { data } = await bffClient.post<unknown>(API_ROUTES.auth.login, input);
  return data;
}

export async function logout(): Promise<unknown> {
  const { data } = await bffClient.post<unknown>(API_ROUTES.auth.logout);
  return data;
}

export async function getSession({ signal }: { signal: AbortSignal }): Promise<unknown> {
  const { data } = await bffClient.get<unknown>(API_ROUTES.auth.session, { signal });
  return data;
}
