import type { NextRequest } from "next/server";

import { passwordLoginInputSchema } from "@/features/auth/schemas/auth.schema";
import { setAuthCookies } from "@/server/auth/cookies";
import { upstreamPasswordLogin } from "@/server/auth/upstream-auth";
import { bffError, bffJson } from "@/server/bff/responses";

/** BFF password login: validates input, stores the token in an httpOnly cookie. */
export async function POST(request: NextRequest) {
  const input = passwordLoginInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return bffJson({ message: "Invalid input" }, { status: 400 });

  try {
    const { user, token } = await upstreamPasswordLogin(input.data);
    const response = bffJson({ user });
    setAuthCookies(response.cookies, token);
    return response;
  } catch (error) {
    return bffError(error);
  }
}
