"use client";

import { toTableController } from "@repo/table/to-table-controller";
import { useTableState } from "@repo/table/use-table-state";

import { useIdentityRequestsListQuery } from "../identity-requests.api";
import { identityRequestsSearchParams } from "../identity-requests.search-params";
import { useIdentityStatusTab } from "./use-identity-status-tab";

/** URL state + status tab → identity-requests query → everything the data-table components need. */
export function useIdentityRequestsTable() {
  const { params, ...controls } = useTableState(identityRequestsSearchParams);
  const tab = useIdentityStatusTab();
  return toTableController(
    controls,
    useIdentityRequestsListQuery({ ...params, status: tab.value }),
  );
}
