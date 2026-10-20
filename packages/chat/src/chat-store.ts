import type { ChatEvent, ChatMessage, ChatTransport, ConnectionStatus, HistoryPage } from "./types";

export type ChatState = {
  /** Oldest → newest; pending and failed messages of the current user included. */
  messages: readonly ChatMessage[];
  /** The first page: `loading` → `ready` (or `error`). */
  status: "idle" | "loading" | "ready" | "error";
  error: unknown;
  /** Older messages exist on the server. */
  hasMore: boolean;
  loadingOlder: boolean;
  connection: ConnectionStatus;
  /** Other participants typing right now. */
  typingUserIds: readonly string[];
  /** The last message each participant has read. */
  readBy: Readonly<Record<string, string>>;
  /** First message the current user had not read when the chat opened (the unread divider). */
  firstUnreadId: string | null;
};

export type ChatStoreOptions = {
  transport: ChatTransport;
  currentUserId: string;
  /** Messages per history page. Default 50. */
  pageSize?: number;
  /** A typing indicator disappears if no new `typing` event comes within this time. Default 6s. */
  typingTimeoutMs?: number;
  /** The current user's `typing: true` is re-sent at most this often while typing. Default 3s. */
  typingThrottleMs?: number;
  /** After this long without keystrokes the current user stops "typing". Default 4s. */
  typingIdleMs?: number;
  createClientId?: () => string;
  now?: () => number;
};

const INITIAL_STATE: ChatState = {
  messages: [],
  status: "idle",
  error: null,
  hasMore: false,
  loadingOlder: false,
  connection: "connecting",
  typingUserIds: [],
  readBy: {},
  firstUnreadId: null,
};

const byTimeThenId = (a: ChatMessage, b: ChatMessage) =>
  a.createdAt === b.createdAt
    ? a.id < b.id
      ? -1
      : a.id > b.id
        ? 1
        : 0
    : a.createdAt < b.createdAt
      ? -1
      : 1;

/**
 * Adds or replaces messages (by `id`, or by `clientId` for the echo of an optimistic message)
 * and keeps the list sorted by time. Pure.
 */
export function mergeMessages(
  current: readonly ChatMessage[],
  incoming: readonly ChatMessage[],
): ChatMessage[] {
  const next = [...current];
  for (const message of incoming) {
    const index = next.findIndex(
      (existing) =>
        existing.id === message.id ||
        (message.clientId !== null &&
          message.clientId !== undefined &&
          existing.clientId === message.clientId),
    );
    // A server copy keeps the clientId of the optimistic one (stable React keys).
    if (index === -1) next.push(message);
    else next[index] = { ...message, clientId: message.clientId ?? next[index]?.clientId };
  }
  return next.toSorted(byTimeThenId);
}

/**
 * Framework-agnostic chat state: history paging, live events, optimistic sending with retry,
 * edit/delete, typing and read receipts. React reads it with `useChat`
 * (`useSyncExternalStore`); tests drive it directly with a fake transport.
 */
