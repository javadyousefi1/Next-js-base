import "server-only";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  tokenPairSchema,
  upstreamLoginResponseSchema,
  type LoginInput,
} from "@/features/auth/schemas/auth.schema";
import { upstreamPost } from "@/server/http/upstream";

/** Token-issuing upstream endpoints (only reachable through /api/auth/*, which sets cookies). */
export function upstreamLogin(credentials: LoginInput) {
  return upstreamPost(API_ENDPOINTS.auth.login, credentials, upstreamLoginResponseSchema);
}

export function upstreamRefresh(refreshToken: string) {
  return upstreamPost(API_ENDPOINTS.auth.refresh, { refreshToken }, tokenPairSchema);
}
