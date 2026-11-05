import { createPollingTransport } from "@repo/chat/polling-transport";
import type { ChatTransport } from "@repo/chat/types";

import { apiClient } from "@/lib/http/client";

import {
  CHAT_ENDPOINTS,
  chatEventsResponse,
  chatHistoryResponse,
  chatMessageResponse,
  toBackendDraft,
} from "./chat.backend";

const POLL_INTERVAL_MS = 1500;

/**
 * The chat over the REST API (through the BFF proxy): requests are API calls validated with the
 * backend schemas, live changes come from polling `/chat/events`. The chat keeps its own state
 * (`@repo/chat`), so these calls don't go through React Query.
 */
export function createChatRestTransport(): ChatTransport {
  return createPollingTransport(
    {
      history: ({ before, limit }) =>
        apiClient.get(CHAT_ENDPOINTS.messages, {
          params: { before, limit },
          schema: chatHistoryResponse,
        }),
      send: (draft) =>
        apiClient.post(CHAT_ENDPOINTS.messages, toBackendDraft(draft), {
          schema: chatMessageResponse,
        }),
      edit: (id, text) =>
        apiClient.patch(CHAT_ENDPOINTS.message(id), { text }, { schema: chatMessageResponse }),
      remove: async (id) => {
        await apiClient.delete(CHAT_ENDPOINTS.message(id));
      },
      markRead: async (messageId) => {
        await apiClient.post(CHAT_ENDPOINTS.read, { message_id: messageId });
      },
      setTyping: async (typing) => {
        await apiClient.post(CHAT_ENDPOINTS.typing, { typing });
      },
      poll: (cursor) =>
        apiClient.get(CHAT_ENDPOINTS.events, {
          params: { cursor: cursor ?? undefined },
          schema: chatEventsResponse,
        }),
    },
    { intervalMs: POLL_INTERVAL_MS },
  );
}
