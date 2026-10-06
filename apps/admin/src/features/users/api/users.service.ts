import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { QueryFetcher } from "@/lib/query";

import type { UsersListParams } from "../schemas/user.schema";
import { toBackendListQuery } from "./users.backend";

/** Works in the browser (BFF proxy) and on the server (prefetch): `http` is injected. */
export const fetchUsersList: QueryFetcher<UsersListParams> = (params, { http, signal }) =>
  http.get(API_ENDPOINTS.users.list, { params: toBackendListQuery(params), signal });
