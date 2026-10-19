import { clearAuthCookies } from "@/server/auth/cookies";
import { bffJson } from "@/server/bff/responses";

/** BFF logout: drops both auth cookies. */
export function POST() {
  const response = bffJson({ ok: true });
  clearAuthCookies(response.cookies);
  return response;
}
