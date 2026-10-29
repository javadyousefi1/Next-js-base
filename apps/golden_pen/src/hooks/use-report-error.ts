"use client";

import { useEffect } from "react";

/**
 * Error boundaries render a generic message; this keeps the real error visible in the browser
 * console. `digest` (server errors) matches the line Next.js prints in the server log
 * (`docker logs <container>`), and `code` is a short label to show the user.
 */
export function useReportError(error: Error & { digest?: string }) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return { code: error.digest ?? error.name };
}
