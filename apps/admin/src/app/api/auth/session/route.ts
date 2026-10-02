import { connection, type NextRequest } from "next/server";

import { withSession } from "@/server/auth/session";
import { upstreamMe } from "@/server/auth/upstream-auth";
import { bffError, bffJson } from "@/server/bff/responses";

/** Current user for the browser (`useSession`). Refreshes the access token when needed. */
export async function GET(request: NextRequest) {
  await connection(); // per-request response: never prerendered
  try {
    const { result: user, refreshedTokens } = await withSession(request, upstreamMe);
    return bffJson({ user }, { refreshedTokens });
  } catch (error) {
    return bffError(error);
  }
}
