import { z } from "zod";

import { userRoleSchema } from "@/features/users/schemas/user.schema";

export const PASSWORD_MIN_LENGTH = 6;

/**
 * Login contract, shared by the form (react-hook-form), the `login` mutation and the BFF route.
 * Error messages are translation keys under `Auth.validation`.
 */
export const loginInputSchema = z.object({
  username: z.string().trim().min(1, { error: "usernameRequired" }),
  password: z.string().min(PASSWORD_MIN_LENGTH, { error: "passwordMin" }),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

/** The user as exposed to the browser (never contains tokens). */
export const sessionUserSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  role: userRoleSchema.default("user"),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

/** Response of our BFF `/api/auth/login` and `/api/auth/session`. */
export const sessionResponseSchema = z.object({ user: sessionUserSchema });
export type SessionResponse = z.infer<typeof sessionResponseSchema>;

export const logoutResponseSchema = z.object({ ok: z.literal(true) });

/** Upstream token pair (server only — never sent to the browser). */
export const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresInMins: z.number().int().positive().optional(),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;

/** Upstream `/auth/login` response: user fields + tokens. */
export const upstreamLoginResponseSchema = sessionUserSchema.extend(tokenPairSchema.shape);
