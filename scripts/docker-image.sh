#!/usr/bin/env bash
# Builds the production Docker image of ONE app and saves it as a file you can copy to a server.
#
#   bun run docker:image               → asks which app (only apps with a Dockerfile are listed)
#   bun run docker:image golden_pen    → no question
#   PLATFORM=linux/arm64 bun run docker:image   → for an ARM server (default: linux/amd64)
#
# Output: docker-images/<app>_<date>_<commit>_<os>-<arch>.tar.gz (git- and docker-ignored).
# On the server: `docker load -i <file>` — the script prints the exact commands at the end.
set -euo pipefail
cd "$(dirname "$0")/.."

# Ubuntu servers are almost always x86-64. The image must match the SERVER, not this machine
# (an image built on an Apple Silicon Mac is arm64 unless told otherwise).
PLATFORM="${PLATFORM:-linux/amd64}"
OUT_DIR="docker-images"
IMAGE_PREFIX="next-js-base"

fail() {
  echo "✖ $*" >&2
  exit 1
}

command -v docker >/dev/null || fail "Docker is not installed."
docker info >/dev/null 2>&1 || fail "Docker is not running. Start Docker and try again."
docker buildx version >/dev/null 2>&1 || fail "docker buildx is missing (it ships with Docker Desktop / docker-buildx-plugin)."

# ── 1. which app ────────────────────────────────────────────────────────────────────────────────
apps=()
for dockerfile in apps/*/Dockerfile; do
  [[ -f "$dockerfile" ]] && apps+=("$(basename "$(dirname "$dockerfile")")")
done
((${#apps[@]})) || fail "No app has a Dockerfile (apps/<name>/Dockerfile)."

app="${1:-}"
if [[ -z "$app" ]]; then
  echo "Which app do you want an image for?"
  PS3="Number: "
  select choice in "${apps[@]}"; do
    [[ -n "$choice" ]] && app="$choice" && break
    echo "Pick a number from the list."
  done
fi
[[ -f "apps/$app/Dockerfile" ]] || fail "Unknown app '$app'. Apps with a Dockerfile: ${apps[*]}"
dockerfile="apps/$app/Dockerfile"

# ── 2. build arguments ──────────────────────────────────────────────────────────────────────────
# NEXT_PUBLIC_* values are baked into the browser bundle at BUILD time: ask for each one the
# Dockerfile declares (Enter keeps the default shown). Set them in the environment to skip it.
build_args=()
while IFS='=' read -r name default; do
  if [[ -n "${!name:-}" ]]; then
    value="${!name}"
  elif [[ -t 0 ]]; then
    read -r -p "$name [$default]: " value
    value="${value:-$default}"
  else
    value="$default"
  fi
  build_args+=(--build-arg "$name=$value")
done < <(sed -n 's/^ARG \(NEXT_PUBLIC_[A-Z0-9_]*\)=\(.*\)$/\1=\2/p' "$dockerfile")

# ── 3. build for the server's platform ──────────────────────────────────────────────────────────
commit="$(git rev-parse --short HEAD)"
git diff --quiet HEAD -- || commit="$commit-dirty" # uncommitted changes are in the image too
tag="$(date +%Y%m%d-%H%M)-$commit"
image="$IMAGE_PREFIX/$app"

echo "▶ Building $image:$tag for $PLATFORM (first build takes a few minutes)…"
docker buildx build \
  --platform "$PLATFORM" \
  --file "$dockerfile" \
  --tag "$image:$tag" \
  --tag "$image:latest" \
  ${build_args[@]+"${build_args[@]}"} \
  --load \
  . || fail "Build failed (see the error above). An 'exec format error' means the CPU emulation is missing: Docker Desktop has it built in; on Linux run 'docker run --privileged --rm tonistiigi/binfmt --install all'."

# ── 4. save to a file ───────────────────────────────────────────────────────────────────────────
mkdir -p "$OUT_DIR"
file="$OUT_DIR/${app}_${tag}_${PLATFORM//\//-}.tar.gz"
echo "▶ Saving to $file…"
docker save "$image:$tag" "$image:latest" | gzip >"$file"

port="$(sed -n 's/^EXPOSE \([0-9]*\).*/\1/p' "$dockerfile" | head -n 1)"
port="${port:-3000}"

cat <<EOF

✔ Done: $file ($(du -h "$file" | cut -f1))

On the server (Ubuntu):
  scp $file user@server:~/
  ssh user@server
  docker load -i ~/$(basename "$file")
  docker run -d --name $app --restart unless-stopped -p $port:$port --env-file .env $image:$tag

The .env file holds the runtime variables (see apps/$app/.env.example); NEXT_PUBLIC_* values are
already in the image.
EOF
