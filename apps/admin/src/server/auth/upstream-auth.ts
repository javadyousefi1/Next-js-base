import "server-only";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  loginResponse,
  refreshResponse,
  toLoginBody,
  toRefreshBody,
} from "@/features/auth/api/auth.backend";
import type { LoginInput } from "@/features/auth/schemas/auth.schema";
import { upstream } from "@/server/http/upstream";

/** Token-issuing upstream endpoints (only reachable through /api/auth/*, which sets cookies). */
export function upstreamLogin(credentials: LoginInput) {
  return upstream.post(API_ENDPOINTS.auth.login, toLoginBody(credentials), {
    schema: loginResponse,
  });
}

export function upstreamRefresh(refreshToken: string) {
  return upstream.post(API_ENDPOINTS.auth.refresh, toRefreshBody(refreshToken), {
    schema: refreshResponse,
  });
}
