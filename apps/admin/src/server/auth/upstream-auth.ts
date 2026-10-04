import "server-only";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  tokenPairSchema,
  upstreamLoginResponseSchema,
  type LoginInput,
} from "@/features/auth/schemas/auth.schema";
import { upstream } from "@/server/http/upstream";

/** Token-issuing upstream endpoints (only reachable through /api/auth/*, which sets cookies). */
export function upstreamLogin(credentials: LoginInput) {
  return upstream.post(API_ENDPOINTS.auth.login, credentials, {
    schema: upstreamLoginResponseSchema,
  });
}

export function upstreamRefresh(refreshToken: string) {
  return upstream.post(API_ENDPOINTS.auth.refresh, { refreshToken }, { schema: tokenPairSchema });
}
