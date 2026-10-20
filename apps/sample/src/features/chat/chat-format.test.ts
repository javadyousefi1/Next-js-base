import { describe, expect, test } from "bun:test";

import { formatChatDay, formatChatTime, previousDay } from "./chat-format";

const labels = { today: "Today", yesterday: "Yesterday" };

describe("chat formatting", () => {
  test("previousDay crosses months and years", () => {
    expect(previousDay("2026-03-01")).toBe("2026-02-28");
    expect(previousDay("2026-01-01")).toBe("2025-12-31");
  });

  test("today and yesterday are words", () => {
    expect(formatChatDay("2026-10-20", "2026-10-20", "en", labels)).toBe("Today");
    expect(formatChatDay("2026-10-19", "2026-10-20", "fa", labels)).toBe("Yesterday");
  });

  test("Persian dates are Jalali; the year shows only for another year", () => {
    expect(formatChatDay("2026-10-10", "2026-10-20", "fa", labels)).toBe("شنبه ۱۸ مهر");
    expect(formatChatDay("2024-03-20", "2026-10-20", "fa", labels)).toBe("چهارشنبه ۱ فروردین ۱۴۰۳");
  });

  test("other locales are Gregorian", () => {
    expect(formatChatDay("2026-10-10", "2026-10-20", "en", labels)).toBe("Saturday, October 10");
    expect(formatChatDay("2024-03-20", "2026-10-20", "en", labels)).toBe(
      "Wednesday, March 20, 2024",
    );
  });

  test("times follow the locale's digits and the time zone", () => {
    expect(formatChatTime("2026-10-20T08:05:00.000Z", "en-GB", "UTC")).toBe("08:05");
    expect(formatChatTime("2026-10-20T08:05:00.000Z", "fa", "Asia/Tehran")).toBe("۱۱:۳۵");
  });
});
