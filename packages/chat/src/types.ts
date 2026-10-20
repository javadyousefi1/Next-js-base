/**
 * The chat's own shapes. An app maps its backend (REST, WebSocket, SSE…) to them in a
 * `ChatTransport`; the store, the timeline and the hooks never see the backend.
 */

/** One message. Times are ISO strings; ids are strings whatever the backend uses. */
export type ChatMessage = {
  /** Server id. While a sent message has no server id yet, it is its `clientId`. */
  id: string;
  /** Chosen by the sender's client; the server echoes it so the optimistic copy is replaced. */
  clientId?: string | null;
  authorId: string;
  text: string;
  createdAt: string;
  editedAt?: string | null;
  /** Kept as a tombstone ("message deleted") so replies and the order stay intact. */
  deleted?: boolean;
  replyToId?: string | null;
  /** Delivery of the current user's messages (local); everything from the server is `"sent"`. */
  status?: "sending" | "sent" | "failed";
};

/** What the composer sends. `clientId` makes the send idempotent and matches the echo. */
export type MessageDraft = { clientId: string; text: string; replyToId?: string | null };

export type HistoryPage = {
  /** Oldest → newest. */
  messages: ChatMessage[];
  /** More messages exist before the first one. */
  hasMore: boolean;
  /** The last message each participant has read (the current user's too), when known. */
  readBy?: Record<string, string>;
};

export type ConnectionStatus = "connecting" | "open" | "closed";

/** Live events a transport pushes (a WebSocket frame, a polled change…). */
export type ChatEvent =
  | { type: "message"; message: ChatMessage }
  | { type: "message-updated"; message: ChatMessage }
  | { type: "message-deleted"; id: string }
  | { type: "typing"; userId: string; typing: boolean }
  | { type: "read"; userId: string; messageId: string }
  | { type: "connection"; status: ConnectionStatus };

/**
 * How the chat reaches a backend. Implement it for any protocol, or use
 * `createWebSocketTransport` / `createPollingTransport`. Only `loadHistory`, `send` and
 * `subscribe` are required; the store hides features whose method is missing.
 */
export type ChatTransport = {
  /** A page of messages before `before` (a message id), or the latest page. */
  loadHistory: (request: { before?: string; limit: number }) => Promise<HistoryPage>;
  send: (draft: MessageDraft) => Promise<ChatMessage>;
  edit?: (id: string, text: string) => Promise<ChatMessage>;
  remove?: (id: string) => Promise<void>;
  /** Everything up to `messageId` was read by the current user. */
  markRead?: (messageId: string) => Promise<void>;
  setTyping?: (typing: boolean) => void;
  /** Starts the live connection and delivers its events; the returned function stops it. */
  subscribe: (listener: (event: ChatEvent) => void) => () => void;
};
