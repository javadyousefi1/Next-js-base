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
  stats: "/stats",
} as const;
