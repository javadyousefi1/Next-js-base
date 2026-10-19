import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { env } from "@/env";

import { db, DEMO_ACCOUNTS, TASK_STATUSES, USER_ROLES, type MockTask, type MockUser } from "./db";

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

/** Server-side validation of a task body (the client validates too). */
function taskBodyError(body: Partial<MockTask>): string | undefined {
  if (typeof body.title !== "string" || body.title.trim().length < 3) return "Title is too short";
  if (body.status && !TASK_STATUSES.includes(body.status)) return "Unknown status";
  return undefined;
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

  // ── Tasks (the data example): list, create, update, delete ──────────────────────────────────
  http.get(url(API_ENDPOINTS.tasks.list), async ({ request }) => {
    if (!currentUser(request)) return unauthorized();
    await delay(RESPONSE_DELAY_MS);

    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.toLowerCase() ?? "";
    const status = params.get("status");
    const sortBy = params.get("sort_by") as keyof MockTask | null;
    const order = params.get("order") === "desc" ? -1 : 1;
    const limit = Number(params.get("limit") ?? 10);
    const skip = Number(params.get("skip") ?? 0);

    let tasks = db.tasks.filter(
      (task) => (!q || task.title.toLowerCase().includes(q)) && (!status || task.status === status),
    );
    if (sortBy && db.tasks[0] && sortBy in db.tasks[0]) {
      tasks = tasks.toSorted((a, b) => {
        const [left, right] = [a[sortBy] ?? "", b[sortBy] ?? ""];
        return left > right ? order : left < right ? -order : 0;
      });
    } else {
      tasks = tasks.toSorted((a, b) => b.id - a.id); // newest first
    }

    return HttpResponse.json({ tasks: tasks.slice(skip, skip + limit), total: tasks.length });
  }),

  http.post(url(API_ENDPOINTS.tasks.list), async ({ request }) => {
    if (!currentUser(request)) return unauthorized();
    await delay(RESPONSE_DELAY_MS);
    const body = (await request.json()) as Partial<MockTask>;
    const invalid = taskBodyError(body);
    if (invalid) return HttpResponse.json({ message: invalid }, { status: 400 });

    const task: MockTask = {
      id: Math.max(0, ...db.tasks.map((item) => item.id)) + 1,
      title: body.title ?? "",
      status: body.status ?? "todo",
      due_date: body.due_date ?? null,
      created_at: new Date().toISOString(),
    };
    db.tasks.push(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch(url(`${API_ENDPOINTS.tasks.list}/:id`), async ({ request, params }) => {
    if (!currentUser(request)) return unauthorized();
    await delay(RESPONSE_DELAY_MS);
    const task = db.tasks.find((item) => item.id === Number(params.id));
    if (!task) return HttpResponse.json({ message: "Task not found" }, { status: 404 });
    const body = (await request.json()) as Partial<MockTask>;
    const invalid = taskBodyError({ ...task, ...body });
    if (invalid) return HttpResponse.json({ message: invalid }, { status: 400 });

    Object.assign(task, {
      title: body.title ?? task.title,
      status: body.status ?? task.status,
      due_date: body.due_date === undefined ? task.due_date : body.due_date,
    });
    return HttpResponse.json(task);
  }),

  http.delete(url(`${API_ENDPOINTS.tasks.list}/:id`), async ({ request, params }) => {
    if (!currentUser(request)) return unauthorized();
    await delay(RESPONSE_DELAY_MS);
    const index = db.tasks.findIndex((item) => item.id === Number(params.id));
    if (index === -1) return HttpResponse.json({ message: "Task not found" }, { status: 404 });
    // A business rule the UI can't know in advance: the confirm modal shows this error.
    if (db.tasks[index]?.status === "doing") {
      return HttpResponse.json(
        { message: "A task in progress cannot be deleted" },
        { status: 422 },
      );
    }
    db.tasks.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
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
