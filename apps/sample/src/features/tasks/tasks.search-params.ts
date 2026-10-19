import { filterParams, tableSearchParams } from "@repo/table/search-params";
import { createLoader, parseAsStringLiteral } from "nuqs/server";

import { TASK_SORT_FIELDS, TASK_STATUSES } from "./schemas/task.schema";

/** URL state of the tasks table (browser hook + server prefetch send the same params). */
export const tasksSearchParams = {
  ...tableSearchParams,
  sortBy: parseAsStringLiteral(TASK_SORT_FIELDS),
  status: filterParams.select(TASK_STATUSES),
};

export const loadTasksSearchParams = createLoader(tasksSearchParams);
