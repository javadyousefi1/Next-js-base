---
name: add-env-var
description: Add or change an environment variable everywhere it must be declared (zod env schema, .env.example, turbo.json strict env, docker-compose/Dockerfile, docs). Use whenever code needs a new config value or secret.
---

# Add an environment variable

1. **Decide the side** — secret or server-only → `apps/admin/src/env/server.ts`; needed in the
   browser → `NEXT_PUBLIC_<NAME>` in `apps/admin/src/env/client.ts` (inlined at BUILD time, so it
   is public and changing it needs a rebuild). Say so if the user wants a secret in the browser.
2. **Schema** — zod type with the strictest correct validation (`z.url()`, `z.enum([...])`,
   `z.coerce.number().int().positive()`, `z.stringbool()`); `.default()` only for real defaults.
   Client vars must also be listed in `runtimeEnv`.
3. **`.env.example`** — add the key with a one-line comment (no real secret).
4. **`turbo.json`** — strict env mode: add to `tasks.build.env` if it changes the build output
   (all `NEXT_PUBLIC_*` already match), otherwise to `passThroughEnv`; same for `test:e2e` if the
   tests need it.
5. **Docker** — runtime value in `docker-compose.yml` `environment:`; build-time (`NEXT_PUBLIC_*`)
   as `ARG` + `ENV` in `apps/admin/Dockerfile` and `build.args` in compose.
6. **Use it** — `import { serverEnv } from "@/env/server"` (server code only) or `clientEnv`.
   Never `process.env` (lint: `project/no-process-env`).
7. **Verify** — remove it from `.env.local` and confirm `bun run build` fails with a clear error,
   then restore it.
