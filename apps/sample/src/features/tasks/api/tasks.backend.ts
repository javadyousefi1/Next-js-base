import { z } from "zod";

import {
  taskStatusSchema,
  type Task,
  type TaskInput,
  type TasksList,
  type TasksListParams,
} from "../schemas/task.schema";

/**
 * The ONLY file that knows the backend's tasks API (snake_case fields, limit/skip pagination,
 * `{ tasks, total }`). A new backend → change this file (+ `API_ENDPOINTS`, the MSW mock).
 */

/** Table params → backend query string. */
export function toBackendListQuery(params: TasksListParams) {
  return {
    limit: params.pageSize,
    skip: (params.page - 1) * params.pageSize,
    q: params.q || undefined,
    status: params.status ?? undefined,
    sort_by: params.sortBy ? SORT_FIELDS[params.sortBy] : undefined,
    order: params.sortBy ? params.order : undefined,
  };
}

const SORT_FIELDS = {
  title: "title",
  status: "status",
  dueDate: "due_date",
  createdAt: "created_at",
} as const satisfies Record<NonNullable<TasksListParams["sortBy"]>, string>;

/** Form values → backend request body. */
export function toBackendTaskBody(input: TaskInput) {
  return { title: input.title, status: input.status, due_date: input.dueDate };
}

/** Backend task → the app's `Task`. */
export const taskResponse = z
  .object({
    id: z.number().int(),
    title: z.string(),
    status: taskStatusSchema,
    due_date: z.iso.date().nullable(),
    created_at: z.iso.datetime(),
  })
  .transform((task): Task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.due_date,
    createdAt: task.created_at,
  }));

/** Backend `{ tasks, total }` → the app's `TasksList`. */
export const tasksListResponse = z
  .object({ tasks: z.array(taskResponse), total: z.number().int().nonnegative() })
  .transform(({ tasks, total }): TasksList => ({ items: tasks, total }));

/** DELETE answers 204 No Content. */
export const deleteTaskResponse = z.unknown();
