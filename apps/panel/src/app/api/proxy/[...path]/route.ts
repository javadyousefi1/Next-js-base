import type { NextRequest } from "next/server";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { authorizationHeader } from "@/features/auth/api/auth.backend";
import { withSession } from "@/server/auth/session";
import { bffError, bffJson } from "@/server/bff/responses";
import { upstream } from "@/server/http/upstream";

/**
 * BFF proxy: `/api/proxy/<path>` → `${API_BASE_URL}/<path>`.
 * Adds the access token from the httpOnly cookie and forwards the JSON response (an upstream
 * 401 ends the session). The browser never sees a token. (JSON APIs only — no file streaming.)
 */
/**
 * Token-issuing endpoints are only reachable through `/api/auth/*`, which stores the token in
 * an httpOnly cookie. Proxying them would hand raw tokens to browser JavaScript. Lowercased:
 * the comparison below is case-insensitive.
 */
const BLOCKED_PATHS = new Set<string>(
  [
    API_ENDPOINTS.auth.login,
    API_ENDPOINTS.auth.register,
    API_ENDPOINTS.auth.verifyOtp,
    API_ENDPOINTS.auth.registerByInviteLink,
  ].map((path) => path.toLowerCase()),
);

async function forward(request: NextRequest, context: RouteContext<"/api/proxy/[...path]">) {
  const { path } = await context.params;
  if (path.some((segment) => segment === "." || segment === "..")) {
    return bffJson({ message: "Invalid path" }, { status: 400 });
  }
  if (BLOCKED_PATHS.has(`/${path.filter(Boolean).join("/")}`.toLowerCase())) {
    return bffJson({ message: "Not found" }, { status: 404 });
  }

  const url = `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const hasBody = request.method !== "GET" && request.method !== "DELETE";
  const body = hasBody ? await request.text() : undefined;

  try {
    const result = await withSession(request, (accessToken) =>
      upstream.request(request.method, url, {
        body,
        headers: { ...authorizationHeader(accessToken), "Content-Type": "application/json" },
      }),
    );
    return bffJson(result.data, { status: result.status });
  } catch (error) {
    return bffError(error);
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
