import { PAGE_SIZES } from "@repo/table/search-params";
import { Skeleton } from "@repo/ui/components/skeleton";

import { tableMinHeight } from "./data-table-layout";

/**
 * Static stand-in (server-safe) for the table and its pagination bar while the server fetches:
 * the same footprint as `<DataTable>` + `<DataTablePagination>` for the default page size.
 */
export function DataTablePlaceholder() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="rounded-lg border" style={{ minHeight: tableMinHeight(PAGE_SIZES[0]) }} />
      <div className="flex min-h-8 items-center justify-between gap-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-72 max-w-full" />
      </div>
    </div>
  );
}
