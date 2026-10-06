import { ApiError } from "@repo/http";
import { rateLimit } from "@repo/redis";
import type { NextRequest } from "next/server";

import { LOGIN_RATE_LIMIT } from "@/config/auth";
import { loginInputSchema } from "@/features/auth/schemas/auth.schema";
import { setAuthCookies } from "@/server/auth/cookies";
import { upstreamLogin } from "@/server/auth/upstream-auth";
import { bffError, bffJson } from "@/server/bff/responses";
import { getRedis } from "@/server/redis/client";

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** BFF login: validates input, rate-limits per IP (Redis), stores tokens in httpOnly cookies. */
export async function POST(request: NextRequest) {
  const limit = await rateLimit(getRedis(), `login:${clientIp(request)}`, LOGIN_RATE_LIMIT);
  if (!limit.allowed) {
    return bffError(
      new ApiError("Too many login attempts", {
        status: 429,
        code: "RATE_LIMITED",
        retryAfterSeconds: limit.retryAfterSeconds,
      }),
    );
  }

  const input = loginInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return bffJson({ message: "Invalid input" }, { status: 400 });

  try {
    const { user, tokens } = await upstreamLogin(input.data);
    const response = bffJson({ user });
    setAuthCookies(response.cookies, tokens);
    return response;
  } catch (error) {
    return bffError(error);
  }
}
