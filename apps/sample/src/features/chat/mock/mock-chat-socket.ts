import type { SocketRequest, WebSocketLike } from "@repo/chat/websocket-transport";

import { fakeChatServerFor } from "./fake-chat-server";

const CONNECT_DELAY_MS = 300;
const REPLY_DELAY_MS = 150;

type Listener = (event: { data?: unknown }) => void;

/**
 * A WebSocket to a fake server that lives in this browser tab (the demo has no socket server).
 * It speaks the default JSON protocol of `createWebSocketTransport`; a real app passes
 * `() => new WebSocket(url)` instead and nothing else changes.
 */
export class MockChatSocket implements WebSocketLike {
  readyState = 0;
  private listeners = new Map<string, Listener[]>();
  private server;
  private unsubscribe: (() => void) | undefined;

  constructor(userId: string) {
    this.server = fakeChatServerFor(userId);
    setTimeout(() => {
      if (this.readyState !== 0) return;
      this.readyState = 1;
      this.unsubscribe = this.server.on((event) => this.push(event));
      this.fire("open");
    }, CONNECT_DELAY_MS);
  }

  addEventListener(type: "open" | "message" | "close" | "error", listener: Listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  send(data: string) {
    // Frames come from our own transport (createWebSocketTransport), never from outside.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const request = JSON.parse(data) as SocketRequest;
    if (request.type === "typing") return;
    setTimeout(() => {
      try {
        this.push({
          type: "reply",
          requestId: request.requestId,
          ok: true,
          data: this.handle(request),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        this.push({ type: "reply", requestId: request.requestId, ok: false, error: message });
      }
    }, REPLY_DELAY_MS);
  }

  close() {
    this.readyState = 3;
    this.unsubscribe?.();
    this.fire("close");
  }

  private handle(request: Exclude<SocketRequest, { type: "typing" }>): unknown {
    switch (request.type) {
      case "history":
        return this.server.history(request);
      case "send":
        return this.server.send(request.draft);
      case "edit":
        return this.server.edit(request.id, request.text);
      case "remove":
        return this.server.remove(request.id);
      case "read":
      default:
        return this.server.read(request.messageId);
    }
  }

  private push(frame: unknown) {
    if (this.readyState === 1) this.fire("message", { data: JSON.stringify(frame) });
  }

  private fire(type: string, event: { data?: unknown } = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}
