import { z } from "zod";

export const USER_ROLES = ["admin", "moderator", "user"] as const;
export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.email(),
  phone: z.string(),
  age: z.number().int(),
  role: userRoleSchema.default("user"),
  company: z.object({ name: z.string(), title: z.string() }).partial().optional(),
});
export type User = z.infer<typeof userSchema>;

export const USER_SORT_FIELDS = ["firstName", "email", "age", "role"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;
export const PAGE_SIZES = [10, 20, 50] as const;

/** Input contract of the users list query (also mirrors the URL state of the table). */
export const usersListParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(PAGE_SIZES[0]),
  q: z.string().trim().default(""),
  role: userRoleSchema.nullable().default(null),
  sortBy: z.enum(USER_SORT_FIELDS).nullable().default(null),
  order: z.enum(SORT_ORDERS).default("asc"),
});
export type UsersListParams = z.output<typeof usersListParamsSchema>;
export type UsersListParamsInput = z.input<typeof usersListParamsSchema>;

/** Output contract of the users list query (upstream shape: DummyJSON pagination). */
export const usersListResponseSchema = z.object({
  users: z.array(userSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});
export type UsersListResponse = z.infer<typeof usersListResponseSchema>;
