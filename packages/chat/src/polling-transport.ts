import type { ChatEvent, ChatMessage, ChatTransport, HistoryPage, MessageDraft } from "./types";

/** A REST backend, as functions the app writes with its own HTTP client and schemas. */
export type ChatRestApi = {
  history: (request: { before?: string; limit: number }) => Promise<HistoryPage>;
  send: (draft: MessageDraft) => Promise<ChatMessage>;
  edit?: (id: string, text: string) => Promise<ChatMessage>;
  remove?: (id: string) => Promise<void>;
  markRead?: (messageId: string) => Promise<void>;
  setTyping?: (typing: boolean) => Promise<void>;
  /**
   * Changes after `cursor` (`null` on the first call: the server answers with no events and the
   * current cursor). Returns the events and the cursor to ask from next time.
   */
  poll: (cursor: string | null) => Promise<{ events: ChatEvent[]; cursor: string | null }>;
};

export type PollingTransportOptions = {
  /** Between two polls. Default 2 s. */
  intervalMs?: number;
  /** After failures the interval doubles up to this. Default 30 s. */
  maxIntervalMs?: number;
};

/**
 * A `ChatTransport` for a plain REST API: requests are the API calls, live events come from
 * polling `poll(cursor)` while subscribed. A failed poll reports `connection: closed` and backs off.
 */
export function createPollingTransport(
  api: ChatRestApi,
  { intervalMs = 2000, maxIntervalMs = 30_000 }: PollingTransportOptions = {},
): ChatTransport {
  const { edit, remove, markRead, setTyping } = api;
  return {
    loadHistory: (request) => api.history(request),
    send: (draft) => api.send(draft),
    edit: edit && ((id, text) => edit(id, text)),
    remove: remove && ((id) => remove(id)),
    markRead: markRead && ((messageId) => markRead(messageId)),
    setTyping:
      setTyping &&
      ((typing) => {
        void setTyping(typing).catch(() => {});
      }),
    subscribe(listener) {
      let active = true;
      let cursor: string | null = null;
      let delay = intervalMs;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let connected = false;

      const tick = async () => {
        try {
          const result = await api.poll(cursor);
          if (!active) return;
          cursor = result.cursor;
          delay = intervalMs;
          if (!connected) {
            connected = true;
            listener({ type: "connection", status: "open" });
          }
          for (const event of result.events) listener(event);
        } catch {
          if (!active) return;
          if (connected || delay === intervalMs) listener({ type: "connection", status: "closed" });
          connected = false;
          delay = Math.min(delay * 2, maxIntervalMs);
        }
        if (active) timer = setTimeout(() => void tick(), delay);
      };

      listener({ type: "connection", status: "connecting" });
      void tick();
      return () => {
        active = false;
        clearTimeout(timer);
      };
    },
  };
}
