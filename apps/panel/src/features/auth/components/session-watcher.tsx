"use client";

import { useUnauthorizedRedirect } from "../hooks/use-unauthorized-redirect";

/** Renders nothing: wires the "session expired → login" redirect into the authenticated shell. */
export function SessionWatcher() {
  useUnauthorizedRedirect();
  return null;
}
