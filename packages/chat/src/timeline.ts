import type { ChatMessage } from "./types";

/** One row of the conversation, ready to render (a virtualized list renders these). */
export type TimelineItem =
  | {
      type: "day";
      key: string;
      /** `YYYY-MM-DD` of the day in the timeline's time zone. */
      day: string;
      /** An instant on that day (its first message), for formatting. */
      date: string;
    }
  | { type: "unread"; key: "unread" }
  | {
      type: "message";
      /** Stable across the optimistic → server swap (`clientId` first). */
      key: string;
      message: ChatMessage;
      /** Written by the current user (rendered on the end side). */
      isOwn: boolean;
      /** First / last of consecutive messages by one author (avatar, name, corners, time). */
      isFirstInGroup: boolean;
      isLastInGroup: boolean;
      /** An own message someone else has read. */
      isRead: boolean;
      /** The message it replies to; `null` when that message isn't loaded. */
      replyTo: ChatMessage | null;
    };

export type TimelineOptions = {
  currentUserId: string;
  /** Day dividers follow this time zone. Default: the runtime's. */
  timeZone?: string;
  /** Consecutive messages of one author closer than this are grouped. Default 5 minutes. */
  groupWindowMs?: number;
  /** `ChatState.readBy`: read receipts of own messages. */
  readBy?: Readonly<Record<string, string>>;
  /** `ChatState.firstUnreadId`: an "unread messages" divider goes before it. */
  firstUnreadId?: string | null;
};

const dayFormatters = new Map<string, Intl.DateTimeFormat>();

/** `YYYY-MM-DD` of an instant in a time zone (`en-CA` formats dates that way). */
export function dayKey(iso: string, timeZone?: string): string {
  const cacheKey = timeZone ?? "";
  let format = dayFormatters.get(cacheKey);
  if (!format) {
    format = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dayFormatters.set(cacheKey, format);
  }
  return format.format(new Date(iso));
}

/**
 * Messages (oldest → newest) → rows: a day divider whenever the day changes, the unread divider,
 * and each message with its side, grouping, read state and replied-to message. Pure.
 */
export function buildTimeline(
  messages: readonly ChatMessage[],
  options: TimelineOptions,
): TimelineItem[] {
  const {
    currentUserId,
    timeZone,
    groupWindowMs = 5 * 60_000,
    readBy = {},
    firstUnreadId,
  } = options;
  const position = new Map(messages.map((message, index) => [message.id, index]));
  // The furthest message another participant has read.
  const readUpTo = Math.max(
    -1,
    ...Object.entries(readBy)
      .filter(([userId]) => userId !== currentUserId)
      .map(([, messageId]) => position.get(messageId) ?? -1),
  );

  const days = messages.map((message) => dayKey(message.createdAt, timeZone));
  const sameGroup = (a: number, b: number) => {
    const first = messages[a];
    const second = messages[b];
    if (!first || !second || first.authorId !== second.authorId || days[a] !== days[b]) {
      return false;
    }
    if (second.id === firstUnreadId) return false;
    return Date.parse(second.createdAt) - Date.parse(first.createdAt) <= groupWindowMs;
  };

  const items: TimelineItem[] = [];
  messages.forEach((message, index) => {
    const day = days[index] ?? "";
    if (day !== days[index - 1]) {
      items.push({ type: "day", key: `day:${day}`, day, date: message.createdAt });
    }
    if (message.id === firstUnreadId) items.push({ type: "unread", key: "unread" });

    const isOwn = message.authorId === currentUserId;
    const replyIndex = message.replyToId ? position.get(message.replyToId) : undefined;
    items.push({
      type: "message",
      key: `message:${message.clientId ?? message.id}`,
      message,
      isOwn,
      isFirstInGroup: !sameGroup(index - 1, index),
      isLastInGroup: !sameGroup(index, index + 1),
      isRead:
        isOwn && message.status !== "sending" && message.status !== "failed" && index <= readUpTo,
      replyTo: replyIndex === undefined ? null : (messages[replyIndex] ?? null),
    });
  });
  return items;
}
