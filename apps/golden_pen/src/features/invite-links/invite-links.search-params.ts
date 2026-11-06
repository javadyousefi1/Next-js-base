import { filterParams, tableSearchParams } from "@repo/table/search-params";
import { createLoader } from "nuqs/server";

import { IS_USED_FILTERS } from "./schemas/invite-link.schema";

/**
 * URL state of the invite links table. Used by `useInviteLinksTable` and the toolbar (browser). The API has no search and no sorting (`q`, `sortBy`, `order` stay unused).
 */
export const inviteLinksSearchParams = {
  ...tableSearchParams,
  isUsed: filterParams.select(IS_USED_FILTERS),
};

export const loadInviteLinksSearchParams = createLoader(inviteLinksSearchParams);
