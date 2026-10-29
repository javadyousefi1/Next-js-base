import { Skeleton } from "@repo/ui/components/skeleton";

import { DataTableToolbarPlaceholder } from "@/components/data-table/data-table-toolbar-placeholder";

/** Static stand-in (server-safe) for `<IdentityRequestsToolbar>`: the tabs row + the table toolbar. */
export function IdentityRequestsToolbarPlaceholder() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="h-8 w-96 max-w-full" />
      <DataTableToolbarPlaceholder />
    </div>
  );
}
