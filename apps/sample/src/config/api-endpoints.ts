/**
 * Upstream API paths (relative to `API_BASE_URL` on the server, or to `/api/proxy` in the
 * browser — the BFF forwards the same path). Never inline an endpoint string elsewhere.
 */
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  users: {
    list: "/users",
  },
  tasks: {
    list: "/tasks",
    detail: (id: number) => `/tasks/${id}`,
  },
  chat: {
    messages: "/chat/messages",
    message: (id: string) => `/chat/messages/${id}`,
    read: "/chat/read",
    typing: "/chat/typing",
    events: "/chat/events",
  },
  stats: "/stats",
} as const;
