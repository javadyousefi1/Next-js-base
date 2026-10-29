import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { env } from "@/env";
import { PAGE_INDEX_BASE } from "@/features/users/api/users.backend";

import { db, MOCK_OTP_CODE, type MockUser } from "./db";
import {
  DEFAULT_EXPIRES_IN_DAYS,
  inviteUrlOf,
  mockInviteLinks,
  type MockInviteLink,
} from "./invite-links-data";
import { emptyIdentity, identityResponse, MOCK_CITIES, MOCK_PROVINCES } from "./profile-data";
import { mockListedUsers } from "./users-data";

/**
 * MSW handlers that imitate the back-office API (Authentication + User). They answer the
 * server-side requests our BFF makes to `API_BASE_URL`. Every handler requires the header
 * `back-office: true`, like the real API's back-office mode.
 */
const url = (path: string) => `${env.API_BASE_URL.replace(/\/$/, "")}${path}`;

/** `PUT /User/Update` section types and the keys each section must carry. */
const UPDATE_TYPE_INFO = 1;
const UPDATE_TYPE_IDENTITY = 2;
const INFO_KEYS = ["firstName", "lastName", "phoneNumber", "username", "email"];
const IDENTITY_KEYS = [
  "specialty",
  "bio",
  "licenseNumber",
  "barAssociation",
  "provinceId",
  "cityId",
  "officeAddress",
  "companyName",
  "nationalId",
  "companyNationalId",
  "companyRegistrationNumber",
  "companyRepresentativeName",
];

