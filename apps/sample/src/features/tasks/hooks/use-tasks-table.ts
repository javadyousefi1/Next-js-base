"use client";

import type { TableController } from "@repo/table/types";
import { useTableState } from "@repo/table/use-table-state";
import { keepPreviousData } from "@tanstack/react-query";

import { tasksListQuery } from "../api/tasks.queries";
import type { Task } from "../schemas/task.schema";
import { tasksSearchParams } from "../tasks.search-params";

const NO_TASKS: Task[] = [];

/** URL state → tasks query → everything the data-table components need. */
export function useTasksTable(): TableController<Task> {
  const { params, ...controls } = useTableState(tasksSearchParams);
  const query = tasksListQuery.useQuery(params, { placeholderData: keepPreviousData });

  return {
    ...controls,
    rows: query.data?.items ?? NO_TASKS,
    total: query.data?.total ?? 0,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError && query.data === undefined,
    retry: () => void query.refetch(),
  };
}
