import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { API_ROUTES } from "@/config/routes";
import { authKeys } from "@/features/auth/auth.api";
import { AUTH_ENDPOINTS, ignoredResponse } from "@/features/auth/auth.backend";
import { apiClient, bffClient } from "@/lib/http/client";

import { DOCUMENT_FIELD, toUploadFormData } from "./profile.backend";
import {
  DOCUMENT_KINDS,
  type DocumentKind,
  type Profile,
  type UpdateIdentityInput,
  type UpdateInfoInput,
  type UploadInput,
} from "./schemas/profile.schema";

/**
 * The ONLY file that knows the backend's profile API: `GET /User/Get?includeIdentity=true` and
 * `PUT /User/Update` (`type` 1 = info, 2 = identity; every key of the chosen section is sent, the
 * other section is `null`), plus the upload call (its multipart form is in `profile.backend.ts`,
 * which the BFF route shares). Endpoints, mapping, response schemas, keys, queries and
 * mutations. A new backend → change this file (+ the MSW mock), nothing else.
 */

/** Relative to `API_BASE_URL` on the server, or to `/api/proxy` in the browser (BFF). */
export const PROFILE_ENDPOINT = AUTH_ENDPOINTS.me;
export const UPDATE_ENDPOINT = "/User/Update";

export const UPDATE_TYPE = { info: 1, identity: 2 } as const;

/** The signed-in user together with their identity. */
export function toProfileQuery() {
  return { includeIdentity: true };
}

const backendDocumentSchema = z.object({
  fieldType: z.string(),
  name: z.string(),
  url: z.string().nullish(),
});

const backendIdentitySchema = z.object({
  statusType: z.number().int(),
  message: z.string().nullish(),
  specialty: z.string().nullish(),
  bio: z.string().nullish(),
  licenseNumber: z.string().nullish(),
  barAssociation: z.string().nullish(),
  provinceId: z.union([z.number(), z.string()]).nullish(),
  cityId: z.union([z.number(), z.string()]).nullish(),
  nationalId: z.string().nullish(),
  companyName: z.string().nullish(),
  companyNationalId: z.string().nullish(),
  companyRegistrationNumber: z.string().nullish(),
  companyRepresentativeName: z.string().nullish(),
  documents: z.array(backendDocumentSchema).nullish(),
});

const backendProfileSchema = z.object({
  info: z.object({
    fullName: z.string().nullish(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    phoneNumber: z.string(),
    username: z.string().nullish(),
    email: z.string().nullish(),
    avatarUrl: z.string().nullish(),
  }),
  identity: backendIdentitySchema.nullish(),
});

/** Ids come as numbers or numeric strings (int64). */
const idOf = (value: number | string | null | undefined) => {
  const id = value === null || value === undefined ? NaN : Number(value);
  return Number.isInteger(id) ? id : null;
};

/** `fieldType` → the document kind; anything but the license counts as "other documents". */
function kindOf(fieldType: string): DocumentKind {
  return DOCUMENT_KINDS.find((kind) => DOCUMENT_FIELD[kind] === fieldType) ?? "document";
}

/** Backend `GetUserRsDto` → the app's `Profile`. */
export const profileResponse = backendProfileSchema.transform(({ info, identity }): Profile => {
  const firstName = info.firstName ?? "";
  const lastName = info.lastName ?? "";
  return {
    info: {
      fullName: info.fullName || `${firstName} ${lastName}`.trim() || info.phoneNumber,
      firstName,
      lastName,
      phoneNumber: info.phoneNumber,
      username: info.username ?? null,
      email: info.email ?? null,
      avatarUrl: info.avatarUrl ?? null,
    },
    identity: identity
      ? {
          statusType: identity.statusType,
          message: identity.message ?? null,
          specialty: identity.specialty ?? null,
          bio: identity.bio ?? null,
          licenseNumber: identity.licenseNumber ?? null,
          barAssociation: identity.barAssociation ?? null,
          provinceId: idOf(identity.provinceId),
          cityId: idOf(identity.cityId),
          nationalId: identity.nationalId ?? null,
          companyName: identity.companyName ?? null,
          companyNationalId: identity.companyNationalId ?? null,
          companyRegistrationNumber: identity.companyRegistrationNumber ?? null,
          companyRepresentativeName: identity.companyRepresentativeName ?? null,
          documents: (identity.documents ?? []).map((document) => ({
            kind: kindOf(document.fieldType),
            name: document.name,
            url: document.url ?? null,
          })),
        }
      : null,
  };
});

/** `PUT /User/Update` body for the basic info: only `info` is filled. */
export function toUpdateInfoBody(input: UpdateInfoInput) {
  return {
    type: UPDATE_TYPE.info,
    info: {
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      username: input.username,
      email: input.email,
    },
    identity: null,
  };
}

/** `PUT /User/Update` body for the identity: only `identity` is filled (all keys, nullable). */
export function toUpdateIdentityBody(input: UpdateIdentityInput) {
  return { type: UPDATE_TYPE.identity, info: null, identity: { ...input } };
}

/** Hierarchical: invalidating `all` refreshes every profile query. */
export const profileKeys = {
  all: ["profile"] as const,
  detail: () => ["profile", "detail"] as const,
};

/** The signed-in user with their identity (its own key: the session query has no identity). */
export const profileQuery = () =>
  queryOptions({
    queryKey: profileKeys.detail(),
    queryFn: ({ signal }) =>
      apiClient.get(PROFILE_ENDPOINT, {
        params: toProfileQuery(),
        signal,
        schema: profileResponse,
      }),
    staleTime: 30_000,
  });

export function useProfileQuery() {
  return useQuery(profileQuery());
}

/*
 * The forms show their own errors (`silent`); the writes answer 204. Callers add their own
 * `onSuccess` to `mutate(vars, { onSuccess })`.
 */

/** Refreshes the profile and the session (the sidebar shows the name). */
export function useUpdateInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateInfoInput) =>
      apiClient.put(UPDATE_ENDPOINT, toUpdateInfoBody(input), { schema: ignoredResponse }),
    meta: { silent: true },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: profileKeys.all }),
        queryClient.invalidateQueries({ queryKey: authKeys.session() }),
      ]),
  });
}

export function useUpdateIdentityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateIdentityInput) =>
      apiClient.put(UPDATE_ENDPOINT, toUpdateIdentityBody(input), { schema: ignoredResponse }),
    meta: { silent: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.all }),
  });
}

/**
 * Files go to our own multipart BFF route (the generic proxy is JSON-only). An avatar change
 * also refreshes the session (the sidebar shows the avatar).
 */
export function useUploadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadInput) =>
      bffClient.post(API_ROUTES.upload, toUploadFormData(input), { schema: ignoredResponse }),
    meta: { silent: true },
    onSuccess: (_data, { target }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: profileKeys.all }),
        target === "avatar"
          ? queryClient.invalidateQueries({ queryKey: authKeys.session() })
          : undefined,
      ]),
  });
}
