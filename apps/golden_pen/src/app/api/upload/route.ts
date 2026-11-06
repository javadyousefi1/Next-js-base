import type { NextRequest } from "next/server";

import { authorizationHeader } from "@/features/auth/auth.backend";
import { UPLOAD_ENDPOINT, validateUploadForm } from "@/features/profile/profile.backend";
import { withSession } from "@/server/auth/session";
import { bffError, bffJson } from "@/server/bff/responses";
import { upstream } from "@/server/http/upstream";

/**
 * BFF upload: validates the multipart form (`validateUploadForm`: type, size, kind) and forwards
 * it to the upstream `POST /User/Upload` with the access token from the httpOnly cookie. The
 * generic `/api/proxy` is JSON-only, so files get their own route. An avatar without a file
 * deletes the avatar.
 */
export async function POST(request: NextRequest) {
  const input = await request.formData().catch(() => null);
  if (!input) return bffJson({ message: "Invalid form" }, { status: 400 });

  const checked = validateUploadForm(input);
  if (!checked.ok) return bffJson({ message: checked.message }, { status: 400 });

  try {
    const result = await withSession(request, (accessToken) =>
      upstream.request("POST", UPLOAD_ENDPOINT, {
        body: checked.form,
        headers: authorizationHeader(accessToken),
      }),
    );
    return bffJson(result.data, { status: result.status });
  } catch (error) {
    return bffError(error);
  }
}
