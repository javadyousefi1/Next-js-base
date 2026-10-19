import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/http/client";
import type { QueryFetcher } from "@/lib/query";

import type { TaskId, TaskInput, TasksListParams, UpdateTaskInput } from "../schemas/task.schema";
import { toBackendListQuery, toBackendTaskBody } from "./tasks.backend";

/** Works in the browser (BFF proxy) and on the server (prefetch): `http` is injected. */
export const fetchTasksList: QueryFetcher<TasksListParams> = (params, { http, signal }) =>
  http.get(API_ENDPOINTS.tasks.list, { params: toBackendListQuery(params), signal });

/** Writes run in the browser only, through the BFF proxy. */
export function createTask(input: TaskInput): Promise<unknown> {
  return apiClient.post(API_ENDPOINTS.tasks.list, toBackendTaskBody(input));
}

export function updateTask({ id, ...input }: UpdateTaskInput): Promise<unknown> {
  return apiClient.patch(API_ENDPOINTS.tasks.detail(id), toBackendTaskBody(input));
}

export function deleteTask({ id }: TaskId): Promise<unknown> {
  return apiClient.delete(API_ENDPOINTS.tasks.detail(id));
}
