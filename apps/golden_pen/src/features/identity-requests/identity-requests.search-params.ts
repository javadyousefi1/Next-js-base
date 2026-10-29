import { filterParams, tableSearchParams } from "@repo/table/search-params";
import { createLoader, parseAsStringLiteral } from "nuqs/server";

import { DEFAULT_STATUS_TAB, STATUS_TABS } from "./schemas/identity-requests.schema";

/**
 * URL state of the identity-requests table (own keys: independent of `/users`). The status tab
 * is NOT a filter of the Filters drawer, so it lives apart (`statusTabParser`) and is not
 * counted as an active filter; `identityRequestsLoaderParams` is both, for the page's prefetch.
 */
export const identityRequestsSearchParams = {
  ...tableSearchParams,
  phoneNumber: filterParams.text(),
};

/** `?status=…`; the default tab (requested) is left out of the URL. */
export const statusTabParser = parseAsStringLiteral(STATUS_TABS).withDefault(DEFAULT_STATUS_TAB);

export const identityRequestsLoaderParams = {
  ...identityRequestsSearchParams,
  status: statusTabParser,
};

export const loadIdentityRequestsSearchParams = createLoader(identityRequestsLoaderParams);
