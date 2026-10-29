import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { env } from "@/env";
import { PAGE_INDEX_BASE } from "@/features/users/api/users.backend";

import { db, MOCK_OTP_CODE, type MockUser } from "./db";
import { mockListedUsers } from "./users-data";

/**
 * MSW handlers that imitate the back-office API (Authentication + User). They answer the
 * server-side requests our BFF makes to `API_BASE_URL`. Every handler requires the header
 * `back-office: true`, like the real API's back-office mode.
 */
const url = (path: string) => `${env.API_BASE_URL.replace(/\/$/, "")}${path}`;

const TOKEN_HOURS = 24;
const RESPONSE_DELAY_MS = 150;

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

/** An unsigned, JWT-shaped token: `header.payload.signature` (base64url), payload `{ sub, exp }`. */
function issueToken(user: MockUser) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_HOURS * 3600;
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ sub: user.id, exp })}.mock`;
}

function userOf(token: string | undefined): MockUser | undefined {
  try {
    const payload = JSON.parse(Buffer.from(token?.split(".")[1] ?? "", "base64url").toString());
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return undefined;
    return db.users.find((user) => user.id === payload.sub);
  } catch {
    return undefined;
  }
}

const findByPhone = (phoneNumber: unknown) =>
  db.users.find((user) => user.phoneNumber === phoneNumber);

/** The backend's error body (`ProblemDetails`). */
const problem = (status: number, detail: string, code: string) =>
  HttpResponse.json(
    { title: detail, status, detail, errors: [{ code, message: detail }] },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );

const missingBackOffice = (request: Request) =>
  request.headers.get("back-office") === "true"
    ? undefined
    : problem(400, "The back-office header is missing", "BackOffice.Missing");

export const handlers = [
  http.post(url(API_ENDPOINTS.auth.login), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const body = (await request.json()) as { phoneNumber?: string; password?: string | null };
    const user = findByPhone(body.phoneNumber);
    if (!user) return problem(404, "User not found", "User.NotFound");

    // `password: null` → the backend sends an SMS code (the mock "sends" MOCK_OTP_CODE).
    if (body.password === null) return HttpResponse.json({ token: "" });

    if (user.password === null || user.password !== body.password) {
      return problem(400, "Invalid phone number or password", "Auth.InvalidCredentials");
    }
    return HttpResponse.json({ token: issueToken(user) });
  }),

  http.post(url(API_ENDPOINTS.auth.register), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      roleId?: number;
    };
    if (!body.firstName || !body.lastName || !body.phone || body.roleId === undefined) {
      return problem(400, "Invalid registration", "Register.Invalid");
    }
    if (findByPhone(body.phone)) return problem(409, "Phone number is taken", "User.Conflict");

    db.users.push({
      id: crypto.randomUUID(),
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phone,
      password: null,
      isPhoneNumberVerified: false,
      roles: ["User"],
    });
    return HttpResponse.json({});
  }),

  http.post(url(API_ENDPOINTS.auth.verifyOtp), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const body = (await request.json()) as { phoneNumber?: string; code?: string };
    const user = findByPhone(body.phoneNumber);
    if (!user) return problem(404, "User not found", "User.NotFound");
    if (body.code !== MOCK_OTP_CODE) return problem(400, "The code is wrong", "Otp.Invalid");

    user.isPhoneNumberVerified = true;
    return HttpResponse.json({ token: issueToken(user) });
  }),

  http.put(url(API_ENDPOINTS.auth.resendOtp), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const body = (await request.json()) as { phoneNumber?: string };
    if (!findByPhone(body.phoneNumber)) return problem(404, "User not found", "User.NotFound");
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(url(API_ENDPOINTS.users.me), ({ request }) => {
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const user = userOf(request.headers.get("authorization")?.replace("Bearer ", ""));
    if (!user) return new HttpResponse(null, { status: 401 });

    return HttpResponse.json({
      info: {
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isPhoneNumberVerified: user.isPhoneNumberVerified,
        email: null,
        username: null,
        isActive: true,
        avatarUrl: null,
        roles: user.roles,
      },
      identity: null,
    });
  }),

  http.get(url(API_ENDPOINTS.users.list), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!userOf(token)) return new HttpResponse(null, { status: 401 });

    const query = new URL(request.url).searchParams;
    const fullName = query.get("FullName");
    const phoneNumber = query.get("PhoneNumber");
    const role = query.get("Role");
    const identityStatus = query.get("IdentityStatus");
    const includeIdentity = query.get("IncludeIdentity") === "true";
    const pageIndex = Number(query.get("PageIndex") ?? PAGE_INDEX_BASE);
    const pageSize = Number(query.get("PageSize") ?? 10);

    const matches = mockListedUsers.filter(
      (user) =>
        (!fullName || user.fullName.includes(fullName)) &&
        (!phoneNumber || user.phoneNumber.includes(phoneNumber)) &&
        (!role || user.roles.includes(role)) &&
        (identityStatus === null ||
          (user.identity !== null && user.identity.statusType === Number(identityStatus))),
    );
    const start = (pageIndex - PAGE_INDEX_BASE) * pageSize;
    const items = matches
      .slice(start, start + pageSize)
      .map((user) => ({ ...user, identity: includeIdentity ? user.identity : null }));

    return HttpResponse.json({ items, totalCount: matches.length });
  }),
];
