import { z } from "zod";

import { MUTATION_KEYS, QUERY_KEYS } from "@/config/query-keys";
import { makeMutation, makeQuery } from "@/lib/query";

import {
  loginInputSchema,
  logoutResponseSchema,
  sessionResponseSchema,
  sessionUserSchema,
} from "../schemas/auth.schema";
import { fetchCurrentUser, login, logout } from "./auth.service";

/** The signed-in user (validated). A 401 here triggers the global "session expired" redirect. */
export const sessionQuery = makeQuery({
  key: QUERY_KEYS.auth.session,
  params: z.void(),
  response: sessionUserSchema,
  fetcher: fetchCurrentUser,
  staleTime: 5 * 60_000,
});

export const loginMutation = makeMutation({
  mutationKey: MUTATION_KEYS.auth.login,
  variables: loginInputSchema,
  response: sessionResponseSchema,
  mutationFn: login,
  // The login form renders its own error message.
  silent: true,
});

export const logoutMutation = makeMutation({
  mutationKey: MUTATION_KEYS.auth.logout,
  variables: z.void(),
  response: logoutResponseSchema,
  mutationFn: logout,
});
