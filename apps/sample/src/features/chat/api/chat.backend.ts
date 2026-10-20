import type { ChatEvent, ChatMessage, HistoryPage, MessageDraft } from "@repo/chat/types";
import { z } from "zod";

/**
 * The ONLY file that knows the chat REST API (snake_case, a polled event log). It maps the
 * backend to `@repo/chat`'s types; nothing else in the app sees the backend's shapes.
 */

const backendMessage = z
  .object({
    id: z.string(),
    client_id: z.string().nullable(),
    author_id: z.string(),
    text: z.string(),
    created_at: z.iso.datetime(),
    edited_at: z.iso.datetime().nullable(),
    deleted: z.boolean(),
    reply_to_id: z.string().nullable(),
  })
  .transform((message): ChatMessage => ({
    id: message.id,
    clientId: message.client_id,
    authorId: message.author_id,
    text: message.text,
    createdAt: message.created_at,
    editedAt: message.edited_at,
    deleted: message.deleted,
    replyToId: message.reply_to_id,
  }));

export const chatMessageResponse = backendMessage;

export const chatHistoryResponse = z
  .object({
    messages: z.array(backendMessage),
    has_more: z.boolean(),
    read_by: z.record(z.string(), z.string()),
  })
  .transform((page): HistoryPage => ({
    messages: page.messages,
    hasMore: page.has_more,
    readBy: page.read_by,
  }));

const backendEvent = z.discriminatedUnion("type", [
  z.object({ type: z.literal("message"), message: backendMessage }),
  z.object({ type: z.literal("message_updated"), message: backendMessage }),
  z.object({ type: z.literal("message_deleted"), id: z.string() }),
  z.object({ type: z.literal("typing"), user_id: z.string(), typing: z.boolean() }),
  z.object({ type: z.literal("read"), user_id: z.string(), message_id: z.string() }),
]);

function toChatEvent(event: z.output<typeof backendEvent>): ChatEvent {
  switch (event.type) {
    case "message":
      return { type: "message", message: event.message };
    case "message_updated":
      return { type: "message-updated", message: event.message };
    case "message_deleted":
      return { type: "message-deleted", id: event.id };
    case "typing":
      return { type: "typing", userId: event.user_id, typing: event.typing };
    case "read":
    default:
      return { type: "read", userId: event.user_id, messageId: event.message_id };
  }
}

export const chatEventsResponse = z
  .object({ events: z.array(backendEvent), cursor: z.string() })
  .transform(({ events, cursor }) => ({ events: events.map(toChatEvent), cursor }));

/** Composer draft → request body. */
export function toBackendDraft(draft: MessageDraft) {
  return { client_id: draft.clientId, text: draft.text, reply_to_id: draft.replyToId ?? null };
}
