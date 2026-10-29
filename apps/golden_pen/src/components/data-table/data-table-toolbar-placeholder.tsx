import { Skeleton } from "@repo/ui/components/skeleton";

/**
 * Static stand-in for `<DataTableToolbar>` (server-safe) until the client toolbar, which reads
 * the URL, can render a few ms after the page shell. Same sizes: search/Filters row + badges row.
 */
export function DataTableToolbarPlaceholder({ search = true }: { search?: boolean }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <div className="flex items-center gap-2">
        {search ? <Skeleton className="h-8 w-full sm:max-w-xs" /> : null}
        <Skeleton className="ms-auto h-8 w-24" />
      </div>
      <div className="h-7" />
    </div>
  );
}
