import type { ChatEvent, ChatMessage } from "@repo/chat/types";
import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { fakeChatServerFor } from "@/features/chat/mock/fake-chat-server";

import type { MockUser } from "./db";

type Helpers = {
  url: (path: string) => string;
  currentUser: (request: Request) => MockUser | undefined;
  unauthorized: () => Response;
};

/** Backend (snake_case) shape of a message. */
const toBackend = (message: ChatMessage) => ({
  id: message.id,
  client_id: message.clientId ?? null,
  author_id: message.authorId,
  text: message.text,
  created_at: message.createdAt,
  edited_at: message.editedAt ?? null,
  deleted: message.deleted ?? false,
  reply_to_id: message.replyToId ?? null,
});

function toBackendEvent(event: ChatEvent) {
  switch (event.type) {
    case "message":
      return { type: "message", message: toBackend(event.message) };
    case "message-updated":
      return { type: "message_updated", message: toBackend(event.message) };
    case "message-deleted":
      return { type: "message_deleted", id: event.id };
    case "typing":
      return { type: "typing", user_id: event.userId, typing: event.typing };
    case "read":
      return { type: "read", user_id: event.userId, message_id: event.messageId };
    case "connection":
    default:
      return null;
  }
}

/** Per user: the fake server and a numbered log of its events (what `/chat/events` polls). */
const logs = new Map<string, { seq: number; events: { seq: number; event: unknown }[] }>();

function roomFor(userId: string) {
  const server = fakeChatServerFor(userId);
  let log = logs.get(userId);
  if (!log) {
    const created = { seq: 0, events: [] as { seq: number; event: unknown }[] };
    server.on((event) => {
      const backend = toBackendEvent(event);
      if (backend) created.events.push({ seq: ++created.seq, event: backend });
      // Keep the log small: pollers only need recent events.
      if (created.events.length > 500) created.events.splice(0, 100);
    });
    logs.set(userId, created);
    log = created;
  }
  return { server, log };
}

const fail = (error: unknown) =>
  HttpResponse.json(
    { message: error instanceof Error ? error.message : "Request failed" },
    { status: 400 },
  );

/** The chat REST API of the demo backend (answers the BFF's upstream requests). */
export function createChatHandlers({ url, currentUser, unauthorized }: Helpers) {
  const withRoom =
    (
      handle: (
        room: ReturnType<typeof roomFor>,
        request: Request,
        params: Record<string, string>,
      ) => Promise<Response>,
    ) =>
    async ({
      request,
      params,
    }: {
      request: Request;
      params: Record<string, string | readonly string[] | undefined>;
    }) => {
      const user = currentUser(request);
      if (!user) return unauthorized();
      const flat = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)]),
      );
      try {
        return await handle(roomFor(String(user.id)), request, flat);
      } catch (error) {
        return fail(error);
      }
    };

  return [
    http.get(
      url(API_ENDPOINTS.chat.messages),
      withRoom(async ({ server }, request) => {
        await delay(400);
        const params = new URL(request.url).searchParams;
        const page = server.history({
          before: params.get("before") ?? undefined,
          limit: Math.min(Number(params.get("limit") ?? 50), 100),
        });
        return HttpResponse.json({
          messages: page.messages.map(toBackend),
          has_more: page.hasMore,
          read_by: page.readBy ?? {},
        });
      }),
    ),
    http.post(
      url(API_ENDPOINTS.chat.messages),
      withRoom(async ({ server }, request) => {
        await delay(250);
        const body = (await request.json()) as {
          client_id: string;
          text: string;
          reply_to_id: string | null;
        };
        const message = server.send({
          clientId: body.client_id,
          text: body.text,
          replyToId: body.reply_to_id,
        });
        return HttpResponse.json(toBackend(message), { status: 201 });
      }),
    ),
    http.patch(
      url(`${API_ENDPOINTS.chat.messages}/:id`),
      withRoom(async ({ server }, request, params) => {
        const body = (await request.json()) as { text: string };
        return HttpResponse.json(toBackend(server.edit(params.id ?? "", body.text)));
      }),
    ),
    http.delete(
      url(`${API_ENDPOINTS.chat.messages}/:id`),
      withRoom(async ({ server }, _request, params) => {
        await delay(300);
        server.remove(params.id ?? "");
        return new HttpResponse(null, { status: 204 });
      }),
    ),
    http.post(
      url(API_ENDPOINTS.chat.read),
      withRoom(async ({ server }, request) => {
        const body = (await request.json()) as { message_id: string };
        server.read(body.message_id);
        return new HttpResponse(null, { status: 204 });
      }),
    ),
    http.post(
      url(API_ENDPOINTS.chat.typing),
      withRoom(async () => new HttpResponse(null, { status: 204 })),
    ),
    http.get(
      url(API_ENDPOINTS.chat.events),
      withRoom(async ({ log }, request) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        const after = cursor === null ? log.seq : Number(cursor);
        return HttpResponse.json({
          events: log.events.filter((entry) => entry.seq > after).map((entry) => entry.event),
          cursor: String(log.seq),
        });
      }),
    ),
  ];
}
