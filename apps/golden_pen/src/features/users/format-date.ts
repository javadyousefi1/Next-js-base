const persianDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium" });

/** An ISO date-time as a Persian (Jalali) date; "—" when there is none or it is invalid. */
export function formatPersianDate(iso: string | null): string {
  if (iso === null) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : persianDate.format(date);
}
