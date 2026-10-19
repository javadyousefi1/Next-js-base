import { MUTATION_KEYS, QUERY_KEYS } from "@/config/query-keys";
import { makeMutation, makeQuery } from "@/lib/query";

import {
  taskIdSchema,
  taskInputSchema,
  tasksListParamsSchema,
  updateTaskSchema,
} from "../schemas/task.schema";
import { deleteTaskResponse, taskResponse, tasksListResponse } from "./tasks.backend";
import { createTask, deleteTask, fetchTasksList, updateTask } from "./tasks.service";

export const tasksListQuery = makeQuery({
  key: QUERY_KEYS.tasks.list,
  params: tasksListParamsSchema,
  response: tasksListResponse,
  fetcher: fetchTasksList,
  staleTime: 30_000,
});

export const createTaskMutation = makeMutation({
  mutationKey: MUTATION_KEYS.tasks.create,
  variables: taskInputSchema,
  response: taskResponse,
  mutationFn: createTask,
  invalidates: [QUERY_KEYS.tasks.lists()],
  // The form shows the error.
  silent: true,
});

export const updateTaskMutation = makeMutation({
  mutationKey: MUTATION_KEYS.tasks.update,
  variables: updateTaskSchema,
  response: taskResponse,
  mutationFn: updateTask,
  invalidates: [QUERY_KEYS.tasks.lists()],
  silent: true,
});

export const deleteTaskMutation = makeMutation({
  mutationKey: MUTATION_KEYS.tasks.remove,
  variables: taskIdSchema,
  response: deleteTaskResponse,
  mutationFn: deleteTask,
  invalidates: [QUERY_KEYS.tasks.lists()],
  // The confirm modal shows the error.
  silent: true,
});
