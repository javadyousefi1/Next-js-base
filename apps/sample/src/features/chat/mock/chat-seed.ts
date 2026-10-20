import type { ChatMessage } from "@repo/chat/types";

/**
 * Demo conversation shared by both fake backends (the MSW REST API on the server and the
 * in-browser WebSocket): the signed-in user talks to "Sara", a support bot. Deterministic text,
 * times relative to now (so "today" and "yesterday" mean something).
 */
export const CHAT_BOT = { id: "sara", name: "Sara" } as const;

const LINES = [
  "Hi! How can I help you today?",
  "سلام، وقت بخیر 👋",
  "I can't find the export button on the users page.",
  "It's in the toolbar, next to the filters.",
  "ممنون، پیداش کردم.",
  "Can I filter by role and search at the same time?",
  "Yes — filters and search are both kept in the URL, so you can share the view.",
  "عالیه 🙌",
  "Is there a dark mode?",
  "Settings → Appearance. It follows the system by default.",
  "تاریخ‌ها رو شمسی هم نشون می‌ده؟",
  "بله، با زبان فارسی همه‌ی تاریخ‌ها شمسی و رقم‌ها فارسی می‌شن.",
  "Perfect, thanks!",
  "Anything else I can do for you?",
  "One more thing: how do I invite a teammate?",
  "Open Users, then “New user”. They get an email with a link.",
  "اوکی، تست می‌کنم و خبر می‌دم.",
  "Sure, take your time.",
] as const;

const REPLIES = [
  "Got it — let me check that for you.",
  "حتماً، الان بررسی می‌کنم.",
  "Thanks for the details! That should work now.",
  "Good question. You'll find it under Settings.",
  "خواهش می‌کنم 🙂",
  "Done. Anything else?",
] as const;

/** Mulberry32: a tiny seeded random generator (the same conversation on every run). */
function random(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * `count` messages over the last ~60 days ending a few minutes ago, oldest first: bursts by one
 * author, gaps of minutes to days, some replies. Ids are `m1`, `m2`…
 */
export function seedConversation(userId: string, count = 1200, now = Date.now()): ChatMessage[] {
  const next = random(42);
  const gaps = Array.from({ length: count }, () => {
    const roll = next();
    if (roll < 0.6) return 20_000 + next() * 120_000; // same burst
    if (roll < 0.95) return 10 * 60_000 + next() * 3 * 3_600_000; // later that day
    return 18 * 3_600_000 + next() * 48 * 3_600_000; // another day
  });
  let time = now - 5 * 60_000 - gaps.reduce((sum, gap) => sum + gap, 0);
  let author: string = CHAT_BOT.id;
  return gaps.map((gap, index) => {
    time += gap;
    if (next() < 0.35) author = author === CHAT_BOT.id ? userId : CHAT_BOT.id;
    const id = `m${index + 1}`;
    return {
      id,
      authorId: author,
      text: LINES[index % LINES.length] ?? "",
      createdAt: new Date(time).toISOString(),
      replyToId: index > 5 && next() < 0.05 ? `m${index - 1 - Math.floor(next() * 4)}` : null,
    };
  });
}

/** The bot's answer to the n-th message it receives. */
export function botReply(index: number): string {
  return REPLIES[index % REPLIES.length] ?? "";
}
