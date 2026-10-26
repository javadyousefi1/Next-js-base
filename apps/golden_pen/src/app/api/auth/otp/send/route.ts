import type { NextRequest } from "next/server";

import { otpSendInputSchema } from "@/features/auth/schemas/auth.schema";
import { upstreamOtpSend } from "@/server/auth/upstream-auth";
import { bffError, bffJson } from "@/server/bff/responses";

/** BFF "send me a code": no rate limit here — the backend is expected to throttle SMS. */
export async function POST(request: NextRequest) {
  const input = otpSendInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return bffJson({ message: "Invalid input" }, { status: 400 });

  try {
    await upstreamOtpSend(input.data);
    return bffJson({ ok: true });
  } catch (error) {
    return bffError(error);
  }
}
