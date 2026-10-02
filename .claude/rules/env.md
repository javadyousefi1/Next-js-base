---
paths:
  - "apps/*/src/env/**"
  - "apps/*/.env.example"
  - "turbo.json"
  - "docker-compose.yml"
  - "apps/*/Dockerfile"
---

# Environment variables

- Server-only → `src/env/server.ts`; browser (`NEXT_PUBLIC_*`, inlined at BUILD time) →
  `src/env/client.ts`. Validate with zod; required unless a real default exists.
- Every variable also goes to: `.env.example` (with a comment), `turbo.json` (`env` if it changes
  build output, else `passThroughEnv` — strict env mode drops undeclared vars), and
  `docker-compose.yml` / Dockerfile `ARG` when the container needs it.
- Never commit real values. `.env.local` is ignored by git and unreadable for Claude.
