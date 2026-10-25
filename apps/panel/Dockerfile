# syntax=docker/dockerfile:1.7
#
# Production image for apps/panel. Build context = repository root:
#   docker build -f apps/panel/Dockerfile -t next-js-base/panel .
#   (or: bun run docker:build → docker compose build)
#
# Stages: prune (turbo) → builder (bun install + next build, both cached) → runner (node, non-root)
# Bun is the package manager/build tool; the production server runs on Node (Next.js standalone).

ARG BUN_VERSION=1.4.2
ARG NODE_VERSION=24
ARG TURBO_VERSION=2.11.6

FROM oven/bun:${BUN_VERSION}-alpine AS bun

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    HUSKY=0

# ── 1. prune: only apps/panel + the workspace packages it depends on ───────────────────────────
FROM base AS prune
ARG TURBO_VERSION
COPY . .
RUN bunx turbo@${TURBO_VERSION} prune panel --docker

# ── 2. builder ──────────────────────────────────────────────────────────────────────────────────
FROM base AS builder
# Dependencies first: this layer stays cached until a package.json or bun.lock changes.
COPY --from=prune /app/out/json/ .
RUN --mount=type=cache,id=bun-install,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts

COPY --from=prune /app/out/full/ .

# NEXT_PUBLIC_* values are inlined into the browser bundle at BUILD time.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3002
# Secrets are not needed to build, so validation is skipped here; src/instrumentation.ts validates
# every variable (NEXT_PUBLIC_* included) when the container starts — a bad value stops it at once.
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    SKIP_ENV_VALIDATION=1

RUN --mount=type=cache,id=next-cache,target=/app/apps/panel/.next/cache \
    --mount=type=cache,id=turbo-cache,target=/app/.turbo/cache \
    node_modules/.bin/turbo run build --filter=panel

# ── 3. runner: minimal Node image with the standalone server ────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3002 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/panel/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/panel/.next/static ./apps/panel/.next/static

USER nextjs
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3002) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "apps/panel/server.js"]
