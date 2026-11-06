import type { TableController, TableControls } from "./types";

/** The parts of a list query (e.g. TanStack's `useQuery` result) a table needs. */
export type ListQueryState<TRow> = {
  data?: { items: TRow[]; total: number };
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => unknown;
};

const NO_ROWS: never[] = [];

/**
 * URL controls (`useTableState`) + the list query → what the data-table components need:
 *
 *   const { params, ...controls } = useTableState(usersSearchParams);
 *   return toTableController(controls, useUsersListQuery(params));
 *
 * An error only counts while there is no data to show (a failed background refetch keeps the rows).
 */
export function toTableController<TRow>(
  controls: TableControls,
  query: ListQueryState<TRow>,
): TableController<TRow> {
  return {
    ...controls,
    rows: query.data?.items ?? NO_ROWS,
    total: query.data?.total ?? 0,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError && query.data === undefined,
    retry: () => void query.refetch(),
  };
}
