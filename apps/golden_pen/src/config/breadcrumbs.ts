import type messages from "../../messages/fa.json";
import { ROUTES } from "./routes";

/** A label from the `Nav` messages. */
export type BreadcrumbLabelKey = keyof (typeof messages)["Nav"];

/**
 * Breadcrumb label per page. The trail is built from the URL (`/items/42/edit` → `/`, `/items`,
 * `/items/42`, `/items/42/edit`), so a nested page only needs its own entry; a `[param]` segment
 * matches any value (`"/items/[id]": "itemDetails"`).
 *
 * - Every page needs its own entry (without one the page shows no breadcrumb); paths in between
 *   without an entry are skipped.
 * - The first matching pattern wins: list specific ones (`/items/[id]/edit`) before general ones
 *   (`/items/[id]/[tab]`).
 */
export const BREADCRUMBS: Readonly<Record<string, BreadcrumbLabelKey>> = {
  [ROUTES.dashboard]: "dashboard",
  [ROUTES.users]: "users",
  [ROUTES.inviteLinks]: "inviteLinks",
  [ROUTES.settings]: "settings",
};
