import type { NextRequest } from "next/server";

import { registerInputSchema } from "@/features/auth/schemas/auth.schema";
import { upstreamRegister } from "@/server/auth/upstream-auth";
import { bffError, bffJson } from "@/server/bff/responses";

/** BFF registration: the backend sends an SMS code; the user signs in with `/api/auth/otp/verify`. */
export async function POST(request: NextRequest) {
  const input = registerInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return bffJson({ message: "Invalid input" }, { status: 400 });

  try {
    await upstreamRegister(input.data);
    return bffJson({ ok: true });
  } catch (error) {
    return bffError(error);
  }
}
