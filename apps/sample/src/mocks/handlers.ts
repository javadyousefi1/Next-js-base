import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { env } from "@/env";

import { db, DEMO_ACCOUNTS, USER_ROLES, type MockUser } from "./db";

/**
 * MSW handlers that imitate the upstream REST API (DummyJSON-compatible contract).
 * They answer the server-side requests our BFF makes to `API_BASE_URL`.
 */
const url = (path: string) => `${env.API_BASE_URL.replace(/\/$/, "")}${path}`;

const ACCESS_TOKEN_MINUTES = 15;
const REFRESH_TOKEN_MINUTES = 60 * 24 * 7;
const RESPONSE_DELAY_MS = 250;

function issueTokens(userId: number) {
  const accessToken = `at_${crypto.randomUUID()}`;
  const refreshToken = `rt_${crypto.randomUUID()}`;
  db.accessTokens.set(accessToken, {
    userId,
    expiresAt: Date.now() + ACCESS_TOKEN_MINUTES * 60_000,
  });
  db.refreshTokens.set(refreshToken, {
    userId,
    expiresAt: Date.now() + REFRESH_TOKEN_MINUTES * 60_000,
  });
  return { accessToken, refreshToken, expiresInMins: ACCESS_TOKEN_MINUTES };
}

function currentUser(request: Request): MockUser | undefined {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const session = token ? db.accessTokens.get(token) : undefined;
  if (!session || session.expiresAt < Date.now()) return undefined;
  return db.users.find((user) => user.id === session.userId);
}

const unauthorized = () =>
  HttpResponse.json({ message: "Invalid or expired token" }, { status: 401 });

export const handlers = [
  http.post(url(API_ENDPOINTS.auth.login), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const body = (await request.json()) as { username?: string; password?: string };
    const isValid = Object.values(DEMO_ACCOUNTS).some(
      (account) => body.username === account.username && body.password === account.password,
    );
    const user = db.users.find((candidate) => candidate.username === body.username);

    if (!isValid || !user) {
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }
    return HttpResponse.json({ ...user, ...issueTokens(user.id) });
  }),

  http.post(url(API_ENDPOINTS.auth.refresh), async ({ request }) => {
    const { refreshToken } = (await request.json()) as { refreshToken?: string };
    const session = refreshToken ? db.refreshTokens.get(refreshToken) : undefined;

    if (!refreshToken || !session || session.expiresAt < Date.now()) return unauthorized();
    db.refreshTokens.delete(refreshToken); // refresh tokens are single-use (rotation)
    return HttpResponse.json(issueTokens(session.userId));
  }),

  http.get(url(API_ENDPOINTS.auth.me), ({ request }) => {
    const user = currentUser(request);
    return user ? HttpResponse.json(user) : unauthorized();
  }),

  http.get(url(API_ENDPOINTS.users.list), async ({ request }) => {
    const caller = currentUser(request);
    if (!caller) return unauthorized();
    // A real API authorizes too: members may not list users (the UI only hides the page).
    if (caller.role === "user") return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    await delay(RESPONSE_DELAY_MS);

    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.toLowerCase() ?? "";
    const role = params.get("role");
    const sortBy = params.get("sortBy") as keyof MockUser | null;
    const order = params.get("order") === "desc" ? -1 : 1;
    const limit = Number(params.get("limit") ?? 10);
    const skip = Number(params.get("skip") ?? 0);

    let users = db.users.filter(
      (user) =>
        (!q ||
          `${user.firstName} ${user.lastName} ${user.email} ${user.username}`
            .toLowerCase()
            .includes(q)) &&
        (!role || user.role === role),
    );
    if (sortBy && sortBy in db.users[0]!) {
      users = users.toSorted((a, b) =>
        a[sortBy] > b[sortBy] ? order : a[sortBy] < b[sortBy] ? -order : 0,
      );
    }

    return HttpResponse.json({
      users: users.slice(skip, skip + limit),
      total: users.length,
      skip,
      limit,
    });
  }),

  http.get(url(API_ENDPOINTS.stats), async () => {
    await delay(RESPONSE_DELAY_MS);
    const roles = Object.fromEntries(
      USER_ROLES.map((role) => [role, db.users.filter((user) => user.role === role).length]),
    );
    return HttpResponse.json({
      totalUsers: db.users.length,
      roles,
      generatedAt: new Date().toISOString(),
    });
  }),
];
