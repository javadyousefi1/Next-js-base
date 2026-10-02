"use client";

import { WifiOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useOffline } from "next/offline";

/** Shown while the browser is offline (`experimental.useOffline` retries navigations on reconnect). */
export function OfflineBanner() {
  const t = useTranslations("Common");
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive"
    >
      <WifiOffIcon className="size-4" aria-hidden />
      {t("offline")}
    </div>
  );
}
