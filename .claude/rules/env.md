---
paths:
  - "apps/*/src/env.ts"
  - "apps/*/.env.example"
  - "turbo.json"
  - "docker-compose.yml"
  - "apps/*/Dockerfile"
---

# Environment variables

- One file, `src/env.ts`, one `createEnv`: secrets/server-only → `server` object; browser →
  `client` object (`NEXT_PUBLIC_*`, inlined at BUILD time, also listed in
  `experimental__runtimeEnv`). Validate with zod; required unless a real default exists.
- Read values as `env.X` (`import { env } from "@/env"`). A server value read in the browser
  throws. No other exports in `env.ts` — derived values live where they are used.
- Every variable also goes to: `.env.example` (with a comment), `turbo.json` (`env` if it changes
  build output, else `passThroughEnv` — strict env mode drops undeclared vars), and
  `docker-compose.yml` / Dockerfile `ARG` when the container needs it.
- Never commit real values. `.env.local` is ignored by git and unreadable for Claude.
