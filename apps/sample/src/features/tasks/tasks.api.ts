import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useApiMutation, useApiQuery } from "@/lib/query/api-hooks";

import {
  taskStatusSchema,
  type Task,
  type TaskId,
  type TaskInput,
  type TasksList,
  type TasksListParams,
  type UpdateTaskInput,
} from "./schemas/task.schema";

/**
 * The ONLY file that knows the backend's tasks API (snake_case fields, limit/skip pagination,
 * `{ tasks, total }`): endpoints, mapping, response schemas, keys, queries and mutations. A new
 * backend → change this file (+ the MSW mock).
 */

/** Relative to `API_BASE_URL` on the server, or to `/api/proxy` in the browser (BFF). */
export const TASKS_ENDPOINT = "/tasks";
const taskEndpoint = (id: number) => `${TASKS_ENDPOINT}/${id}`;

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

/** Hierarchical: invalidating `all` refreshes every tasks query. */
export const tasksKeys = {
  all: ["tasks"] as const,
  list: (params: TasksListParams) => ["tasks", "list", params] as const,
};

/** One table page; the previous page stays visible while the next one loads. */
export const useTasksListQuery = (params: TasksListParams) =>
  useApiQuery({
    key: tasksKeys.list(params),
    url: TASKS_ENDPOINT,
    params: toBackendListQuery(params),
    schema: tasksListResponse,
    keepPrevious: true,
    staleTime: 30_000,
  });

/** Refetches every tasks query (lists included). */
export function useRefreshTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: tasksKeys.all });
}

/*
 * Mutations refresh the lists on success. `silent`: the form / confirm modal renders the error
 * itself, so no global toast. Callers add their own `onSuccess` to `mutate(vars, { onSuccess })`.
 */

export const useCreateTaskMutation = () =>
  useApiMutation({
    method: "POST",
    url: TASKS_ENDPOINT,
    body: (input: TaskInput) => toBackendTaskBody(input),
    schema: taskResponse,
    invalidates: [tasksKeys.all],
    silent: true,
  });

export const useUpdateTaskMutation = () =>
  useApiMutation({
    method: "PATCH",
    url: ({ id }: UpdateTaskInput) => taskEndpoint(id),
    body: ({ id: _id, ...input }) => toBackendTaskBody(input),
    schema: taskResponse,
    invalidates: [tasksKeys.all],
    silent: true,
  });

/** DELETE answers 204 No Content. */
export const useDeleteTaskMutation = () =>
  useApiMutation({
    method: "DELETE",
    url: ({ id }: TaskId) => taskEndpoint(id),
    invalidates: [tasksKeys.all],
    silent: true,
  });
