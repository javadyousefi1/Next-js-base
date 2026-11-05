import "server-only";
import {
  AUTH_ENDPOINTS,
  loginResponse,
  refreshResponse,
  toLoginBody,
  toRefreshBody,
} from "@/features/auth/auth.backend";
import type { LoginInput } from "@/features/auth/schemas/auth.schema";
import { upstream } from "@/server/http/upstream";

/** Token-issuing upstream endpoints (only reachable through /api/auth/*, which sets cookies). */
export function upstreamLogin(credentials: LoginInput) {
  return upstream.post(AUTH_ENDPOINTS.login, toLoginBody(credentials), {
    schema: loginResponse,
  });
}

export function upstreamRefresh(refreshToken: string) {
  return upstream.post(AUTH_ENDPOINTS.refresh, toRefreshBody(refreshToken), {
    schema: refreshResponse,
  });
}
