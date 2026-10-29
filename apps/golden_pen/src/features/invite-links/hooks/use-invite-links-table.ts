"use client";

import type { TableController } from "@repo/table/types";
import { useTableState } from "@repo/table/use-table-state";
import { keepPreviousData } from "@tanstack/react-query";

import { inviteLinksListQuery } from "../api/invite-links.queries";
import { inviteLinksSearchParams } from "../invite-links.search-params";
import type { InviteLink } from "../schemas/invite-link.schema";

const NO_LINKS: InviteLink[] = [];

/** URL state → invite links query → everything the data-table components need. */
export function useInviteLinksTable(): TableController<InviteLink> {
  const { params, ...controls } = useTableState(inviteLinksSearchParams);
  const query = inviteLinksListQuery.useQuery(params, { placeholderData: keepPreviousData });

  return {
    ...controls,
    rows: query.data?.items ?? NO_LINKS,
    total: query.data?.total ?? 0,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError && query.data === undefined,
    retry: () => void query.refetch(),
  };
}
