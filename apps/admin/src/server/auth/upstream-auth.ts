import "server-only";

import {
  sessionUserSchema,
  tokenPairSchema,
  upstreamLoginResponseSchema,
  type LoginInput,
} from "@/features/auth/schemas/auth.schema";
import { bearer, upstream } from "@/server/http/upstream";

/** Upstream auth endpoints. Every response is validated before use. */
export async function upstreamLogin(credentials: LoginInput) {
  const { data } = await upstream.post<unknown>("/auth/login", credentials);
  return upstreamLoginResponseSchema.parse(data);
}

export async function upstreamRefresh(refreshToken: string) {
  const { data } = await upstream.post<unknown>("/auth/refresh", { refreshToken });
  return tokenPairSchema.parse(data);
}

export async function upstreamMe(accessToken: string) {
  const { data } = await upstream.get<unknown>("/auth/me", { headers: bearer(accessToken) });
  return sessionUserSchema.parse(data);
}
