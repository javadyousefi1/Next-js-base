import { MUTATION_KEYS, QUERY_KEYS } from "@/config/query-keys";
import { ignoredResponse } from "@/features/auth/api/auth.backend";
import { profileResponse } from "@/features/profile/api/profile.backend";
import { usersListResponse } from "@/features/users/api/users.backend";
import { makeMutation, makeQuery } from "@/lib/query";

import {
  identityActionInputSchema,
  identityDetailParamsSchema,
  identityRequestsListParamsSchema,
} from "../schemas/identity-requests.schema";
import {
  actOnIdentity,
  fetchIdentityDetail,
  fetchIdentityRequestsList,
} from "./identity-requests.service";

export const identityRequestsListQuery = makeQuery({
  key: QUERY_KEYS.identityRequests.list,
  params: identityRequestsListParamsSchema,
  response: usersListResponse,
  fetcher: fetchIdentityRequestsList,
  staleTime: 30_000,
});

/** One user with their identity, for the review sheet. */
export const identityDetailQuery = makeQuery({
  key: QUERY_KEYS.identityRequests.detail,
  params: identityDetailParamsSchema,
  response: profileResponse,
  fetcher: fetchIdentityDetail,
  staleTime: 0,
});

/**
 * Request / verify / reject / revoke (answers 204). The callers show their own errors
 * (`silent: true`). A status change moves rows between lists, so every list, the dashboard
 * counts, the own profile and the session are refreshed.
 */
export const identityActionMutation = makeMutation({
  mutationKey: MUTATION_KEYS.identityRequests.act,
  variables: identityActionInputSchema,
  response: ignoredResponse,
  mutationFn: actOnIdentity,
  invalidates: [
    QUERY_KEYS.identityRequests.all,
    QUERY_KEYS.users.all,
    QUERY_KEYS.dashboard.all,
    QUERY_KEYS.profile.all,
    QUERY_KEYS.auth.session(),
  ],
  silent: true,
});
