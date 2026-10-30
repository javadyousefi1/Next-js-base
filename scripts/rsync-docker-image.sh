#!/bin/zsh
set -euo pipefail

# انتقال ایمیج داکر به سرور ریموت با rsync
# استفاده: bash scripts/rsync-docker-image.sh

IMAGES_DIR="$(cd "$(dirname "$0")/.." && pwd)/docker-images"

if [[ ! -d "$IMAGES_DIR" ]]; then
  echo "پوشه $IMAGES_DIR پیدا نشد." >&2
  exit 1
fi

# لیست فایل‌ها بر اساس تاریخ (جدیدترین اول)
FILES=("${(@f)$(ls -1t "$IMAGES_DIR"/*.tar.gz 2>/dev/null)}")

if [[ -z "${FILES[1]:-}" ]]; then
  echo "هیچ ایمیج tar.gz در docker-images پیدا نشد." >&2
  exit 1
fi

echo "فایل‌های موجود (جدیدترین اول):"
for i in {1..${#FILES[@]}}; do
  f="${FILES[$i]}"
  size=$(du -h "$f" | cut -f1)
  printf "  [%d] %s (%s)\n" "$i" "$(basename "$f")" "$size"
done
echo

read "IDX?شماره فایل مورد نظر (پیش‌فرض 1 = جدیدترین): "
IDX=${IDX:-1}
if ! [[ "$IDX" =~ ^[0-9]+$ ]] || (( IDX < 1 )) || (( IDX > ${#FILES[@]} )); then
  echo "شماره نامعتبر." >&2
  exit 1
fi
SRC="${FILES[$IDX]}"

read "HOST?آدرس سرور [پیش‌فرض 5.159.49.104]: "
HOST=${HOST:-5.159.49.104}

read "SSH_USER?یوزر [پیش‌فرض root]: "
SSH_USER=${SSH_USER:-root}

read "PORT?پورت SSH [پیش‌فرض 22]: "
PORT=${PORT:-22}

read "DEST?مسیر مقصد روی سرور [پیش‌فرض /root/]: "
DEST=${DEST:-/root/}

read -s "PASS?پسورد SSH (خالی = استفاده از کلید SSH): "
echo

echo
echo "در حال انتقال $(basename "$SRC") → $SSH_USER@$HOST:$DEST"

if [[ -n "$PASS" ]]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "sshpass نصب نیست. نصب: brew install hudochenkov/sshpass/sshpass" >&2
    exit 1
  fi
  sshpass -p "$PASS" rsync -avzP --human-readable \
    -e "ssh -p $PORT -o StrictHostKeyChecking=accept-new" \
    "$SRC" "$SSH_USER@$HOST:$DEST"
else
  rsync -avzP --human-readable \
    -e "ssh -p $PORT -o StrictHostKeyChecking=accept-new" \
    "$SRC" "$SSH_USER@$HOST:$DEST"
fi

echo
echo "انتقال با موفقیت انجام شد."
echo "در سرور می‌تونی لود کنی با:"
echo "  gunzip -c $DEST$(basename "$SRC") | docker load"
