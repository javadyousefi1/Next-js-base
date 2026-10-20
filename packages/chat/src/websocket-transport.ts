import type { ChatEvent, ChatMessage, ChatTransport, HistoryPage, MessageDraft } from "./types";

/** The part of the browser `WebSocket` the transport uses (fakes and mocks implement it too). */
export type WebSocketLike = {
  readonly readyState: number;
  send(data: string): void;
  close(): void;
  addEventListener(
    type: "open" | "message" | "close" | "error",
    listener: (event: { data?: unknown }) => void,
  ): void;
};

/** What the client asks; `requestId` pairs a request with its reply. */
export type SocketRequest =
  | { type: "history"; requestId: string; before?: string; limit: number }
  | { type: "send"; requestId: string; draft: MessageDraft }
  | { type: "edit"; requestId: string; id: string; text: string }
  | { type: "remove"; requestId: string; id: string }
  | { type: "read"; requestId: string; messageId: string }
  | { type: "typing"; typing: boolean };

/** What the server sends: a reply to a request, or a live event. */
export type SocketIncoming =
  | { type: "reply"; requestId: string; ok: true; data: unknown }
  | { type: "reply"; requestId: string; ok: false; error: string }
  | ChatEvent;

/**
 * Wire format. The default is JSON with the shapes above; a backend with another protocol only
 * needs another codec (`decode` returns `null` for frames the chat doesn't care about).
 */
export type SocketCodec = {
  encode(request: SocketRequest): string;
  decode(data: unknown): SocketIncoming | null;
};

/** A frame with a string `type` (the shape check the JSON codec does). */
function isSocketIncoming(value: unknown): value is SocketIncoming {
  return (
    typeof value === "object" && value !== null && "type" in value && typeof value.type === "string"
  );
}

export const jsonSocketCodec: SocketCodec = {
  encode: (request) => JSON.stringify(request),
  decode: (data) => {
    if (typeof data !== "string") return null;
    try {
      const parsed: unknown = JSON.parse(data);
      return isSocketIncoming(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
};

export type WebSocketTransportOptions = {
  /** Opens a socket: `() => new WebSocket(url)`. Called again on every reconnect. */
  createSocket: () => WebSocketLike;
  codec?: SocketCodec;
  /** A request without a reply fails after this long. Default 10s. */
  requestTimeoutMs?: number;
  /** Reconnect delays grow from `min` to `max` (doubling). Default 500 ms → 10 s. */
  reconnectDelayMs?: { min: number; max: number };
};

const OPEN = 1;

/**
 * A `ChatTransport` over one WebSocket: requests (history, send, edit…) wait for their reply by
 * `requestId`, everything else is a live event. Requests made before the socket opens are
 * queued; a dropped connection reconnects with backoff while someone is subscribed.
 */
export function createWebSocketTransport(options: WebSocketTransportOptions): ChatTransport {
  const {
    createSocket,
    codec = jsonSocketCodec,
    requestTimeoutMs = 10_000,
    reconnectDelayMs = { min: 500, max: 10_000 },
  } = options;

  let socket: WebSocketLike | null = null;
  let listener: ((event: ChatEvent) => void) | null = null;
  let reconnectDelay = reconnectDelayMs.min;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let nextRequestId = 1;
  const queue: string[] = [];
  const pending = new Map<
    string,
    {
      resolve: (data: unknown) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();

  const emit = (event: ChatEvent) => listener?.(event);

  const failPending = (reason: string) => {
    for (const [id, request] of pending) {
      clearTimeout(request.timer);
      request.reject(new Error(reason));
      pending.delete(id);
    }
  };

  const connect = () => {
    if (socket) return;
    emit({ type: "connection", status: "connecting" });
    const current = createSocket();
    socket = current;
    current.addEventListener("open", () => {
      reconnectDelay = reconnectDelayMs.min;
      emit({ type: "connection", status: "open" });
      for (const frame of queue.splice(0)) current.send(frame);
    });
    current.addEventListener("message", ({ data }) => {
      const incoming = codec.decode(data);
      if (!incoming) return;
      if (incoming.type !== "reply") {
        emit(incoming);
        return;
      }
      const request = pending.get(incoming.requestId);
      if (!request) return;
      clearTimeout(request.timer);
      pending.delete(incoming.requestId);
      if (incoming.ok) request.resolve(incoming.data);
      else request.reject(new Error(incoming.error));
    });
    current.addEventListener("close", () => {
      if (socket !== current) return;
      socket = null;
      failPending("Connection closed");
      emit({ type: "connection", status: "closed" });
      if (!listener) return;
      reconnectTimer = setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, reconnectDelayMs.max);
    });
  };

  const write = (request: SocketRequest) => {
    const frame = codec.encode(request);
    if (socket?.readyState === OPEN) socket.send(frame);
    else {
      queue.push(frame);
      connect();
    }
  };

  const request = <T>(build: (requestId: string) => SocketRequest): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const requestId = String(nextRequestId++);
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error("Request timed out"));
      }, requestTimeoutMs);
      // The reply's shape is the protocol's contract; a custom codec can validate it.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      pending.set(requestId, { resolve: (data) => resolve(data as T), reject, timer });
      write(build(requestId));
    });

  return {
    loadHistory: ({ before, limit }) =>
      request<HistoryPage>((requestId) => ({ type: "history", requestId, before, limit })),
    send: (draft) => request<ChatMessage>((requestId) => ({ type: "send", requestId, draft })),
    edit: (id, text) =>
      request<ChatMessage>((requestId) => ({ type: "edit", requestId, id, text })),
    remove: (id) => request<void>((requestId) => ({ type: "remove", requestId, id })),
    markRead: (messageId) => request<void>((requestId) => ({ type: "read", requestId, messageId })),
    setTyping: (typing) => {
      // Typing is best effort: never queued for later.
      if (socket?.readyState === OPEN) socket.send(codec.encode({ type: "typing", typing }));
    },
    subscribe(next) {
      listener = next;
      connect();
      return () => {
        listener = null;
        clearTimeout(reconnectTimer);
        const current = socket;
        socket = null;
        queue.length = 0;
        failPending("Connection closed");
        current?.close();
      };
    },
  };
}
