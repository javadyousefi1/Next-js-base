#!/usr/bin/env bash
# Builds ONE app's Docker image for the server (linux/amd64) and saves it as a .tar.gz.
#
#   bun run docker:image              → first asks which project (apps with a Dockerfile)
#   bun run docker:image golden_pen   → no question
#   PLATFORM=linux/arm64 bun run docker:image   → for an ARM server
#
# Output: docker-images/<app>_<date>_<os>-<arch>.tar.gz (git- and docker-ignored).
# NEXT_PUBLIC_* build values come from apps/<app>/.env.production when it exists.

set -eo pipefail
cd "$(dirname "$0")/.."

PLATFORM="${PLATFORM:-linux/amd64}"
OUT_DIR="docker-images"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  echo "❌ ERROR: $1"
  exit 1
}

# ── Which project ────────────────────────────────────────────────────────────────────────────────
APPS=()
for dockerfile in apps/*/Dockerfile; do
  [ -f "$dockerfile" ] && APPS+=("$(basename "$(dirname "$dockerfile")")")
done
[ ${#APPS[@]} -gt 0 ] || error "No app has a Dockerfile (apps/<name>/Dockerfile)"

APP="${1:-}"
if [ -z "$APP" ]; then
  echo "Which project do you want to build?"
  PS3="Number: "
  select choice in "${APPS[@]}"; do
    [ -n "$choice" ] && APP="$choice" && break
    echo "Pick a number from the list."
  done
fi
[ -f "apps/$APP/Dockerfile" ] || error "Unknown project '$APP'. Projects: ${APPS[*]}"

IMAGE_NAME="$APP"
IMAGE_TAG="latest"
OUTPUT_NAME="$OUT_DIR/${APP}_$(date '+%Y%m%d-%H%M')_${PLATFORM//\//-}.tar.gz"

log "🚀 Starting build & export process for: $APP"

# Check docker
if ! command -v docker >/dev/null 2>&1; then
  error "Docker is not installed or not in PATH"
fi
docker info >/dev/null 2>&1 || error "Docker is not running"

# Show system arch
ARCH=$(uname -m)
log "🖥️  Detected system architecture: $ARCH"

# NEXT_PUBLIC_* values are baked into the browser code at build time
BUILD_ARGS=()
ENV_FILE="apps/$APP/.env.production"
while IFS='=' read -r name default; do
  value=""
  [ -f "$ENV_FILE" ] && value="$(sed -n "s/^$name=//p" "$ENV_FILE" | tail -n 1)"
  value="${value:-$default}"
  log "🔧 $name=$value"
  BUILD_ARGS+=(--build-arg "$name=$value")
done < <(sed -n 's/^ARG \(NEXT_PUBLIC_[A-Z0-9_]*\)=\(.*\)$/\1=\2/p' "apps/$APP/Dockerfile")
[ -f "$ENV_FILE" ] || log "⚠️  $ENV_FILE not found: using the Dockerfile defaults"

# Build image (build context = repo root: the Dockerfile prunes the monorepo itself)
log "🐳 Building Docker image for platform: $PLATFORM"
log "📦 Image: ${IMAGE_NAME}:${IMAGE_TAG}"

docker buildx build \
  --platform "$PLATFORM" \
  -f "apps/$APP/Dockerfile" \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  ${BUILD_ARGS[@]+"${BUILD_ARGS[@]}"} \
  --load \
  . || error "Docker build failed"

log "✅ Build finished successfully"

# Check image exists
docker image inspect "${IMAGE_NAME}:${IMAGE_TAG}" >/dev/null 2>&1 || error "Image was not found after build"

# Export + compress
mkdir -p "$OUT_DIR"
log "💾 Saving and compressing image to $OUTPUT_NAME"
docker save "${IMAGE_NAME}:${IMAGE_TAG}" | gzip >"$OUTPUT_NAME" || error "docker save failed"

# Final check
[ -s "$OUTPUT_NAME" ] || error "Output file not found after compression"

FILE_SIZE=$(du -h "$OUTPUT_NAME" | cut -f1)
PORT=$(sed -n 's/^EXPOSE \([0-9]*\).*/\1/p' "apps/$APP/Dockerfile" | head -n 1)

log "🎉 Done!"
log "📁 Output file: $(pwd)/${OUTPUT_NAME}"
log "📏 File size: ${FILE_SIZE}"
log "➡️  Copy these two files to the same folder on your server:"
log "    $(pwd)/${OUTPUT_NAME}"
if [ -f "$ENV_FILE" ]; then
  log "    $(pwd)/${ENV_FILE}   (runtime variables)"
else
  log "    a .env.production with the runtime variables (see apps/$APP/.env.example)"
fi
log "➡️  Then, in that folder on the server, run:"
log "    docker load < $(basename "$OUTPUT_NAME")"
log "    docker rm -f $APP 2>/dev/null || true"
log "    docker run -d --name $APP --restart unless-stopped -p ${PORT:-3000}:${PORT:-3000} --env-file .env.production ${IMAGE_NAME}:${IMAGE_TAG}"
