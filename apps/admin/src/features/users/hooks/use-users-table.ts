"use client";

import { keepPreviousData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DataTableFeatures } from "@/lib/table/features";
import { TABLE_URL_OPTIONS } from "@/lib/table/search-params";
import { useDataTable } from "@/lib/table/use-data-table";

import { usersListQuery } from "../api/users.queries";
import type { User } from "../schemas/user.schema";
import { usersSearchParams } from "../users.search-params";

const NO_USERS: User[] = [];

// oxlint-disable-next-line typescript/no-explicit-any -- TanStack's type for mixed column value types
type UsersColumns = ColumnDef<DataTableFeatures, User, any>[];

/** URL state → users query → table. */
export function useUsersTable(columns: UsersColumns) {
  // 1. State lives in the URL (shareable, back/forward, read by the server prefetch too).
  const [params, setParams] = useQueryStates(usersSearchParams, TABLE_URL_OPTIONS);

  // 2. Fetch with a debounced search; keep the previous page visible while the next one loads.
  const search = useDebouncedValue(params.q, 300);
  const query = usersListQuery.useQuery(
    { ...params, q: search },
    { placeholderData: keepPreviousData },
  );

  // 3. Table controlled by the URL state.
  const table = useDataTable({
    data: query.data?.users ?? NO_USERS,
    rowCount: query.data?.total ?? 0,
    columns,
    getRowId: (user) => String(user.id),
    state: params,
    onStateChange: setParams,
  });

  return {
    table,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError && query.data === undefined,
    retry: () => void query.refetch(),
  };
}
