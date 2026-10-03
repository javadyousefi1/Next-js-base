---
name: add-env-var
description: Add or change an environment variable everywhere it must be declared (zod env schema, .env.example, turbo.json strict env, docker-compose/Dockerfile, docs). Use whenever code needs a new config value or secret.
---

# Add an environment variable

1. **Decide the side** — in `apps/admin/src/env.ts`: secret or server-only → the `server` object;
   needed in the browser → `NEXT_PUBLIC_<NAME>` in the `client` object (inlined at BUILD time, so
   it is public and changing it needs a rebuild). Say so if the user wants a secret in the browser.
2. **Schema** — zod type with the strictest correct validation (`z.url()`, `z.enum([...])`,
   `z.coerce.number().int().positive()`, `z.stringbool()`); `.default()` only for real defaults.
   Client vars must also be listed in `experimental__runtimeEnv`.
3. **`.env.example`** — add the key with a one-line comment (no real secret).
4. **`turbo.json`** — strict env mode: add to `tasks.build.env` if it changes the build output
   (all `NEXT_PUBLIC_*` already match), otherwise to `passThroughEnv`; same for `test:e2e` if the
   tests need it.
5. **Docker** — runtime value in `docker-compose.yml` `environment:`; build-time (`NEXT_PUBLIC_*`)
   as `ARG` + `ENV` in `apps/admin/Dockerfile` and `build.args` in compose.
6. **Use it** — `import { env } from "@/env"`, then `env.<NAME>` (a server variable read in the
   browser throws). Never `process.env` (lint: `project/no-process-env`).
7. **Verify** — remove it from `.env.local` and confirm `bun run build` fails with a clear error,
   then restore it.
