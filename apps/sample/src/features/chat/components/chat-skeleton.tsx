import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

const BUBBLES = [
  { id: "a", own: false, width: "w-48" },
  { id: "b", own: false, width: "w-64" },
  { id: "c", own: true, width: "w-40" },
  { id: "d", own: false, width: "w-56" },
  { id: "e", own: true, width: "w-72" },
  { id: "f", own: true, width: "w-32" },
];

/** Placeholder bubbles on both sides while the first page loads. */
export function ChatSkeleton() {
  return (
    <div className="flex h-full flex-col justify-end gap-3 p-4" aria-hidden>
      {BUBBLES.map((bubble) => (
        <div
          key={bubble.id}
          className={cn("flex items-end gap-2", bubble.own && "flex-row-reverse")}
        >
          {!bubble.own && <Skeleton className="size-8 rounded-full" />}
          <Skeleton className={cn("h-9 rounded-xl", bubble.width)} />
        </div>
      ))}
    </div>
  );
}
