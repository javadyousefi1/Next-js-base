"use client";

import { toTableController } from "@repo/table/to-table-controller";
import { useTableState } from "@repo/table/use-table-state";

import { useTasksListQuery } from "../tasks.api";
import { tasksSearchParams } from "../tasks.search-params";

/** URL state → tasks query → everything the data-table components need. */
export function useTasksTable() {
  const { params, ...controls } = useTableState(tasksSearchParams);
  return toTableController(controls, useTasksListQuery(params));
}
