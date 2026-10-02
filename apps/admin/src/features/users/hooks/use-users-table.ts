"use client";

import { keepPreviousData } from "@tanstack/react-query";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { TableController } from "@/lib/table/types";
import { useTableState } from "@/lib/table/use-table-state";

import { usersListQuery } from "../api/users.queries";
import type { User } from "../schemas/user.schema";
import { usersSearchParams } from "../users.search-params";

const NO_USERS: User[] = [];

/** URL state → users query → everything the data-table components need. */
export function useUsersTable(): TableController<User> {
  const { params, ...controls } = useTableState(usersSearchParams);
  const search = useDebouncedValue(params.q, 300);
  const query = usersListQuery.useQuery(
    { ...params, q: search },
    { placeholderData: keepPreviousData }, // keep the previous page visible while loading
  );

  return {
    ...controls,
    rows: query.data?.users ?? NO_USERS,
    total: query.data?.total ?? 0,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError && query.data === undefined,
    retry: () => void query.refetch(),
  };
}
