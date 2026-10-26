import { clearAuthCookies } from "@/server/auth/cookies";
import { bffJson } from "@/server/bff/responses";

/** BFF logout: drops the auth cookie (the backend has no logout endpoint). */
export function POST() {
  const response = bffJson({ ok: true });
  clearAuthCookies(response.cookies);
  return response;
}
