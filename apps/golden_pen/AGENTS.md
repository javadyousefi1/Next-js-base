# apps/golden_pen — AGENTS.md

Golden Pen, the admin panel: a lean copy of `apps/sample` (same structure, rules and tooling) with phone-number
auth against the back-office API. **Copy patterns from `apps/sample`** (names, folders, comments);
repository rules: [`../../AGENTS.md`](../../AGENTS.md), app conventions:
[`../sample/AGENTS.md`](../sample/AGENTS.md). It has no examples, tables, chat, PWA, Redis or
access control (yet). Dev/start port **3002**.

**Persian only** (RTL, `messages/fa.json`): one locale, no URL prefix (`/settings`; next-intl
rewrites to `[locale]` internally), no language switcher. Don't add English strings.

## Back-office API

- Every upstream request sends the header `back-office: true` (`backOfficeHeader` in
  `features/auth/api/auth.backend.ts`, applied in `src/server/http/upstream.ts`).
- `features/auth/api/auth.backend.ts` is the ONLY file that knows the backend's auth contract
  (swagger: `/Authentication/*`, `/User/Get`). Endpoint paths: `src/config/api-endpoints.ts`.
- `REGISTER_ROLE_ID` (the role of a new user) is a guess: confirm it with the backend.

## Auth (BFF + one httpOnly cookie)

```
password: POST /api/auth/login        → Login {phoneNumber, password} → {token} → GET /User/Get → cookie
otp:      POST /api/auth/otp/send     → Login {phoneNumber, password: null} (backend SMSes a code)
          POST /api/auth/otp/verify   → VerifyOtp {phoneNumber, code} → {token} → GET /User/Get → cookie
          POST /api/auth/otp/resend   → ResendOtp {phoneNumber}   (60 s cooldown in the UI)
register: POST /api/auth/register     → Register {firstName, lastName, phone, roleId} → code → otp/verify
logout:   POST /api/auth/logout       → clears the cookie
```

- One JWT, no refresh token, no logout endpoint upstream: the session ends when the JWT expires
  (cookie `maxAge` from its `exp`, else `AUTH_TOKEN_TTL_SECONDS`) or on any upstream 401.
- `/api/proxy/*` adds the Bearer token; the token-issuing endpoints are blocked there.
- No rate limiting here: the backend is expected to throttle SMS.

## Mocks (`API_MOCKING=enabled`: e2e tests and demos; `.env.example` uses the real API)

MSW in `src/mocks` imitates the API and requires the `back-office: true` header. Admin
`09120000000` / `admin123`; the SMS code of every phone is `123456`; a registered phone is stored
unverified until its code is verified.

## Users table

`/users`: `GET /User/GetAll` (`features/users`, `users.backend.ts` is the only file that knows the API).
The toolbar search is `FullName`; the Filters drawer has `PhoneNumber`, `Role` (`USER_ROLES`, ids 1-4,
sent as the role name) and `IdentityStatus` (0-5); `IncludeIdentity=true` is always sent; no sorting.
`PAGE_INDEX_BASE` (`users.backend.ts`, now 1) is a guess: set 0 if the API's `PageIndex` is 0-based.

## Invite links

`/invite-links`: `GET /User/InviteLink/GetAll` (`IsUsed` filter, paging; no search, no sorting, so the
toolbar hides the search box) and `POST /User/InviteLink/Create` (`features/invite-links`,
`invite-links.backend.ts` is the only file that knows the API; `PAGE_INDEX_BASE` comes from users).
Create: the page-header button opens a `modal.open` form (first/last name, phone, optional
`expiresInDays`; empty = the server's default); on success the modal stays open and shows the
`inviteUrl` with a copy button, and the list is invalidated. 400/409 show the server's message.
Status is derived in the mapper: used, else expired (`!isValid`), else active.

Sidebar: one collapsible item "مدیریت کاربران" (`NavParent` in `config/navigation.ts`) holds
کاربران and لینک دعوت; `features/shell/nav-active.ts` marks it active/open when a child is current.

## Profile

`/profile` (user menu → «پروفایل»; no sidebar item): `features/profile`, `profile.backend.ts` is the only
file that knows the API. Read: `GET /User/Get?includeIdentity=true` (own query key, separate from the
session). Write: `PUT /User/Update` through the proxy: `type` 1 = info, 2 = identity (every key of the
section is sent, nullable; the other section is `null`; the response does not return the office address,
so that form part starts empty). Upload: `POST /User/Upload` is multipart, so it goes through its own BFF
route `/api/upload` (`API_ROUTES.upload`; `validateUploadForm` checks `uploadType` 1 = avatar / 2 =
identity document with `fieldType` `licenseFile` | `documents`, type JPEG/PNG(+WebP/PDF for documents),
5 MB). An avatar upload without a file deletes the avatar. Province/city selects: `features/base-info`
(`GET /base-info/enums`: `type=1` provinces, `type=2&parentId=` cities). The identity status label is
`useIdentityStatusLabel` (users feature).

## Tests

Unit: `bun test` (`*.test.ts` next to the code). E2E: `e2e/*.spec.ts` (Playwright against
`next start` + MSW, Persian labels, plain URLs like `/login`). Skill: `write-e2e-test`.

## Deploy

`bun run docker:image` (repo root) first asks for the app, builds its image for `linux/amd64` and
saves it to `docker-images/`; it prints the `scp` / `docker load` / `docker run` commands for the
server. Production `NEXT_PUBLIC_*` values (baked in at build time) go in `.env.production` here.
