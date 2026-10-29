import { MUTATION_KEYS, QUERY_KEYS } from "@/config/query-keys";
import { makeMutation, makeQuery } from "@/lib/query";

import {
  createInviteLinkInputSchema,
  inviteLinksListParamsSchema,
} from "../schemas/invite-link.schema";
import { createInviteLinkResponse, inviteLinksListResponse } from "./invite-links.backend";
import { createInviteLink, fetchInviteLinksList } from "./invite-links.service";

export const inviteLinksListQuery = makeQuery({
  key: QUERY_KEYS.inviteLinks.list,
  params: inviteLinksListParamsSchema,
  response: inviteLinksListResponse,
  fetcher: fetchInviteLinksList,
  staleTime: 30_000,
});

export const createInviteLinkMutation = makeMutation({
  mutationKey: MUTATION_KEYS.inviteLinks.create,
  variables: createInviteLinkInputSchema,
  response: createInviteLinkResponse,
  mutationFn: createInviteLink,
  invalidates: [QUERY_KEYS.inviteLinks.lists()],
  // The form shows the error.
  silent: true,
});
