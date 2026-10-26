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

## Mocks (`API_MOCKING=enabled`, the default in `.env.example`)

MSW in `src/mocks` imitates the API and requires the `back-office: true` header. Admin
`09120000000` / `admin123`; the SMS code of every phone is `123456`; a registered phone is stored
unverified until its code is verified. Set `API_MOCKING=disabled` to use the real API.

## Tests

Unit: `bun test` (`*.test.ts` next to the code). E2E: `e2e/*.spec.ts` (Playwright against
`next start` + MSW, Persian labels, plain URLs like `/login`). Skill: `write-e2e-test`.

## Deploy

`bun run docker:image golden_pen` (repo root) builds the image for `linux/amd64` and saves it to
`docker-images/`; it prints the `scp` / `docker load` / `docker run` commands for the server.
