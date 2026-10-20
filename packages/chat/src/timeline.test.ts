import { describe, expect, test } from "bun:test";

import { buildTimeline, dayKey, type TimelineItem } from "./timeline";
import type { ChatMessage } from "./types";

const at = (
  iso: string,
  id: string,
  authorId = "sara",
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({ id, authorId, text: id, createdAt: iso, ...extra });

/** `a<F` = message a, other side, first of its group; `[day]`; `--unread--`. */
function shape(items: TimelineItem[]) {
  return items.map((item) => {
    if (item.type === "day") return `[${item.day}]`;
    if (item.type === "unread") return "--unread--";
    const side = item.isOwn ? ">" : "<";
    return `${item.message.id}${side}${item.isFirstInGroup ? "F" : ""}${item.isLastInGroup ? "L" : ""}`;
  });
}

describe("dayKey", () => {
  test("is the calendar day in the given time zone", () => {
    expect(dayKey("2026-03-20T20:00:00.000Z", "UTC")).toBe("2026-03-20");
    expect(dayKey("2026-03-20T20:31:00.000Z", "Asia/Tehran")).toBe("2026-03-21");
  });
});

describe("buildTimeline", () => {
  const messages = [
    at("2026-01-01T10:00:00.000Z", "a"),
    at("2026-01-01T10:01:00.000Z", "b"),
    at("2026-01-01T10:20:00.000Z", "c"), // more than 5 minutes later: a new group
    at("2026-01-01T10:21:00.000Z", "d", "me"),
    at("2026-01-02T09:00:00.000Z", "e", "me"), // a new day: a new group
  ];

  test("day dividers, sides and groups", () => {
    expect(shape(buildTimeline(messages, { currentUserId: "me", timeZone: "UTC" }))).toEqual([
      "[2026-01-01]",
      "a<F",
      "b<L",
      "c<FL",
      "d>FL",
      "[2026-01-02]",
      "e>FL",
    ]);
  });

  test("the unread divider sits before the first unread message and splits its group", () => {
    const items = buildTimeline(messages, {
      currentUserId: "me",
      timeZone: "UTC",
      firstUnreadId: "b",
    });
    expect(shape(items).slice(0, 4)).toEqual(["[2026-01-01]", "a<FL", "--unread--", "b<FL"]);
  });

  test("own messages are read up to the furthest pointer of another participant", () => {
    const own = [
      at("2026-01-01T10:00:00.000Z", "1", "me"),
      at("2026-01-01T10:01:00.000Z", "2", "me"),
      at("2026-01-01T10:02:00.000Z", "3", "me", { status: "sending" }),
    ];
    const items = buildTimeline(own, { currentUserId: "me", readBy: { sara: "2", me: "3" } });
    expect(items.flatMap((item) => (item.type === "message" ? [item.isRead] : []))).toEqual([
      true,
      true,
      false,
    ]);
  });

  test("replies point at the loaded message; keys prefer the clientId", () => {
    const items = buildTimeline(
      [
        at("2026-01-01T10:00:00.000Z", "1"),
        at("2026-01-01T10:01:00.000Z", "s2", "me", { clientId: "c2", replyToId: "1" }),
        at("2026-01-01T10:02:00.000Z", "3", "me", { replyToId: "not-loaded" }),
      ],
      { currentUserId: "me" },
    ).filter((item) => item.type === "message");
    expect(items[1]?.replyTo?.id).toBe("1");
    expect(items[1]?.key).toBe("message:c2");
    expect(items[2]?.replyTo).toBeNull();
  });

  test("no messages, no rows", () => {
    expect(buildTimeline([], { currentUserId: "me" })).toEqual([]);
  });
});
