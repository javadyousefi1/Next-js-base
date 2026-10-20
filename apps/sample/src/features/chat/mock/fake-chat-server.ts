import type { ChatEvent, ChatMessage, HistoryPage, MessageDraft } from "@repo/chat/types";

import { botReply, CHAT_BOT, seedConversation } from "./chat-seed";

const BOT_READS_AFTER_MS = 700;
const BOT_TYPES_AFTER_MS = 1100;
const BOT_ANSWERS_AFTER_MS = 2600;

/**
 * The demo backend's logic, shared by the MSW REST mock (server) and the in-browser WebSocket
 * mock: one conversation per user with "Sara", who reads, types and answers every message.
 * Works on `@repo/chat` types; each mock maps them to its own wire format.
 */
export class FakeChatServer {
  private messages: ChatMessage[];
  private readBy: Record<string, string>;
  private listeners = new Set<(event: ChatEvent) => void>();
  private nextId: number;
  private answered = 0;

  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.messages = seedConversation(userId);
    this.nextId = this.messages.length + 1;
    const lastOwn = this.messages.findLast((message) => message.authorId === userId);
    // The user hasn't read the last few messages: the unread divider shows.
    const lastRead = this.messages.at(-4);
    this.readBy = {
      ...(lastRead && { [userId]: lastRead.id }),
      ...(lastOwn && { [CHAT_BOT.id]: lastOwn.id }),
    };
  }

  on(listener: (event: ChatEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  history({ before, limit }: { before?: string; limit: number }): HistoryPage {
    const end = before
      ? this.messages.findIndex((message) => message.id === before)
      : this.messages.length;
    const start = Math.max(0, end - limit);
    return {
      messages: this.messages.slice(start, end),
      hasMore: start > 0,
      readBy: { ...this.readBy },
    };
  }

  /** Idempotent by `clientId` (a retried send returns the stored message). */
  send(draft: MessageDraft): ChatMessage {
    const existing = this.messages.find((message) => message.clientId === draft.clientId);
    if (existing) return existing;
    if (!draft.text.trim()) throw new Error("A message can't be empty");
    const message = this.add({
      clientId: draft.clientId,
      authorId: this.userId,
      text: draft.text.trim(),
      replyToId: draft.replyToId ?? null,
    });
    this.answer(message);
    return message;
  }

  edit(id: string, text: string): ChatMessage {
    const message = this.own(id);
    message.text = text.trim();
    message.editedAt = new Date().toISOString();
    this.emit({ type: "message-updated", message: { ...message } });
    return { ...message };
  }

  remove(id: string) {
    const message = this.own(id);
    message.deleted = true;
    message.text = "";
    this.emit({ type: "message-deleted", id });
  }

  read(messageId: string) {
    if (this.messages.some((message) => message.id === messageId)) {
      this.readBy[this.userId] = messageId;
    }
  }

  private own(id: string): ChatMessage {
    const message = this.messages.find((candidate) => candidate.id === id);
    if (!message) throw new Error("Message not found");
    if (message.authorId !== this.userId) throw new Error("You can only change your own messages");
    return message;
  }

  private add(fields: Pick<ChatMessage, "authorId" | "text"> & Partial<ChatMessage>): ChatMessage {
    const message: ChatMessage = {
      id: `m${this.nextId++}`,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deleted: false,
      replyToId: null,
      clientId: null,
      ...fields,
    };
    this.messages.push(message);
    this.emit({ type: "message", message: { ...message } });
    return message;
  }

  /** Sara reads the message, types for a while, then answers. */
  private answer(message: ChatMessage) {
    setTimeout(() => {
      this.readBy[CHAT_BOT.id] = message.id;
      this.emit({ type: "read", userId: CHAT_BOT.id, messageId: message.id });
    }, BOT_READS_AFTER_MS);
    setTimeout(
      () => this.emit({ type: "typing", userId: CHAT_BOT.id, typing: true }),
      BOT_TYPES_AFTER_MS,
    );
    setTimeout(() => {
      this.add({ authorId: CHAT_BOT.id, text: botReply(this.answered++), replyToId: null });
    }, BOT_ANSWERS_AFTER_MS);
  }

  private emit(event: ChatEvent) {
    for (const listener of this.listeners) listener(event);
  }
}

const servers = new Map<string, FakeChatServer>();

/** One fake conversation per user, kept for the life of the process (or the browser tab). */
export function fakeChatServerFor(userId: string): FakeChatServer {
  let server = servers.get(userId);
  if (!server) {
    server = new FakeChatServer(userId);
    servers.set(userId, server);
  }
  return server;
}
