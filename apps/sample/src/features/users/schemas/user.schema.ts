import { PAGE_SIZES, SORT_ORDERS } from "@repo/table/search-params";
import { z } from "zod";

export const USER_ROLES = ["admin", "moderator", "user"] as const;
export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

/** A user as the app uses it; the backend shape lives in api/users.backend.ts. */
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  age: number;
  role: UserRole;
  company?: { name?: string; title?: string };
};

export const USER_SORT_FIELDS = ["firstName", "email", "age", "role"] as const;

/**
 * Input contract of the users list query. It mirrors the table URL state, so every field
 * `.catch()`es to its default: a hand-edited URL (`?page=-3&sortBy=hack`) is sanitized instead
 * of failing the query.
 */
export const usersListParamsSchema = z.object({
  page: z.number().int().min(1).catch(1),
  pageSize: z.number().int().min(1).max(100).catch(PAGE_SIZES[0]),
  q: z.string().trim().catch(""),
  role: userRoleSchema.nullable().catch(null),
  sortBy: z.enum(USER_SORT_FIELDS).nullable().catch(null),
  order: z.enum(SORT_ORDERS).catch("asc"),
});
export type UsersListParams = z.output<typeof usersListParamsSchema>;
export type UsersListParamsInput = z.input<typeof usersListParamsSchema>;

/** A page of users as the app uses it; the backend shape lives in api/users.backend.ts. */
export type UsersList = { items: User[]; total: number };
