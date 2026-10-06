import type messages from "../../messages/en.json";
import { ROUTES } from "./routes";

/** A label from the `Nav` messages. */
export type BreadcrumbLabelKey = keyof (typeof messages)["Nav"];

/**
 * Breadcrumb label per page. The trail is built from the URL (`/users/42/edit` → `/`, `/users`,
 * `/users/42`, `/users/42/edit`), so a nested page only needs its own entry; a `[param]` segment
 * matches any value (`"/users/[id]": "userDetails"`). Paths without an entry are skipped.
 */
export const BREADCRUMBS: Readonly<Record<string, BreadcrumbLabelKey>> = {
  [ROUTES.dashboard]: "dashboard",
  [ROUTES.users]: "users",
  [ROUTES.settings]: "settings",
};
