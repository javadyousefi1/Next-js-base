import { describe, expect, test } from "bun:test";

import type { ChatEvent } from "./types";
import {
  createWebSocketTransport,
  jsonSocketCodec,
  type WebSocketLike,
} from "./websocket-transport";

type Listener = (event: { data?: unknown }) => void;

/** An in-memory socket: the test opens it, reads what was sent and pushes frames. */
class FakeSocket implements WebSocketLike {
  readyState = 0;
  sent: unknown[] = [];
  closed = false;
  private listeners = new Map<string, Listener[]>();

  addEventListener(type: "open" | "message" | "close" | "error", listener: Listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
  close() {
    this.closed = true;
    this.readyState = 3;
    this.fire("close");
  }
  open() {
    this.readyState = 1;
    this.fire("open");
  }
  receive(frame: unknown) {
    this.fire("message", { data: JSON.stringify(frame) });
  }
  drop() {
    this.readyState = 3;
    this.fire("close");
  }
  private fire(type: string, event: { data?: unknown } = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

function setup(options: { requestTimeoutMs?: number } = {}) {
  const sockets: FakeSocket[] = [];
  const events: ChatEvent[] = [];
  const transport = createWebSocketTransport({
    createSocket: () => {
      const socket = new FakeSocket();
      sockets.push(socket);
      return socket;
    },
    reconnectDelayMs: { min: 5, max: 20 },
    ...options,
  });
  const latest = () => sockets.at(-1) ?? new FakeSocket();
  return {
    transport,
    sockets,
    events,
    latest,
    listen: () => transport.subscribe((e) => events.push(e)),
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("createWebSocketTransport", () => {
  test("requests made before the socket opens are queued and answered by requestId", async () => {
    const { transport, latest, listen, events } = setup();
    listen();
    const history = transport.loadHistory({ limit: 20 });
    expect(latest().sent).toEqual([]);

    latest().open();
    expect(latest().sent).toEqual([{ type: "history", requestId: "1", limit: 20 }]);
    latest().receive({
      type: "reply",
      requestId: "1",
      ok: true,
      data: { messages: [], hasMore: false },
    });
    expect(await history).toEqual({ messages: [], hasMore: false });
    expect(events).toEqual([
      { type: "connection", status: "connecting" },
      { type: "connection", status: "open" },
    ]);
  });

  test("an error reply rejects the request; other frames are live events", async () => {
    const { transport, latest, listen, events } = setup();
    listen();
    latest().open();
    const sending = transport.send({ clientId: "c1", text: "hi" });
    latest().receive({ type: "reply", requestId: "1", ok: false, error: "Too long" });
    expect(await sending.catch((error: unknown) => (error as Error).message)).toBe("Too long");

    latest().receive({ type: "typing", userId: "sara", typing: true });
    latest().receive("not json");
    expect(events.at(-1)).toEqual({ type: "typing", userId: "sara", typing: true });
  });

  test("typing is best effort: sent only while open", () => {
    const { transport, latest, listen } = setup();
    listen();
    transport.setTyping?.(true);
    latest().open();
    transport.setTyping?.(true);
    expect(latest().sent).toEqual([{ type: "typing", typing: true }]);
  });

  test("a dropped connection fails pending requests and reconnects with backoff", async () => {
    const { transport, sockets, latest, listen, events } = setup();
    listen();
    latest().open();
    const pending = transport.markRead?.("m1");
    latest().drop();
    expect(await pending?.catch((error: unknown) => (error as Error).message)).toBe(
      "Connection closed",
    );
    expect(events.at(-1)).toEqual({ type: "connection", status: "closed" });
    await wait(15);
    expect(sockets).toHaveLength(2);
    latest().open();
    expect(events.at(-1)).toEqual({ type: "connection", status: "open" });
  });

  test("unsubscribe closes the socket and stops reconnecting", async () => {
    const { sockets, latest, listen } = setup();
    const stop = listen();
    latest().open();
    stop();
    expect(latest().closed).toBe(true);
    await wait(30);
    expect(sockets).toHaveLength(1);
  });

  test("requests time out without a reply", async () => {
    const { transport, latest, listen } = setup({ requestTimeoutMs: 10 });
    listen();
    latest().open();
    const result = await transport
      .remove?.("m1")
      .catch((error: unknown) => (error as Error).message);
    expect(result).toBe("Request timed out");
  });

  test("the JSON codec ignores frames that aren't chat frames", () => {
    expect(jsonSocketCodec.decode("{")).toBeNull();
    expect(jsonSocketCodec.decode(JSON.stringify({ hello: 1 }))).toBeNull();
    expect(jsonSocketCodec.decode(new ArrayBuffer(1))).toBeNull();
    expect(jsonSocketCodec.decode(JSON.stringify({ type: "message-deleted", id: "1" }))).toEqual({
      type: "message-deleted",
      id: "1",
    });
  });
});
