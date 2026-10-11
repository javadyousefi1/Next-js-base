import { gregorianToJalali, jalaliToGregorian, type JalaliDate } from "./convert";

type DateToJalaliOptions = {
  /**
   * Whose calendar day the instant falls on: an IANA zone such as `"Asia/Tehran"` or `"UTC"`.
   * Default: the runtime's local time zone. Pass one on the server so SSR and the browser agree.
   */
  timeZone?: string;
};

/** The Jalali day of a JavaScript `Date` (an instant) in a time zone: `new Date()` → today. */
export function dateToJalali(date: Date, { timeZone }: DateToJalaliOptions = {}): JalaliDate {
  if (Number.isNaN(date.getTime())) throw new RangeError("Invalid Date");
  if (!timeZone) {
    return gregorianToJalali({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const part = (type: "year" | "month" | "day") =>
    Number(parts.find((p) => p.type === type)?.value);
  return gregorianToJalali({ year: part("year"), month: part("month"), day: part("day") });
}

type JalaliToDateOptions = {
  /** `true`: midnight UTC of that day. Default: midnight in the runtime's local time zone. */
  utc?: boolean;
};

/** A JavaScript `Date` at the start (midnight) of a Jalali day. */
export function jalaliToDate(date: JalaliDate, { utc = false }: JalaliToDateOptions = {}): Date {
  const { year, month, day } = jalaliToGregorian(date);
  const result = new Date(0);
  if (utc) {
    result.setUTCFullYear(year, month - 1, day);
  } else {
    result.setFullYear(year, month - 1, day);
    result.setHours(0, 0, 0, 0);
  }
  return result;
}
