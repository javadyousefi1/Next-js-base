import { describe, expect, test } from "bun:test";

import { createChatStore, mergeMessages } from "./chat-store";
import type { ChatEvent, ChatMessage, ChatTransport, HistoryPage, MessageDraft } from "./types";

const ME = "me";
const SARA = "sara";

const message = (
  id: string,
  minute: number,
  authorId = SARA,
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({
  id,
  authorId,
  text: `text ${id}`,
  createdAt: new Date(Date.UTC(2026, 0, 1, 10, minute)).toISOString(),
  ...extra,
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const echo = async (draft: MessageDraft) =>
  message(`server-${draft.clientId}`, 59, ME, { clientId: draft.clientId, text: draft.text });

/** A controllable transport that records what the store asks for. */
function fakeTransport(pages: HistoryPage[] = [{ messages: [], hasMore: false }]) {
  let emit: ((event: ChatEvent) => void) | undefined;
  let sendResult = echo;
  let unsubscribed = 0;
  const calls = {
    sent: [] as MessageDraft[],
    typing: [] as boolean[],
    read: [] as string[],
    history: [] as { before?: string; limit: number }[],
  };

  const transport: ChatTransport = {
    loadHistory: async (request) => {
      calls.history.push(request);
      return pages.shift() ?? { messages: [], hasMore: false };
    },
    send: (draft) => {
      calls.sent.push(draft);
      return sendResult(draft);
    },
    edit: async (id, text) => message(id, 1, ME, { text, editedAt: "2026-01-01T11:00:00.000Z" }),
    remove: async () => {},
    markRead: async (id) => {
      calls.read.push(id);
    },
    setTyping: (value) => calls.typing.push(value),
    subscribe: (listener) => {
      emit = listener;
      return () => {
        unsubscribed += 1;
      };
    },
  };

  return {
    transport,
    calls,
    emit: (event: ChatEvent) => emit?.(event),
    unsubscribed: () => unsubscribed,
    failSends: () => {
      sendResult = () => Promise.reject(new Error("offline"));
    },
    succeedSends: () => {
      sendResult = echo;
    },
  };
}

let ids = 0;
const createStore = (
  fake: ReturnType<typeof fakeTransport>,
  extra: Partial<Parameters<typeof createChatStore>[0]> = {},
) =>
  createChatStore({
    transport: fake.transport,
    currentUserId: ME,
    pageSize: 2,
    createClientId: () => `c${++ids}`,
    ...extra,
  });

describe("mergeMessages", () => {
  test("adds, replaces by id or by clientId, and sorts by time", () => {
    const merged = mergeMessages(
      [message("b", 2), message("c1", 3, ME, { clientId: "c1", status: "sending" })],
      [
        message("a", 1),
        message("s1", 3, ME, { clientId: "c1" }),
        message("b", 2, SARA, { text: "new" }),
      ],
    );
    expect(merged.map((item) => item.id)).toEqual(["a", "b", "s1"]);
    expect(merged[1]?.text).toBe("new");
    expect(merged[2]?.clientId).toBe("c1");
  });
});

describe("createChatStore", () => {
  test("start: loading → ready with the latest page, read pointers and the unread divider", async () => {
    const fake = fakeTransport([
      {
        messages: [message("1", 1), message("2", 2, ME), message("3", 3)],
        hasMore: true,
        readBy: { [ME]: "2", [SARA]: "2" },
      },
    ]);
    const chat = createStore(fake);
    const starting = chat.start();
    expect(chat.getState().status).toBe("loading");
    await starting;
    expect(chat.getState()).toMatchObject({ status: "ready", hasMore: true, firstUnreadId: "3" });
    expect(chat.getState().messages.map((item) => item.id)).toEqual(["1", "2", "3"]);
    expect(fake.calls.history).toEqual([{ limit: 2 }]);
  });

  test("a failed first page is an error; start() again retries", async () => {
    const fake = fakeTransport();
    fake.transport.loadHistory = () => Promise.reject(new Error("down"));
    const chat = createStore(fake);
    await chat.start();
    expect(chat.getState().status).toBe("error");
    fake.transport.loadHistory = async () => ({ messages: [message("1", 1)], hasMore: false });
    await chat.start();
    expect(chat.getState().status).toBe("ready");
  });

  test("loadOlder prepends the page before the oldest message, one request at a time", async () => {
    const fake = fakeTransport([
      { messages: [message("3", 3), message("4", 4)], hasMore: true },
      { messages: [message("1", 1), message("2", 2)], hasMore: false },
    ]);
    const chat = createStore(fake);
    await chat.start();
    const loading = chat.loadOlder();
    void chat.loadOlder(); // ignored while loading
    expect(chat.getState().loadingOlder).toBe(true);
    await loading;
    expect(chat.getState().messages.map((item) => item.id)).toEqual(["1", "2", "3", "4"]);
    expect(chat.getState()).toMatchObject({ hasMore: false, loadingOlder: false });
    expect(fake.calls.history).toEqual([{ limit: 2 }, { before: "3", limit: 2 }]);
    await chat.loadOlder(); // nothing more on the server
    expect(fake.calls.history).toHaveLength(2);
  });

  test("send is optimistic, then replaced by the server copy with the same clientId", async () => {
    const fake = fakeTransport();
    const chat = createStore(fake);
    await chat.start();
    const clientId = chat.send("  hello  ", { replyToId: "x" }) ?? "";
    expect(chat.getState().messages).toMatchObject([
      { id: clientId, clientId, text: "hello", status: "sending", replyToId: "x", authorId: ME },
    ]);
    expect(fake.calls.sent).toEqual([{ clientId, text: "hello", replyToId: "x" }]);
    await flush();
    expect(chat.getState().messages).toMatchObject([
      { id: `server-${clientId}`, clientId, status: "sent" },
    ]);
    expect(chat.send("   ")).toBeNull();
  });

  test("the live echo of an own message arriving first doesn't duplicate it", async () => {
    const fake = fakeTransport();
    const chat = createStore(fake);
    await chat.start();
    const clientId = chat.send("hi") ?? "";
    fake.emit({ type: "message", message: message("s9", 59, ME, { clientId, text: "hi" }) });
    await flush();
    expect(chat.getState().messages).toHaveLength(1);
  });

  test("a failed send is marked failed and retried with the same clientId", async () => {
    const fake = fakeTransport();
    const chat = createStore(fake);
    await chat.start();
    fake.failSends();
    const clientId = chat.send("hi") ?? "";
    await flush();
    expect(chat.getState().messages[0]?.status).toBe("failed");
    fake.succeedSends();
    chat.retry(clientId);
    expect(chat.getState().messages[0]?.status).toBe("sending");
    await flush();
    expect(chat.getState().messages[0]?.status).toBe("sent");
    expect(fake.calls.sent.map((draft) => draft.clientId)).toEqual([clientId, clientId]);
  });

  test("live events: connection, typing (expires), message, update, read (forward only), delete", async () => {
    const fake = fakeTransport([{ messages: [message("1", 1, ME)], hasMore: false }]);
    const chat = createStore(fake, { typingTimeoutMs: 20 });
    await chat.start();
    fake.emit({ type: "connection", status: "open" });
    fake.emit({ type: "typing", userId: SARA, typing: true });
    fake.emit({ type: "typing", userId: ME, typing: true }); // own echo is ignored
    expect(chat.getState()).toMatchObject({ connection: "open", typingUserIds: [SARA] });

    fake.emit({ type: "message", message: message("2", 2) });
    expect(chat.getState().typingUserIds).toEqual([]); // the message ends the typing
    fake.emit({ type: "message-updated", message: message("2", 2, SARA, { text: "edited" }) });
    expect(chat.getState().messages.map((item) => item.text)).toEqual(["text 1", "edited"]);

    fake.emit({ type: "read", userId: SARA, messageId: "2" });
    fake.emit({ type: "read", userId: SARA, messageId: "1" });
    expect(chat.getState().readBy[SARA]).toBe("2");

    fake.emit({ type: "message-deleted", id: "2" });
    expect(chat.getState().messages[1]).toMatchObject({ deleted: true, text: "" });

    fake.emit({ type: "typing", userId: SARA, typing: true });
    await wait(40);
    expect(chat.getState().typingUserIds).toEqual([]);
  });

  test("events that arrive while the first page loads are kept", async () => {
    const page = Promise.withResolvers<HistoryPage>();
    const fake = fakeTransport();
    fake.transport.loadHistory = () => page.promise;
    const chat = createStore(fake);
    const starting = chat.start();
    fake.emit({ type: "message", message: message("3", 3) });
    page.resolve({ messages: [message("1", 1), message("2", 2)], hasMore: false });
    await starting;
    expect(chat.getState().messages.map((item) => item.id)).toEqual(["1", "2", "3"]);
  });

  test("edit is optimistic and rolls back when the server refuses", async () => {
    const fake = fakeTransport([{ messages: [message("1", 1, ME)], hasMore: false }]);
    const chat = createStore(fake);
    await chat.start();
    await chat.edit("1", "changed");
    expect(chat.getState().messages[0]).toMatchObject({ text: "changed", status: "sent" });

    fake.transport.edit = () => Promise.reject(new Error("nope"));
    const editing = chat.edit("1", "again");
    expect(chat.getState().messages[0]?.text).toBe("again");
    expect(await editing.catch((error: unknown) => error)).toBeInstanceOf(Error);
    expect(chat.getState().messages[0]?.text).toBe("changed");
  });

  test("remove waits for the server; an unsent message is just dropped", async () => {
    const fake = fakeTransport([{ messages: [message("1", 1, ME)], hasMore: false }]);
    const chat = createStore(fake);
    await chat.start();
    await chat.remove("1");
    expect(chat.getState().messages[0]).toMatchObject({ deleted: true });

    fake.failSends();
    chat.send("draft");
    await flush();
    await chat.remove(chat.getState().messages.at(-1)?.id ?? "");
    expect(chat.getState().messages).toHaveLength(1);
  });

  test("markRead tells the server once per newer message", async () => {
    const fake = fakeTransport([{ messages: [message("1", 1), message("2", 2)], hasMore: false }]);
    const chat = createStore(fake);
    await chat.start();
    chat.markRead();
    chat.markRead();
    expect(fake.calls.read).toEqual(["2"]);
    expect(chat.getState().readBy[ME]).toBe("2");
  });

  test("typing: throttled while typing, stopped after a pause and on send", async () => {
    let time = 0;
    const fake = fakeTransport();
    const chat = createStore(fake, { typingThrottleMs: 100, typingIdleMs: 20, now: () => time });
    await chat.start();
    chat.notifyTyping();
    time = 50;
    chat.notifyTyping();
    time = 150;
    chat.notifyTyping();
    expect(fake.calls.typing).toEqual([true, true]);
    await wait(40);
    expect(fake.calls.typing).toEqual([true, true, false]);

    time = 300;
    chat.notifyTyping();
    chat.send("done");
    expect(fake.calls.typing).toEqual([true, true, false, true, false]);
  });

  test("stop unsubscribes and ignores late answers", async () => {
    const page = Promise.withResolvers<HistoryPage>();
    const fake = fakeTransport();
    fake.transport.loadHistory = () => page.promise;
    const chat = createStore(fake);
    const starting = chat.start();
    chat.stop();
    page.resolve({ messages: [message("1", 1)], hasMore: false });
    await starting;
    expect(chat.getState().messages).toEqual([]);
    expect(fake.unsubscribed()).toBe(1);
  });

  test("capabilities follow the transport", () => {
    const fake = fakeTransport();
    delete fake.transport.edit;
    delete fake.transport.setTyping;
    expect(createStore(fake).capabilities).toEqual({
      edit: false,
      remove: true,
      typing: false,
      read: true,
    });
  });
});
