"use client";

import type { ChatTransport } from "@repo/chat/types";
import { createWebSocketTransport } from "@repo/chat/websocket-transport";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

import { createChatRestTransport } from "../api/chat-rest-transport";
import { MockChatSocket } from "../mock/mock-chat-socket";

const BACKENDS = ["api", "socket"] as const;
export type ChatBackend = (typeof BACKENDS)[number];

/**
 * Which backend the chat talks to. The chat itself only knows `ChatTransport`: swapping REST
 * polling for a WebSocket is this one choice (a real app: `() => new WebSocket(url)`).
 */
export function useChatExample() {
  const t = useTranslations("Examples.chat");
  const { user } = useCurrentUser();
  const [backend, setBackend] = useState<ChatBackend>("api");
  const currentUserId = user ? String(user.id) : null;

  const transport = useMemo((): ChatTransport | null => {
    if (currentUserId === null) return null;
    if (backend === "api") return createChatRestTransport();
    return createWebSocketTransport({ createSocket: () => new MockChatSocket(currentUserId) });
  }, [backend, currentUserId]);

  return {
    backends: BACKENDS.map((value) => ({ value, label: t(value) })),
    backend,
    /** ToggleGroup values are arrays; unselecting keeps the current backend. */
    selectBackend: (values: string[]) => {
      const next = BACKENDS.find((value) => value === values[0]);
      if (next) setBackend(next);
    },
    transport,
    currentUserId,
  };
}