export function createChatStore(options: ChatStoreOptions) {
  const {
    transport,
    currentUserId,
    pageSize = 50,
    typingTimeoutMs = 6000,
    typingThrottleMs = 3000,
    typingIdleMs = 4000,
    createClientId = () => crypto.randomUUID(),
    now = () => Date.now(),
  } = options;

  let state = INITIAL_STATE;
  const listeners = new Set<() => void>();
  /** Bumped by `stop()`: answers of an older run are ignored. */
  let run = 0;
  let unsubscribe: (() => void) | undefined;
  const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  /** When `typing: true` was last sent; `null` = the user isn't typing. */
  let lastTypingSentAt: number | null = null;
  let typingIdleTimer: ReturnType<typeof setTimeout> | undefined;

  const set = (changes: Partial<ChatState>) => {
    state = { ...state, ...changes };
    for (const listener of listeners) listener();
  };
  const indexOf = (id: string) => state.messages.findIndex((message) => message.id === id);
  const replace = (id: string, changes: Partial<ChatMessage>) =>
    set({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, ...changes } : message,
      ),
    });

  /** Moves a read pointer forward only. */
  const markReadBy = (userId: string, messageId: string) => {
    const current = state.readBy[userId];
    if (current !== undefined && indexOf(current) >= indexOf(messageId)) return;
    set({ readBy: { ...state.readBy, [userId]: messageId } });
  };

  const stopTyping = (userId: string) => {
    clearTimeout(typingTimers.get(userId));
    typingTimers.delete(userId);
    if (state.typingUserIds.includes(userId)) {
      set({ typingUserIds: state.typingUserIds.filter((id) => id !== userId) });
    }
  };

  const handleEvent = (event: ChatEvent) => {
    switch (event.type) {
      case "message":
      case "message-updated":
        set({ messages: mergeMessages(state.messages, [{ ...event.message, status: "sent" }]) });
        if (event.type === "message") stopTyping(event.message.authorId);
        break;
      case "message-deleted":
        if (indexOf(event.id) !== -1) replace(event.id, { deleted: true, text: "" });
        break;
      case "typing":
        if (event.userId === currentUserId) break;
        if (!event.typing) {
          stopTyping(event.userId);
          break;
        }
        clearTimeout(typingTimers.get(event.userId));
        typingTimers.set(
          event.userId,
          setTimeout(() => stopTyping(event.userId), typingTimeoutMs),
        );
        if (!state.typingUserIds.includes(event.userId)) {
          set({ typingUserIds: [...state.typingUserIds, event.userId] });
        }
        break;
      case "read":
        markReadBy(event.userId, event.messageId);
        break;
      case "connection":
        set({ connection: event.status });
        break;
    }
  };

  /** The first message after the current user's read pointer that someone else wrote. */
  const firstUnread = (page: HistoryPage) => {
    const lastRead = page.readBy?.[currentUserId];
    if (lastRead === undefined) return null;
    const start = page.messages.findIndex((message) => message.id === lastRead);
    if (start === -1) return null;
    return (
      page.messages.slice(start + 1).find((message) => message.authorId !== currentUserId)?.id ??
      null
    );
  };

  const deliver = async (clientId: string) => {
    const message = state.messages.find((candidate) => candidate.clientId === clientId);
    if (!message) return;
    const current = run;
    try {
      const saved = await transport.send({
        clientId,
        text: message.text,
        replyToId: message.replyToId ?? null,
      });
      if (current !== run) return;
      set({ messages: mergeMessages(state.messages, [{ ...saved, clientId, status: "sent" }]) });
    } catch {
      if (current !== run) return;
      const failed = state.messages.find((candidate) => candidate.clientId === clientId);
      if (failed?.status === "sending") replace(failed.id, { status: "failed" });
    }
  };

  const sendTyping = (typing: boolean) => {
    if (!transport.setTyping) return;
    lastTypingSentAt = typing ? now() : null;
    transport.setTyping(typing);
  };

  return {
    getState: (): ChatState => state,
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** What the transport supports (hide the matching UI otherwise). */
    capabilities: {
      edit: Boolean(transport.edit),
      remove: Boolean(transport.remove),
      typing: Boolean(transport.setTyping),
      read: Boolean(transport.markRead),
    },

    /** Connects and loads the latest page. Safe to call again after `stop()` or an error. */
    async start(): Promise<void> {
      if (state.status === "loading") return;
      const current = ++run;
      unsubscribe?.();
      set({ ...INITIAL_STATE, status: "loading" });
      unsubscribe = transport.subscribe((event) => {
        if (current === run) handleEvent(event);
      });
      try {
        const page = await transport.loadHistory({ limit: pageSize });
        if (current !== run) return;
        set({
          // Events that arrived while the page loaded are merged, not lost.
          messages: mergeMessages(page.messages, state.messages),
          hasMore: page.hasMore,
          readBy: { ...page.readBy, ...state.readBy },
          firstUnreadId: firstUnread(page),
          status: "ready",
        });
      } catch (error) {
        if (current === run) set({ status: "error", error });
      }
    },

    /** Disconnects; late answers are ignored. */
    stop() {
      run += 1;
      unsubscribe?.();
      unsubscribe = undefined;
      for (const timer of typingTimers.values()) clearTimeout(timer);
      typingTimers.clear();
      clearTimeout(typingIdleTimer);
      set({ ...state, status: state.status === "loading" ? "idle" : state.status });
    },

    /** The page before the oldest loaded message (scrolled to the top). */
    async loadOlder(): Promise<void> {
      const oldest = state.messages.find((message) => message.status !== "sending");
      if (!state.hasMore || state.loadingOlder || state.status !== "ready" || !oldest) return;
      const current = run;
      set({ loadingOlder: true });
      try {
        const page = await transport.loadHistory({ before: oldest.id, limit: pageSize });
        if (current !== run) return;
        set({
          messages: mergeMessages(state.messages, page.messages),
          hasMore: page.hasMore,
          loadingOlder: false,
        });
      } catch {
        // Scrolling up again retries.
        if (current === run) set({ loadingOlder: false });
      }
    },

    /** Shows the message at once (`sending`), then `sent` or `failed` (see `retry`). */
    send(text: string, { replyToId = null }: { replyToId?: string | null } = {}): string | null {
      const body = text.trim();
      if (!body) return null;
      const clientId = createClientId();
      const message: ChatMessage = {
        id: clientId,
        clientId,
        authorId: currentUserId,
        text: body,
        createdAt: new Date(now()).toISOString(),
        replyToId,
        status: "sending",
      };
      set({ messages: [...state.messages, message] });
      clearTimeout(typingIdleTimer);
      if (lastTypingSentAt !== null) sendTyping(false);
      void deliver(clientId);
      return clientId;
    },

    /** Sends a failed message again (same `clientId`, so the server can de-duplicate). */
    retry(clientId: string) {
      const message = state.messages.find((candidate) => candidate.clientId === clientId);
      if (message?.status !== "failed") return;
      replace(message.id, { status: "sending" });
      void deliver(clientId);
    },

    /** Optimistic; restores the old text and rethrows when the server refuses. */
    async edit(id: string, text: string): Promise<void> {
      const body = text.trim();
      const message = state.messages.find((candidate) => candidate.id === id);
      if (!transport.edit || !message || !body || body === message.text) return;
      replace(id, { text: body, editedAt: new Date(now()).toISOString() });
      try {
        const saved = await transport.edit(id, body);
        set({ messages: mergeMessages(state.messages, [{ ...saved, status: "sent" }]) });
      } catch (error) {
        replace(id, { text: message.text, editedAt: message.editedAt ?? null });
        throw error;
      }
    },

    /** Deletes on the server first (await it, e.g. in `modal.confirm`'s `onAction`). */
    async remove(id: string): Promise<void> {
      const message = state.messages.find((candidate) => candidate.id === id);
      if (!message) return;
      // A message the server never got is just dropped.
      if (message.status === "failed" || message.status === "sending") {
        set({ messages: state.messages.filter((candidate) => candidate.id !== id) });
        return;
      }
      if (!transport.remove) return;
      await transport.remove(id);
      replace(id, { deleted: true, text: "" });
    },

    /** The current user has seen everything up to `messageId` (default: the latest message). */
    markRead(messageId?: string) {
      const target =
        messageId ??
        state.messages.findLast(
          (message) => message.status !== "sending" && message.status !== "failed",
        )?.id;
      if (!target) return;
      const before = state.readBy[currentUserId];
      markReadBy(currentUserId, target);
      if (state.readBy[currentUserId] !== before) void transport.markRead?.(target).catch(() => {});
    },

    /** Call on every keystroke: throttled `typing: true`, then `false` after a pause. */
    notifyTyping() {
      if (!transport.setTyping) return;
      if (lastTypingSentAt === null || now() - lastTypingSentAt >= typingThrottleMs) {
        sendTyping(true);
      }
      clearTimeout(typingIdleTimer);
      typingIdleTimer = setTimeout(() => sendTyping(false), typingIdleMs);
    },
  };
}

export type ChatStore = ReturnType<typeof createChatStore>;
