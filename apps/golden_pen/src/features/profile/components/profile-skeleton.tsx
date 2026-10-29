import { Skeleton } from "@repo/ui/components/skeleton";

/** Placeholder of the profile page while it loads. */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