/** `PUT /User/Identity` `actionType`s and the identity statuses they move to. */
const IDENTITY_REQUEST = 1;
const IDENTITY_VERIFY = 2;
const IDENTITY_REVOKE = 4;
const IDENTITY_REQUESTED = 1;
const IDENTITY_VERIFIED = 3;
/** verify → Verified (3), reject → Rejected (4), revoke → Revoked (5). */
const IDENTITY_REVIEW_STATUS: Record<number, number> = { 2: 3, 3: 4, 4: 5 };

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
      email: null,
      username: null,
      avatarUrl: null,
      identity: null,
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
    const query = new URL(request.url).searchParams;
    const includeIdentity = query.get("includeIdentity") === "true";

    // `userId`: another user of the back-office list (the identity review).
    const userId = query.get("userId");
    if (userId) {
      const listed = mockListedUsers.find((candidate) => candidate.id === userId);
      if (!listed) return problem(404, "کاربر پیدا نشد.", "User.NotFound");
      const [firstName = "", ...rest] = listed.fullName.split(" ");
      return HttpResponse.json({
        info: {
          id: listed.id,
          fullName: listed.fullName,
          firstName,
          lastName: rest.join(" "),
          phoneNumber: listed.phoneNumber,
          isPhoneNumberVerified: listed.isPhoneNumberVerified,
          email: listed.email,
          username: listed.username,
          isActive: listed.isActive,
          avatarUrl: listed.avatarUrl,
          roles: listed.roles,
        },
        identity: includeIdentity && listed.identity ? identityResponse(listed.identity) : null,
      });
    }

    return HttpResponse.json({
      info: {
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isPhoneNumberVerified: user.isPhoneNumberVerified,
        email: user.email,
        username: user.username,
        isActive: true,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
      },
      // The identity only comes with `includeIdentity=true`.
      identity: includeIdentity && user.identity ? identityResponse(user.identity) : null,
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

  http.get(url(API_ENDPOINTS.users.inviteLinks), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!userOf(token)) return new HttpResponse(null, { status: 401 });

    const query = new URL(request.url).searchParams;
    const isUsed = query.get("IsUsed");
    const pageIndex = Number(query.get("PageIndex") ?? PAGE_INDEX_BASE);
    const pageSize = Number(query.get("PageSize") ?? 10);

    const matches = mockInviteLinks.filter(
      (link) => isUsed === null || (link.usedAt !== null) === (isUsed === "true"),
    );
    const start = (pageIndex - PAGE_INDEX_BASE) * pageSize;

    return HttpResponse.json({
      items: matches.slice(start, start + pageSize),
      totalCount: matches.length,
    });
  }),

  http.post(url(API_ENDPOINTS.users.createInviteLink), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!userOf(token)) return new HttpResponse(null, { status: 401 });

    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      expiresInDays?: number | null;
    };
    if (!body.firstName || !body.lastName || !body.phoneNumber) {
      return problem(400, "نام، نام خانوادگی و شماره موبایل الزامی است.", "InviteLink.Invalid");
    }
    // One valid (unused, not expired) link per phone number.
    const hasValidLink = mockInviteLinks.some(
      (link) => link.phoneNumber === body.phoneNumber && link.isValid && link.usedAt === null,
    );
    if (hasValidLink) {
      return problem(409, "برای این شماره یک لینک دعوت فعال وجود دارد.", "InviteLink.Conflict");
    }

    const days = body.expiresInDays ?? DEFAULT_EXPIRES_IN_DAYS;
    const newToken = crypto.randomUUID().replaceAll("-", "");
    const now = new Date();
    const link: MockInviteLink = {
      id: crypto.randomUUID(),
      token: newToken,
      inviteUrl: inviteUrlOf(newToken),
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      expiresAt: new Date(now.getTime() + days * 86_400_000).toISOString(),
      usedAt: null,
      usedByUserId: null,
      isValid: true,
      createdAt: now.toISOString(),
    };
    mockInviteLinks.unshift(link);

    return HttpResponse.json({
      id: link.id,
      token: link.token,
      inviteUrl: link.inviteUrl,
      expiresAt: link.expiresAt,
      firstName: link.firstName,
      lastName: link.lastName,
      phoneNumber: link.phoneNumber,
    });
  }),

  http.put(url(API_ENDPOINTS.users.update), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const user = userOf(request.headers.get("authorization")?.replace("Bearer ", ""));
    if (!user) return new HttpResponse(null, { status: 401 });

    const body = (await request.json()) as {
      type?: number;
      info?: Record<string, string | null> | null;
      identity?: Record<string, unknown> | null;
    };

    if (body.type === UPDATE_TYPE_INFO) {
      const info = body.info;
      if (!info || INFO_KEYS.some((key) => !(key in info))) {
        return problem(400, "همه فیلدهای اطلاعات پایه باید ارسال شوند.", "User.Invalid");
      }
      if (!info.firstName || !info.lastName || !info.phoneNumber) {
        return problem(400, "نام، نام خانوادگی و شماره موبایل الزامی است.", "User.Invalid");
      }
      const taken = findByPhone(info.phoneNumber);
      if (taken && taken.id !== user.id) {
        return problem(409, "این شماره موبایل قبلاً ثبت شده است.", "User.Conflict");
      }
      user.firstName = info.firstName;
      user.lastName = info.lastName;
      user.phoneNumber = info.phoneNumber;
      user.username = info.username ?? null;
      user.email = info.email ?? null;
      return new HttpResponse(null, { status: 204 });
    }

    if (body.type === UPDATE_TYPE_IDENTITY) {
      const identity = body.identity;
      if (!identity || IDENTITY_KEYS.some((key) => !(key in identity))) {
        return problem(400, "همه فیلدهای اطلاعات هویتی باید ارسال شوند.", "User.Invalid");
      }
      // The mock keeps the status and the documents; the office address is not stored.
      const { officeAddress: _officeAddress, ...fields } = identity;
      user.identity = { ...(user.identity ?? emptyIdentity()), ...fields };
      return new HttpResponse(null, { status: 204 });
    }

    return problem(400, "نوع به‌روزرسانی معتبر نیست.", "User.Invalid");
  }),

  http.put(url(API_ENDPOINTS.users.identity), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const caller = userOf(request.headers.get("authorization")?.replace("Bearer ", ""));
    if (!caller) return new HttpResponse(null, { status: 401 });

    const body = (await request.json()) as {
      actionType?: number;
      userId?: string;
      message?: string;
    };
    const now = new Date().toISOString();

    // Request: the signed-in user asks for verification (`userId` is ignored).
    if (body.actionType === IDENTITY_REQUEST) {
      const status = caller.identity?.statusType ?? 0;
      if (status === IDENTITY_REQUESTED || status === IDENTITY_VERIFIED) {
        return problem(
          400,
          "درخواست احراز هویت در این وضعیت ممکن نیست.",
          "UserErrors.InvalidIdentityAction",
        );
      }
      const identity = caller.identity;
      const isComplete =
        identity !== null &&
        Boolean(identity.nationalId) &&
        Boolean(identity.specialty) &&
        identity.documents.length > 0;
      if (!identity || !isComplete) {
        return problem(400, "پروفایل کاربر کامل نیست.", "UserErrors.ProfileNotComplete");
      }
      identity.statusType = IDENTITY_REQUESTED;
      identity.requestedAt = now;
      identity.message = null;
      return new HttpResponse(null, { status: 204 });
    }

    // Verify / reject / revoke: super-admin only, on a user of the back-office list.
    const target = IDENTITY_REVIEW_STATUS[body.actionType ?? 0];
    if (target === undefined) {
      return problem(400, "عملیات معتبر نیست.", "UserErrors.InvalidIdentityAction");
    }
    if (!caller.roles.includes("super-admin")) {
      return problem(403, "دسترسی لازم را ندارید.", "Auth.Forbidden");
    }
    const user = mockListedUsers.find((candidate) => candidate.id === body.userId);
    if (!user) return problem(404, "کاربر پیدا نشد.", "User.NotFound");

    const status = user.identity?.statusType ?? 0;
    const isRevoke = body.actionType === IDENTITY_REVOKE;
    if (isRevoke ? status !== IDENTITY_VERIFIED : status !== IDENTITY_REQUESTED) {
      return problem(
        400,
        isRevoke
          ? "فقط احراز هویت تأییدشده قابل ابطال است."
          : "این درخواست دیگر در انتظار بررسی نیست.",
        isRevoke ? "UserErrors.InvalidIdentityAction" : "UserErrors.IdentityNotInRequestedState",
      );
    }
    const needsMessage = body.actionType !== IDENTITY_VERIFY;
    if (needsMessage && !body.message?.trim()) {
      return problem(400, "دلیل الزامی است.", "UserErrors.InvalidIdentityAction");
    }
    if (!user.identity) return problem(404, "هویت کاربر پیدا نشد.", "User.NotFound");
    user.identity.statusType = target;
    user.identity.verifiedAt = now;
    user.identity.message = needsMessage ? (body.message?.trim() ?? null) : null;
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(url(API_ENDPOINTS.users.upload), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    const user = userOf(request.headers.get("authorization")?.replace("Bearer ", ""));
    if (!user) return new HttpResponse(null, { status: 401 });

    const form = await request.formData();
    const uploadType = form.get("uploadType");
    const fieldType = form.get("fieldType");
    const file = form.get("file");
    const originalFileName = form.get("originalFileName");

    if (uploadType === "1") {
      // No file: the avatar is deleted. Otherwise it is kept as a data URL.
      if (file instanceof File) {
        const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
        user.avatarUrl = `data:${file.type};base64,${bytes}`;
      } else {
        user.avatarUrl = null;
      }
      return new HttpResponse(null, { status: 204 });
    }

    if (uploadType === "2" && file instanceof File && typeof fieldType === "string") {
      if (fieldType !== "licenseFile" && fieldType !== "documents") {
        return problem(400, "نوع مدرک معتبر نیست.", "Upload.Invalid");
      }
      const identity = user.identity ?? emptyIdentity();
      user.identity = identity;
      identity.documents.push({
        fieldType,
        name: typeof originalFileName === "string" ? originalFileName : file.name,
        url: `https://example.com/documents/${encodeURIComponent(file.name)}`,
      });
      return new HttpResponse(null, { status: 204 });
    }

    return problem(400, "درخواست بارگذاری معتبر نیست.", "Upload.Invalid");
  }),

  http.get(url(API_ENDPOINTS.baseInfo.enums), async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);
    const rejected = missingBackOffice(request);
    if (rejected) return rejected;

    if (!userOf(request.headers.get("authorization")?.replace("Bearer ", ""))) {
      return new HttpResponse(null, { status: 401 });
    }

    const query = new URL(request.url).searchParams;
    if (query.get("type") === "1") return HttpResponse.json(MOCK_PROVINCES);
    if (query.get("type") === "2") {
      const parentId = Number(query.get("parentId"));
      if (!query.get("parentId") || Number.isNaN(parentId)) {
        return problem(400, "شناسه استان الزامی است.", "BaseInfo.Invalid");
      }
      return HttpResponse.json(MOCK_CITIES[parentId] ?? []);
    }
    return problem(400, "نوع معتبر نیست.", "BaseInfo.Invalid");
  }),
];
