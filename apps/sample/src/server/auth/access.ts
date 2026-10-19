import "server-only";
import { allows, type AccessRule } from "@repo/access/access";
import type { Permission, Role } from "@repo/access/register";
import { isApiError } from "@repo/http";
import { cache } from "react";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { meResponse } from "@/features/auth/api/auth.backend";
import { upstreamFor } from "@/server/http/upstream";

import { getAccessToken } from "./cookies";

/** The signed-in user, asked from the upstream API once per request (`null` without a valid session). */
export const getSessionUser = cache(async () => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    return await upstreamFor(accessToken).get(API_ENDPOINTS.auth.me, { schema: meResponse });
  } catch (error) {
    // No valid session is normal; anything else (outage, schema drift) is worth a log line.
    if (!isApiError(error) || error.code !== "UNAUTHORIZED") {
      console.error("[access] could not read the session", isApiError(error) ? error.code : error);
    }
    return null;
  }
});

/** Does the signed-in user satisfy the rule? For Server Actions and route handlers (they are public). */
export async function hasAccess(rule: AccessRule<Role, Permission>) {
  const user = await getSessionUser();
  return user !== null && allows(user, rule);
}
