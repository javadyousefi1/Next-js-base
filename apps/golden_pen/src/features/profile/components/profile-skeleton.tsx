import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

import type { ProfileTab } from "../hooks/use-profile-tab";

/** Height of each tab's card (rem), measured from the real forms: keep in sync when they change. */
const TAB_HEIGHT: Record<ProfileTab, string> = {
  info: "h-[24rem]",
  // The request card (6rem) and the gap (1rem) above the form.
  identity: "h-[64rem]",
  documents: "h-[10rem]",
};

/** Placeholder of the profile page while it loads: same grid, side card and tab sizes (server-safe: no URL state). */
export function ProfileSkeleton({ tab = "info" }: { tab?: ProfileTab }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]" aria-busy="true">
      <Skeleton className="h-[19rem] w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className={cn(TAB_HEIGHT[tab], "w-full")} />
      </div>
    </div>
  );
}
