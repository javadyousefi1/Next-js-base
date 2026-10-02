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
      className="bg-destructive/10 text-destructive flex items-center gap-2 px-4 py-2 text-sm"
    >
      <WifiOffIcon className="size-4" aria-hidden />
      {t("offline")}
    </div>
  );
}
