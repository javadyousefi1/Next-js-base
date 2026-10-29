import type { JalaliDate } from "@repo/jalali";

export type HolidayKey =
  | "nowruz"
  | "republic"
  | "sizdahBedar"
  | "khomeini"
  | "khordad15"
  | "revolution"
  | "oil";

/**
 * Fixed solar official holidays. Lunar holidays (Eid, Ashura, …) are NOT included: they move
 * every year. `key` is a translation key under `Dashboard.holidays`.
 */
const SOLAR_HOLIDAYS: readonly { month: number; day: number; key: HolidayKey }[] = [
  { month: 1, day: 1, key: "nowruz" },
  { month: 1, day: 2, key: "nowruz" },
  { month: 1, day: 3, key: "nowruz" },
  { month: 1, day: 4, key: "nowruz" },
  { month: 1, day: 12, key: "republic" },
  { month: 1, day: 13, key: "sizdahBedar" },
  { month: 3, day: 14, key: "khomeini" },
  { month: 3, day: 15, key: "khordad15" },
  { month: 11, day: 22, key: "revolution" },
  { month: 12, day: 29, key: "oil" },
];

/** The holiday of a Jalali day, or `undefined`. */
export function solarHolidayKey({ month, day }: Pick<JalaliDate, "month" | "day">) {
  return SOLAR_HOLIDAYS.find((holiday) => holiday.month === month && holiday.day === day)?.key;
}
