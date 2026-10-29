import { z } from "zod";

import { MUTATION_KEYS, QUERY_KEYS } from "@/config/query-keys";
import { ignoredResponse } from "@/features/auth/api/auth.backend";
import { makeMutation, makeQuery } from "@/lib/query";

import {
  updateIdentityInputSchema,
  updateInfoInputSchema,
  uploadInputSchema,
} from "../schemas/profile.schema";
import { profileResponse } from "./profile.backend";
import { fetchProfile, updateIdentity, updateInfo, upload } from "./profile.service";

/** The signed-in user with their identity (its own key: the session query has no identity). */
export const profileQuery = makeQuery({
  key: QUERY_KEYS.profile.detail,
  params: z.void(),
  response: profileResponse,
  fetcher: fetchProfile,
  staleTime: 30_000,
});

// The forms show their own errors (`silent: true`); the writes answer 204.
export const updateInfoMutation = makeMutation({
  mutationKey: MUTATION_KEYS.profile.updateInfo,
  variables: updateInfoInputSchema,
  response: ignoredResponse,
  mutationFn: updateInfo,
  // The sidebar shows the name.
  invalidates: [QUERY_KEYS.profile.all, QUERY_KEYS.auth.session()],
  silent: true,
});

export const updateIdentityMutation = makeMutation({
  mutationKey: MUTATION_KEYS.profile.updateIdentity,
  variables: updateIdentityInputSchema,
  response: ignoredResponse,
  mutationFn: updateIdentity,
  invalidates: [QUERY_KEYS.profile.all],
  silent: true,
});

export const uploadMutation = makeMutation({
  mutationKey: MUTATION_KEYS.profile.upload,
  variables: uploadInputSchema,
  response: ignoredResponse,
  mutationFn: upload,
  // The sidebar shows the avatar.
  invalidates: (_data, { target }) =>
    target === "avatar"
      ? [QUERY_KEYS.profile.all, QUERY_KEYS.auth.session()]
      : [QUERY_KEYS.profile.all],
  silent: true,
});
