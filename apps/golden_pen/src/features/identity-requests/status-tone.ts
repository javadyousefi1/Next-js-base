/**
 * Badge colours per identity status (0 None, 1 Requested, 2 Pending, 3 Verified, 4 Rejected,
 * 5 Revoked), light and dark. An unknown status gets the neutral tone.
 */
const NEUTRAL = "bg-muted text-muted-foreground";

const STATUS_TONES: Record<number, string> = {
  1: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  2: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  3: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  4: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  5: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
};

export function statusTone(status: number): string {
  return STATUS_TONES[status] ?? NEUTRAL;
}
