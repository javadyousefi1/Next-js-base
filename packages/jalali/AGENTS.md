# packages/jalali — AGENTS.md

`@repo/jalali`: Gregorian ↔ Jalali (Solar Hijri) dates, no dependencies. Repository rules:
[`../../AGENTS.md`](../../AGENTS.md).

- **Correctness**: leap years follow Borkowski's astronomical break years (the algorithm behind
  jalaali-js), valid for Jalali years `-61`–`3177`. Tests check every day 1178–1501 SH against the
  runtime's ICU Persian calendar and every year 400–2300 SH against the vernal equinox (Meeus).
  ICU uses a 33-year arithmetic rule and is one day off in a few borderline years (1177, 1503,
  1602): this package follows the astronomy, i.e. the official calendar.
- All months are 1-based; dates are plain `{ year, month, day }` objects. Invalid input throws a
  `RangeError` (`isValid…` / `parseJalali` never throw).
- `convert` — `gregorianToJalali`, `jalaliToGregorian`, `isLeapJalaliYear`, `jalaliMonthLength`,
  `isValidJalaliDate`, `isValidGregorianDate`, `jalaliToEpochDay` / `epochDayToJalali`.
- `calendar` — `jalaliWeekday` (0 = Saturday), `addJalaliDays`, `addJalaliMonths` (day clamped),
  `differenceInJalaliDays`, `compareJalali`.
- `date` — `dateToJalali(date, { timeZone })` (pass `"Asia/Tehran"` on the server so SSR and the
  browser agree), `jalaliToDate(date, { utc })` (midnight).
- `format` — `formatJalali(date, "dddd D MMMM YYYY", { locale, digits })`, `parseJalali` (Persian
  or Latin digits, `/ - .`), `toPersianDigits`, `toLatinDigits`, month and weekday names (fa/en).
- Import from `@repo/jalali`; app-agnostic (no i18n files, no env).
