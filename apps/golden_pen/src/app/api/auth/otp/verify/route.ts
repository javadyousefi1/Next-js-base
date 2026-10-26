import type { NextRequest } from "next/server";

import { otpVerifyInputSchema } from "@/features/auth/schemas/auth.schema";
import { setAuthCookies } from "@/server/auth/cookies";
import { upstreamOtpVerify } from "@/server/auth/upstream-auth";
import { bffError, bffJson } from "@/server/bff/responses";

/** BFF code check (OTP login and registration): stores the token in an httpOnly cookie. */
export async function POST(request: NextRequest) {
  const input = otpVerifyInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return bffJson({ message: "Invalid input" }, { status: 400 });

  try {
    const { user, token } = await upstreamOtpVerify(input.data);
    const response = bffJson({ user });
    setAuthCookies(response.cookies, token);
    return response;
  } catch (error) {
    return bffError(error);
  }
}
