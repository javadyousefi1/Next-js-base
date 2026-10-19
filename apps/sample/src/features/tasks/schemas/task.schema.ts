import { PAGE_SIZES, SORT_ORDERS } from "@repo/table/search-params";
import { z } from "zod";

export const TASK_STATUSES = ["todo", "doing", "done"] as const;
export const taskStatusSchema = z.enum(TASK_STATUSES);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

/** A task as the app uses it; the backend shape lives in api/tasks.backend.ts. */
export type Task = {
  id: number;
  title: string;
  status: TaskStatus;
  /** Gregorian `YYYY-MM-DD` (shown and picked in Jalali); `null` = no due date. */
  dueDate: string | null;
  /** ISO timestamp. */
  createdAt: string;
};

export const TASK_SORT_FIELDS = ["title", "status", "dueDate", "createdAt"] as const;

/**
 * Input contract of the tasks list query; mirrors the table URL state, so every field
 * `.catch()`es to its default (a hand-edited URL is sanitized instead of failing the query).
 */
export const tasksListParamsSchema = z.object({
  page: z.number().int().min(1).catch(1),
  pageSize: z.number().int().min(1).max(100).catch(PAGE_SIZES[0]),
  q: z.string().trim().catch(""),
  status: taskStatusSchema.nullable().catch(null),
  sortBy: z.enum(TASK_SORT_FIELDS).nullable().catch(null),
  order: z.enum(SORT_ORDERS).catch("asc"),
});
export type TasksListParams = z.output<typeof tasksListParamsSchema>;

/** A page of tasks as the app uses it. */
export type TasksList = { items: Task[]; total: number };

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 80;

/**
 * The task form and the create variables. Error messages are keys of
 * `Examples.data.validation` (the form hook translates them).
 */
export const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(TITLE_MIN_LENGTH, { error: "titleMin" })
    .max(TITLE_MAX_LENGTH, { error: "titleMax" }),
  status: taskStatusSchema,
  dueDate: z.iso.date().nullable(),
});
export type TaskInput = z.infer<typeof taskInputSchema>;

export const updateTaskSchema = taskInputSchema.extend({ id: z.number().int().positive() });
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskIdSchema = z.object({ id: z.number().int().positive() });
export type TaskId = z.infer<typeof taskIdSchema>;
