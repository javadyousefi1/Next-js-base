import type { ApiError } from "@repo/http";

/** 400/409: the server's reason when it sent one; anything else (or no error): the generic text. */
export function serverMessage(error: ApiError | null, generic: string): string | null {
  if (!error) return null;
  return (error.status === 400 || error.status === 409) && error.message ? error.message : generic;
}
