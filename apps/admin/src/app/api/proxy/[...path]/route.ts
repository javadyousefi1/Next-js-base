import type { NextRequest } from "next/server";

import { withSession } from "@/server/auth/session";
import { bffError, bffJson } from "@/server/bff/responses";
import { bearer, upstream } from "@/server/http/upstream";

/**
 * BFF proxy: `/api/proxy/<path>` → `${API_BASE_URL}/<path>`.
 * Adds the access token from the httpOnly cookie, refreshes it once on 401 and forwards the
 * JSON response. The browser never sees a token. (JSON APIs only — no file streaming.)
 */
async function forward(request: NextRequest, context: RouteContext<"/api/proxy/[...path]">) {
  const { path } = await context.params;
  if (path.some((segment) => segment === "." || segment === "..")) {
    return bffJson({ message: "Invalid path" }, { status: 400 });
  }

  const hasBody = request.method !== "GET" && request.method !== "DELETE";
  const body = hasBody ? await request.text() : undefined;

  try {
    const { result, refreshedTokens } = await withSession(request, (accessToken) =>
      upstream.request<unknown>({
        method: request.method,
        url: `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
        data: body,
        headers: { ...bearer(accessToken), "Content-Type": "application/json" },
      }),
    );
    return bffJson(result.data, { status: result.status, refreshedTokens });
  } catch (error) {
    return bffError(error);
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
