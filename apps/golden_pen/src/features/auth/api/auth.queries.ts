import { z } from "zod";

import { MUTATION_KEYS, QUERY_KEYS } from "@/config/query-keys";
import { makeMutation, makeQuery } from "@/lib/query";

import {
  okResponseSchema,
  otpSendInputSchema,
  otpVerifyInputSchema,
  passwordLoginInputSchema,
  registerInputSchema,
  sessionResponseSchema,
} from "../schemas/auth.schema";
import { meResponse } from "./auth.backend";
import {
  fetchCurrentUser,
  logout,
  otpResend,
  otpSend,
  otpVerify,
  passwordLogin,
  register,
} from "./auth.service";

/** The signed-in user (validated). A 401 here triggers the global "session expired" redirect. */
export const sessionQuery = makeQuery({
  key: QUERY_KEYS.auth.session,
  params: z.void(),
  response: meResponse,
  fetcher: fetchCurrentUser,
  staleTime: 5 * 60_000,
});

// The sign-in forms render their own error message (`silent: true`).
export const passwordLoginMutation = makeMutation({
  mutationKey: MUTATION_KEYS.auth.login,
  variables: passwordLoginInputSchema,
  response: sessionResponseSchema,
  mutationFn: passwordLogin,
  silent: true,
});

export const otpSendMutation = makeMutation({
  mutationKey: MUTATION_KEYS.auth.otpSend,
  variables: otpSendInputSchema,
  response: okResponseSchema,
  mutationFn: otpSend,
  silent: true,
});

export const otpResendMutation = makeMutation({
  mutationKey: MUTATION_KEYS.auth.otpResend,
  variables: otpSendInputSchema,
  response: okResponseSchema,
  mutationFn: otpResend,
  silent: true,
});

export const otpVerifyMutation = makeMutation({
  mutationKey: MUTATION_KEYS.auth.otpVerify,
  variables: otpVerifyInputSchema,
  response: sessionResponseSchema,
  mutationFn: otpVerify,
  silent: true,
});

export const registerMutation = makeMutation({
  mutationKey: MUTATION_KEYS.auth.register,
  variables: registerInputSchema,
  response: okResponseSchema,
  mutationFn: register,
  silent: true,
});

export const logoutMutation = makeMutation({
  mutationKey: MUTATION_KEYS.auth.logout,
  variables: z.void(),
  response: okResponseSchema,
  mutationFn: logout,
});
