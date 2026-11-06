"use client";

import { toTableController } from "@repo/table/to-table-controller";
import { useTableState } from "@repo/table/use-table-state";

import { useUsersListQuery } from "../users.api";
import { usersSearchParams } from "../users.search-params";

/** URL state → users query → everything the data-table components need. */
export function useUsersTable() {
  const { params, ...controls } = useTableState(usersSearchParams);
  // The search box debounces its own typing; the previous page stays visible while loading.
  return toTableController(controls, useUsersListQuery(params));
}
