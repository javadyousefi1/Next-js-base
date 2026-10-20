import { describe, expect, test } from "bun:test";

import { createPollingTransport, type ChatRestApi } from "./polling-transport";
import type { ChatEvent } from "./types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function fakeApi(polls: (() => Promise<{ events: ChatEvent[]; cursor: string | null }>)[]) {
  const cursors: (string | null)[] = [];
  const typing: boolean[] = [];
  const api: ChatRestApi = {
    history: async () => ({ messages: [], hasMore: false }),
    send: async (draft) => ({
      id: "1",
      clientId: draft.clientId,
      authorId: "me",
      text: draft.text,
      createdAt: "2026-01-01T00:00:00.000Z",
    }),
    setTyping: async (value) => {
      typing.push(value);
    },
    poll: (cursor) => {
      cursors.push(cursor);
      const next = polls.shift();
      return next ? next() : Promise.resolve({ events: [], cursor });
    },
  };
  return { api, cursors, typing };
}

describe("createPollingTransport", () => {
  test("polls from the returned cursor and forwards events", async () => {
    const message: ChatEvent = {
      type: "message",
      message: { id: "9", authorId: "sara", text: "hi", createdAt: "2026-01-01T00:00:00.000Z" },
    };
    const { api, cursors } = fakeApi([
      async () => ({ events: [], cursor: "5" }),
      async () => ({ events: [message], cursor: "6" }),
    ]);
    const events: ChatEvent[] = [];
    const stop = createPollingTransport(api, { intervalMs: 5 }).subscribe((event) =>
      events.push(event),
    );
    await wait(30);
    stop();
    expect(cursors.slice(0, 3)).toEqual([null, "5", "6"]);
    expect(events.slice(0, 3)).toEqual([
      { type: "connection", status: "connecting" },
      { type: "connection", status: "open" },
      message,
    ]);
  });

  test("a failing poll reports the connection closed and backs off, then recovers", async () => {
    const { api, cursors } = fakeApi([
      () => Promise.reject(new Error("down")),
      () => Promise.reject(new Error("down")),
      async () => ({ events: [], cursor: "1" }),
    ]);
    const events: ChatEvent[] = [];
    const stop = createPollingTransport(api, { intervalMs: 5, maxIntervalMs: 10 }).subscribe(
      (event) => events.push(event),
    );
    await wait(60);
    stop();
    expect(cursors.length).toBeGreaterThanOrEqual(3);
    expect(
      events.filter((event) => event.type === "connection").map((event) => event.status),
    ).toEqual(["connecting", "closed", "open"]);
  });

  test("stops polling on unsubscribe; optional API methods become transport methods", async () => {
    const { api, cursors, typing } = fakeApi([]);
    const transport = createPollingTransport(api, { intervalMs: 5 });
    const stop = transport.subscribe(() => {});
    await wait(1);
    stop();
    const count = cursors.length;
    await wait(20);
    expect(cursors.length).toBe(count);

    expect(transport.edit).toBeUndefined();
    transport.setTyping?.(true);
    expect(typing).toEqual([true]);
    expect((await transport.send({ clientId: "c", text: "x" })).clientId).toBe("c");
  });
});
