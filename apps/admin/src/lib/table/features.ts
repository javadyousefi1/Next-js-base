import {
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * TanStack Table v9 features used by server-driven tables (pagination + sorting happen on the
 * API, so no client row models). Column helpers must be created with the same features type.
 */
export const dataTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
});
export type DataTableFeatures = typeof dataTableFeatures;
