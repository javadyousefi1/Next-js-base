"use client";

import { toTableController } from "@repo/table/to-table-controller";
import { useTableState } from "@repo/table/use-table-state";

import { useInviteLinksListQuery } from "../invite-links.api";
import { inviteLinksSearchParams } from "../invite-links.search-params";

/** URL state → invite links query → everything the data-table components need. */
export function useInviteLinksTable() {
  const { params, ...controls } = useTableState(inviteLinksSearchParams);
  return toTableController(controls, useInviteLinksListQuery(params));
}
