import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_ROUTES } from "@/config/routes";
import { apiClient, bffClient } from "@/lib/http/client";
import type { QueryFetcher } from "@/lib/query";

import type { UpdateIdentityInput, UpdateInfoInput, UploadInput } from "../schemas/profile.schema";
import {
  toProfileQuery,
  toUpdateIdentityBody,
  toUpdateInfoBody,
  toUploadFormData,
} from "./profile.backend";

/** Works in the browser (BFF proxy) and on the server (prefetch): `http` is injected. */
export const fetchProfile: QueryFetcher<void> = (_params, { http, signal }) =>
  http.get(API_ENDPOINTS.users.me, { params: toProfileQuery(), signal });

/** Writes run in the browser only, through the BFF proxy. */
export function updateInfo(input: UpdateInfoInput): Promise<unknown> {
  return apiClient.put(API_ENDPOINTS.users.update, toUpdateInfoBody(input));
}

export function updateIdentity(input: UpdateIdentityInput): Promise<unknown> {
  return apiClient.put(API_ENDPOINTS.users.update, toUpdateIdentityBody(input));
}

/** Files go to our own multipart BFF route (the generic proxy is JSON-only). */
export function upload(input: UploadInput): Promise<unknown> {
  return bffClient.post(API_ROUTES.upload, toUploadFormData(input));
}
